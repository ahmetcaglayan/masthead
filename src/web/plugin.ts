/**
 * Web mode (`npm run dev:web`): a Vite plugin that hosts the core backend inside the dev server and
 * serves it to the renderer over HTTP + Server-Sent Events at `/api`, so the whole app runs in a
 * normal browser on localhost — for machines where installing the desktop app is not allowed.
 */
import { mkdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { format } from 'node:util'
import { normalizePath, type Plugin, type ViteDevServer } from 'vite'
import type { Backend, Logger } from '@core/backend'
import type { createBackend } from '@core/index'
import { createApiHandler } from './routes'

const ROOT = resolve(__dirname, '../..')
const CORE_ENTRY = normalizePath(resolve(ROOT, 'src/core/index.ts'))
/** Settings, library and caches of web mode (git-ignored). */
const DATA_DIR = resolve(ROOT, '.masthead-web')
const CACHE_DIR = resolve(DATA_DIR, 'cache')
const SHUTDOWN_TIMEOUT_MS = 5000

/** Serves the core backend at `/api` of the Vite dev server. Dev server only (`apply: 'serve'`). */
export function mastheadWebHost(): Plugin {
  let loading: Promise<Backend> | undefined
  let failure: string | undefined
  let onSigint: (() => void) | undefined

  return {
    name: 'masthead:web-host',
    apply: 'serve',

    async configureServer(server) {
      const pkg = await readPackage()
      const logger = backendLogger(server)
      server.middlewares.use(
        '/api',
        createApiHandler({
          appName: pkg.name,
          appVersion: pkg.version,
          logger,
          backend: () => loading ?? Promise.reject(new Error('the dev server is still starting'))
        })
      )

      const start = (): void => {
        loading = startBackend(server, pkg.version, logger)
        loading.then(
          () => {
            const url = server.resolvedUrls?.local[0] ?? `http://localhost:${server.config.server.port}/`
            server.config.logger.info(`  ➜  Masthead web mode is ready at ${url} · data in ${DATA_DIR}`)
          },
          (error: unknown) => {
            failure = error instanceof Error ? error.message : String(error)
            const detail = error instanceof Error ? (error.stack ?? failure) : failure
            logger.error(
              `The backend failed to load, so /api answers 503. Fix it, then press r + enter to restart.\n${detail}`
            )
          }
        )
      }
      if (server.httpServer) {
        server.httpServer.once('listening', start)
        // Vite only handles SIGTERM; close gracefully on Ctrl+C too so pending writes are flushed.
        onSigint = () => {
          void withTimeout(server.close(), SHUTDOWN_TIMEOUT_MS).finally(() => process.exit())
        }
        process.once('SIGINT', onSigint)
      } else {
        start()
      }

      // The backend is loaded once; its code does not hot-reload.
      server.watcher.on('change', (file) => {
        if (!server.environments.ssr.moduleGraph.getModulesByFile(normalizePath(file))?.size) return
        logger.info(`${normalizePath(relative(ROOT, file))} changed; press r + enter to restart the backend`)
      })
    },

    transformIndexHtml(html) {
      const page = allowBlobWorkers(html)
      if (!failure) return page
      return page.replace('<div id="root"></div>', `<div id="root">${failureNotice(failure)}</div>`)
    },

    // Vite runs buildEnd when the dev server closes (Ctrl+C, `q`, restart).
    async buildEnd() {
      if (onSigint) process.off('SIGINT', onSigint)
      const backend = await loading?.catch(() => undefined)
      await backend?.stop()
    }
  }
}

async function startBackend(server: ViteDevServer, appVersion: string, logger: Logger): Promise<Backend> {
  await mkdir(CACHE_DIR, { recursive: true })
  const core = (await server.ssrLoadModule(CORE_ENTRY)) as { createBackend?: typeof createBackend }
  if (typeof core.createBackend !== 'function') {
    throw new Error('src/core/index.ts does not export createBackend()')
  }
  const backend = await core.createBackend({ dataDir: DATA_DIR, cacheDir: CACHE_DIR, appVersion, logger })
  try {
    await backend.start()
  } catch (error) {
    await backend.stop().catch(() => undefined)
    throw error
  }
  return backend
}

async function readPackage(): Promise<{ name: string; version: string }> {
  const pkg = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8')) as {
    productName?: string
    version?: string
  }
  return { name: pkg.productName ?? 'Masthead', version: pkg.version ?? '0.0.0' }
}

function backendLogger(server: ViteDevServer): Logger {
  const { logger } = server.config
  // '%s' keeps printf-like sequences in messages (e.g. percent-encoded URLs) literal.
  const line = (message: string, rest: unknown[]): string => format('[masthead] %s', message, ...rest)
  return {
    info: (message, ...rest) => logger.info(line(message, rest)),
    warn: (message, ...rest) => logger.warn(line(message, rest)),
    error: (message, ...rest) => logger.error(line(message, rest))
  }
}

function withTimeout(promise: Promise<unknown>, ms: number): Promise<unknown> {
  return Promise.race([promise, new Promise((done) => setTimeout(done, ms).unref())])
}

const CSP_META = /(<meta\s+http-equiv="Content-Security-Policy"\s+content=")([^"]*)(")/i

/**
 * Web mode only: after a dev-server restart Vite's client polls for the server from a `blob:`
 * SharedWorker, which index.html's CSP (`script-src 'self'`, no `worker-src`) blocks — the page would
 * then never reload by itself. The React Refresh preamble needs no exception: it is injected before
 * the CSP <meta>, and a meta policy only governs what follows it.
 */
function allowBlobWorkers(html: string): string {
  return html.replace(CSP_META, (tag: string, open: string, policy: string, close: string) =>
    /(^|;)\s*worker-src\b/.test(policy) ? tag : `${open}${policy}; worker-src 'self' blob:${close}`
  )
}

/** Shown in place of the app when the backend could not load (the renderer cannot boot without it). */
function failureNotice(reason: string): string {
  const escaped = reason.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`)
  return (
    '<p style="max-width:40rem;margin:4rem auto;padding:0 1.5rem;font:15px/1.6 system-ui,sans-serif">' +
    `Masthead could not start its backend: ${escaped}<br />` +
    'See the terminal running <code>npm run dev:web</code>, fix the problem and restart it.</p>'
  )
}
