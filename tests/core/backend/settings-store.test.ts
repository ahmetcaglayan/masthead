import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsStore } from '../../../src/core/stores/settings-store'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const quiet = { logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'masthead-settings-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

async function readSettingsFile(): Promise<Settings> {
  return JSON.parse(await readFile(join(dir, 'settings.json'), 'utf8')) as Settings
}

describe('SettingsStore', () => {
  it('starts from the defaults', async () => {
    const store = await SettingsStore.open(dir)
    expect(store.get()).toEqual(DEFAULT_SETTINGS)
  })

  it('merges and validates patches, then persists them', async () => {
    const store = await SettingsStore.open(dir)
    const next = store.update({
      theme: 'dark',
      typography: { scale: 9 },
      location: { provinceCode: '06', regionId: 'central-anatolia' },
      // Invalid values from an untrusted caller are dropped.
      accent: 'neon' as never,
      interests: ['sports', 'nonsense' as never, 'sports']
    })
    expect(next.theme).toBe('dark')
    expect(next.typography.scale).toBe(1.3)
    expect(next.typography.uiFont).toBe(DEFAULT_SETTINGS.typography.uiFont)
    expect(next.location).toEqual({ provinceCode: '06', regionId: 'central-anatolia' })
    expect(next.accent).toBe(DEFAULT_SETTINGS.accent)
    expect(next.interests).toEqual(['sports'])
    expect(store.get()).toBe(next)

    await store.flush()
    expect(await readSettingsFile()).toEqual(next)
    const reopened = await SettingsStore.open(dir)
    expect(reopened.get()).toEqual(next)
  })

  it('notifies listeners with the previous and next settings, only on real changes', async () => {
    const store = await SettingsStore.open(dir)
    const listener = vi.fn()
    const unsubscribe = store.onChange(listener)

    const prev = store.get()
    const next = store.update({ language: 'tr' })
    expect(listener).toHaveBeenCalledExactlyOnceWith(prev, next)

    expect(store.update({ language: 'tr' })).toBe(next)
    expect(listener).toHaveBeenCalledOnce()

    unsubscribe()
    store.update({ language: 'en' })
    expect(listener).toHaveBeenCalledOnce()
  })

  it('keeps notifying other listeners when one throws', async () => {
    const store = await SettingsStore.open(dir, quiet)
    const good = vi.fn()
    store.onChange(() => {
      throw new Error('boom')
    })
    store.onChange(good)
    store.update({ theme: 'light' })
    expect(good).toHaveBeenCalledOnce()
    expect(quiet.logger.error).toHaveBeenCalled()
  })

  it('reset restores the defaults but keeps the window bounds', async () => {
    const store = await SettingsStore.open(dir)
    store.update({
      theme: 'dark',
      onboardingCompleted: true,
      window: { width: 1400, height: 900, x: 10, y: 20, maximized: true }
    })
    const reset = store.reset()
    expect(reset.theme).toBe(DEFAULT_SETTINGS.theme)
    expect(reset.onboardingCompleted).toBe(false)
    expect(reset.window).toEqual({ width: 1400, height: 900, x: 10, y: 20, maximized: true })
  })

  it('fills in fields missing from an older file', async () => {
    await writeFile(
      join(dir, 'settings.json'),
      JSON.stringify({ schemaVersion: 1, theme: 'dark', country: 'tr' })
    )
    const store = await SettingsStore.open(dir)
    expect(store.get()).toEqual({ ...DEFAULT_SETTINGS, theme: 'dark' })
  })

  it.each([
    ['broken JSON', '{"theme": "dark"'],
    ['a JSON array', '[1, 2, 3]'],
    ['a JSON string', '"dark"']
  ])('recovers from %s with the defaults and a backup', async (_label, contents) => {
    await writeFile(join(dir, 'settings.json'), contents)
    const store = await SettingsStore.open(dir, quiet)
    expect(store.get()).toEqual(DEFAULT_SETTINGS)
    const files = await readdir(dir)
    expect(files).toHaveLength(1)
    expect(files[0]).toMatch(/^settings\.corrupt-\d+\.json$/)
  })
})
