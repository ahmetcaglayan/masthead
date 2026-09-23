import {
  app,
  session,
  WebContentsView,
  type BrowserWindow,
  type Rectangle,
  type Session,
  type WebContents
} from 'electron'
import { IPC, type ReaderNavigation } from '@shared/ipc'
import type { ReaderMode } from '@shared/settings'
import type { Article, ReaderBounds, ReaderContent, ReaderEvent } from '@shared/types'
import { extractFromPage } from './readability'

const PARTITION = 'persist:reader'
const ACCEPT_LANGUAGES = 'tr-TR,tr,en-US,en'
const ERR_ABORTED = -3
const ERR_FAILED = -2
const BORDER_RADIUS = 12
/** AARRGGBB; the dialog surface colour, so an unpainted page never flashes white in dark mode. */
const BACKGROUND = { light: '#FFF6F4EF', dark: '#FF1B1A17' }
/** Alt+key shortcuts that work while the page has focus, by physical key. */
const ALT_SHORTCUTS: Partial<Record<string, 'next' | 'prev' | 'reader'>> = {
  ArrowRight: 'next',
  ArrowLeft: 'prev',
  KeyR: 'reader'
}
/** Pages may navigate the top frame to these… */
const TOP_LEVEL_PROTOCOLS = new Set(['http:', 'https:'])
/** …and redirect or navigate sub-frames to these as well (ads and embeds use about:blank / data: frames). */
const FRAME_PROTOCOLS = new Set([...TOP_LEVEL_PROTOCOLS, 'about:', 'data:', 'blob:'])
/**
 * A page's `window.open` is followed only this soon after the user clicked, tapped or typed in it:
 * Electron has no popup blocker, so scripts and ads could otherwise replace the article at any time.
 */
const USER_GESTURE_MS = 1000

const protocolOf = (url: string): string => {
  try {
    return new URL(url).protocol
  } catch {
    return ''
  }
}

/** True for absolute http(s) URLs. */
export const isWebUrl = (url: string): boolean => TOP_LEVEL_PROTOCOLS.has(protocolOf(url))

/** The view's contents while they live; a page that closed itself (`window.close()`) leaves the view without any. */
function liveContents(view: WebContentsView | null): WebContents | undefined {
  const contents = view?.webContents as WebContents | undefined
  return contents && !contents.isDestroyed() ? contents : undefined
}

/** Compare two URLs ignoring the fragment. */
function sameDocument(a: string, b: string): boolean {
  try {
    const left = new URL(a)
    const right = new URL(b)
    left.hash = ''
    right.hash = ''
    return left.href === right.href
  } catch {
    return false
  }
}

let hardened = false

/**
 * The `persist:reader` session that news pages load in, kept apart from the app's
 * own session. Hardened on first use: only `fullscreen` is ever granted (which also
 * denies `openExternal`, so pages cannot launch other apps), device access and
 * downloads are refused, and the user agent looks like plain Chrome in Turkish.
 */
export function readerSession(): Session {
  const ses = session.fromPartition(PARTITION)
  if (hardened) return ses
  hardened = true
  ses.setPermissionRequestHandler((_wc, permission, callback) => callback(permission === 'fullscreen'))
  ses.setPermissionCheckHandler((_wc, permission) => permission === 'fullscreen')
  ses.setDevicePermissionHandler(() => false)
  ses.on('will-download', (event) => event.preventDefault())
  ses.setUserAgent(ses.getUserAgent().replace(/\s?(?:Electron|Masthead)\/\S+/gi, ''), ACCEPT_LANGUAGES)
  return ses
}

export interface ReaderViewOptions {
  dark: boolean
  /** Keep pages silent even while shown (automation modes). */
  muted?: boolean
  /** Called with each page view's contents when it is created (automation modes watch loads and errors). */
  onViewCreated?(contents: WebContents): void
}

/** What the page view is doing, for the automation modes. */
export interface ReaderViewState {
  /** The page view's contents; null before the first article opened in Web mode. */
  contents: WebContents | null
  /** Where the view sits in the window, in DIPs. */
  bounds: Rectangle
  visible: boolean
  /** Id of the article loaded in the view; null while it is parked on about:blank. */
  articleId: string | null
  failed: boolean
}

/**
 * The in-app article viewer: one reusable `WebContentsView` layered over the
 * reader dialog's content area. The renderer positions it (`setBounds`), shows
 * it once the dialog has animated in, and receives loading/navigation state,
 * Esc and shortcuts as `reader:event` messages.
 */
export class ReaderViewManager {
  private view: WebContentsView | null = null
  private bounds: Rectangle = { x: 0, y: 0, width: 0, height: 0 }
  private visible = false
  private dark: boolean
  private htmlFullScreen = false
  /** The article loaded in the view; null while idle (blank). Loading events are only reported while set. */
  private article: Pick<Article, 'id' | 'url'> | null = null
  private failed = false
  /** Set while an article's first load is in progress: history starts at the page it lands on. */
  private clearHistoryOnNavigate = false
  private disposed = false
  private readonly muted: boolean
  private readonly onViewCreated?: (contents: WebContents) => void

  constructor(
    private readonly win: BrowserWindow,
    options: ReaderViewOptions
  ) {
    this.dark = options.dark
    this.muted = options.muted === true
    this.onViewCreated = options.onViewCreated
    win.on('resize', () => {
      if (this.htmlFullScreen) this.fitToWindow()
    })
    win.on('closed', () => this.dispose())
  }

  /** Web mode loads the article (hidden until `setVisible(true)`); reader mode only drops a different page. */
  open(article: Article, mode: ReaderMode): void {
    if (this.disposed || !isWebUrl(article.url)) return
    const same = this.article?.id === article.id
    if (mode === 'reader') {
      if (!same) this.reset()
      return
    }
    if (same && !this.failed) {
      this.emitNavigated()
      this.emit({ type: 'loading', loading: liveContents(this.view)?.isLoading() ?? false })
      return
    }
    this.article = { id: article.id, url: article.url }
    this.failed = false
    this.clearHistoryOnNavigate = true
    this.load(article.url)
  }

  /** Hide the view, stop the page (audio and video included) and return focus to the app. */
  close(): void {
    this.setVisible(false)
    this.reset()
  }

  /** Position of the dialog's content area, in window CSS pixels. */
  setBounds(rect: ReaderBounds): void {
    const values = [rect.x, rect.y, rect.width, rect.height]
    if (this.win.isDestroyed() || !values.every(Number.isFinite)) return
    const zoom = this.win.webContents.getZoomFactor()
    this.bounds = {
      x: Math.round(rect.x * zoom),
      y: Math.round(rect.y * zoom),
      width: Math.max(0, Math.round(rect.width * zoom)),
      height: Math.max(0, Math.round(rect.height * zoom))
    }
    if (!this.htmlFullScreen) this.view?.setBounds(this.bounds)
  }

  setVisible(visible: boolean): void {
    this.visible = visible
    if (this.disposed || (!visible && !this.view)) return
    const view = this.ensureView()
    view.setVisible(visible)
    // A hidden page stays loaded (Reader mode reads from it), but is never heard.
    view.webContents.setAudioMuted(this.muted || !visible)
    if (visible) view.webContents.focus()
    else if (!this.win.isDestroyed()) this.win.webContents.focus()
  }

  navigate(action: ReaderNavigation): void {
    const wc = liveContents(this.view)
    if (!wc) {
      // The page closed itself and took the view with it: Reload opens the article again.
      if (action === 'reload' && this.article) this.load(this.article.url)
      return
    }
    const history = wc.navigationHistory
    switch (action) {
      case 'back':
        if (history.canGoBack()) history.goBack()
        break
      case 'forward':
        if (history.canGoForward()) history.goForward()
        break
      case 'reload':
        if (this.article && !isWebUrl(wc.getURL())) this.load(this.article.url)
        else wc.reload()
        break
      case 'stop':
        wc.stop()
        break
    }
  }

  /** Follow the app theme for the area behind the page. */
  setDark(dark: boolean): void {
    this.dark = dark
    this.view?.setBackgroundColor(dark ? BACKGROUND.dark : BACKGROUND.light)
  }

  /**
   * Reader-mode content straight from the page on screen, when the view shows
   * `url` and has finished loading; null otherwise (the caller falls back to
   * fetching the page).
   */
  async extractFromView(url: string): Promise<ReaderContent | null> {
    const wc = liveContents(this.view)
    if (!wc || wc.isLoading() || this.failed || !this.article) return null
    // The page may have been redirected; the opened article still counts until the user navigates away.
    const showing =
      sameDocument(wc.getURL(), url) ||
      (sameDocument(this.article.url, url) && !wc.navigationHistory.canGoBack())
    return showing ? extractFromPage(wc) : null
  }

  /** The view's current state (screenshots and self-test). */
  inspect(): ReaderViewState {
    const contents = liveContents(this.view) ?? null
    return {
      contents,
      bounds: this.htmlFullScreen && this.view ? this.view.getBounds() : { ...this.bounds },
      visible: this.visible && contents !== null,
      articleId: this.article?.id ?? null,
      failed: this.failed
    }
  }

  private ensureView(): WebContentsView {
    if (this.view && liveContents(this.view)) return this.view
    readerSession()
    const view = new WebContentsView({
      webPreferences: {
        partition: PARTITION,
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        nodeIntegrationInSubFrames: false,
        webSecurity: true,
        allowRunningInsecureContent: false,
        devTools: !app.isPackaged,
        spellcheck: false,
        safeDialogs: true,
        navigateOnDragDrop: false,
        autoplayPolicy: 'document-user-activation-required',
        focusOnNavigation: false
      }
    })
    view.setBorderRadius(BORDER_RADIUS)
    view.setBackgroundColor(this.dark ? BACKGROUND.dark : BACKGROUND.light)
    view.setBounds(this.bounds)
    view.setVisible(this.visible)
    view.webContents.setAudioMuted(this.muted || !this.visible)
    this.win.contentView.addChildView(view)
    this.view = view
    this.attach(view)
    this.onViewCreated?.(view.webContents)
    return view
  }

  private attach(view: WebContentsView): void {
    const wc = view.webContents

    // When the user last clicked, tapped or pressed a key in the page (see USER_GESTURE_MS).
    let gestureAt = 0
    wc.on('before-mouse-event', (_event, mouse) => {
      if (mouse.type === 'mouseDown' || mouse.type === 'mouseUp') gestureAt = Date.now()
    })
    wc.on('input-event', (_event, input) => {
      if (input.type === 'gestureTap' || input.type === 'touchEnd') gestureAt = Date.now()
    })
    wc.setWindowOpenHandler(({ url, disposition }) => {
      // Links that open a tab stay in the dialog; sized popups (share dialogs, pop-unders) and
      // windows a script opens on its own are dropped.
      const byUser = Date.now() - gestureAt <= USER_GESTURE_MS
      if (byUser && disposition !== 'new-window' && isWebUrl(url)) this.load(url)
      return { action: 'deny' }
    })
    // The viewer always wins: a page's "leave site?" prompt would otherwise silently cancel
    // closing (its audio playing on), the next article and followed links.
    wc.on('will-prevent-unload', (event) => event.preventDefault())
    wc.on('will-navigate', (event) => {
      if (!isWebUrl(event.url)) event.preventDefault()
    })
    wc.on('will-redirect', (event) => {
      if (!FRAME_PROTOCOLS.has(protocolOf(event.url))) event.preventDefault()
    })
    wc.on('will-frame-navigate', (event) => {
      if (!FRAME_PROTOCOLS.has(protocolOf(event.url))) event.preventDefault()
    })

    wc.on('did-start-loading', () => {
      if (!this.article) return
      this.emit({ type: 'loading', loading: true })
      this.emit({ type: 'progress', value: 0.1 })
    })
    wc.on('dom-ready', () => {
      if (this.article) this.emit({ type: 'progress', value: 0.6 })
    })
    wc.on('did-stop-loading', () => {
      if (!this.article) return
      // The first load has settled; from here on navigations are the reader's own and Back returns to them.
      if (isWebUrl(wc.getURL())) this.clearHistoryOnNavigate = false
      this.emit({ type: 'progress', value: 1 })
      this.emit({ type: 'loading', loading: false })
    })
    wc.on('did-navigate', (_event, url) => {
      if (!isWebUrl(url)) return
      this.failed = false
      // Also swallows script redirects (feed trackers, Google News links) so Back never lands on them.
      if (this.clearHistoryOnNavigate) wc.navigationHistory.clear()
      this.emitNavigated()
    })
    wc.on('did-navigate-in-page', (_event, _url, isMainFrame) => {
      if (isMainFrame) this.emitNavigated()
    })
    wc.on('page-title-updated', () => {
      if (!this.failed) this.emitNavigated()
    })
    wc.on('did-fail-load', (_event, code, description, url, isMainFrame) => {
      if (!isMainFrame || code === ERR_ABORTED || !this.article) return
      this.failed = true
      this.emit({ type: 'failed', url, code, description })
    })

    wc.on('before-input-event', (event, input) => {
      if (input.type !== 'keyDown' || input.isComposing) return
      gestureAt = Date.now()
      if (input.key === 'Escape') {
        if (this.htmlFullScreen) return
        event.preventDefault()
        this.emit({ type: 'escape' })
        return
      }
      if (input.alt && !input.control && !input.meta && !input.shift && !input.isAutoRepeat) {
        const key = ALT_SHORTCUTS[input.code]
        if (key) {
          event.preventDefault()
          this.emit({ type: 'shortcut', key })
        }
        return
      }
      if (input.key === 'F12' && !app.isPackaged) wc.toggleDevTools()
    })

    wc.on('enter-html-full-screen', () => {
      this.htmlFullScreen = true
      view.setBorderRadius(0)
      this.fitToWindow()
    })
    wc.on('leave-html-full-screen', () => {
      this.htmlFullScreen = false
      view.setBorderRadius(BORDER_RADIUS)
      view.setBounds(this.bounds)
    })

    wc.on('render-process-gone', (_event, details) => {
      if (this.view !== view) return
      // Swap in a fresh view outside the event dispatch; the renderer offers a reload.
      setImmediate(() => this.recover(details.reason))
    })
    wc.once('destroyed', () => {
      if (this.view !== view) return
      // The page closed itself (window.close()), and Electron took the view out of the window.
      // Forget it; the renderer offers a reload, which makes a new one.
      this.view = null
      this.htmlFullScreen = false
      if (this.article && !this.disposed) {
        this.failed = true
        this.emit({
          type: 'failed',
          url: this.article.url,
          code: ERR_FAILED,
          description: 'The page closed itself'
        })
      }
    })
  }

  private recover(reason: string): void {
    const url = this.article?.url
    this.destroyView()
    if (this.disposed) return
    this.htmlFullScreen = false
    this.ensureView()
    if (url) {
      this.failed = true
      const description = `The page stopped working (${reason})`
      this.emit({ type: 'failed', url, code: ERR_FAILED, description })
    }
  }

  private load(url: string): void {
    // Rejections are either ERR_ABORTED (the navigation was replaced) or reported through did-fail-load.
    this.ensureView()
      .webContents.loadURL(url)
      .catch(() => undefined)
  }

  /** Stop the page and park the view on about:blank. */
  private reset(): void {
    this.article = null
    this.failed = false
    this.clearHistoryOnNavigate = false
    const wc = this.view?.webContents
    if (!wc || wc.isDestroyed()) return
    wc.stop()
    wc.loadURL('about:blank').catch(() => undefined)
  }

  private fitToWindow(): void {
    if (!this.view || this.win.isDestroyed()) return
    const { width, height } = this.win.getContentBounds()
    this.view.setBounds({ x: 0, y: 0, width, height })
  }

  private emitNavigated(): void {
    const wc = this.view?.webContents
    if (!wc || wc.isDestroyed() || !this.article) return
    const url = wc.getURL()
    if (!isWebUrl(url)) return
    this.emit({
      type: 'navigated',
      url,
      title: wc.getTitle(),
      canGoBack: wc.navigationHistory.canGoBack(),
      canGoForward: wc.navigationHistory.canGoForward()
    })
  }

  private emit(event: ReaderEvent): void {
    if (!this.win.isDestroyed() && !this.win.webContents.isDestroyed()) {
      this.win.webContents.send(IPC.readerEvent, event)
    }
  }

  private destroyView(): void {
    const view = this.view
    this.view = null
    if (!view) return
    if (!this.win.isDestroyed()) this.win.contentView.removeChildView(view)
    liveContents(view)?.close()
  }

  private dispose(): void {
    this.disposed = true
    this.article = null
    this.destroyView()
  }
}
