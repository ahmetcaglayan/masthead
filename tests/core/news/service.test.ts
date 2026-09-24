import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CountryPack } from '../../../src/shared/countries/types'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'
import type { Article, NewsUpdate, RefreshStatus, SourceDef } from '../../../src/shared/types'
import { createNewsService, planFeeds } from '../../../src/core/news/service'
import type { NewsService } from '../../../src/core/news/types'
import { NOW, fixture, testPack } from './helpers'

const MINUTE = 60_000

const source = (id: string, feeds: SourceDef['feeds'], extra: Partial<SourceDef> = {}): SourceDef => ({
  id,
  name: id,
  homepage: `https://${id}.test`,
  kind: 'mainstream',
  language: 'tr',
  feeds,
  ...extra
})

const pack: CountryPack = {
  ...testPack,
  sources: [
    source('sabah', [
      { url: 'https://sabah.test/anasayfa.xml', category: 'top', headline: true },
      { url: 'https://sabah.test/gundem.xml', category: 'general' }
    ]),
    source('hurriyet', [{ url: 'https://hurriyet.test/gundem', category: 'general' }]),
    source('dw', [
      { url: 'https://dw.test/atom', category: 'world' },
      { url: 'https://dw.test/rdf', category: 'world' }
    ]),
    source('ntv', [{ url: 'https://ntv.test/gundem.rss', category: 'general' }]),
    source('son', [{ url: 'https://son.test/rss', category: 'breaking', breaking: true }]),
    source('optin', [{ url: 'https://optin.test/rss', category: 'general' }], { defaultEnabled: false }),
    source(
      'sabah-yerel',
      [
        { url: 'https://sabah.test/izmir.xml', category: 'local', province: '35' },
        { url: 'https://sabah.test/istanbul.xml', category: 'local', province: '34' }
      ],
      { kind: 'local' }
    )
  ]
}

interface Route {
  body?: string
  status?: number
  etag?: string
  contentType?: string
  /** Never answer; only an abort ends the request. */
  hang?: boolean
  /** Answer only once this settles. */
  wait?: Promise<void>
  /** Drop the connection this many times (a reset, as undici reports it) before answering. */
  resets?: number
  /** Fail without an answer, like a network error. */
  error?: string
}

interface SyntheticItem {
  title: string
  link: string
  date: number
  description?: string
}

function rss(items: SyntheticItem[]): string {
  const body = items
    .map(
      (i) =>
        `<item><title>${i.title}</title><link>${i.link}</link><pubDate>${new Date(i.date).toUTCString()}</pubDate>` +
        `<description>${i.description ?? ''}</description></item>`
    )
    .join('')
  return `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>Test</title>${body}</channel></rss>`
}

const breakingItems: SyntheticItem[] = [
  { title: 'Ankara’da toplantı sürüyor', link: 'https://son.test/1', date: NOW - 50 * MINUTE }
]

function defaultRoutes(): Record<string, Route> {
  return {
    'https://sabah.test/anasayfa.xml': { body: fixture('sabah-gundem.xml') },
    'https://sabah.test/gundem.xml': { body: fixture('sabah-gundem.xml') },
    'https://hurriyet.test/gundem': { body: fixture('hurriyet-gundem.xml') },
    'https://dw.test/atom': { body: fixture('dw-atom.xml') },
    'https://dw.test/rdf': { body: fixture('dw-rdf.xml') },
    'https://ntv.test/gundem.rss': {
      body: fixture('ntv-bot-wall.html'),
      status: 403,
      contentType: 'text/html'
    },
    'https://son.test/rss': { body: rss(breakingItems) },
    'https://optin.test/rss': {
      body: rss([
        {
          title: 'Gece yarısı açıklanan kararın ayrıntıları',
          link: 'https://optin.test/1',
          date: NOW - 20 * MINUTE
        }
      ])
    },
    'https://sabah.test/izmir.xml': { body: fixture('sabah-izmir.xml') },
    'https://sabah.test/istanbul.xml': {
      body: rss([
        {
          title: 'Kadıköy’de sahil yolu yenilendi',
          link: 'https://sabah.test/istanbul/1',
          date: NOW - 90 * MINUTE
        }
      ])
    }
  }
}

interface Harness {
  service: NewsService
  routes: Record<string, Route>
  calls: { url: string; headers: Record<string, string> }[]
  updates: NewsUpdate[]
  statuses: RefreshStatus[]
  breaking: Article[][]
  errors: unknown[]
  settings: () => Settings
  changeSettings: (patch: (s: Settings) => Settings) => void
  requests: (url: string) => number
}

let dir: string
let clock: number
const harnesses: Harness[] = []

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'masthead-news-'))
  clock = NOW
})

afterEach(async () => {
  await Promise.all(harnesses.splice(0).map((h) => h.service.stop()))
  await rm(dir, { recursive: true, force: true })
})

function harness(
  options: { settings?: Partial<Settings>; manual?: boolean; routes?: Record<string, Route> } = {}
): Harness {
  let settings: Settings = { ...DEFAULT_SETTINGS, ...options.settings }
  const routes = options.routes ?? defaultRoutes()
  const calls: Harness['calls'] = []
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    const headers = Object.fromEntries(new Headers(init?.headers).entries())
    calls.push({ url, headers })
    const route = routes[url]
    if (!route) return new Response('not found', { status: 404 })
    if (route.hang) {
      return new Promise<Response>((_, reject) =>
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
      )
    }
    if (route.error) throw new TypeError(route.error)
    if (route.resets) {
      route.resets--
      throw new TypeError('fetch failed', {
        cause: Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' })
      })
    }
    await route.wait
    if (route.etag && headers['if-none-match'] === route.etag) {
      return new Response(null, { status: 304, headers: { etag: route.etag } })
    }
    return new Response(route.body ?? '', {
      status: route.status ?? 200,
      headers: {
        'content-type': route.contentType ?? 'application/rss+xml; charset=utf-8',
        ...(route.etag ? { etag: route.etag } : {})
      }
    })
  }) as typeof fetch
  const h: Harness = {
    routes,
    calls,
    updates: [],
    statuses: [],
    breaking: [],
    errors: [],
    settings: () => settings,
    changeSettings: (patch) => {
      const prev = settings
      settings = patch(settings)
      h.service.settingsChanged(prev, settings)
    },
    requests: (url) => calls.filter((c) => c.url === url).length,
    service: undefined as unknown as NewsService
  }
  h.service = createNewsService({
    cacheDir: dir,
    getPack: (country) => (country === 'tr' ? pack : undefined),
    getSettings: () => settings,
    appVersion: '0.0.0-test',
    logger: { info: () => undefined, warn: () => undefined, error: (...args) => void h.errors.push(args) },
    now: () => clock,
    fetch: fetchImpl,
    manualRefresh: options.manual ?? true,
    onUpdated: (update) => void h.updates.push(update),
    onStatus: (status) => void h.statuses.push(status),
    onBreaking: (articles) => void h.breaking.push(articles)
  })
  harnesses.push(h)
  return h
}

async function waitFor(check: () => boolean, timeoutMs = 3000): Promise<void> {
  const started = Date.now()
  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error('condition not reached in time')
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

const bySource = (h: Harness, sourceId: string): Article[] =>
  h.service.snapshot().articles.filter((a) => a.sourceId === sourceId)

describe('news service', () => {
  it('merges a story seen in several feeds of one source, and the same feed in two formats', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()

    const sabah = bySource(h, 'sabah')
    expect(sabah).toHaveLength(5)
    for (const article of sabah) {
      expect(article.categories).toEqual(expect.arrayContaining(['top', 'general']))
      expect(article.isHeadline).toBe(true)
      expect(article.fetchedAt).toBe(NOW)
    }
    // Atom and RDF links differ only in DW's `maca` tracking parameter.
    expect(bySource(h, 'dw')).toHaveLength(3)
    expect(bySource(h, 'hurriyet')).toHaveLength(3)

    const { articles, feeds, updatedAt } = h.service.snapshot()
    expect(updatedAt).toBe(NOW)
    expect(articles.map((a) => a.publishedAt)).toEqual(
      [...articles.map((a) => a.publishedAt)].sort((a, b) => b - a)
    )
    expect(feeds.find((f) => f.sourceId === 'ntv')).toMatchObject({ ok: false, lastError: 'HTTP 403' })
    expect(feeds.find((f) => f.url === 'https://dw.test/rdf')).toMatchObject({
      ok: true,
      itemCount: 3,
      lastFetchedAt: NOW
    })
    expect(h.errors).toEqual([])
  })

  it('asks again once when a site drops the connection', async () => {
    const routes = defaultRoutes()
    routes['https://dw.test/rdf'] = { ...routes['https://dw.test/rdf'], resets: 1 }
    routes['https://ntv.test/gundem.rss'] = { ...routes['https://ntv.test/gundem.rss'], resets: 2 }
    const h = harness({ routes })
    await h.service.start()
    await h.service.refresh()
    const feeds = h.service.snapshot().feeds
    expect(h.requests('https://dw.test/rdf')).toBe(2)
    expect(feeds.find((f) => f.url === 'https://dw.test/rdf')).toMatchObject({ ok: true, itemCount: 3 })
    // A second drop in a row is a failure like any other.
    expect(h.requests('https://ntv.test/gundem.rss')).toBe(2)
    expect(feeds.find((f) => f.url === 'https://ntv.test/gundem.rss')).toMatchObject({
      ok: false,
      lastError: 'fetch failed'
    })
  })

  it('reports a page that is not a feed as an error', async () => {
    const routes = defaultRoutes()
    routes['https://ntv.test/gundem.rss'] = { body: fixture('ntv-bot-wall.html'), contentType: 'text/html' }
    const h = harness({ routes })
    await h.service.start()
    await h.service.refresh()
    expect(h.service.snapshot().feeds.find((f) => f.sourceId === 'ntv')).toMatchObject({
      ok: false,
      lastError: 'not a feed (<html> document)'
    })
  })

  it('collapses one source’s duplicate headlines published under two URLs', async () => {
    const routes = defaultRoutes()
    routes['https://son.test/rss'] = {
      body: rss([
        {
          title: 'Merkez Bankası politika faizini sabit tuttu',
          link: 'https://son.test/a',
          date: NOW - 60 * MINUTE
        },
        {
          title: 'Merkez Bankası politika faizini sabit tuttu!',
          link: 'https://son.test/b',
          date: NOW - 59 * MINUTE
        }
      ])
    }
    const h = harness({ routes })
    await h.service.start()
    await h.service.refresh()
    expect(bySource(h, 'son').map((a) => a.url)).toEqual(['https://son.test/a'])
  })

  it('keeps a headline one source repeats on another day as a story of its own', async () => {
    const title = 'Borsa güne yükselişle başladı ve rekor kırdı'
    const routes = defaultRoutes()
    routes['https://son.test/rss'] = {
      body: rss([{ title, link: 'https://son.test/day-1', date: NOW - 60 * MINUTE }])
    }
    const h = harness({ routes })
    await h.service.start()
    await h.service.refresh()

    clock += 24 * 60 * MINUTE
    h.routes['https://son.test/rss'] = {
      body: rss([
        { title, link: 'https://son.test/day-2', date: clock - 30 * MINUTE },
        { title, link: 'https://son.test/day-1', date: NOW - 60 * MINUTE }
      ])
    }
    await h.service.refresh()
    expect(bySource(h, 'son').map((a) => [a.url, a.publishedAt])).toEqual([
      ['https://son.test/day-2', clock - 30 * MINUTE],
      ['https://son.test/day-1', NOW - 60 * MINUTE]
    ])
  })

  it('counts a well-formed feed without items as working', async () => {
    const routes = defaultRoutes()
    routes['https://hurriyet.test/gundem'] = { body: rss([]) }
    const h = harness({ routes })
    await h.service.start()
    await h.service.refresh()
    const status = h.service.snapshot().feeds.find((f) => f.sourceId === 'hurriyet')
    expect(status).toMatchObject({ ok: true, itemCount: 0 })
    expect(status?.lastError).toBeUndefined()
    // Not backed off: fetched again on the next run.
    clock += 2 * MINUTE
    await h.service.refresh()
    expect(h.requests('https://hurriyet.test/gundem')).toBe(2)
  })

  it('never fetches disabled sources and drops them from the snapshot as soon as they are disabled', async () => {
    const h = harness({ settings: { sources: { disabled: ['hurriyet'] } } })
    await h.service.start()
    await h.service.refresh()
    expect(h.requests('https://hurriyet.test/gundem')).toBe(0)
    expect(bySource(h, 'hurriyet')).toEqual([])
    expect(bySource(h, 'dw')).toHaveLength(3)

    h.updates.length = 0
    h.changeSettings((s) => ({ ...s, sources: { disabled: ['hurriyet', 'dw'] } }))
    expect(bySource(h, 'dw')).toEqual([])
    expect(h.updates).toEqual([{ updatedAt: NOW, newCount: 0, newBreaking: 0 }])
    expect(h.service.snapshot().feeds.some((f) => f.sourceId === 'dw')).toBe(false)
  })

  it('refetches a re-enabled source from scratch', async () => {
    const routes = defaultRoutes()
    routes['https://dw.test/atom'].etag = '"dw-1"'
    const h = harness({ manual: false, routes })
    await h.service.start()
    await waitFor(() => h.statuses.some((s) => s.state === 'idle' && s.lastCompletedAt === NOW))
    h.changeSettings((s) => ({ ...s, sources: { disabled: ['dw'] } }))
    const before = h.requests('https://dw.test/atom')
    h.changeSettings((s) => ({ ...s, sources: { disabled: [] } }))
    await waitFor(() => h.requests('https://dw.test/atom') > before)
    await waitFor(() => bySource(h, 'dw').length === 3)
    // Validators were forgotten when the source was disabled, so this is a full fetch.
    expect(
      h.calls.filter((c) => c.url === 'https://dw.test/atom').at(-1)?.headers['if-none-match']
    ).toBeUndefined()
  })

  it('keeps no validators for a source switched off while it was being fetched', async () => {
    const routes = defaultRoutes()
    let answer: () => void = () => undefined
    routes['https://dw.test/atom'].etag = '"dw-1"'
    routes['https://dw.test/atom'].wait = new Promise((resolve) => (answer = resolve))
    const h = harness({ routes })
    await h.service.start()
    const refreshing = h.service.refresh()
    await waitFor(() => h.requests('https://dw.test/atom') === 1)
    h.changeSettings((s) => ({ ...s, sources: { disabled: ['dw'] } }))
    answer()
    await refreshing
    expect(bySource(h, 'dw')).toEqual([])

    h.changeSettings((s) => ({ ...s, sources: { disabled: [] } }))
    await h.service.refresh()
    expect(
      h.calls.filter((c) => c.url === 'https://dw.test/atom').at(-1)?.headers['if-none-match']
    ).toBeUndefined()
    expect(h.service.snapshot().feeds.find((f) => f.url === 'https://dw.test/atom')).toMatchObject({
      ok: true,
      itemCount: 3
    })
  })

  it('fetches an opt-in source only while the user has it switched on', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()
    expect(h.requests('https://optin.test/rss')).toBe(0)
    expect(bySource(h, 'optin')).toEqual([])
    expect(h.service.snapshot().feeds.some((f) => f.sourceId === 'optin')).toBe(false)

    h.changeSettings((s) => ({ ...s, sources: { disabled: [], enabled: ['optin'] } }))
    await h.service.refresh()
    expect(h.requests('https://optin.test/rss')).toBe(1)
    expect(bySource(h, 'optin')).toHaveLength(1)
    expect(h.service.snapshot().feeds.find((f) => f.sourceId === 'optin')).toMatchObject({ ok: true })

    // Switched off again: gone at once, and not fetched any more.
    h.updates.length = 0
    h.changeSettings((s) => ({ ...s, sources: { disabled: [], enabled: [] } }))
    expect(bySource(h, 'optin')).toEqual([])
    expect(h.updates).toEqual([{ updatedAt: NOW, newCount: 0, newBreaking: 0 }])
    await h.service.refresh(true)
    expect(h.requests('https://optin.test/rss')).toBe(1)

    // `disabled` wins over `enabled`.
    h.changeSettings((s) => ({ ...s, sources: { disabled: [], enabled: ['optin'] } }))
    await h.service.refresh()
    expect(bySource(h, 'optin')).toHaveLength(1)
    h.changeSettings((s) => ({ ...s, sources: { disabled: ['optin'], enabled: ['optin'] } }))
    expect(bySource(h, 'optin')).toEqual([])
  })

  it('refreshes when an opt-in source is switched on, and serves its cache only while it is on', async () => {
    const first = harness({ manual: false })
    await first.service.start()
    await waitFor(() => first.statuses.some((s) => s.state === 'idle' && s.lastCompletedAt === NOW))
    expect(first.requests('https://optin.test/rss')).toBe(0)
    first.changeSettings((s) => ({ ...s, sources: { disabled: [], enabled: ['optin'] } }))
    await waitFor(() => bySource(first, 'optin').length === 1)
    await first.service.stop()

    const off = harness({ routes: {} })
    await off.service.start()
    expect(bySource(off, 'optin')).toEqual([])
    await off.service.stop()

    const on = harness({ routes: {}, settings: { sources: { disabled: [], enabled: ['optin'] } } })
    await on.service.start()
    expect(bySource(on, 'optin')).toHaveLength(1)
  })

  it('fetches city feeds only for the selected province', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()
    expect(h.requests('https://sabah.test/izmir.xml')).toBe(0)
    expect(h.requests('https://sabah.test/istanbul.xml')).toBe(0)

    h.changeSettings((s) => ({ ...s, location: { provinceCode: '35', regionId: 'aegean' } }))
    await h.service.refresh()
    expect(h.requests('https://sabah.test/izmir.xml')).toBe(1)
    expect(h.requests('https://sabah.test/istanbul.xml')).toBe(0)
    const local = bySource(h, 'sabah-yerel')
    expect(local).toHaveLength(4)
    expect(local.every((a) => a.provinces.includes('35') && a.regions.includes('aegean'))).toBe(true)
    expect(local.every((a) => a.categories.includes('local'))).toBe(true)

    h.changeSettings((s) => ({ ...s, location: { provinceCode: null, regionId: 'marmara' } }))
    await h.service.refresh()
    expect(h.requests('https://sabah.test/istanbul.xml')).toBe(1)
    expect(h.requests('https://sabah.test/izmir.xml')).toBe(1)
  })

  it('takes at most six city feeds for a region, spread over its provinces', () => {
    const codes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const regionPack: CountryPack = {
      ...testPack,
      regions: [{ id: 'aegean', provinces: codes }],
      sources: [
        source(
          'one',
          codes.map((code) => ({
            url: `https://one.test/${code}`,
            category: 'local' as const,
            province: code
          }))
        ),
        source(
          'two',
          codes
            .slice(0, 2)
            .map((code) => ({ url: `https://two.test/${code}`, category: 'local' as const, province: code }))
        )
      ]
    }
    const planned = planFeeds(regionPack, {
      ...DEFAULT_SETTINGS,
      location: { provinceCode: null, regionId: 'aegean' }
    })
    expect(planned).toHaveLength(6)
    expect(new Set(planned.map((p) => p.feed.province)).size).toBe(6)
    expect(planFeeds(regionPack, DEFAULT_SETTINGS)).toEqual([])
  })

  it('takes region-wide local feeds for any place in their region, and only then', () => {
    const nationPack: CountryPack = {
      ...testPack,
      regions: [
        { id: 'scotland', provinces: ['glasgow', 'edinburgh'] },
        { id: 'wales', provinces: ['cardiff'] }
      ],
      provinces: [
        { code: 'glasgow', name: 'Glasgow', slug: 'glasgow', region: 'scotland', aliases: [] },
        { code: 'edinburgh', name: 'Edinburgh', slug: 'edinburgh', region: 'scotland', aliases: [] },
        { code: 'cardiff', name: 'Cardiff', slug: 'cardiff', region: 'wales', aliases: [] }
      ],
      sources: [
        source('herald', [
          { url: 'https://herald.test/rss', category: 'local' as const, region: 'scotland' }
        ]),
        source('glasgow-live', [
          { url: 'https://glw.test/rss', category: 'local' as const, province: 'glasgow' }
        ])
      ]
    }
    const urls = (location: { provinceCode: string | null; regionId: string | null }): string[] =>
      planFeeds(nationPack, { ...DEFAULT_SETTINGS, location }).map((p) => p.feed.url)
    expect(urls({ provinceCode: 'edinburgh', regionId: 'scotland' })).toEqual(['https://herald.test/rss'])
    expect(urls({ provinceCode: 'glasgow', regionId: 'scotland' })).toEqual([
      'https://herald.test/rss',
      'https://glw.test/rss'
    ])
    expect(urls({ provinceCode: null, regionId: 'scotland' })).toEqual([
      'https://herald.test/rss',
      'https://glw.test/rss'
    ])
    expect(urls({ provinceCode: 'cardiff', regionId: 'wales' })).toEqual([])
    expect(urls({ provinceCode: null, regionId: null })).toEqual([])
  })

  it('shares one in-flight refresh between concurrent callers', async () => {
    const h = harness()
    await h.service.start()
    const first = h.service.refresh()
    const second = h.service.refresh(true)
    expect(second).toBe(first)
    await Promise.all([first, second])
    expect(h.requests('https://sabah.test/gundem.xml')).toBe(1)
    expect(h.requests('https://hurriyet.test/gundem')).toBe(1)
  })

  it('uses conditional GET and keeps what it has on 304', async () => {
    const routes = defaultRoutes()
    routes['https://hurriyet.test/gundem'].etag = '"h-1"'
    const h = harness({ routes })
    await h.service.start()
    await h.service.refresh()
    clock += 11 * MINUTE
    await h.service.refresh()
    const [firstCall, secondCall] = h.calls.filter((c) => c.url === 'https://hurriyet.test/gundem')
    expect(firstCall.headers['if-none-match']).toBeUndefined()
    expect(secondCall.headers['if-none-match']).toBe('"h-1"')
    expect(bySource(h, 'hurriyet')).toHaveLength(3)
    expect(h.service.snapshot().feeds.find((f) => f.sourceId === 'hurriyet')).toMatchObject({
      ok: true,
      itemCount: 3,
      lastFetchedAt: clock
    })
    expect(h.updates.at(-1)).toEqual({ updatedAt: clock, newCount: 0, newBreaking: 0 })

    await h.service.refresh(true)
    expect(
      h.calls.filter((c) => c.url === 'https://hurriyet.test/gundem').at(-1)?.headers['if-none-match']
    ).toBeUndefined()
  })

  it('backs off a failing feed, and a forced refresh retries it', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()
    expect(h.requests('https://ntv.test/gundem.rss')).toBe(1)
    clock += 4 * MINUTE
    await h.service.refresh()
    expect(h.requests('https://ntv.test/gundem.rss')).toBe(1)
    clock += 2 * MINUTE
    await h.service.refresh()
    expect(h.requests('https://ntv.test/gundem.rss')).toBe(2)
    // Second failure: ten minutes.
    clock += 6 * MINUTE
    await h.service.refresh()
    expect(h.requests('https://ntv.test/gundem.rss')).toBe(2)
    await h.service.refresh(true)
    expect(h.requests('https://ntv.test/gundem.rss')).toBe(3)
  })

  it('does not back feeds off while offline, nor report the failed runs as updates', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()
    const online = { ...h.routes }
    for (const url of Object.keys(h.routes)) h.routes[url] = { error: 'fetch failed' }
    // An hour and a half without a network, refreshing every ten minutes.
    for (let run = 0; run < 9; run++) {
      clock += 10 * MINUTE
      await h.service.refresh()
    }
    expect(h.requests('https://hurriyet.test/gundem')).toBe(10)
    expect(h.service.status().lastCompletedAt).toBe(NOW)
    expect(h.service.snapshot().updatedAt).toBe(NOW)
    expect(h.service.snapshot().feeds.find((f) => f.sourceId === 'hurriyet')).toMatchObject({
      ok: false,
      lastError: 'fetch failed'
    })

    // Back online: the next scheduled run fetches every feed again.
    Object.assign(h.routes, online)
    clock += 10 * MINUTE
    await h.service.refresh()
    expect(h.requests('https://hurriyet.test/gundem')).toBe(11)
    expect(h.service.snapshot().feeds.find((f) => f.sourceId === 'hurriyet')).toMatchObject({ ok: true })
    expect(h.service.status().lastCompletedAt).toBe(clock)
  })

  it('applies a new refresh interval chosen during a breaking-news run', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
    try {
      const h = harness({ manual: false, settings: { refresh: { intervalMinutes: 60 } } })
      await h.service.start()
      await h.service.refresh()
      const fullRuns = (): number => h.requests('https://hurriyet.test/gundem')
      expect(fullRuns()).toBe(1)

      // Let pending fetches and their promise chains run (setImmediate is not faked).
      const settle = async (): Promise<void> => {
        for (let i = 0; i < 5; i++) await new Promise((resolve) => setImmediate(resolve))
      }
      let answer: () => void = () => undefined
      h.routes['https://son.test/rss'].wait = new Promise((resolve) => (answer = resolve))
      await vi.advanceTimersByTimeAsync(2 * MINUTE)
      await settle()
      // The breaking-news run is waiting for its feed when the interval changes.
      expect(h.requests('https://son.test/rss')).toBe(2)
      expect(fullRuns()).toBe(1)
      h.changeSettings((s) => ({ ...s, refresh: { intervalMinutes: 5 } }))
      answer()
      await settle()

      await vi.advanceTimersByTimeAsync(5 * MINUTE)
      await settle()
      expect(fullRuns()).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('reports progress while refreshing and idle at the end', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()
    expect(h.statuses[0]).toEqual({ state: 'refreshing', done: 0, total: 7, lastCompletedAt: 0 })
    expect(h.statuses.at(-1)).toEqual({ state: 'idle', done: 7, total: 7, lastCompletedAt: NOW })
    expect(h.service.status()).toEqual(h.statuses.at(-1))
  })

  it('announces newly seen breaking news from the last 30 minutes, never on a cold first load', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()
    expect(h.breaking).toEqual([])
    // A son dakika feed is a "latest" stream: its report alone is not breaking news.
    const [lone] = bySource(h, 'son')
    expect(lone).toMatchObject({ isBreaking: false, categories: ['breaking'] })

    clock += 5 * MINUTE
    const strait = 'https://son.test/4'
    h.routes['https://son.test/rss'] = {
      body: rss([
        ...breakingItems,
        {
          title: 'SON DAKİKA: İzmir’de 4,9 büyüklüğünde deprem',
          link: 'https://son.test/2',
          date: clock - 3 * MINUTE
        },
        {
          title: 'SON DAKİKA: Eski haber yeni göründü',
          link: 'https://son.test/3',
          date: clock - 3 * 60 * MINUTE
        },
        { title: 'Boğaz’da gemi trafiği çift yönlü askıya alındı', link: strait, date: clock - 10 * MINUTE }
      ])
    }
    await h.service.refresh()
    expect(h.breaking).toHaveLength(1)
    expect(h.breaking[0].map((a) => a.url)).toEqual(['https://son.test/2'])
    expect(h.breaking[0][0]).toMatchObject({
      title: 'İzmir’de 4,9 büyüklüğünde deprem',
      isBreaking: true,
      provinces: ['35'],
      regions: ['aegean']
    })
    // The marked old story is breaking but too old to announce; the strait report stands alone.
    expect(h.updates.at(-1)).toEqual({ updatedAt: clock, newCount: 3, newBreaking: 2 })
    const byUrl = (url: string): Article | undefined => bySource(h, 'son').find((a) => a.url === url)
    expect(byUrl('https://son.test/3')?.isBreaking).toBe(true)
    expect(byUrl(strait)?.isBreaking).toBe(false)

    // A second source picks the story up within the hour: now it is breaking news.
    clock += 3 * MINUTE
    h.routes['https://hurriyet.test/gundem'] = {
      body: rss([
        {
          title: 'Boğaz’da gemi trafiği askıya alındı',
          link: 'https://hurriyet.test/b',
          date: clock - 2 * MINUTE
        }
      ])
    }
    await h.service.refresh()
    expect(byUrl(strait)?.isBreaking).toBe(true)
    expect(bySource(h, 'hurriyet').find((a) => a.url === 'https://hurriyet.test/b')?.isBreaking).toBe(false)
    expect(h.breaking).toHaveLength(2)
    expect(h.breaking[1].map((a) => a.url)).toEqual([strait])
    expect(h.updates.at(-1)).toMatchObject({ newCount: 1, newBreaking: 1 })

    // An hour later the report is no longer breaking; explicitly marked stories stay so.
    clock += 70 * MINUTE
    await h.service.refresh()
    expect(byUrl(strait)).toMatchObject({ isBreaking: false, categories: ['breaking'] })
    expect(byUrl('https://son.test/2')?.isBreaking).toBe(true)
    expect(h.breaking).toHaveLength(2)
  })

  it('keeps the explicit breaking marker across restarts', async () => {
    const routes = defaultRoutes()
    routes['https://son.test/rss'] = {
      body: rss([
        { title: 'SON DAKİKA: Ankara’da patlama sesi', link: 'https://son.test/9', date: NOW - 90 * MINUTE }
      ])
    }
    const first = harness({ routes })
    await first.service.start()
    await first.service.refresh()
    expect(bySource(first, 'son')[0]).toMatchObject({ title: 'Ankara’da patlama sesi', isBreaking: true })
    await first.service.stop()

    const second = harness({ routes: {} })
    await second.service.start()
    expect(bySource(second, 'son')[0]).toMatchObject({ title: 'Ankara’da patlama sesi', isBreaking: true })
  })

  it('drops official notices and site-name items, also from a cache written before the filter', async () => {
    const routes = defaultRoutes()
    routes['https://hurriyet.test/gundem'] = {
      body: rss([
        {
          title: 'SAPANCA 1. ASLİYE HUKUK MAHKEMESİ HAKİMLİĞİ',
          link: 'https://hurriyet.test/resmi-ilanlar/1',
          date: NOW - MINUTE
        },
        { title: 'hurriyet', link: 'https://hurriyet.test/x', date: NOW - MINUTE },
        {
          title: 'Mahkeme, sanığın tutukluluğuna devam kararı verdi',
          link: 'https://hurriyet.test/2',
          date: NOW - MINUTE
        }
      ])
    }
    const h = harness({ routes })
    await h.service.start()
    await h.service.refresh()
    expect(bySource(h, 'hurriyet').map((a) => a.url)).toEqual(['https://hurriyet.test/2'])

    const legal: Article = {
      ...bySource(h, 'hurriyet')[0],
      id: 'legalnotice00001',
      url: 'https://www.takvim.com.tr/resmi-ilan/2026/09/22/tc-kutahya-3-asliye-hukuk-mahkemesinden',
      title: 'T.C. KÜTAHYA 3. ASLİYE HUKUK MAHKEMESİNDEN'
    }
    await h.service.stop()
    const file = join(dir, 'news-tr.json')
    const cache = JSON.parse(await readFile(file, 'utf8')) as { articles: Article[]; marked?: string[] }
    cache.articles.push(legal)
    delete cache.marked
    await writeFile(file, JSON.stringify(cache))

    const second = harness({ routes: {} })
    await second.service.start()
    expect(bySource(second, 'hurriyet').map((a) => a.url)).toEqual(['https://hurriyet.test/2'])
  })

  it('saves the cache and serves it on the next start without fetching', async () => {
    const first = harness()
    await first.service.start()
    await first.service.refresh()
    const snapshot = first.service.snapshot()
    const hurriyet = snapshot.articles.find((a) => a.sourceId === 'hurriyet' && a.hasDetail)
    expect(hurriyet).toBeDefined()
    await first.service.stop()
    expect(existsSync(join(dir, 'news-tr.json'))).toBe(true)

    const second = harness({ routes: {} })
    await second.service.start()
    expect(second.calls).toEqual([])
    expect(second.updates).toEqual([{ updatedAt: NOW, newCount: 0, newBreaking: 0 }])
    const restored = second.service.snapshot()
    expect(restored.articles.map((a) => a.id)).toEqual(snapshot.articles.map((a) => a.id))
    expect(restored.clusters).toEqual(snapshot.clusters)
    expect(restored.updatedAt).toBe(NOW)
    expect(await second.service.detail(hurriyet?.id ?? '')).toEqual(
      await first.service.detail(hurriyet?.id ?? '')
    )
    expect(await second.service.detail('missing')).toBeNull()
  })

  it('drops articles older than 72 hours', async () => {
    const routes = defaultRoutes()
    for (const route of Object.values(routes)) route.etag = '"same"'
    const h = harness({ routes })
    await h.service.start()
    await h.service.refresh()
    expect(h.service.snapshot().articles.length).toBeGreaterThan(0)
    clock += 80 * 60 * MINUTE
    await h.service.refresh()
    expect(h.service.snapshot().articles).toEqual([])
  })

  it('resolves a missing image from the article page once and remembers it', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()
    const [article] = bySource(h, 'dw')
    expect(article.image).toBeUndefined()
    h.routes[article.url] = {
      contentType: 'text/html; charset=utf-8',
      body: '<html><head><meta content="/images/lead.jpg" property="og:image"><title>x</title></head><body></body></html>'
    }

    const image = await h.service.resolveImage(article.id)
    expect(image).toBe('https://www.dw.com/images/lead.jpg')
    expect(await h.service.resolveImage(article.id)).toBe(image)
    expect(h.requests(article.url)).toBe(1)
    expect(h.service.snapshot().articles.find((a) => a.id === article.id)?.image).toBe(image)

    // A feed image doesn't short-circuit the lookup: the renderer asks when that image
    // broke or is too small, so the page's own og:image is fetched and the feed image kept.
    const withImage = bySource(h, 'sabah')[0]
    h.routes[withImage.url] = {
      contentType: 'text/html; charset=utf-8',
      body: '<html><head><meta property="og:image" content="https://cdn.sabah.com.tr/big.jpg"></head></html>'
    }
    expect(await h.service.resolveImage(withImage.id)).toBe('https://cdn.sabah.com.tr/big.jpg')
    expect(h.service.snapshot().articles.find((a) => a.id === withImage.id)?.image).toBe(withImage.image)
    expect(await h.service.resolveImage('unknown')).toBeNull()

    await h.service.stop()
    const saved = JSON.parse(await readFile(join(dir, 'images-tr.json'), 'utf8')) as {
      images: Record<string, string>
    }
    expect(saved.images[article.id]).toBe(image)
  })

  it('rejects an og:image that a site serves for every article', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()
    const [first, second, third] = bySource(h, 'dw')
    const page =
      '<html><head><meta property="og:image" content="https://www.dw.com/cards/dw-share.jpg"></head></html>'
    for (const article of [first, second, third]) {
      h.routes[article.url] = { contentType: 'text/html', body: page }
    }

    expect(await h.service.resolveImage(first.id)).toBe('https://www.dw.com/cards/dw-share.jpg')
    expect(await h.service.resolveImage(second.id)).toBeNull()
    expect(bySource(h, 'dw').every((a) => a.image === undefined)).toBe(true)
    expect(await h.service.resolveImage(first.id)).toBeNull()
    expect(await h.service.resolveImage(third.id)).toBeNull()

    await h.service.stop()
    const saved = JSON.parse(await readFile(join(dir, 'images-tr.json'), 'utf8')) as {
      siteDefaults: string[]
    }
    expect(saved.siteDefaults).toEqual(['https://www.dw.com/cards/dw-share.jpg'])
  })

  it('stops without waiting for a site that never answers', async () => {
    const routes = defaultRoutes()
    routes['https://hurriyet.test/gundem'] = { hang: true }
    const h = harness({ routes })
    await h.service.start()
    const refreshing = h.service.refresh()
    await waitFor(() => h.requests('https://hurriyet.test/gundem') === 1)
    const started = Date.now()
    await h.service.stop()
    await refreshing
    expect(Date.now() - started).toBeLessThan(1000)
    expect(h.service.snapshot().articles).toEqual([])
  })

  it('switches country: saves, serves the other country’s (empty) cache, and back', async () => {
    const h = harness()
    await h.service.start()
    await h.service.refresh()
    const count = h.service.snapshot().articles.length

    h.updates.length = 0
    h.changeSettings((s) => ({ ...s, country: 'us' }))
    await waitFor(() => h.updates.length === 1)
    expect(h.service.snapshot()).toMatchObject({ country: 'us', articles: [], clusters: [], feeds: [] })
    await h.service.refresh()
    expect(h.statuses.at(-1)?.state).toBe('idle')

    h.changeSettings((s) => ({ ...s, country: 'tr' }))
    await waitFor(() => h.service.snapshot().country === 'tr')
    expect(h.service.snapshot().articles).toHaveLength(count)
  })
})
