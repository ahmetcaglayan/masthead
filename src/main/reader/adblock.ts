import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { net, type Session } from 'electron'
import type { ElectronBlocker } from '@ghostery/adblocker-electron'
import type { Logger } from '@core/backend'

const ENGINE_FILE = 'adblock-engine.bin'
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000
const STALE_CHECK_MS = 24 * 60 * 60 * 1000
const RETRY_MS = 10 * 60 * 1000
const FETCH_TIMEOUT_MS = 30_000
/** AdGuard Turkish, uBlock flavour. */
const TURKISH_LIST = 'https://filters.adtidy.org/extension/ublock/filters/13.txt'

type Blocker = typeof ElectronBlocker

/** Ghostery's list fetches, over Chromium's network stack (system proxy) and with a timeout. */
const fetchList = (url: string): Promise<Response> =>
  net.fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })

/**
 * Ad and tracker blocking for the reader session only: the Ghostery engine with
 * EasyList, EasyPrivacy, uBlock filters, EasyList Cookie and AdGuard Turkish.
 *
 * The compiled engine is cached on disk and rebuilt in the background when it is
 * older than three days. Nothing here throws: offline with a cache works, offline
 * without one simply means no blocking until a later retry.
 */
export class Adblocker {
  private readonly path: string
  private blocker: ElectronBlocker | null = null
  private loading: Promise<ElectronBlocker | null> | null = null
  private enabled = false
  private started = false
  private startTimer: NodeJS.Timeout | null = null
  private retryTimer: NodeJS.Timeout | null = null
  private settle: (active: boolean) => void = () => undefined
  /** Settles after the first load attempt (see `settled()`). */
  private readonly firstAttempt = new Promise<boolean>((resolve) => {
    this.settle = resolve
  })

  constructor(
    private readonly session: Session,
    cacheDir: string,
    private readonly logger: Logger
  ) {
    this.path = join(cacheDir, ENGINE_FILE)
  }

  /** True while the engine is blocking in the reader session. */
  get active(): boolean {
    return this.blocker?.isBlockingEnabled(this.session) ?? false
  }

  /**
   * Resolves once the first attempt to turn blocking on has finished (right away
   * when disabled): true when blocking is active. Used by the self-test.
   */
  settled(): Promise<boolean> {
    return this.firstAttempt
  }

  /** Begin loading after `delayMs`, off the startup path. Later calls are ignored. */
  start(delayMs: number): void {
    if (this.started || this.startTimer) return
    this.startTimer = setTimeout(() => {
      this.started = true
      void this.apply()
      setInterval(() => void this.refreshIfStale(), STALE_CHECK_MS).unref()
    }, delayMs)
  }

  /** Follow `settings.reader.blockAds`. */
  setEnabled(enabled: boolean): void {
    if (enabled === this.enabled) return
    this.enabled = enabled
    if (this.started) void this.apply()
  }

  private async apply(): Promise<void> {
    if (!this.enabled) {
      this.detach()
      this.settle(false)
      return
    }
    const blocker = await this.load()
    if (blocker && this.enabled) this.attach(blocker)
    this.settle(this.active)
  }

  private attach(blocker: ElectronBlocker): void {
    if (blocker.isBlockingEnabled(this.session)) return
    try {
      blocker.enableBlockingInSession(this.session)
      this.logger.info('Ad blocking enabled in the reader session')
    } catch (error) {
      this.logger.warn('Could not enable ad blocking', error)
    }
  }

  private detach(): void {
    const blocker = this.blocker
    if (!blocker?.isBlockingEnabled(this.session)) return
    try {
      blocker.disableBlockingInSession(this.session)
    } catch (error) {
      this.logger.warn('Could not disable ad blocking', error)
    }
  }

  private load(): Promise<ElectronBlocker | null> {
    this.loading ??= this.create().then(
      (blocker) => {
        this.blocker = blocker
        void this.refreshIfStale()
        return blocker
      },
      (error: unknown) => {
        this.logger.warn(
          'Ad blocking unavailable (no cached engine and the filter lists could not be fetched)',
          error
        )
        this.loading = null
        this.scheduleRetry()
        return null
      }
    )
    return this.loading
  }

  /** Read the cached engine, or fetch and compile the lists and cache the result. */
  private async create(): Promise<ElectronBlocker> {
    const { ElectronBlocker, lists } = await ghostery()
    return ElectronBlocker.fromLists(
      fetchList,
      lists,
      { enableCompression: true },
      {
        path: this.path,
        read: (path) => readFile(path),
        write: (path, buffer) => this.write(path, buffer)
      }
    )
  }

  private async refreshIfStale(): Promise<void> {
    if (!this.blocker) return
    try {
      const { mtimeMs } = await stat(this.path)
      if (Date.now() - mtimeMs < MAX_AGE_MS) return
    } catch {
      return
    }
    try {
      const { ElectronBlocker, lists } = await ghostery()
      const fresh = await ElectronBlocker.fromLists(fetchList, lists, { enableCompression: true })
      await this.write(this.path, fresh.serialize())
      this.swap(fresh)
      this.logger.info('Ad block lists refreshed')
    } catch (error) {
      this.logger.warn('Ad block list refresh failed; keeping the cached engine', error)
    }
  }

  private swap(next: ElectronBlocker): void {
    this.detach()
    this.blocker = next
    this.loading = Promise.resolve(next)
    if (this.enabled) this.attach(next)
  }

  /** Atomic write; a failed write only costs the cache, never the engine. */
  private async write(path: string, buffer: Uint8Array): Promise<void> {
    const temp = `${path}.${process.pid}.tmp`
    try {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(temp, buffer)
      await rename(temp, path)
    } catch (error) {
      this.logger.warn('Could not cache the ad block engine', error)
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimer) return
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      if (this.enabled) void this.apply()
    }, RETRY_MS)
    this.retryTimer.unref()
  }
}

/** The Ghostery module and our list selection, loaded on first use to keep it off the startup path. */
async function ghostery(): Promise<{ ElectronBlocker: Blocker; lists: string[] }> {
  const { ElectronBlocker, adsAndTrackingLists, fullLists } = await import('@ghostery/adblocker-electron')
  const cookieLists = fullLists.filter((url) => url.endsWith('/easylist-cookie.txt'))
  return { ElectronBlocker, lists: [...adsAndTrackingLists, ...cookieLists, TURKISH_LIST] }
}
