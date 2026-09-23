import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NewsService, NewsServiceOptions } from '../../../src/core/news/types'
import type { Article, NewsSnapshot, RefreshStatus } from '../../../src/shared/types'

const mocks = vi.hoisted(() => ({
  options: [] as NewsServiceOptions[],
  services: [] as NewsService[],
  getCountryPack: vi.fn(() => undefined)
}))

vi.mock('../../../src/core/news/service', () => ({
  createNewsService: vi.fn((options: NewsServiceOptions): NewsService => {
    const snapshot: NewsSnapshot = { country: 'tr', articles: [], clusters: [], feeds: [], updatedAt: 0 }
    const status: RefreshStatus = { state: 'idle', done: 0, total: 0, lastCompletedAt: 0 }
    const service: NewsService = {
      start: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      snapshot: vi.fn(() => snapshot),
      status: vi.fn(() => status),
      refresh: vi.fn(async () => undefined),
      refreshMarkets: vi.fn(async () => undefined),
      resolveImage: vi.fn(async (id: string) => `https://img.example/${id}.jpg`),
      detail: vi.fn(async () => null),
      settingsChanged: vi.fn()
    }
    mocks.options.push(options)
    mocks.services.push(service)
    return service
  })
}))

vi.mock('../../../src/shared/countries', () => ({ getCountryPack: mocks.getCountryPack }))

const { createBackend } = await import('../../../src/core/index')
type Backend = Awaited<ReturnType<typeof createBackend>>

const ARTICLE_HTML = await readFile(new URL('./fixtures/article.html', import.meta.url), 'utf8')

function article(n: number): Article {
  return {
    id: `a${n}`,
    url: `https://haber.example/${n}`,
    title: `Haber ${n}`,
    summary: '',
    hasDetail: false,
    publishedAt: n,
    fetchedAt: n,
    sourceId: 'kaynak',
    categories: [],
    isBreaking: false,
    isHeadline: false,
    provinces: [],
    regions: []
  }
}

const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
let dataDir: string
let backend: Backend | undefined

async function open(
  extra: { fetch?: typeof fetch } = {}
): Promise<{ backend: Backend; news: NewsService; options: NewsServiceOptions }> {
  backend = await createBackend({
    dataDir,
    cacheDir: join(dataDir, 'cache'),
    appVersion: '9.9.9',
    logger,
    now: () => 1_700_000_000_000,
    manualRefresh: true,
    ...extra
  })
  return { backend, news: mocks.services.at(-1)!, options: mocks.options.at(-1)! }
}

beforeEach(async () => {
  dataDir = await mkdtemp(join(tmpdir(), 'masthead-backend-'))
  mocks.options.length = 0
  mocks.services.length = 0
  vi.clearAllMocks()
})

afterEach(async () => {
  await backend?.stop()
  backend = undefined
  await rm(dataDir, { recursive: true, force: true })
})

describe('createBackend', () => {
  it('wires the news service with the host options and live settings', async () => {
    const { backend, options } = await open()
    expect(options).toMatchObject({
      cacheDir: join(dataDir, 'cache'),
      appVersion: '9.9.9',
      manualRefresh: true,
      getPack: mocks.getCountryPack
    })
    expect(options.now()).toBe(1_700_000_000_000)
    expect(options.getSettings()).toBe(backend.settings.get())
    backend.settings.update({ country: 'az' })
    expect(options.getSettings().country).toBe('az')
  })

  it('delegates news calls to the service', async () => {
    const { backend, news } = await open()
    expect(backend.news.snapshot().country).toBe('tr')
    expect(backend.news.status().state).toBe('idle')
    await backend.news.refresh(true)
    expect(news.refresh).toHaveBeenCalledWith(true)
    await expect(backend.news.resolveImage('a1')).resolves.toBe('https://img.example/a1.jpg')
    await expect(backend.news.detail('a1')).resolves.toBeNull()
  })

  it('forwards news service callbacks as events', async () => {
    const { backend, options } = await open()
    const updated = vi.fn()
    const status = vi.fn()
    const breaking = vi.fn()
    backend.on('newsUpdated', updated)
    backend.on('newsStatus', status)
    backend.on('breaking', breaking)

    options.onUpdated({ updatedAt: 1, newCount: 3, newBreaking: 1 })
    options.onStatus({ state: 'refreshing', done: 1, total: 4, lastCompletedAt: 0 })
    options.onBreaking([article(1)])

    expect(updated).toHaveBeenCalledWith({ updatedAt: 1, newCount: 3, newBreaking: 1 })
    expect(status).toHaveBeenCalledWith({ state: 'refreshing', done: 1, total: 4, lastCompletedAt: 0 })
    expect(breaking).toHaveBeenCalledWith([article(1)])
  })

  it('routes settings changes through the news service and emits them', async () => {
    const { backend, news } = await open()
    const listener = vi.fn()
    const unsubscribe = backend.on('settings', listener)

    const prev = backend.settings.get()
    const next = backend.settings.update({ sources: { disabled: ['aa'] } })
    expect(news.settingsChanged).toHaveBeenCalledExactlyOnceWith(prev, next)
    expect(listener).toHaveBeenCalledExactlyOnceWith(next)

    backend.settings.update({ sources: { disabled: ['aa'] } })
    expect(listener).toHaveBeenCalledOnce()

    const reset = backend.settings.reset()
    expect(news.settingsChanged).toHaveBeenLastCalledWith(next, reset)
    expect(listener).toHaveBeenLastCalledWith(reset)

    unsubscribe()
    backend.settings.update({ theme: 'dark' })
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('still emits settings when the news service throws', async () => {
    const { backend, news } = await open()
    vi.mocked(news.settingsChanged).mockImplementation(() => {
      throw new Error('bad pack')
    })
    const listener = vi.fn()
    backend.on('settings', listener)
    backend.settings.update({ theme: 'dark' })
    expect(listener).toHaveBeenCalledOnce()
    expect(logger.error).toHaveBeenCalled()
  })

  it('emits library changes and keeps going when a listener throws', async () => {
    const { backend } = await open()
    backend.on('library', () => {
      throw new Error('renderer gone')
    })
    const listener = vi.fn()
    backend.on('library', listener)

    const saved = backend.library.toggleSave(article(1))
    const read = backend.library.markRead(article(2))
    const cleared = backend.library.clearHistory()

    expect(listener.mock.calls).toEqual([[saved], [read], [cleared]])
    expect(backend.library.get()).toEqual({ saved: saved.saved, history: [] })
    expect(saved.saved[0].savedAt).toBe(1_700_000_000_000)
    expect(logger.error).toHaveBeenCalledTimes(3)
  })

  it('starts and stops the news service and flushes stores on stop', async () => {
    const { backend, news } = await open()
    await backend.start()
    await backend.start()
    expect(news.start).toHaveBeenCalledOnce()

    backend.settings.update({ language: 'tr' })
    backend.library.toggleSave(article(7))
    await backend.stop()
    expect(news.stop).toHaveBeenCalledOnce()

    const settings = JSON.parse(await readFile(join(dataDir, 'settings.json'), 'utf8'))
    const library = JSON.parse(await readFile(join(dataDir, 'library.json'), 'utf8'))
    expect(settings.language).toBe('tr')
    expect(library.saved[0].article.id).toBe('a7')
  })

  it('restores persisted settings and library in a new instance', async () => {
    const first = await open()
    first.backend.settings.update({ accent: 'forest', onboardingCompleted: true })
    first.backend.library.markRead(article(3))
    await first.backend.stop()

    const second = await open()
    expect(second.backend.settings.get()).toMatchObject({ accent: 'forest', onboardingCompleted: true })
    expect(second.backend.library.get().history[0].article.id).toBe('a3')
  })

  it('extracts reader content with the injected fetch and caches it', async () => {
    const fetch = vi.fn(async () => new Response(ARTICLE_HTML, { headers: { 'content-type': 'text/html' } }))
    const { backend } = await open({ fetch })
    const url = 'http://93.184.216.34/turizm/kapadokya'
    const [first, second] = await Promise.all([
      backend.reader.extract(url),
      backend.reader.extract(`${url}#yorumlar`)
    ])
    expect(first?.title).toBe("Kapadokya'da balon turları rekor kırdı")
    expect(second).toBe(first)
    await backend.reader.extract(url)
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('returns null and logs when extraction fails, and retries later', async () => {
    const fetch = vi.fn(async () => new Response('hata', { status: 500 }))
    const { backend } = await open({ fetch })
    await expect(backend.reader.extract('http://93.184.216.34/a')).resolves.toBeNull()
    await expect(backend.reader.extract('http://127.0.0.1/admin')).resolves.toBeNull()
    await expect(backend.reader.extract('http://93.184.216.34/a')).resolves.toBeNull()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(logger.warn).toHaveBeenCalledTimes(3)
  })

  it('probes frameability with the injected fetch', async () => {
    const fetch = vi.fn(async () => new Response('', { headers: { 'x-frame-options': 'SAMEORIGIN' } }))
    const { backend } = await open({ fetch })
    await expect(backend.reader.probe('http://93.184.216.34/a')).resolves.toEqual({
      frameable: false,
      finalUrl: 'http://93.184.216.34/a'
    })
  })
})
