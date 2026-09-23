import { app, ipcMain, shell, type BrowserWindow, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'
import type { Backend, BackendEventName, BackendEvents } from '@core/backend'
import {
  IPC,
  type AppInfo,
  type ReaderNavigation,
  type ReaderOpenRequest,
  type ReaderProbe
} from '@shared/ipc'
import type { SettingsPatch } from '@shared/settings'
import type { Article, ReaderBounds } from '@shared/types'
import { isWebUrl, type ReaderViewManager } from './reader/view'
import type { UpdateController } from './updates'
import { isRendererUrl, setTitleBarColors, windowState } from './window'

/** The main window and the reader view layered on it. */
export interface HostWindow {
  win: BrowserWindow
  reader: ReaderViewManager
}

export interface IpcContext {
  backend: Backend
  /** Settles once `backend.start()` has; backend calls wait for it. */
  ready: Promise<void>
  /** The app updater, once it has loaded. */
  updates: Promise<UpdateController>
  /** The open main window, or null while there is none (macOS keeps running without one). */
  current(): HostWindow | null
  /** Sees every accepted `invoke` call and its outcome (automation modes). Must handle rejections. */
  observe?(channel: string, outcome: Promise<unknown>): void
}

const NAVIGATIONS: readonly ReaderNavigation[] = ['back', 'forward', 'reload', 'stop']
const MAX_URL_LENGTH = 8192
const MAX_ID_LENGTH = 256

class InvalidArgument extends Error {
  constructor(channel: string) {
    super(`Invalid argument for ${channel}`)
    this.name = 'InvalidArgument'
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isString = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= max

const isHttpUrl = (value: unknown): value is string => isString(value, MAX_URL_LENGTH) && isWebUrl(value)

const isStringArray = (value: unknown): boolean =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

/** Just enough shape to be stored in the library or opened in the reader; the stores normalise the rest. */
function isArticle(value: unknown): value is Article {
  return (
    isObject(value) &&
    isString(value.id, MAX_ID_LENGTH) &&
    isHttpUrl(value.url) &&
    typeof value.title === 'string' &&
    typeof value.sourceId === 'string' &&
    typeof value.publishedAt === 'number' &&
    Number.isFinite(value.publishedAt) &&
    isStringArray(value.categories)
  )
}

function isOpenRequest(value: unknown): value is ReaderOpenRequest {
  return isObject(value) && isArticle(value.article) && (value.mode === 'web' || value.mode === 'reader')
}

function isBounds(value: unknown): value is ReaderBounds {
  return (
    isObject(value) &&
    [value.x, value.y, value.width, value.height].every((n) => typeof n === 'number' && Number.isFinite(n))
  )
}

function isTitleBarColors(value: unknown): value is { background: string; symbol: string } {
  return isObject(value) && isString(value.background, 64) && isString(value.symbol, 64)
}

function appInfo(): AppInfo {
  const platform = process.platform === 'darwin' || process.platform === 'linux' ? process.platform : 'win32'
  return {
    host: 'electron',
    name: 'Masthead',
    version: app.getVersion(),
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    platform,
    locale: app.getLocale()
  }
}

/**
 * Wire every `IPC` channel to the backend, the reader view and the window, and
 * forward backend events to the renderer. Only the main window's top frame,
 * showing the app's own page, may call in; every argument is validated.
 */
export function registerIpc({ backend, ready, updates, current, observe }: IpcContext): void {
  const senderWindow = (event: IpcMainEvent | IpcMainInvokeEvent): HostWindow | null => {
    const host = current()
    const frame = event.senderFrame
    if (!host || host.win.isDestroyed() || event.sender !== host.win.webContents) return null
    if (!frame || frame.parent !== null || !isRendererUrl(frame.url)) return null
    return host
  }

  const handle = (channel: string, listener: (host: HostWindow, arg: unknown) => unknown): void => {
    ipcMain.handle(channel, (event, arg: unknown) => {
      const host = senderWindow(event)
      if (!host) throw new Error(`Rejected ${channel}: unexpected sender`)
      const result = listener(host, arg)
      observe?.(channel, Promise.resolve(result))
      return result
    })
  }

  const listen = (channel: string, listener: (host: HostWindow, arg: unknown) => void): void => {
    ipcMain.on(channel, (event, arg: unknown) => {
      const host = senderWindow(event)
      if (host) listener(host, arg)
    })
  }

  /** Backend calls wait until the backend has started. */
  const handleBackend = (channel: string, listener: (arg: unknown) => unknown): void => {
    handle(channel, async (_host, arg) => {
      await ready
      return listener(arg)
    })
  }

  handle(IPC.appInfo, () => appInfo())

  handleBackend(IPC.settingsGet, () => backend.settings.get())
  handleBackend(IPC.settingsUpdate, (patch) => {
    if (!isObject(patch)) throw new InvalidArgument(IPC.settingsUpdate)
    return backend.settings.update(patch as SettingsPatch)
  })
  handleBackend(IPC.settingsReset, () => backend.settings.reset())

  handleBackend(IPC.newsSnapshot, () => backend.news.snapshot())
  handleBackend(IPC.newsRefresh, (force) => backend.news.refresh(force === true))
  handleBackend(IPC.newsResolveImage, (id) => {
    if (!isString(id, MAX_ID_LENGTH)) throw new InvalidArgument(IPC.newsResolveImage)
    return backend.news.resolveImage(id)
  })
  handleBackend(IPC.newsDetail, (id) => {
    if (!isString(id, MAX_ID_LENGTH)) throw new InvalidArgument(IPC.newsDetail)
    return backend.news.detail(id)
  })

  handleBackend(IPC.libraryGet, () => backend.library.get())
  handleBackend(IPC.libraryToggleSave, (article) => {
    if (!isArticle(article)) throw new InvalidArgument(IPC.libraryToggleSave)
    return backend.library.toggleSave(article)
  })
  handleBackend(IPC.libraryMarkRead, (article) => {
    if (!isArticle(article)) throw new InvalidArgument(IPC.libraryMarkRead)
    backend.library.markRead(article)
  })
  handleBackend(IPC.libraryClearHistory, () => backend.library.clearHistory())

  handleBackend(IPC.newsRefreshMarkets, () => backend.news.refreshMarkets())
  handleBackend(IPC.widgetsWeather, () => backend.widgets.weather())
  handleBackend(IPC.marketsQuotes, () => backend.markets.quotes())

  handle(IPC.readerOpen, ({ reader }, request) => {
    if (!isOpenRequest(request)) throw new InvalidArgument(IPC.readerOpen)
    reader.open(request.article, request.mode)
  })
  handle(IPC.readerClose, ({ reader }) => reader.close())
  handle(IPC.readerExtract, async ({ reader }, url) => {
    if (!isHttpUrl(url)) throw new InvalidArgument(IPC.readerExtract)
    const fromView = await reader.extractFromView(url)
    if (fromView) return fromView
    await ready
    return backend.reader.extract(url)
  })
  handle(IPC.readerProbe, (_host, url): ReaderProbe => {
    if (!isHttpUrl(url)) throw new InvalidArgument(IPC.readerProbe)
    // The embedded view is a top-level browser tab, so framing restrictions never apply.
    return { frameable: true, finalUrl: url }
  })
  handle(IPC.readerOpenExternal, async (_host, url) => {
    if (!isHttpUrl(url)) throw new InvalidArgument(IPC.readerOpenExternal)
    await shell.openExternal(url)
  })
  listen(IPC.readerBounds, ({ reader }, bounds) => {
    if (isBounds(bounds)) reader.setBounds(bounds)
  })
  listen(IPC.readerVisible, ({ reader }, visible) => {
    if (typeof visible === 'boolean') reader.setVisible(visible)
  })
  listen(IPC.readerNavigate, ({ reader }, action) => {
    if (NAVIGATIONS.includes(action as ReaderNavigation)) reader.navigate(action as ReaderNavigation)
  })

  handle(IPC.updatesStatus, async () => (await updates).get())
  handle(IPC.updatesCheck, async () => (await updates).check())
  handle(IPC.updatesDownload, async () => (await updates).download())
  handle(IPC.updatesInstall, async () => (await updates).install())

  handle(IPC.windowState, ({ win }) => windowState(win))
  listen(IPC.windowTitleBar, ({ win }, colors) => {
    if (isTitleBarColors(colors)) setTitleBarColors(win, colors)
  })

  const forward = <E extends BackendEventName>(event: E, channel: string): void => {
    backend.on(event, (payload: BackendEvents[E]) => {
      const host = current()
      if (host && !host.win.isDestroyed()) host.win.webContents.send(channel, payload)
    })
  }
  forward('settings', IPC.settingsChanged)
  forward('library', IPC.libraryChanged)
  forward('newsUpdated', IPC.newsUpdated)
  forward('newsStatus', IPC.newsStatus)
}
