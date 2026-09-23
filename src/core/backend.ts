/**
 * The host-independent backend contract.
 *
 * Everything that is not UI lives behind this interface: settings and library
 * persistence, the news pipeline, reader-mode extraction. It is plain Node —
 * it must never import `electron` — so the exact same code runs in:
 *   - the Electron main process (`src/main`, bridged to the renderer over IPC)
 *   - the web-mode dev server (`src/web`, bridged over HTTP + SSE on localhost)
 *   - unit tests.
 */
import type { ReaderProbe } from '../shared/ipc'
import type { Settings, SettingsPatch } from '../shared/settings'
import type {
  Article,
  ArticleDetail,
  Library,
  NewsSnapshot,
  NewsUpdate,
  ReaderContent,
  RefreshStatus
} from '../shared/types'

export interface Logger {
  info(message: string, ...rest: unknown[]): void
  warn(message: string, ...rest: unknown[]): void
  error(message: string, ...rest: unknown[]): void
}

export interface BackendOptions {
  /** Directory for settings.json and library.json. */
  dataDir: string
  /** Directory for the news cache and resolved-image cache. */
  cacheDir: string
  /** Version string used in the User-Agent suffix. */
  appVersion: string
  logger?: Logger
  /** Injectable clock for tests. */
  now?: () => number
  /** Injectable fetch for tests; defaults to global fetch. */
  fetch?: typeof fetch
  /** Skip the periodic refresh timer (tests, screenshot mode). */
  manualRefresh?: boolean
}

export interface BackendEvents {
  settings: Settings
  library: Library
  newsUpdated: NewsUpdate
  newsStatus: RefreshStatus
  /** Newly-seen breaking articles after a refresh (for desktop notifications). */
  breaking: Article[]
}

export type BackendEventName = keyof BackendEvents

export interface Backend {
  settings: {
    get(): Settings
    update(patch: SettingsPatch): Settings
    reset(): Settings
  }
  news: {
    snapshot(): NewsSnapshot
    status(): RefreshStatus
    /** Resolves when the refresh finishes. Concurrent calls share one in-flight refresh. */
    refresh(force?: boolean): Promise<void>
    resolveImage(articleId: string): Promise<string | null>
    detail(articleId: string): Promise<ArticleDetail | null>
  }
  library: {
    get(): Library
    toggleSave(article: Article): Library
    markRead(article: Article): Library
    clearHistory(): Library
  }
  reader: {
    extract(url: string): Promise<ReaderContent | null>
    probe(url: string): Promise<ReaderProbe>
  }
  on<E extends BackendEventName>(event: E, listener: (payload: BackendEvents[E]) => void): () => void
  /** Load caches, start the refresh schedule. */
  start(): Promise<void>
  /** Stop timers and flush pending writes. */
  stop(): Promise<void>
}
