import { join } from 'node:path'
import {
  app,
  BrowserWindow,
  nativeTheme,
  screen,
  type BrowserWindowConstructorOptions,
  type Rectangle
} from 'electron'
import { createLogger } from '@core/log'
import { IPC, type WindowState } from '@shared/ipc'
import type { Settings, ThemeMode } from '@shared/settings'

/** Saved window geometry, as stored in `settings.window`. */
export type WindowBounds = NonNullable<Settings['window']>

export interface MainWindow {
  win: BrowserWindow
  /** Persist a pending bounds change right away (before quitting). */
  flushBounds(): void
}

export interface MainWindowOptions {
  settings: Settings
  /** Stores the window's normal bounds and maximized flag; called debounced. */
  saveBounds(bounds: WindowBounds): void
  /**
   * Automation modes (screenshots, self-test): a window of exactly this content
   * size that keeps rendering without ever appearing on screen. Saved geometry
   * is neither used nor tracked.
   */
  headless?: { width: number; height: number }
}

/** Where a headless window goes when it has to be shown to be captured: off every display. */
export const OFFSCREEN_X = -3000

const DEFAULT_SIZE = { width: 1440, height: 900 }
const MIN_SIZE = { width: 1024, height: 680 }
const TITLE_BAR_HEIGHT = 44
const SAVE_DELAY_MS = 500

/** Canvas and caption-symbol colours; they mirror `--canvas` / `--fg-muted` in globals.css. */
const CHROME = {
  light: { background: '#f6f4ef', symbol: '#5c574d' },
  dark: { background: '#13120f', symbol: '#aba596' }
} as const

const CSS_COLOR = /^(?:#[0-9a-f]{3}|#[0-9a-f]{6}|(?:rgb|hsl)a?\([\d\s.,%]+\))$/i

const devServerUrl = app.isPackaged ? undefined : process.env.ELECTRON_RENDERER_URL
const logger = createLogger('window')

/** Resolve a theme setting; `system` follows the OS. */
export function isDarkTheme(theme: ThemeMode): boolean {
  return theme === 'system' ? nativeTheme.shouldUseDarkColors : theme === 'dark'
}

/** Create the main window (hidden title bar, native caption buttons), restore its geometry and load the renderer. */
export function createMainWindow({ settings, saveBounds, headless }: MainWindowOptions): MainWindow {
  const chrome = isDarkTheme(settings.theme) ? CHROME.dark : CHROME.light
  const frame: BrowserWindowConstructorOptions =
    process.platform === 'darwin'
      ? { titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 16, y: 15 } }
      : {
          icon: join(__dirname, '../../resources/icon.png'),
          titleBarStyle: 'hidden',
          titleBarOverlay: { color: chrome.background, symbolColor: chrome.symbol, height: TITLE_BAR_HEIGHT }
        }

  const win = new BrowserWindow({
    ...(headless
      ? { ...headless, x: OFFSCREEN_X, y: 0, useContentSize: true, skipTaskbar: true }
      : initialBounds(settings.window)),
    ...frame,
    minWidth: MIN_SIZE.width,
    minHeight: MIN_SIZE.height,
    show: false,
    paintWhenInitiallyHidden: true,
    title: 'Masthead',
    backgroundColor: chrome.background,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      devTools: !app.isPackaged,
      // A hidden window must keep painting and running timers and animation frames.
      backgroundThrottling: !headless
    }
  })

  if (!headless) {
    win.once('ready-to-show', () => {
      if (settings.window?.maximized) win.maximize()
      win.show()
    })
  }

  win.webContents.on('will-navigate', (event) => event.preventDefault())
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  if (!app.isPackaged) {
    win.webContents.on('before-input-event', (_event, input) => {
      if (input.type === 'keyDown' && input.key === 'F12') win.webContents.toggleDevTools()
    })
  }

  forwardWindowState(win)
  const flushBounds = headless ? () => undefined : trackBounds(win, saveBounds)
  loadRenderer(win)
  return { win, flushBounds }
}

/** Maximized / fullscreen / focus flags reported to the renderer. */
export function windowState(win: BrowserWindow): WindowState {
  return { maximized: win.isMaximized(), fullscreen: win.isFullScreen(), focused: win.isFocused() }
}

/** Recolour the native caption buttons (Windows/Linux title-bar overlay). Invalid colours are ignored. */
export function setTitleBarColors(win: BrowserWindow, colors: { background: string; symbol: string }): void {
  if (process.platform === 'darwin' || win.isDestroyed()) return
  if (!CSS_COLOR.test(colors.background) || !CSS_COLOR.test(colors.symbol)) return
  win.setTitleBarOverlay({ color: colors.background, symbolColor: colors.symbol, height: TITLE_BAR_HEIGHT })
  win.setBackgroundColor(colors.background)
}

/** Match the window background (visible while resizing) to the theme. */
export function applyWindowTheme(win: BrowserWindow, dark: boolean): void {
  if (!win.isDestroyed()) win.setBackgroundColor(dark ? CHROME.dark.background : CHROME.light.background)
}

/** True when `url` is the app's own renderer page: the Vite dev server in development, a file in production. */
export function isRendererUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return devServerUrl ? parsed.origin === new URL(devServerUrl).origin : parsed.protocol === 'file:'
  } catch {
    return false
  }
}

function loadRenderer(win: BrowserWindow): void {
  const loading = devServerUrl
    ? win.loadURL(devServerUrl)
    : win.loadFile(join(__dirname, '../renderer/index.html'))
  loading.catch((error: unknown) => logger.error('Failed to load the renderer', error))
}

function initialBounds(saved: Settings['window']): Partial<Rectangle> & { width: number; height: number } {
  const work = screen.getPrimaryDisplay().workAreaSize
  const size = {
    width: Math.min(saved?.width ?? DEFAULT_SIZE.width, work.width),
    height: Math.min(saved?.height ?? DEFAULT_SIZE.height, work.height)
  }
  if (saved?.x === undefined || saved.y === undefined) return size
  const rect = { x: saved.x, y: saved.y, width: saved.width, height: saved.height }
  return isReachable(rect) ? rect : size
}

/** True when enough of the window's title bar lies on some display for the user to grab it. */
function isReachable(rect: Rectangle): boolean {
  return screen.getAllDisplays().some(({ workArea: area }) => {
    const width = Math.min(rect.x + rect.width, area.x + area.width) - Math.max(rect.x, area.x)
    const height = Math.min(rect.y + TITLE_BAR_HEIGHT, area.y + area.height) - Math.max(rect.y, area.y)
    return width >= 160 && height >= TITLE_BAR_HEIGHT / 2
  })
}

function trackBounds(win: BrowserWindow, save: (bounds: WindowBounds) => void): () => void {
  let timer: NodeJS.Timeout | undefined

  const flush = (): void => {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
    if (win.isDestroyed() || win.isMinimized() || win.isFullScreen()) return
    const { x, y, width, height } = win.getNormalBounds()
    save({ x, y, width, height, maximized: win.isMaximized() })
  }
  const schedule = (): void => {
    clearTimeout(timer)
    timer = setTimeout(flush, SAVE_DELAY_MS)
  }

  win.on('resize', schedule)
  win.on('move', schedule)
  win.on('maximize', schedule)
  win.on('unmaximize', schedule)
  win.on('close', flush)
  return flush
}

function forwardWindowState(win: BrowserWindow): void {
  const send = (): void => {
    if (!win.isDestroyed()) win.webContents.send(IPC.windowState, windowState(win))
  }
  win.on('maximize', send)
  win.on('unmaximize', send)
  win.on('enter-full-screen', send)
  win.on('leave-full-screen', send)
  win.on('enter-html-full-screen', send)
  win.on('leave-html-full-screen', send)
  win.on('focus', send)
  win.on('blur', send)
}
