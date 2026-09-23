/**
 * `MastheadApi` for web mode (`npm run dev:web`): the renderer runs in a plain browser and reaches
 * the core backend hosted by the Vite dev server over HTTP (`/api/*`) plus one shared Server-Sent
 * Events stream (`/api/events`). Electron-only features (embedded reader view, native title bar)
 * are no-ops; the reader dialog falls back to an iframe or Reader mode.
 */
import type { AppInfo, MastheadApi, ReaderProbe, Unsubscribe, UpdateStatus, WindowState } from '@shared/ipc'
import type { Settings } from '@shared/settings'
import type { QuotesReport } from '@shared/markets'
import type { WeatherReport } from '@shared/widgets'
import type {
  ArticleDetail,
  Library,
  NewsSnapshot,
  NewsUpdate,
  ReaderContent,
  RefreshStatus
} from '@shared/types'

/** Events streamed by the web host (`STREAMED_EVENTS` in src/web/routes.ts). */
interface ServerEvents {
  settings: Settings
  library: Library
  newsUpdated: NewsUpdate
  newsStatus: RefreshStatus
}

type ServerEvent = keyof ServerEvents
type Listener<E extends ServerEvent> = (payload: ServerEvents[E]) => void

const SERVER_EVENTS: readonly ServerEvent[] = ['settings', 'library', 'newsUpdated', 'newsStatus']
const RETRY_MIN_MS = 1000
const RETRY_MAX_MS = 30_000

const noop = (): void => {}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers:
      body === undefined
        ? { Accept: 'application/json' }
        : { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  if (!res.ok) {
    const detail = await res.json().then(
      (json: { error?: string }) => json.error,
      () => undefined
    )
    throw new Error(detail ?? `${method} /api${path} failed with HTTP ${res.status}`)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

const get = <T>(path: string): Promise<T> => request<T>('GET', path)

const urlQuery = (url: string): string => `?url=${encodeURIComponent(url)}`

interface EventStream {
  on<E extends ServerEvent>(event: E, listener: Listener<E>): Unsubscribe
}

/**
 * One EventSource shared by every subscriber, opened with the first listener and closed with the
 * last. Reconnects on its own (the browser gives up after HTTP errors such as a 503 while the backend
 * is down) and, after an interruption, re-reads the state so no missed update is lost.
 */
function createEventStream(): EventStream {
  const listeners: { [E in ServerEvent]: Set<Listener<E>> } = {
    settings: new Set(),
    library: new Set(),
    newsUpdated: new Set(),
    newsStatus: new Set()
  }
  let source: EventSource | null = null
  let retryTimer: number | undefined
  let retryDelay = RETRY_MIN_MS
  let interrupted = false

  const listenerCount = (): number => SERVER_EVENTS.reduce((sum, event) => sum + listeners[event].size, 0)

  function emit<E extends ServerEvent>(event: E, payload: ServerEvents[E]): void {
    for (const listener of [...listeners[event]]) {
      try {
        listener(payload)
      } catch (error) {
        console.error(`Masthead: "${event}" listener failed`, error)
      }
    }
  }

  function connect(): void {
    const stream = new EventSource('/api/events')
    source = stream
    stream.onopen = () => {
      retryDelay = RETRY_MIN_MS
      if (!interrupted) return
      interrupted = false
      resync().catch((error: unknown) => console.warn('Masthead: could not resync after reconnecting', error))
    }
    stream.onerror = () => {
      interrupted = true
      if (stream.readyState !== EventSource.CLOSED) return
      stream.close()
      source = null
      scheduleReconnect()
    }
    for (const event of SERVER_EVENTS) {
      stream.addEventListener(event, (message: MessageEvent<string>) => {
        let payload: ServerEvents[typeof event]
        try {
          payload = JSON.parse(message.data) as ServerEvents[typeof event]
        } catch {
          console.warn(`Masthead: malformed "${event}" event`, message.data)
          return
        }
        emit(event, payload)
      })
    }
  }

  function scheduleReconnect(): void {
    if (retryTimer !== undefined) return
    retryTimer = window.setTimeout(() => {
      retryTimer = undefined
      if (listenerCount() > 0) connect()
    }, retryDelay)
    retryDelay = Math.min(retryDelay * 2, RETRY_MAX_MS)
  }

  function disconnect(): void {
    source?.close()
    source = null
    window.clearTimeout(retryTimer)
    retryTimer = undefined
    interrupted = false
  }

  /** Events sent while the stream was down are gone: replay the current state instead. */
  async function resync(): Promise<void> {
    const [settings, library, status] = await Promise.all([
      get<Settings>('/settings'),
      get<Library>('/library'),
      get<RefreshStatus>('/news/status')
    ])
    emit('settings', settings)
    emit('library', library)
    emit('newsStatus', status)
    emit('newsUpdated', { updatedAt: status.lastCompletedAt, newCount: 0, newBreaking: 0 })
  }

  return {
    on(event, listener) {
      listeners[event].add(listener)
      if (!source && retryTimer === undefined) connect()
      return () => {
        listeners[event].delete(listener)
        if (listenerCount() === 0) disconnect()
      }
    }
  }
}

function windowState(): WindowState {
  return { maximized: false, fullscreen: document.fullscreenElement !== null, focused: document.hasFocus() }
}

const webUpdateStatus = (info: AppInfo): UpdateStatus => ({
  mode: 'none',
  state: 'idle',
  current: info.version
})

/** Builds the browser implementation of `window.masthead` on top of the web host's HTTP API. */
export function createWebPreviewApi(): MastheadApi {
  const events = createEventStream()

  return {
    app: {
      info: () => get<AppInfo>('/info')
    },
    settings: {
      get: () => get<Settings>('/settings'),
      update: (patch) => request<Settings>('PATCH', '/settings', patch),
      reset: () => request<Settings>('POST', '/settings/reset'),
      onChange: (cb) => events.on('settings', cb)
    },
    news: {
      snapshot: () => get<NewsSnapshot>('/news/snapshot'),
      refresh: (force = false) => request<void>('POST', force ? '/news/refresh?force=1' : '/news/refresh'),
      refreshMarkets: () => request<void>('POST', '/news/refresh-markets'),
      onUpdated: (cb) => events.on('newsUpdated', cb),
      onStatus: (cb) => events.on('newsStatus', cb),
      resolveImage: async (articleId) =>
        (await get<{ url: string | null }>(`/news/image/${encodeURIComponent(articleId)}`)).url,
      detail: (articleId) => get<ArticleDetail | null>(`/news/detail/${encodeURIComponent(articleId)}`),
      onOpenArticle: () => noop
    },
    reader: {
      open: () => Promise.resolve(),
      close: () => Promise.resolve(),
      setBounds: noop,
      setVisible: noop,
      navigate: noop,
      extract: (url) => get<ReaderContent | null>(`/reader/extract${urlQuery(url)}`),
      probe: (url) => get<ReaderProbe>(`/reader/probe${urlQuery(url)}`),
      openExternal: (url) => {
        if (/^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener,noreferrer')
        return Promise.resolve()
      },
      onEvent: () => noop
    },
    library: {
      get: () => get<Library>('/library'),
      toggleSave: (article) => request<Library>('POST', '/library/toggle-save', article),
      markRead: (article) => request<void>('POST', '/library/read', article),
      clearHistory: () => request<Library>('DELETE', '/library/history'),
      onChange: (cb) => events.on('library', cb)
    },
    updates: {
      // The browser version is updated from source (`git pull`); there is nothing to install.
      status: () => get<AppInfo>('/info').then(webUpdateStatus),
      check: () => get<AppInfo>('/info').then(webUpdateStatus),
      download: () => Promise.resolve(),
      install: () => Promise.resolve(),
      onChange: () => noop
    },
    widgets: {
      weather: () => get<WeatherReport | null>('/widgets/weather')
    },
    markets: {
      quotes: () => get<QuotesReport>('/markets/quotes')
    },
    window: {
      setTitleBarColors: noop,
      state: () => Promise.resolve(windowState()),
      onState: (cb) => {
        const notify = (): void => cb(windowState())
        window.addEventListener('focus', notify)
        window.addEventListener('blur', notify)
        document.addEventListener('fullscreenchange', notify)
        return () => {
          window.removeEventListener('focus', notify)
          window.removeEventListener('blur', notify)
          document.removeEventListener('fullscreenchange', notify)
        }
      }
    }
  }
}
