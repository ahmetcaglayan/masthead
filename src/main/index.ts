import { join } from 'node:path'
import { app, Menu, nativeTheme, type BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import type { Backend } from '@core/backend'
import { createBackend, createLogger } from '@core/index'
import { IPC } from '@shared/ipc'
import type { Settings } from '@shared/settings'
import { setUpAutomation, type AppHandle, type AutomationSession } from './automation'
import { registerIpc, type HostWindow } from './ipc'
import { createBreakingNotifier } from './notifications'
import { APP_CACHE_DIR } from './paths'
import { createUpdates } from './updates'
import { Adblocker } from './reader/adblock'
import { ReaderViewManager, readerSession } from './reader/view'
import { applyWindowTheme, createMainWindow, isDarkTheme, type MainWindow } from './window'

const APP_ID = 'com.ahmetcaglayan.masthead'
/** How long quitting waits for the backend to flush before giving up. */
const STOP_TIMEOUT_MS = 4000
const ADBLOCK_DELAY_MS = 3000

/** `--screenshots` / `--selftest` runs; null for a normal start. Prepared before anything else touches userData. */
const automation = setUpAutomation()
const logger = createLogger('main', automation?.logSink)

/** The open main window with its reader view; null before startup and after it closes (macOS). */
let host: (HostWindow & Pick<MainWindow, 'flushBounds'>) | null = null

if (automation) {
  // A temporary profile of its own: no single-instance lock, so it runs next to an open Masthead.
  app.setAppUserModelId(APP_ID)
  Menu.setApplicationMenu(null)
  hardenWebContents()
  app
    .whenReady()
    .then(() => start(automation))
    .then((handle) => automation.run(handle))
    .catch((error: unknown) => {
      logger.error('Automation run failed', error)
      app.exit(1)
    })
} else if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.setAppUserModelId(APP_ID)
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null)
  hardenWebContents()
  app.on('second-instance', () => {
    if (host) focus(host.win)
  })
  app
    .whenReady()
    .then(() => start(null))
    .catch((error: unknown) => {
      logger.error('Startup failed', error)
      app.exit(1)
    })
}

async function start(automation: AutomationSession | null): Promise<AppHandle> {
  if (process.platform === 'darwin' && !automation) installMacMenu()

  const userData = app.getPath('userData')
  const cacheDir = join(userData, APP_CACHE_DIR)
  const backend = await createBackend({
    dataDir: userData,
    cacheDir,
    appVersion: app.getVersion(),
    logger: createLogger('core', automation?.logSink),
    manualRefresh: automation?.manualRefresh
  })

  nativeTheme.themeSource = backend.settings.get().theme
  const adblock = new Adblocker(readerSession(), cacheDir, createLogger('adblock', automation?.logSink))
  adblock.setEnabled(backend.settings.get().reader.blockAds)
  // An automation window is never shown, so blocking starts right away instead of after the first paint.
  if (automation) adblock.start(0)

  const openWindow = (): HostWindow => {
    const settings = backend.settings.get()
    const { win, flushBounds } = createMainWindow({
      settings,
      saveBounds: (window) => backend.settings.update({ window }),
      headless: automation?.window
    })
    automation?.onWindowCreated(win)
    const reader = new ReaderViewManager(win, {
      dark: isDarkTheme(settings.theme),
      muted: automation !== null,
      onViewCreated: automation?.onViewCreated
    })
    const opened = { win, reader, flushBounds }
    if (!automation) win.once('show', () => adblock.start(ADBLOCK_DELAY_MS))
    win.on('closed', () => {
      if (host === opened) host = null
    })
    host = opened
    return opened
  }

  // The window goes up first; the backend loads its caches behind the first paint.
  openWindow()
  const ready = backend.start().catch((error: unknown) => logger.error('Backend failed to start', error))

  // Automation runs exit on their own and never update; a normal run saves before it quits.
  const stopBackend = automation ? () => Promise.resolve() : stopBackendOnQuit(backend)
  const updates = createUpdates({
    disabled: automation !== null,
    autoInstall: () => backend.settings.get().appUpdates.auto,
    prepareToQuit: stopBackend,
    onChange: (status) => {
      if (host && !host.win.isDestroyed()) host.win.webContents.send(IPC.updatesChanged, status)
    },
    logger: createLogger('updates', automation?.logSink)
  })
  updates
    .then((controller) => {
      controller.start()
      backend.on('settings', () => controller.settingsChanged())
    })
    .catch((error: unknown) => logger.error('Updater failed to start', error))

  registerIpc({ backend, ready, updates, current: () => host, observe: automation?.observeIpc })

  backend.on('settings', (settings) => applySettings(settings, adblock))
  nativeTheme.on('updated', () => {
    if (!host) return
    applyWindowTheme(host.win, nativeTheme.shouldUseDarkColors)
    host.reader.setDark(nativeTheme.shouldUseDarkColors)
  })

  const handle: AppHandle = { backend, started: ready, host: () => host, adblock }
  // Automation runs own their lifecycle: no notifications, no reopening, they exit when done.
  if (automation) return handle

  backend.on(
    'breaking',
    createBreakingNotifier({
      getSettings: () => backend.settings.get(),
      onOpen: (article) => {
        if (host) {
          focus(host.win)
          host.win.webContents.send(IPC.newsOpenArticle, article.id)
          return
        }
        // macOS keeps running without a window: a clicked notification opens one (it shows itself
        // when ready) and hands its page the story once loaded; the preload holds it until the app listens.
        const { win } = openWindow()
        win.webContents.once('did-finish-load', () => {
          if (!win.isDestroyed()) win.webContents.send(IPC.newsOpenArticle, article.id)
        })
      }
    })
  )

  app.on('activate', () => {
    if (!host) openWindow()
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
  return handle
}

/** Keep the host in step with settings: native theme (also what pages in the reader see), reader backdrop, ad blocking. */
function applySettings(settings: Settings, adblock: Adblocker): void {
  nativeTheme.themeSource = settings.theme
  adblock.setEnabled(settings.reader.blockAds)
  if (!host) return
  const dark = isDarkTheme(settings.theme)
  applyWindowTheme(host.win, dark)
  host.reader.setDark(dark)
}

/**
 * Hold the quit until the backend has flushed its stores, but never longer than `STOP_TIMEOUT_MS`.
 * Returns the stop itself, so a restart into an update can save everything before the
 * installer takes over; the quit that follows then goes straight through.
 */
function stopBackendOnQuit(backend: Backend): () => Promise<void> {
  let stopping: Promise<void> | null = null
  let stopped = false
  let quitting = false
  const stop = (): Promise<void> => {
    stopping ??= (async () => {
      host?.flushBounds()
      host?.win.hide()
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, STOP_TIMEOUT_MS).unref())
      await Promise.race([backend.stop(), timeout]).catch((error: unknown) =>
        logger.error('Backend did not stop cleanly', error)
      )
      stopped = true
    })()
    return stopping
  }
  app.on('before-quit', (event) => {
    if (stopped) return
    event.preventDefault()
    if (quitting) return
    quitting = true
    void stop().then(() => app.quit())
  })
  return stop
}

/** App-wide defaults for every web contents: no new windows, no <webview>. Views opt in to more themselves. */
function hardenWebContents(): void {
  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(() => ({ action: 'deny' }))
    contents.on('will-attach-webview', (event) => event.preventDefault())
  })
}

function installMacMenu(): void {
  const template: MenuItemConstructorOptions[] = [{ role: 'appMenu' }, { role: 'editMenu' }]
  if (!app.isPackaged) {
    template.push({ label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }] })
  }
  template.push({ role: 'windowMenu' })
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function focus(win: BrowserWindow): void {
  if (win.isDestroyed()) return
  if (win.isMinimized()) win.restore()
  win.show()
  win.focus()
}
