/**
 * The web-mode HTTP API: exposes the core `Backend` to the renderer as JSON over HTTP and streams
 * backend events as Server-Sent Events. Mounted at `/api` by the Vite plugin (./plugin.ts); the
 * browser side is src/renderer/src/lib/web-preview-api.ts.
 */
import type { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'node:http'
import { promisify } from 'node:util'
import { gzip } from 'node:zlib'
import type { Backend, BackendEventName, Logger } from '@core/backend'
import type { AppInfo } from '@shared/ipc'
import type { SettingsPatch } from '@shared/settings'
import type { Article } from '@shared/types'

/** What the API needs from the process hosting it. */
export interface ApiHost {
  appName: string
  appVersion: string
  /** Resolves with the started backend; rejects with the reason it could not be loaded. */
  backend(): Promise<Backend>
  logger: Logger
}

/** Backend events forwarded to the browser over `GET /api/events`. */
export const STREAMED_EVENTS = [
  'settings',
  'library',
  'newsUpdated',
  'newsStatus'
] as const satisfies readonly BackendEventName[]

const MAX_BODY_BYTES = 1024 * 1024
const GZIP_MIN_BYTES = 1024
const KEEP_ALIVE_MS = 20_000
/** Reconnect delay suggested to the browser's EventSource. */
const EVENTS_RETRY_MS = 2000
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

const gzipAsync = promisify(gzip)

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly headers: OutgoingHttpHeaders = {}
  ) {
    super(message)
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RouteContext {
  backend: Backend
  req: IncomingMessage
  res: ServerResponse
  params: Record<string, string>
  query: URLSearchParams
}

interface Route {
  method: Method
  pattern: RegExp
  keys: string[]
  /** The result is sent as JSON; `undefined` means 204 No Content. */
  handle(ctx: RouteContext): unknown
}

/** `path` segments starting with `:` capture one URL-decoded segment into `params`. */
function route(method: Method, path: string, handle: Route['handle']): Route {
  const keys: string[] = []
  const source = path
    .split('/')
    .map((segment) => {
      if (!segment.startsWith(':')) return segment
      keys.push(segment.slice(1))
      return '([^/]+)'
    })
    .join('/')
  return { method, pattern: new RegExp(`^${source}$`), keys, handle }
}

/** Connect-style handler for requests under `/api` (the mount path is already stripped from `req.url`). */
export function createApiHandler(host: ApiHost): (req: IncomingMessage, res: ServerResponse) => void {
  const routes: Route[] = [
    route('GET', '/info', ({ req }) => appInfo(host, req)),

    route('GET', '/settings', ({ backend }) => backend.settings.get()),
    route('PATCH', '/settings', async ({ backend, req }) =>
      backend.settings.update(asRecord(await readJson(req), 'a settings patch') as SettingsPatch)
    ),
    route('POST', '/settings/reset', ({ backend }) => backend.settings.reset()),

    route('GET', '/news/snapshot', ({ backend }) => backend.news.snapshot()),
    route('GET', '/news/status', ({ backend }) => backend.news.status()),
    route('POST', '/news/refresh', async ({ backend, query }) => {
      await backend.news.refresh(query.get('force') === '1')
    }),
    route('GET', '/news/image/:id', async ({ backend, params }) => ({
      url: await backend.news.resolveImage(params.id)
    })),
    route('GET', '/news/detail/:id', ({ backend, params }) => backend.news.detail(params.id)),

    route('GET', '/reader/extract', ({ backend, query }) =>
      backend.reader.extract(httpUrl(query.get('url')))
    ),
    route('GET', '/reader/probe', ({ backend, query }) => backend.reader.probe(httpUrl(query.get('url')))),

    route('GET', '/library', ({ backend }) => backend.library.get()),
    route('POST', '/library/toggle-save', async ({ backend, req }) =>
      backend.library.toggleSave(asArticle(await readJson(req)))
    ),
    route('POST', '/library/read', async ({ backend, req }) => {
      backend.library.markRead(asArticle(await readJson(req)))
    }),
    route('DELETE', '/library/history', ({ backend }) => backend.library.clearHistory()),

    route('GET', '/events', ({ backend, res }) => streamEvents(backend, res))
  ]

  async function dispatch(req: IncomingMessage, res: ServerResponse): Promise<void> {
    assertLocalRequest(req)
    const url = new URL(req.url ?? '/', 'http://localhost')
    const { match, params } = findRoute(routes, req.method ?? 'GET', url.pathname)
    const backend = await host.backend().catch((error: unknown) => {
      throw new HttpError(
        503,
        `The Masthead backend is not available (${errorMessage(error)}). See the terminal running "npm run dev:web".`
      )
    })
    const result = await match.handle({ backend, req, res, params, query: url.searchParams })
    if (res.headersSent) return
    if (result === undefined) res.writeHead(204, { 'Cache-Control': 'no-store' }).end()
    else await sendJson(req, res, 200, result)
  }

  return (req, res) => {
    dispatch(req, res).catch((error: unknown) => {
      if (res.headersSent) {
        res.destroy()
        return
      }
      const status = error instanceof HttpError ? error.status : 500
      if (status === 500) host.logger.error(`${req.method} /api${req.url} failed:`, error)
      const headers = error instanceof HttpError ? error.headers : {}
      sendJson(req, res, status, { error: errorMessage(error) }, headers).catch(() => res.destroy())
    })
  }
}

function findRoute(
  routes: Route[],
  method: string,
  path: string
): { match: Route; params: Record<string, string> } {
  const allowed: Method[] = []
  for (const candidate of routes) {
    const found = candidate.pattern.exec(path)
    if (!found) continue
    if (candidate.method !== method) {
      allowed.push(candidate.method)
      continue
    }
    try {
      const params = Object.fromEntries(
        candidate.keys.map((key, i) => [key, decodeURIComponent(found[i + 1])])
      )
      return { match: candidate, params }
    } catch {
      throw new HttpError(400, `Malformed path: /api${path}`)
    }
  }
  if (allowed.length > 0) {
    throw new HttpError(405, `${method} is not supported on /api${path}`, { Allow: allowed.join(', ') })
  }
  throw new HttpError(404, `No such endpoint: /api${path}`)
}

/**
 * Only answer the browser tab that runs the app: the Host must be loopback (defeats DNS rebinding),
 * the request must not come from another site, and state-changing requests must be same-origin.
 */
function assertLocalRequest(req: IncomingMessage): void {
  const host = req.headers.host ?? ''
  if (!LOCAL_HOSTNAMES.has(hostnameOf(host))) {
    throw new HttpError(403, 'Masthead only answers requests addressed to localhost')
  }
  const site = req.headers['sec-fetch-site']
  if (site !== undefined && site !== 'same-origin' && site !== 'none') {
    throw new HttpError(403, 'Cross-site requests are not allowed')
  }
  const origin = req.headers.origin
  if (req.method !== 'GET' && origin !== undefined && !isSameOrigin(origin, host)) {
    throw new HttpError(403, 'Cross-origin requests are not allowed')
  }
}

function hostnameOf(host: string): string {
  return URL.canParse(`http://${host}`) ? new URL(`http://${host}`).hostname : ''
}

function isSameOrigin(origin: string, host: string): boolean {
  if (!URL.canParse(origin) || !URL.canParse(`http://${host}`)) return false
  const url = new URL(origin)
  return url.protocol === 'http:' && url.host === new URL(`http://${host}`).host
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  if (!/^application\/json\b/i.test(req.headers['content-type'] ?? '')) {
    throw new HttpError(415, 'Expected an application/json request body')
  }
  // The rest of an oversized body is never read, so the connection cannot be reused.
  const tooLarge = (): HttpError =>
    new HttpError(413, 'Request body is larger than 1 MB', { Connection: 'close' })
  if (Number(req.headers['content-length']) > MAX_BODY_BYTES) throw tooLarge()
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.byteLength
    if (size > MAX_BODY_BYTES) throw tooLarge()
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new HttpError(400, 'Request body is not valid JSON')
  }
}

async function sendJson(
  req: IncomingMessage,
  res: ServerResponse,
  status: number,
  value: unknown,
  extraHeaders: OutgoingHttpHeaders = {}
): Promise<void> {
  let body = Buffer.from(JSON.stringify(value ?? null), 'utf8')
  const headers: OutgoingHttpHeaders = {
    ...extraHeaders,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Accept-Encoding'
  }
  if (body.byteLength >= GZIP_MIN_BYTES && /\bgzip\b/i.test(req.headers['accept-encoding'] ?? '')) {
    body = await gzipAsync(body)
    headers['Content-Encoding'] = 'gzip'
  }
  headers['Content-Length'] = body.byteLength
  res.writeHead(status, headers).end(body)
}

/** Holds the response open and writes `event: <name>\ndata: <json>\n\n` for every backend event. */
function streamEvents(backend: Backend, res: ServerResponse): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  })
  const write = (chunk: string): void => {
    if (!res.destroyed && !res.writableEnded) res.write(chunk)
  }
  const send = (event: BackendEventName, payload: unknown): void =>
    write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)

  write(`retry: ${EVENTS_RETRY_MS}\n\n`)
  // A refresh may already be running when the page (re)connects.
  send('newsStatus', backend.news.status())
  const unsubscribes = STREAMED_EVENTS.map((event) => backend.on(event, (payload) => send(event, payload)))
  const keepAlive = setInterval(() => write(': keep-alive\n\n'), KEEP_ALIVE_MS)
  res.once('close', () => {
    clearInterval(keepAlive)
    for (const unsubscribe of unsubscribes) unsubscribe()
  })
}

function appInfo(host: ApiHost, req: IncomingMessage): AppInfo {
  const platform = process.platform === 'win32' || process.platform === 'darwin' ? process.platform : 'linux'
  return {
    host: 'web',
    name: host.appName,
    version: host.appVersion,
    electron: '',
    chrome: '',
    platform,
    locale: browserLocale(req)
  }
}

/** The browser's preferred language (first Accept-Language tag) — the web counterpart of the OS locale. */
function browserLocale(req: IncomingMessage): string {
  const tag = req.headers['accept-language']?.split(',')[0]?.split(';')[0]?.trim()
  return tag && /^[a-z]{2,3}(-[a-z\d]{2,8})*$/i.test(tag) ? tag : 'en-US'
}

function httpUrl(value: unknown): string {
  if (typeof value === 'string' && URL.canParse(value)) {
    const { protocol } = new URL(value)
    if (protocol === 'http:' || protocol === 'https:') return value
  }
  throw new HttpError(400, 'Expected an http(s) URL in the "url" query parameter')
}

function asRecord(value: unknown, what: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, `Expected ${what} as a JSON object`)
  }
  return value as Record<string, unknown>
}

function isArticle(value: Record<string, unknown>): value is Record<string, unknown> & Article {
  return (
    typeof value.id === 'string' &&
    value.id !== '' &&
    typeof value.url === 'string' &&
    /^https?:\/\//i.test(value.url) &&
    typeof value.title === 'string' &&
    typeof value.sourceId === 'string' &&
    typeof value.publishedAt === 'number'
  )
}

function asArticle(value: unknown): Article {
  const article = asRecord(value, 'an article')
  if (!isArticle(article)) {
    throw new HttpError(400, 'Expected an article with id, http(s) url, title, sourceId and publishedAt')
  }
  return article
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
