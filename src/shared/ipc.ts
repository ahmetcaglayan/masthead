import type { Settings, SettingsPatch, ReaderMode } from './settings'
import type {
  Article,
  ArticleDetail,
  Library,
  NewsSnapshot,
  NewsUpdate,
  ReaderBounds,
  ReaderContent,
  ReaderEvent,
  RefreshStatus
} from './types'

/** IPC channel names. `invoke` channels return a value, `send` are fire-and-forget, `event` go main → renderer. */
export const IPC = {
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',
  settingsReset: 'settings:reset',
  settingsChanged: 'settings:changed',

  newsSnapshot: 'news:snapshot',
  newsRefresh: 'news:refresh',
  newsUpdated: 'news:updated',
  newsStatus: 'news:status',
  newsResolveImage: 'news:resolve-image',
  newsDetail: 'news:detail',
  newsOpenArticle: 'news:open-article',

  readerOpen: 'reader:open',
  readerClose: 'reader:close',
  readerBounds: 'reader:bounds',
  readerVisible: 'reader:visible',
  readerNavigate: 'reader:navigate',
  readerExtract: 'reader:extract',
  readerProbe: 'reader:probe',
  readerEvent: 'reader:event',
  readerOpenExternal: 'reader:open-external',

  libraryGet: 'library:get',
  libraryToggleSave: 'library:toggle-save',
  libraryMarkRead: 'library:mark-read',
  libraryClearHistory: 'library:clear-history',
  libraryChanged: 'library:changed',

  windowTitleBar: 'window:title-bar',
  windowState: 'window:state',
  appInfo: 'app:info',

  updatesStatus: 'updates:status',
  updatesCheck: 'updates:check',
  updatesDownload: 'updates:download',
  updatesInstall: 'updates:install',
  updatesChanged: 'updates:changed'
} as const

export type Unsubscribe = () => void

export interface AppInfo {
  /** Where the renderer is hosted: the Electron app, or the browser-based web mode on localhost. */
  host: 'electron' | 'web'
  name: string
  version: string
  /** Empty string in web mode. */
  electron: string
  /** Empty string in web mode. */
  chrome: string
  platform: 'win32' | 'darwin' | 'linux'
  locale: string
}

/**
 * How this copy of Masthead gets new versions.
 * - `auto`: it downloads and installs them itself (Windows installer, Linux AppImage).
 * - `manual`: it can only tell the user one is out (portable exe, unsigned macOS app, .deb).
 * - `none`: no updates here (web mode, a development build).
 */
export type UpdateMode = 'auto' | 'manual' | 'none'

export type UpdateState =
  /** Nothing to report: never checked yet, or the last check found no newer version. */
  | 'idle'
  | 'checking'
  /** A newer version exists and is not being downloaded (manual mode, or automatic installs off). */
  | 'available'
  | 'downloading'
  /** Downloaded; a restart installs it. */
  | 'ready'
  | 'error'

export interface UpdateStatus {
  mode: UpdateMode
  state: UpdateState
  /** The running version. */
  current: string
  /** The newer version, once one is known. */
  version?: string
  /** Download progress, 0–100, while downloading. */
  percent?: number
  /** When the last check finished (epoch ms). */
  checkedAt?: number
  /** Short reason when `state` is `error`. */
  error?: string
}

export interface WindowState {
  maximized: boolean
  fullscreen: boolean
  focused: boolean
}

export interface ReaderOpenRequest {
  article: Article
  mode: ReaderMode
}

export type ReaderNavigation = 'back' | 'forward' | 'reload' | 'stop'

export interface ReaderProbe {
  /** The page may be shown inside an <iframe> (no X-Frame-Options / frame-ancestors block). */
  frameable: boolean
  /** Final URL after redirects. */
  finalUrl: string
}

/**
 * The API the renderer talks to, exposed as `window.masthead`.
 *
 * - In the Electron app it is provided by the preload script over IPC.
 * - In web mode (`npm run dev:web`, plain browser on localhost) the renderer
 *   builds the same interface over HTTP + Server-Sent Events against the
 *   local dev server (see `src/web/`).
 *
 * The renderer never touches ipcRenderer or fetch-to-backend directly —
 * everything goes through this surface.
 */
export interface MastheadApi {
  app: {
    info(): Promise<AppInfo>
  }
  settings: {
    get(): Promise<Settings>
    update(patch: SettingsPatch): Promise<Settings>
    reset(): Promise<Settings>
    onChange(cb: (settings: Settings) => void): Unsubscribe
  }
  news: {
    snapshot(): Promise<NewsSnapshot>
    refresh(force?: boolean): Promise<void>
    onUpdated(cb: (update: NewsUpdate) => void): Unsubscribe
    onStatus(cb: (status: RefreshStatus) => void): Unsubscribe
    /** Lazily look up an og:image for an article that has no image; null if none. */
    resolveImage(articleId: string): Promise<string | null>
    /** Long-form body from the feed for inline expansion; null if the feed had none. */
    detail(articleId: string): Promise<ArticleDetail | null>
    /** The host asks the UI to open an article (e.g. a breaking-news notification was clicked). */
    onOpenArticle(cb: (articleId: string) => void): Unsubscribe
  }
  reader: {
    /** Electron: load the article in the embedded web view (hidden until `setVisible(true)`). Web mode: no-op. */
    open(req: ReaderOpenRequest): Promise<void>
    close(): Promise<void>
    /** Electron: position of the dialog's content area in window CSS pixels. Web mode: no-op. */
    setBounds(bounds: ReaderBounds): void
    setVisible(visible: boolean): void
    navigate(action: ReaderNavigation): void
    /** Extract a clean, readable version of the article (Reader mode). */
    extract(url: string): Promise<ReaderContent | null>
    /** Web mode: whether the page can be shown in an iframe. Electron always reports frameable. */
    probe(url: string): Promise<ReaderProbe>
    openExternal(url: string): Promise<void>
    onEvent(cb: (event: ReaderEvent) => void): Unsubscribe
  }
  library: {
    get(): Promise<Library>
    toggleSave(article: Article): Promise<Library>
    markRead(article: Article): Promise<void>
    clearHistory(): Promise<Library>
    onChange(cb: (library: Library) => void): Unsubscribe
  }
  updates: {
    status(): Promise<UpdateStatus>
    /** Look for a new version now (the host also checks on start and every hour). */
    check(): Promise<UpdateStatus>
    /** Download the available version (when automatic installs are off). */
    download(): Promise<void>
    /** Restart into the downloaded version. */
    install(): Promise<void>
    onChange(cb: (status: UpdateStatus) => void): Unsubscribe
  }
  window: {
    /** Recolour the native caption buttons (Windows/Linux title-bar overlay). No-op in web mode. */
    setTitleBarColors(colors: { background: string; symbol: string }): void
    state(): Promise<WindowState>
    onState(cb: (state: WindowState) => void): Unsubscribe
  }
}
