/**
 * Automation modes of the desktop app, switched on only by exact command-line flags:
 *
 *   electron . --screenshots[=<outDir>] [--shots=a,b] [--langs=en,tr] [--themes=dark,light] [--scale=1]
 *   electron . --selftest
 *
 * Both run against the built app (`npx electron-vite build` first) in a fresh
 * temporary profile, with a 1440×900 window that never appears on screen (hidden,
 * or shown inactive left of every display when a hidden one is throttled; see
 * capture.ts), and exit with 0 on success or 1 on failure. They skip the
 * single-instance lock, so they run next to an open Masthead. Without either flag
 * nothing here runs. See scripts/screenshots.mjs and scripts/selftest.mjs.
 */
import { join } from 'node:path'
import { app, BrowserWindow, type WebContents } from 'electron'
import type { Backend } from '@core/backend'
import type { LogSink } from '@core/index'
import type { HostWindow } from '../ipc'
import type { Adblocker } from '../reader/adblock'
import { AutomationArgsError, parseAutomationArgs, type AutomationOptions } from './args'
import { WindowCapturer } from './capture'
import { Monitor } from './monitor'
import { withTimeout } from './page'
import { createProfile, type Profile } from './profile'
import { runScreenshots } from './screenshots'
import { runSelftest, type SelftestReport } from './selftest'

const WINDOW_SIZE = { width: 1440, height: 900 }
/** Hard limits for a whole run; the process exits with 1 when one is hit. */
const WATCHDOG_MS = { screenshots: 20 * 60_000, selftest: 6 * 60_000 }
const STOP_TIMEOUT_MS = 4000
/** İstanbul, so the local page has stories. */
const LOCATION = { provinceCode: '34', regionId: 'marmara' }

/** What the automation runners need from the started app. */
export interface AppHandle {
  backend: Backend
  /** Settles once `backend.start()` has. */
  started: Promise<void>
  host(): HostWindow | null
  adblock: Adblocker
}

/** A prepared automation run: the hooks `start()` wires in, and the runner. */
export interface AutomationSession {
  mode: AutomationOptions['mode']
  /** Content size of the (never shown) main window. */
  window: { width: number; height: number }
  /** No refresh timers: screenshots keep one stable snapshot. */
  manualRefresh: boolean
  logSink: LogSink
  observeIpc(channel: string, outcome: Promise<unknown>): void
  onWindowCreated(win: BrowserWindow): void
  onViewCreated(contents: WebContents): void
  /** Run the mode against the started app, then exit the process. */
  run(app: AppHandle): Promise<void>
}

const write = (stream: NodeJS.WriteStream, text: string): Promise<void> =>
  new Promise((resolve) => stream.write(text, () => resolve()))

/**
 * Read the command line and, for an automation flag, prepare the run: a fresh
 * temporary userData (set here, before the app is ready), Chromium switches that
 * keep a hidden window rendering, and capture of logs and uncaught errors.
 * Null for a normal run. Exits the process on a malformed automation command line.
 */
export function setUpAutomation(): AutomationSession | null {
  let options: AutomationOptions | null
  try {
    options = parseAutomationArgs(process.argv, process.cwd())
  } catch (error) {
    if (!(error instanceof AutomationArgsError)) throw error
    process.stderr.write(`${error.message}\n`)
    process.exit(2)
  }
  if (!options) return null

  const monitor = new Monitor(options.verbose)
  monitor.watchProcess()
  const screenshots = options.mode === 'screenshots' ? options : null
  const projectDirs = [...new Set([app.getAppPath(), process.cwd()])]
  const profile: Profile = createProfile({
    mode: options.mode,
    settings: {
      onboardingCompleted: screenshots?.shots[0] !== 'onboarding',
      language: screenshots?.langs[0] ?? 'en',
      theme: screenshots?.themes[0] ?? 'system',
      location: screenshots ? LOCATION : undefined,
      notifications: { breaking: false }
    },
    // Screenshots start from the web mode's cache and the normal profile's ad block engine;
    // the self-test builds everything from the network, as a first run does.
    newsCacheFrom: screenshots ? projectDirs.map((dir) => join(dir, '.masthead-web')) : [],
    adblockFrom: screenshots ? app.getPath('userData') : undefined
  })
  app.setPath('userData', profile.dir)
  app.setPath('sessionData', profile.dir)
  if (options.verbose) {
    process.stderr.write(
      `INFO  [automation] profile ${profile.dir}; news cache from ${profile.seededFrom ?? 'network'}\n`
    )
  }

  app.commandLine.appendSwitch('disable-renderer-backgrounding')
  app.commandLine.appendSwitch('disable-background-timer-throttling')
  app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')
  if (screenshots) app.commandLine.appendSwitch('force-device-scale-factor', String(screenshots.scale))

  const mode = options
  return {
    mode: options.mode,
    window: WINDOW_SIZE,
    manualRefresh: screenshots !== null,
    logSink: monitor.sink,
    observeIpc: monitor.observeIpc,
    onWindowCreated: (win) => monitor.watchRenderer(win.webContents),
    // Pages stay silent: the host creates the reader view muted in automation runs.
    onViewCreated: (contents) => monitor.viewCreated(contents),
    run: (handle) => run(mode, handle, monitor)
  }
}

async function run(options: AutomationOptions, handle: AppHandle, monitor: Monitor): Promise<void> {
  const warn = (message: string): void => void process.stderr.write(`WARN  [${options.mode}] ${message}\n`)
  const info = (message: string): void => {
    if (options.verbose) process.stderr.write(`INFO  [${options.mode}] ${message}\n`)
  }
  const host = handle.host()
  let code: number
  let report: SelftestReport | null = null
  let watchdog: NodeJS.Timeout | undefined
  const expired = new Promise<'expired'>((resolve) => {
    watchdog = setTimeout(() => resolve('expired'), WATCHDOG_MS[options.mode])
  })
  try {
    if (!host) throw new Error('The main window did not open')
    const capturer = new WindowCapturer(host.win, warn, info)
    let task: Promise<number>
    if (options.mode === 'screenshots') {
      task = runScreenshots(handle, options, monitor, capturer)
    } else {
      // Timings count from launch.
      const started = new Date(Date.now() - process.uptime() * 1000)
      const selftest: SelftestReport = {
        ok: false,
        startedAt: started.toISOString(),
        durationMs: 0,
        app: {
          version: app.getVersion(),
          electron: process.versions.electron,
          chrome: process.versions.chrome,
          platform: process.platform,
          packaged: app.isPackaged
        },
        checks: []
      }
      report = selftest
      task = runSelftest(handle, monitor, capturer, selftest).then(() => (selftest.ok ? 0 : 1))
    }
    const outcome = await Promise.race([task, expired])
    if (outcome === 'expired') {
      const minutes = WATCHDOG_MS[options.mode] / 60_000
      report?.checks.push({
        name: 'watchdog',
        ok: false,
        detail: `the run did not finish within ${minutes} min`
      })
      throw new Error(`Gave up after ${minutes} min`)
    }
    code = outcome
  } catch (error) {
    code = 1
    process.stderr.write(
      `ERROR [${options.mode}] ${error instanceof Error ? error.message : String(error)}\n`
    )
  } finally {
    clearTimeout(watchdog)
  }

  if (report) {
    report.ok = code === 0 && report.checks.every((check) => check.ok)
    report.durationMs = Date.now() - Date.parse(report.startedAt)
    await write(process.stdout, JSON.stringify(report, null, 2) + '\n')
  }
  await exit(handle, code)
}

/**
 * Stop the backend, close every window and exit with `code`. Chromium holds files in the
 * temporary profile until its processes are gone, so the profile is removed afterwards: by
 * the wrapper scripts once Electron has exited, or by the next automation run.
 */
async function exit(handle: AppHandle, code: number): Promise<void> {
  await withTimeout(handle.backend.stop(), STOP_TIMEOUT_MS, 'backend stop').catch(() => undefined)
  for (const win of BrowserWindow.getAllWindows()) win.destroy()
  app.exit(code)
}
