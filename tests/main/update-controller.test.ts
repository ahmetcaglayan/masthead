import { EventEmitter } from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UpdateMode, UpdateStatus } from '../../src/shared/ipc'
import {
  CHECK_INTERVAL_MS,
  FIRST_CHECK_DELAY_MS,
  INSTALL_FALLBACK_MS,
  UpdateController,
  detectUpdateMode
} from '../../src/main/updates/controller'

/** Stands in for electron-updater: `respond` decides what a check does. */
class FakeUpdater extends EventEmitter {
  autoDownload = true
  checks = 0
  downloads = 0
  installs: [boolean | undefined, boolean | undefined][] = []
  respond: (updater: FakeUpdater) => Promise<unknown> = async () => {
    this.emit('update-not-available', { version: '0.3.0' })
  }

  checkForUpdates(): Promise<unknown> {
    this.checks++
    return this.respond(this)
  }

  downloadUpdate(): Promise<unknown> {
    this.downloads++
    this.emit('download-progress', { percent: 42.4 })
    this.emit('update-downloaded', { version: '0.4.0' })
    return Promise.resolve()
  }

  quitAndInstall(isSilent?: boolean, isForceRunAfter?: boolean): void {
    this.installs.push([isSilent, isForceRunAfter])
  }
}

const offerUpdate = async (updater: FakeUpdater): Promise<void> => {
  updater.emit('update-available', { version: '0.4.0' })
  if (updater.autoDownload) await updater.downloadUpdate()
}

const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }

function setUp(mode: UpdateMode = 'auto', auto = true) {
  const updater = new FakeUpdater()
  const changes: UpdateStatus[] = []
  const calls: string[] = []
  let autoInstall = auto
  const controller = new UpdateController({
    mode,
    current: '0.3.0',
    updater,
    autoInstall: () => autoInstall,
    prepareToQuit: async () => {
      calls.push('prepare')
    },
    relaunch: () => calls.push('relaunch'),
    onChange: (status) => changes.push(status),
    logger,
    now: () => 1000
  })
  return {
    updater,
    controller,
    changes,
    calls,
    setAuto: (value: boolean) => {
      autoInstall = value
    }
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  logger.warn.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('detectUpdateMode', () => {
  it('updates installed Windows copies and AppImages, points everyone else to the download', () => {
    expect(detectUpdateMode({}, 'win32', true)).toBe('auto')
    expect(detectUpdateMode({ PORTABLE_EXECUTABLE_DIR: 'C:\\Apps' }, 'win32', true)).toBe('manual')
    expect(detectUpdateMode({ APPIMAGE: '/home/a/Masthead.AppImage' }, 'linux', true)).toBe('auto')
    expect(detectUpdateMode({}, 'linux', true)).toBe('manual')
    expect(detectUpdateMode({}, 'darwin', true)).toBe('manual')
    expect(detectUpdateMode({}, 'win32', false)).toBe('none')
  })

  it('leaves a Microsoft Store copy to the Store', () => {
    expect(detectUpdateMode({}, 'win32', true, true)).toBe('store')
    expect(detectUpdateMode({}, 'win32', false, true)).toBe('none')
  })
})

describe('UpdateController', () => {
  it('checks shortly after startup and then every hour', async () => {
    const { updater, controller } = setUp()
    controller.start()
    expect(updater.checks).toBe(0)
    await vi.advanceTimersByTimeAsync(FIRST_CHECK_DELAY_MS)
    expect(updater.checks).toBe(1)
    await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS)
    expect(updater.checks).toBe(2)
    await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS)
    expect(updater.checks).toBe(3)
    controller.stop()
    await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS)
    expect(updater.checks).toBe(3)
  })

  it('reports an up-to-date copy as idle', async () => {
    const { controller } = setUp()
    expect(await controller.check()).toEqual({
      mode: 'auto',
      state: 'idle',
      current: '0.3.0',
      checkedAt: 1000
    })
  })

  it('downloads a new version by itself and waits for a restart', async () => {
    const { updater, controller, changes } = setUp('auto', true)
    updater.respond = offerUpdate
    await controller.check()
    expect(updater.autoDownload).toBe(true)
    expect(changes.map((s) => s.state)).toEqual(['checking', 'downloading', 'downloading', 'ready'])
    expect(changes[2].percent).toBe(42)
    expect(controller.get()).toMatchObject({ state: 'ready', version: '0.4.0' })
    // Later checks leave a finished download alone.
    await controller.check()
    expect(updater.checks).toBe(1)
  })

  it('only offers the version when automatic installs are off, and fetches it when switched on', async () => {
    const { updater, controller, setAuto } = setUp('auto', false)
    updater.respond = offerUpdate
    await controller.check()
    expect(controller.get()).toMatchObject({ state: 'available', version: '0.4.0' })
    expect(updater.downloads).toBe(0)
    setAuto(true)
    controller.settingsChanged()
    await vi.runAllTimersAsync()
    expect(updater.downloads).toBe(1)
    expect(controller.get().state).toBe('ready')
  })

  it('never downloads for a copy that cannot install itself', async () => {
    const { updater, controller } = setUp('manual', true)
    updater.respond = offerUpdate
    await controller.check()
    expect(updater.autoDownload).toBe(false)
    expect(controller.get()).toMatchObject({ state: 'available', version: '0.4.0', mode: 'manual' })
    await controller.download()
    expect(updater.downloads).toBe(0)
  })

  it('reports a failed check once and tries again on the next one', async () => {
    const { updater, controller } = setUp()
    updater.respond = async (u) => {
      u.emit('error', new Error('net::ERR_INTERNET_DISCONNECTED\n    at stack'))
      throw new Error('net::ERR_INTERNET_DISCONNECTED')
    }
    await controller.check()
    expect(controller.get()).toMatchObject({ state: 'error', error: 'net::ERR_INTERNET_DISCONNECTED' })
    expect(logger.warn).toHaveBeenCalledTimes(1)
    updater.respond = offerUpdate
    await controller.check()
    expect(controller.get().state).toBe('ready')
    expect(controller.get().error).toBeUndefined()
  })

  it('keeps a finished download when a later error comes in', async () => {
    const { updater, controller } = setUp()
    updater.respond = offerUpdate
    await controller.check()
    updater.emit('error', new Error('rate limited'))
    expect(controller.get().state).toBe('ready')
  })

  it('saves before handing over to the installer, and relaunches if the installer never takes over', async () => {
    const { updater, controller, calls } = setUp()
    await controller.install()
    expect(updater.installs).toEqual([])
    updater.respond = offerUpdate
    await controller.check()
    await controller.install()
    expect(calls).toEqual(['prepare'])
    expect(updater.installs).toEqual([[true, true]])
    await vi.advanceTimersByTimeAsync(INSTALL_FALLBACK_MS)
    expect(calls).toEqual(['prepare', 'relaunch'])
  })

  it('does nothing without an updater (web mode, development builds)', async () => {
    const changes: UpdateStatus[] = []
    const controller = new UpdateController({
      mode: 'none',
      current: '0.3.0',
      updater: null,
      autoInstall: () => true,
      prepareToQuit: () => Promise.resolve(),
      relaunch: () => undefined,
      onChange: (status) => changes.push(status),
      logger
    })
    controller.start()
    await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS * 2)
    expect(await controller.check()).toEqual({ mode: 'none', state: 'idle', current: '0.3.0' })
    expect(changes).toEqual([])
  })
})
