/**
 * App updates, without Electron: when to check, what to report to the window and how to
 * restart into a new version. `index.ts` wires it to electron-updater; tests drive it with
 * a fake updater.
 */
import type { Logger } from '@core/backend'
import type { UpdateMode, UpdateStatus } from '@shared/ipc'

/** Check this often while the app runs. */
export const CHECK_INTERVAL_MS = 60 * 60 * 1000
/** The first check waits for startup to settle. */
export const FIRST_CHECK_DELAY_MS = 10_000
/** If the app is still running this long after handing over to the installer, relaunch it. */
export const INSTALL_FALLBACK_MS = 10_000

interface VersionInfo {
  version: string
}

/** The part of electron-updater's `AppUpdater` the controller drives. */
export interface Updater {
  autoDownload: boolean
  checkForUpdates(): Promise<unknown>
  downloadUpdate(): Promise<unknown>
  quitAndInstall(isSilent?: boolean, isForceRunAfter?: boolean): void
  on(event: 'update-available', listener: (info: VersionInfo) => void): unknown
  on(event: 'update-not-available', listener: (info: VersionInfo) => void): unknown
  on(event: 'update-downloaded', listener: (info: VersionInfo) => void): unknown
  on(event: 'download-progress', listener: (progress: { percent: number }) => void): unknown
  on(event: 'error', listener: (error: Error) => void): unknown
}

/**
 * How a copy of the app can update itself. The Windows installer and the Linux AppImage
 * replace themselves; the portable exe, the unsigned macOS app (Squirrel.Mac only installs
 * signed apps) and the .deb (it would need root) can only point the user to the download.
 */
export function detectUpdateMode(
  env: Record<string, string | undefined>,
  platform: string,
  packaged: boolean
): UpdateMode {
  if (!packaged) return 'none'
  if (platform === 'win32') return env.PORTABLE_EXECUTABLE_DIR ? 'manual' : 'auto'
  if (platform === 'linux') return env.APPIMAGE ? 'auto' : 'manual'
  return 'manual'
}

export interface UpdateControllerOptions {
  mode: UpdateMode
  /** The running version. */
  current: string
  /** Null when `mode` is `none`. */
  updater: Updater | null
  /** The "install updates automatically" setting. */
  autoInstall(): boolean
  /** Save everything and close the window before the installer takes over. */
  prepareToQuit(): Promise<void>
  /** Called when the installer did not end the app in time. */
  relaunch(): void
  onChange(status: UpdateStatus): void
  logger: Logger
  now?: () => number
}

const shortError = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error)).split('\n')[0].slice(0, 200)

export class UpdateController {
  private status: UpdateStatus
  private readonly timers: ReturnType<typeof setTimeout>[] = []
  private readonly now: () => number

  constructor(private readonly options: UpdateControllerOptions) {
    this.now = options.now ?? Date.now
    this.status = { mode: options.mode, state: 'idle', current: options.current }
    const { updater } = options
    if (!updater) return
    updater.on('update-available', ({ version }) =>
      this.set({
        state: updater.autoDownload ? 'downloading' : 'available',
        version,
        percent: updater.autoDownload ? 0 : undefined,
        checkedAt: this.now(),
        error: undefined
      })
    )
    updater.on('update-not-available', () =>
      this.set({
        state: 'idle',
        version: undefined,
        percent: undefined,
        checkedAt: this.now(),
        error: undefined
      })
    )
    updater.on('download-progress', ({ percent }) =>
      this.set({ state: 'downloading', percent: Math.max(0, Math.min(100, Math.round(percent))) })
    )
    updater.on('update-downloaded', ({ version }) =>
      this.set({ state: 'ready', version, percent: undefined, error: undefined })
    )
    updater.on('error', (error) => this.fail(error))
  }

  get(): UpdateStatus {
    return this.status
  }

  /** First check shortly after startup, then every hour. Nothing happens in `none` mode. */
  start(): void {
    if (!this.options.updater) return
    const tick = (): void => void this.check()
    const first = setTimeout(tick, FIRST_CHECK_DELAY_MS)
    const hourly = setInterval(tick, CHECK_INTERVAL_MS)
    // Timers must never keep a quitting app alive.
    first.unref?.()
    hourly.unref?.()
    this.timers.push(first, hourly)
  }

  stop(): void {
    for (const timer of this.timers.splice(0)) clearTimeout(timer)
  }

  /** Look for a new version. A download in progress or a finished one is left alone. */
  async check(): Promise<UpdateStatus> {
    const { updater, mode } = this.options
    if (!updater) return this.status
    if (['checking', 'downloading', 'ready'].includes(this.status.state)) return this.status
    updater.autoDownload = mode === 'auto' && this.options.autoInstall()
    this.set({ state: 'checking', error: undefined })
    try {
      await updater.checkForUpdates()
      // A check that ends without an event (the updater is inactive) goes back to idle.
      if (this.status.state === 'checking') this.set({ state: 'idle', checkedAt: this.now() })
    } catch (error) {
      // The updater usually reports the same failure as an 'error' event too.
      if (!this.failed()) this.fail(error)
    }
    return this.status
  }

  /** Download the available version: automatic installs are off, or were just switched on. */
  async download(): Promise<void> {
    const { updater, mode } = this.options
    if (!updater || mode !== 'auto' || this.status.state !== 'available') return
    this.set({ state: 'downloading', percent: 0 })
    try {
      await updater.downloadUpdate()
    } catch (error) {
      if (!this.failed()) this.fail(error)
    }
  }

  /** The setting changed: switching automatic installs on fetches a version that is waiting. */
  settingsChanged(): void {
    if (this.options.mode === 'auto' && this.options.autoInstall() && this.status.state === 'available') {
      void this.download()
    }
  }

  /** Save, close and hand over to the installer, which starts the new version when it is done. */
  async install(): Promise<void> {
    const { updater } = this.options
    if (!updater || this.status.state !== 'ready') return
    this.options.logger.info(`Restarting into ${this.status.version ?? 'the new version'}`)
    this.stop()
    await this.options.prepareToQuit()
    updater.quitAndInstall(true, true)
    setTimeout(() => {
      this.options.logger.warn('The installer did not take over; relaunching')
      this.options.relaunch()
    }, INSTALL_FALLBACK_MS).unref?.()
  }

  /** Read afresh: the updater's events change the state while a call is awaited. */
  private failed(): boolean {
    return this.status.state === 'error'
  }

  private fail(error: unknown): void {
    this.options.logger.warn('Update check failed', shortError(error))
    // A finished download stays usable even if a later check fails.
    if (this.status.state === 'ready') return
    this.set({ state: 'error', error: shortError(error), percent: undefined, checkedAt: this.now() })
  }

  private set(patch: Partial<UpdateStatus>): void {
    const next: UpdateStatus = { ...this.status, ...patch }
    for (const key of Object.keys(next) as (keyof UpdateStatus)[])
      if (next[key] === undefined) delete next[key]
    this.status = next
    this.options.onChange(next)
  }
}
