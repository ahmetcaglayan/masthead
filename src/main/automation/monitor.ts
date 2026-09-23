import type { WebContents } from 'electron'
import type { LogEntry, LogSink } from '@core/index'

/** One `invoke` call the renderer made, with its outcome once settled. */
export interface IpcCall {
  channel: string
  at: number
  settled: boolean
  value?: unknown
  error?: string
}

/** A console message or failure, as reported in the self-test. */
export interface Problem {
  source: string
  message: string
}

/** Chromium's console line for a failed subresource (a publisher's broken image, a blocked request). */
const RESOURCE_ERROR = /^Failed to load resource\b/

const describe = (error: unknown): string =>
  error instanceof Error ? (error.stack ?? `${error.name}: ${error.message}`) : String(error)

/**
 * Everything an automation run watches: log entries, uncaught errors in the
 * main process, the renderer's console and crashes, `invoke` calls and their
 * outcomes, and the reader's page views.
 */
export class Monitor {
  readonly logs: LogEntry[] = []
  readonly mainErrors: Problem[] = []
  readonly rendererErrors: Problem[] = []
  /** Failed subresource loads in the app's renderer (not counted as app errors). */
  readonly rendererResourceErrors: Problem[] = []
  readonly calls: IpcCall[] = []
  /** Page views created by the reader, newest last. */
  readonly views: WebContents[] = []
  /** Per page view: console errors, failed main-frame loads and crashes. */
  readonly viewProblems = new Map<WebContents, Problem[]>()

  constructor(private readonly verbose: boolean) {}

  /** Records every entry; prints warnings and errors (and info when verbose) to stderr. */
  readonly sink: LogSink = (entry) => {
    this.logs.push(entry)
    if (entry.level === 'info' && !this.verbose) return
    const details = entry.details.map((detail) => (detail instanceof Error ? detail.message : String(detail)))
    const line = [`${entry.level.toUpperCase().padEnd(5)} [${entry.scope}] ${entry.message}`, ...details]
    process.stderr.write(line.join(' ') + '\n')
  }

  /** Catch what would otherwise end in Electron's error dialog, which would block an unattended run. */
  watchProcess(): void {
    process.on('uncaughtException', (error) => this.mainError('uncaughtException', error))
    process.on('unhandledRejection', (reason) => this.mainError('unhandledRejection', reason))
  }

  mainError(source: string, error: unknown): void {
    const message = describe(error)
    this.mainErrors.push({ source, message })
    process.stderr.write(`ERROR [${source}] ${message}\n`)
  }

  /** The app's own renderer: console errors, crashes, preload failures. */
  watchRenderer(contents: WebContents): void {
    contents.on('console-message', (event) => {
      if (event.level !== 'error') return
      const problem = { source: `${event.sourceId}:${event.lineNumber}`, message: event.message }
      if (RESOURCE_ERROR.test(event.message)) this.rendererResourceErrors.push(problem)
      else this.rendererErrors.push(problem)
      if (this.verbose) process.stderr.write(`RENDERER ${problem.message} (${problem.source})\n`)
    })
    contents.on('render-process-gone', (_event, details) => {
      this.rendererErrors.push({ source: 'render-process-gone', message: details.reason })
    })
    contents.on('preload-error', (_event, path, error) => {
      this.rendererErrors.push({ source: `preload ${path}`, message: describe(error) })
    })
    contents.on('unresponsive', () => {
      this.rendererErrors.push({ source: 'unresponsive', message: 'The renderer stopped responding' })
    })
  }

  /** A reader page view was created. */
  readonly viewCreated = (contents: WebContents): void => {
    this.views.push(contents)
    const problems: Problem[] = []
    this.viewProblems.set(contents, problems)
    contents.on('console-message', (event) => {
      if (event.level === 'error') problems.push({ source: 'console', message: event.message })
    })
    contents.on('did-fail-load', (_event, code, description, url, isMainFrame) => {
      // -3 (ERR_ABORTED) is a navigation replaced by another one.
      if (isMainFrame && code !== -3)
        problems.push({ source: 'did-fail-load', message: `${description} ${url}` })
    })
    contents.on('render-process-gone', (_event, details) => {
      problems.push({ source: 'render-process-gone', message: details.reason })
    })
    // The reader session's preloads (Ghostery's cosmetic filtering); in a packaged app they load from app.asar.
    contents.on('preload-error', (_event, path, error) => {
      problems.push({ source: `preload ${path}`, message: describe(error) })
    })
  }

  /** Records an `invoke` call (see `IpcContext.observe`). */
  readonly observeIpc = (channel: string, outcome: Promise<unknown>): void => {
    const call: IpcCall = { channel, at: Date.now(), settled: false }
    this.calls.push(call)
    outcome.then(
      (value) => Object.assign(call, { settled: true, value }),
      (error: unknown) => Object.assign(call, { settled: true, error: describe(error) })
    )
  }

  /** Calls on `channel` made at or after `since` (epoch ms). */
  callsSince(channel: string, since: number): IpcCall[] {
    return this.calls.filter((call) => call.channel === channel && call.at >= since)
  }

  /** Log entries of `level` from `scope` (e.g. `adblock`). */
  entries(scope: string, levels: LogEntry['level'][]): LogEntry[] {
    return this.logs.filter((entry) => entry.scope === scope && levels.includes(entry.level))
  }
}
