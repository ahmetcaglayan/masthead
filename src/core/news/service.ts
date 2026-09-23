/**
 * The news service: decides which feeds to fetch for the current settings, keeps
 * them fresh on a schedule (conditional GET, backoff, limited concurrency), turns
 * items into articles, merges and clusters them, persists a per-country cache and
 * looks up og:images for articles whose feed had none.
 */
import { join } from 'node:path'
import { isSourceEnabled } from '../../shared/countries'
import type { CountryPack } from '../../shared/countries/types'
import type { Settings } from '../../shared/settings'
import type {
  Article,
  ArticleDetail,
  CountryCode,
  FeedDef,
  FeedStatus,
  NewsSnapshot,
  RefreshStatus,
  SourceDef,
  StoryCluster
} from '../../shared/types'
import { fetchText } from '../net'
import { JsonFile } from '../stores/json-file'
import { clusterStories } from './cluster'
import { createGeoTagger, type GeoTagger } from './geo'
import { extractPageImage, widthFromUrl } from './images'
import { isJunkItem, normalizeItem, type NormalizedItem } from './normalize'
import { parseFeed } from './parse'
import { foldTr } from './text'
import type { CreateNewsService } from './types'

const CACHE_VERSION = 1
const SAVE_DEBOUNCE_MS = 2000
const FEED_TIMEOUT_MS = 15_000
const FEED_CONCURRENCY = 8
const FEED_ACCEPT =
  'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.8'
const BREAKING_INTERVAL_MS = 2 * 60_000
/**
 * The markets page refreshes the economy and business feeds at most this often, however many
 * windows ask: once a minute is quick enough for a markets desk and still polite to publishers
 * (their validators turn most of these into "not modified").
 */
const MARKETS_INTERVAL_MS = 50_000
/** Wait after 1, 2, 3, 4, 5+ consecutive failures of a feed. */
const BACKOFF_MINUTES = [5, 10, 20, 40, 60]
const RETENTION_MS = 72 * 3_600_000
const MAX_ARTICLES = 6000
/** One source's copies of a headline published this far apart are separate stories. */
const DUPLICATE_WINDOW_MS = 6 * 3_600_000
/** Only stories this fresh raise a breaking-news notification. */
const BREAKING_ALERT_WINDOW_MS = 30 * 60_000
const STATUS_INTERVAL_MS = 250
/** With only a region selected, fetch at most this many city feeds. */
const MAX_REGION_FEEDS = 6
const IMAGE_TIMEOUT_MS = 8000
const IMAGE_MAX_BYTES = 1.5 * 1024 * 1024
const IMAGE_CONCURRENCY = 4
const PAGE_ACCEPT = 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'

/** A feed the current settings ask for. */
export interface PlannedFeed {
  /** `sourceId url`: identifies the feed in the cache. */
  key: string
  source: SourceDef
  feed: FeedDef
}

interface FeedState {
  ok: boolean
  itemCount: number
  /** Consecutive failures; drives the backoff. */
  failures: number
  /** Not fetched again before this time (epoch ms) unless forced. */
  retryAt: number
  etag?: string
  lastModified?: string
  lastFetchedAt?: number
  lastError?: string
}

interface NewsCache {
  version: number
  country: CountryCode
  savedAt: number
  /** Last completed full refresh (epoch ms). */
  updatedAt: number
  articles: Article[]
  feedState: Record<string, FeedState>
  details: ArticleDetail[]
  /** Ids of articles whose headline carried an explicit breaking marker (absent in older files). */
  marked: string[]
}

interface ImageCache {
  version: number
  /** Article id → og:image found on its page, or null when the page has none. */
  images: Record<string, string | null>
  /** og:images that turned out to be a site's generic picture. */
  siteDefaults: string[]
}

interface FeedOutcome {
  planned: PlannedFeed
  fetchedAt: number
  ok: boolean
  notModified: boolean
  items: NormalizedItem[]
  itemCount: number
  etag?: string
  lastModified?: string
  error?: string
  /** No answer at all (network error or timeout), as opposed to an HTTP or feed error. */
  unreachable?: boolean
}

/** Everything that belongs to one country; swapped as a whole on a country change. */
interface CountryState {
  country: CountryCode
  pack?: CountryPack
  geo?: GeoTagger
  articles: Map<string, Article>
  details: Map<string, ArticleDetail>
  feedState: Map<string, FeedState>
  images: Map<string, string | null>
  siteDefaults: Set<string>
  /** Articles whose headline carried an explicit breaking marker (the normalised `isBreaking`). */
  marked: Set<string>
  /** Breaking articles already announced through `onBreaking` this session. */
  announced: Set<string>
  clusters: StoryCluster[]
  lastCompletedAt: number
  /** The cache was empty: the first refresh only fills it and raises no notifications. */
  cold: boolean
  newsFile: JsonFile<NewsCache>
  imageFile: JsonFile<ImageCache>
}

const feedKey = (source: SourceDef, feed: FeedDef): string => `${source.id} ${feed.url}`

/** What a refresh fetches: every feed, the breaking-news streams, or the markets feeds. */
type Scope = 'full' | 'breaking' | 'markets'

/** Economy feeds and everything business outlets publish. */
const isMarketsFeed = ({ source, feed }: PlannedFeed): boolean =>
  feed.category === 'economy' || source.kind === 'business'

const inScope = (scope: Scope, planned: PlannedFeed): boolean =>
  scope === 'full' || (scope === 'breaking' ? planned.feed.breaking === true : isMarketsFeed(planned))

/** Ids of the pack's sources that are switched on (see `isSourceEnabled`). */
function enabledSources(pack: CountryPack | undefined, settings: Settings): Set<string> {
  const ids = new Set<string>()
  for (const source of pack?.sources ?? []) {
    if (isSourceEnabled(source, settings.sources)) ids.add(source.id)
  }
  return ids
}

/**
 * Feeds to fetch: every feed of the enabled sources, plus city feeds for the
 * selected province only — or, with just a region selected, up to six city feeds
 * spread across that region's best-covered provinces. Region-wide local feeds come
 * along whenever the chosen place lies in their region.
 */
export function planFeeds(pack: CountryPack, settings: Settings): PlannedFeed[] {
  const enabled = enabledSources(pack, settings)
  const { provinceCode, regionId } = settings.location
  const localCodes = provinceCode
    ? [provinceCode]
    : regionId
      ? (pack.regions.find((region) => region.id === regionId)?.provinces ?? [])
      : []
  const activeRegion =
    regionId ?? (provinceCode ? pack.provinces.find((p) => p.code === provinceCode)?.region : undefined)
  const regular: PlannedFeed[] = []
  const regionWide: PlannedFeed[] = []
  const local = new Map<string, PlannedFeed[]>(localCodes.map((code) => [code, []]))
  for (const source of pack.sources) {
    if (!enabled.has(source.id)) continue
    for (const feed of source.feeds) {
      const planned = { key: feedKey(source, feed), source, feed }
      if (feed.province) local.get(feed.province)?.push(planned)
      else if (feed.region) {
        if (feed.region === activeRegion) regionWide.push(planned)
      } else regular.push(planned)
    }
  }
  if (provinceCode) return [...regular, ...regionWide, ...(local.get(provinceCode) ?? [])]

  const groups = [...local.values()].filter((group) => group.length > 0).sort((a, b) => b.length - a.length)
  const picked: PlannedFeed[] = []
  for (let round = 0; picked.length < MAX_REGION_FEEDS && groups.some((g) => g.length > round); round++) {
    for (const group of groups) {
      if (group[round] && picked.length < MAX_REGION_FEEDS) picked.push(group[round])
    }
  }
  return [...regular, ...regionWide, ...picked]
}

/** Run at most `concurrency` tasks at a time. */
function createLimiter(concurrency: number): <T>(task: () => Promise<T>) => Promise<T> {
  let active = 0
  const queue: (() => void)[] = []
  const next = (): void => {
    active--
    queue.shift()?.()
  }
  return (task) =>
    new Promise((resolve, reject) => {
      const run = (): void => {
        active++
        Promise.resolve().then(task).then(resolve, reject).finally(next)
      }
      if (active < concurrency) run()
      else queue.push(run)
    })
}

const byNewest = (a: Article, b: Article): number =>
  b.publishedAt - a.publishedAt || b.fetchedAt - a.fetchedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

const union = <T>(a: readonly T[], b: readonly T[]): T[] => [...new Set([...a, ...b])]

function betterImage(current: string | undefined, candidate: string | undefined): string | undefined {
  if (!current || !candidate) return current ?? candidate
  return (widthFromUrl(candidate) ?? 0) > (widthFromUrl(current) ?? 0) ? candidate : current
}

/** Combine two sightings of one article (another feed of the source, or a later refresh). */
function mergeArticle(existing: Article, incoming: Article): Article {
  const merged: Article = {
    ...existing,
    title: incoming.title || existing.title,
    summary: incoming.summary.length > existing.summary.length ? incoming.summary : existing.summary,
    hasDetail: existing.hasDetail || incoming.hasDetail,
    publishedAt: Math.min(existing.publishedAt, incoming.publishedAt),
    fetchedAt: Math.min(existing.fetchedAt, incoming.fetchedAt),
    categories: union(existing.categories, incoming.categories),
    isBreaking: existing.isBreaking || incoming.isBreaking,
    isHeadline: existing.isHeadline || incoming.isHeadline,
    provinces: union(existing.provinces, incoming.provinces),
    regions: union(existing.regions, incoming.regions)
  }
  const image = betterImage(existing.image, incoming.image)
  if (image) merged.image = image
  const author = existing.author ?? incoming.author
  if (author) merged.author = author
  return merged
}

const detailSize = (detail: ArticleDetail): number => detail.paragraphs.reduce((sum, p) => sum + p.length, 0)

function isArticle(value: unknown): value is Article {
  const a = value as Partial<Article> | null
  return (
    typeof a === 'object' &&
    a !== null &&
    typeof a.id === 'string' &&
    typeof a.url === 'string' &&
    typeof a.title === 'string' &&
    typeof a.summary === 'string' &&
    typeof a.sourceId === 'string' &&
    typeof a.publishedAt === 'number' &&
    typeof a.fetchedAt === 'number' &&
    Array.isArray(a.categories) &&
    Array.isArray(a.provinces) &&
    Array.isArray(a.regions)
  )
}

function isDetail(value: unknown): value is ArticleDetail {
  const d = value as Partial<ArticleDetail> | null
  return typeof d === 'object' && d !== null && typeof d.id === 'string' && Array.isArray(d.paragraphs)
}

function emptyNewsCache(country: CountryCode): NewsCache {
  return {
    version: CACHE_VERSION,
    country,
    savedAt: 0,
    updatedAt: 0,
    articles: [],
    feedState: {},
    details: [],
    marked: []
  }
}

/** Accept a cache file of the current version; anything older starts empty. Throws only on garbage. */
function readNewsCache(raw: unknown, country: CountryCode): NewsCache {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('not an object')
  const cache = raw as Partial<NewsCache>
  if (cache.version !== CACHE_VERSION || cache.country !== country) return emptyNewsCache(country)
  const feedState =
    typeof cache.feedState === 'object' && cache.feedState !== null && !Array.isArray(cache.feedState)
      ? cache.feedState
      : {}
  return {
    version: CACHE_VERSION,
    country,
    savedAt: typeof cache.savedAt === 'number' ? cache.savedAt : 0,
    updatedAt: typeof cache.updatedAt === 'number' ? cache.updatedAt : 0,
    articles: Array.isArray(cache.articles) ? cache.articles.filter(isArticle) : [],
    feedState,
    details: Array.isArray(cache.details) ? cache.details.filter(isDetail) : [],
    marked: Array.isArray(cache.marked)
      ? cache.marked.filter((id): id is string => typeof id === 'string')
      : []
  }
}

function readImageCache(raw: unknown): ImageCache {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('not an object')
  const cache = raw as Partial<ImageCache>
  const images: Record<string, string | null> = {}
  if (cache.version !== CACHE_VERSION) return { version: CACHE_VERSION, images, siteDefaults: [] }
  if (typeof cache.images === 'object' && cache.images !== null) {
    for (const [id, url] of Object.entries(cache.images)) {
      if (typeof url === 'string' || url === null) images[id] = url
    }
  }
  const siteDefaults = Array.isArray(cache.siteDefaults)
    ? cache.siteDefaults.filter((url): url is string => typeof url === 'string')
    : []
  return { version: CACHE_VERSION, images, siteDefaults }
}

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error))

export const createNewsService: CreateNewsService = (options) => {
  const { logger, now, manualRefresh } = options
  const limitFeeds = createLimiter(FEED_CONCURRENCY)
  const limitImages = createLimiter(IMAGE_CONCURRENCY)
  const pendingImages = new Map<string, Promise<string | null>>()
  /** Pages that failed to load this session (not persisted, so they are retried next time). */
  const imageMisses = new Set<string>()

  let state = blankState(options.getSettings().country)
  /** Bumped on every country switch; work started for an older generation is discarded. */
  let generation = 0
  let snapshotCache: NewsSnapshot | undefined
  let status: RefreshStatus = { state: 'idle', done: 0, total: 0, lastCompletedAt: 0 }
  let inflight: { promise: Promise<void>; full: boolean; generation: number } | undefined
  let rerun = false
  let started = false
  let stopped = false
  let fullTimer: ReturnType<typeof setTimeout> | undefined
  let breakingTimer: ReturnType<typeof setInterval> | undefined
  let statusTimer: ReturnType<typeof setTimeout> | undefined
  let lastStatusAt = 0
  /** Aborted by stop() so shutdown never waits for slow sites. */
  let lifetime = new AbortController()
  const fetchUntilStopped: typeof fetch = (input, init) =>
    options.fetch(input, {
      ...init,
      signal: init?.signal ? AbortSignal.any([init.signal, lifetime.signal]) : lifetime.signal
    })

  function blankState(country: CountryCode): CountryState {
    const pack = options.getPack(country)
    return {
      country,
      pack,
      geo: pack ? createGeoTagger(pack) : undefined,
      articles: new Map(),
      details: new Map(),
      feedState: new Map(),
      images: new Map(),
      siteDefaults: new Set(),
      marked: new Set(),
      announced: new Set(),
      clusters: [],
      lastCompletedAt: 0,
      cold: true,
      newsFile: new JsonFile(join(options.cacheDir, `news-${country}.json`), {
        debounceMs: SAVE_DEBOUNCE_MS,
        logger
      }),
      imageFile: new JsonFile(join(options.cacheDir, `images-${country}.json`), {
        debounceMs: SAVE_DEBOUNCE_MS,
        logger
      })
    }
  }

  async function loadState(country: CountryCode): Promise<CountryState> {
    const next = blankState(country)
    const [news, images] = await Promise.all([
      next.newsFile.load(emptyNewsCache(country), (raw) => readNewsCache(raw, country)),
      next.imageFile.load({ version: CACHE_VERSION, images: {}, siteDefaults: [] }, readImageCache)
    ])
    const enabled = enabledSources(next.pack, options.getSettings())
    const sources = new Map(next.pack?.sources.map((s) => [s.id, s]))
    for (const article of news.articles) {
      const source = sources.get(article.sourceId)
      // Junk is dropped at normalisation; this also clears it from caches written before.
      if (source && enabled.has(source.id) && !isJunkItem(article.title, article.url, source)) {
        next.articles.set(article.id, article)
      }
    }
    for (const detail of news.details) if (next.articles.has(detail.id)) next.details.set(detail.id, detail)
    for (const id of news.marked) if (next.articles.has(id)) next.marked.add(id)
    // Forget feeds the pack no longer has.
    const feeds = new Set(next.pack?.sources.flatMap((s) => s.feeds.map((f) => feedKey(s, f))))
    for (const [key, feed] of Object.entries(news.feedState))
      if (feeds.has(key)) next.feedState.set(key, feed)
    for (const url of images.siteDefaults) next.siteDefaults.add(url)
    for (const [id, url] of Object.entries(images.images)) {
      const article = next.articles.get(id)
      if (!article) continue
      next.images.set(id, url)
      if (url && !article.image) next.articles.set(id, { ...article, image: url })
    }
    next.lastCompletedAt = news.updatedAt
    prune(next)
    next.cold = next.articles.size === 0
    recluster(next)
    logger.info(`Loaded ${next.articles.size} cached articles for ${country}`)
    return next
  }

  function removeArticle(s: CountryState, id: string): void {
    s.articles.delete(id)
    s.details.delete(id)
    s.images.delete(id)
    s.marked.delete(id)
    s.announced.delete(id)
  }

  /** Drop articles older than 72 hours and keep the newest 6000. */
  function prune(s: CountryState): void {
    const cutoff = now() - RETENTION_MS
    for (const [id, article] of s.articles) if (article.publishedAt < cutoff) removeArticle(s, id)
    if (s.articles.size > MAX_ARTICLES) {
      const overflow = [...s.articles.values()].sort(byNewest).slice(MAX_ARTICLES)
      for (const article of overflow) removeArticle(s, article.id)
    }
  }

  /**
   * One source can publish a story under two URLs; keep the first-seen copy of a repeated headline.
   * Only copies published close together count: the same headline on another day ("Borsa güne
   * yükselişle başladı") is a new story.
   */
  function collapseDuplicates(s: CountryState): void {
    const kept = new Map<string, string>()
    const oldestFirst = [...s.articles.values()].sort(
      (a, b) => a.fetchedAt - b.fetchedAt || a.publishedAt - b.publishedAt
    )
    for (const article of oldestFirst) {
      const title = foldTr(article.title)
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
      if (title.length < 25) continue
      const key = `${article.sourceId}\n${title}`
      const keptId = kept.get(key)
      const keeper = keptId ? s.articles.get(keptId) : undefined
      if (!keeper || Math.abs(article.publishedAt - keeper.publishedAt) > DUPLICATE_WINDOW_MS) {
        kept.set(key, article.id)
        continue
      }
      s.articles.set(keeper.id, { ...mergeArticle(keeper, article), title: keeper.title })
      const detail = s.details.get(article.id)
      if (detail && !s.details.has(keeper.id)) s.details.set(keeper.id, { ...detail, id: keeper.id })
      if (s.marked.has(article.id)) s.marked.add(keeper.id)
      removeArticle(s, article.id)
    }
  }

  /** Cluster the articles, then stamp each with its cluster and whether it is breaking news. */
  function recluster(s: CountryState): void {
    const { clusters, clusterOf, breaking } = clusterStories([...s.articles.values()], {
      now: now(),
      marked: s.marked
    })
    s.clusters = clusters
    for (const [id, article] of s.articles) {
      const clusterId = clusterOf.get(id)
      const isBreaking = breaking.has(id)
      if (article.clusterId === clusterId && article.isBreaking === isBreaking) continue
      const next = { ...article, isBreaking }
      if (clusterId) next.clusterId = clusterId
      else delete next.clusterId
      s.articles.set(id, next)
    }
    snapshotCache = undefined
  }

  function saveNews(s: CountryState): void {
    s.newsFile.save({
      version: CACHE_VERSION,
      country: s.country,
      savedAt: now(),
      updatedAt: s.lastCompletedAt,
      articles: [...s.articles.values()],
      feedState: Object.fromEntries(s.feedState),
      details: [...s.details.values()],
      marked: [...s.marked]
    })
  }

  function saveImages(s: CountryState): void {
    const images: Record<string, string | null> = {}
    for (const [id, url] of s.images) if (s.articles.has(id)) images[id] = url
    s.imageFile.save({ version: CACHE_VERSION, images, siteDefaults: [...s.siteDefaults] })
  }

  /**
   * Record an og:image found for an article. When a second article of the same source
   * resolves to the very same picture, it is the site's generic image (a logo card),
   * not a photo: it is dropped for both and never used again.
   */
  function storeResolvedImage(s: CountryState, article: Article, image: string | null): string | null {
    let url = image && s.siteDefaults.has(image) ? null : image
    for (const [otherId, other] of s.images) {
      if (!url || other !== url || otherId === article.id) continue
      if (s.articles.get(otherId)?.sourceId !== article.sourceId) continue
      s.siteDefaults.add(url)
      s.images.set(otherId, null)
      const previous = s.articles.get(otherId)
      if (previous?.image === url) {
        const withoutImage = { ...previous }
        delete withoutImage.image
        s.articles.set(otherId, withoutImage)
      }
      url = null
    }
    s.images.set(article.id, url)
    const current = s.articles.get(article.id)
    if (url && current && !current.image) s.articles.set(article.id, { ...current, image: url })
    snapshotCache = undefined
    saveImages(s)
    return url
  }

  function feedStatuses(s: CountryState): FeedStatus[] {
    if (!s.pack) return []
    return planFeeds(s.pack, options.getSettings()).map(({ key, source, feed }) => {
      const feedState = s.feedState.get(key)
      const status: FeedStatus = {
        sourceId: source.id,
        url: feed.url,
        ok: feedState?.ok ?? false,
        itemCount: feedState?.itemCount ?? 0
      }
      if (feedState?.lastFetchedAt) status.lastFetchedAt = feedState.lastFetchedAt
      if (feedState?.lastError) status.lastError = feedState.lastError
      return status
    })
  }

  function snapshot(): NewsSnapshot {
    snapshotCache ??= {
      country: state.country,
      articles: [...state.articles.values()].sort(byNewest),
      clusters: state.clusters,
      feeds: feedStatuses(state),
      updatedAt: state.lastCompletedAt
    }
    return snapshotCache
  }

  /** Emit status, at most four progress events a second; `final` events go out at once. */
  function setStatus(next: RefreshStatus, final = false): void {
    status = next
    const emit = (): void => {
      lastStatusAt = Date.now()
      options.onStatus(status)
    }
    if (final) {
      clearTimeout(statusTimer)
      statusTimer = undefined
      emit()
      return
    }
    const wait = STATUS_INTERVAL_MS - (Date.now() - lastStatusAt)
    if (wait <= 0) emit()
    else if (!statusTimer) {
      statusTimer = setTimeout(() => {
        statusTimer = undefined
        emit()
      }, wait)
      statusTimer.unref?.()
    }
  }

  const intervalMs = (): number => Math.max(1, options.getSettings().refresh.intervalMinutes) * 60_000

  function scheduleFull(delay = intervalMs()): void {
    clearTimeout(fullTimer)
    if (manualRefresh || !started || stopped) return
    fullTimer = setTimeout(() => void refresh(), Math.max(0, delay))
    fullTimer.unref?.()
  }

  function startBreakingTimer(): void {
    clearInterval(breakingTimer)
    if (manualRefresh) return
    breakingTimer = setInterval(() => {
      if (!inflight && !stopped) void run('breaking', false)
    }, BREAKING_INTERVAL_MS)
    breakingTimer.unref?.()
  }

  /** Refresh now if the data is older than the interval (or missing), otherwise when it will be. */
  function refreshWhenStale(): void {
    if (manualRefresh || !started) return
    const age = now() - state.lastCompletedAt
    if (state.articles.size === 0 || age >= intervalMs()) void refresh()
    else scheduleFull(intervalMs() - age)
  }

  /** What to ask a publisher for, and how to read a body that claims an 8-bit codepage. */
  function requestLocale(pack: CountryPack | undefined): {
    acceptLanguage: string
    legacyCharset: string
  } {
    const locale = pack?.locale ?? 'tr-TR'
    const language = pack?.language ?? 'tr'
    return {
      acceptLanguage:
        language === 'en' ? `${locale},en;q=0.9` : `${locale},${language};q=0.9,en-US;q=0.8,en;q=0.7`,
      // Turkish CMSs that label windows-1254 as iso-8859-1 are the exception; elsewhere it means 1252.
      legacyCharset: language === 'tr' ? 'windows-1254' : 'windows-1252'
    }
  }

  async function fetchFeed(planned: PlannedFeed, force: boolean, s: CountryState): Promise<FeedOutcome> {
    const previous = s.feedState.get(planned.key)
    const fetchedAt = now()
    const outcome = { planned, fetchedAt, ok: false, notModified: false, items: [], itemCount: 0 }
    try {
      const res = await fetchText(planned.feed.url, {
        fetch: fetchUntilStopped,
        timeoutMs: FEED_TIMEOUT_MS,
        encoding: planned.feed.encoding,
        accept: FEED_ACCEPT,
        ...requestLocale(s.pack),
        etag: force ? undefined : previous?.etag,
        lastModified: force ? undefined : previous?.lastModified
      })
      if (res.notModified) {
        return { ...outcome, ok: true, notModified: true, itemCount: previous?.itemCount ?? 0 }
      }
      if (!res.ok) return { ...outcome, error: `HTTP ${res.status}` }
      const parsed = parseFeed(res.text)
      // A well-formed feed may be empty for a while (a small province's city feed).
      if (parsed.error) return { ...outcome, error: parsed.error }
      const items: NormalizedItem[] = []
      if (s.pack && s.geo) {
        const context = { source: planned.source, feed: planned.feed, pack: s.pack, geo: s.geo }
        for (const raw of parsed.items) {
          const item = normalizeItem(raw, {
            ...context,
            now: fetchedAt,
            baseUrl: res.url || planned.feed.url
          })
          if (item) items.push(item)
        }
      }
      return {
        ...outcome,
        ok: true,
        items,
        itemCount: parsed.items.length,
        etag: res.etag,
        lastModified: res.lastModified
      }
    } catch (error) {
      return { ...outcome, error: errorMessage(error), unreachable: true }
    }
  }

  function commit(s: CountryState, outcomes: FeedOutcome[], full: boolean, startedAt: number): void {
    const time = now()
    const enabled = enabledSources(s.pack, options.getSettings())
    const before = new Set(s.articles.keys())
    const wasBreaking = new Set([...s.articles.values()].filter((a) => a.isBreaking).map((a) => a.id))
    const failed: string[] = []
    // No feed answered at all: the network is down, which is no reason to back feeds off (they
    // are all tried again as soon as it is back).
    const offline = outcomes.length > 0 && outcomes.every((outcome) => outcome.unreachable === true)
    for (const outcome of outcomes) {
      const { planned } = outcome
      // Switched off while being fetched: keep no validators or backoff for it, so switching it
      // back on fetches everything again (settingsChanged has just forgotten its state).
      if (!enabled.has(planned.source.id)) continue
      const previous = s.feedState.get(planned.key)
      if (!outcome.ok) {
        const failures = (previous?.failures ?? 0) + (offline ? 0 : 1)
        const minutes = offline ? 0 : BACKOFF_MINUTES[Math.min(failures, BACKOFF_MINUTES.length) - 1]
        s.feedState.set(planned.key, {
          ...previous,
          ok: false,
          itemCount: previous?.itemCount ?? 0,
          failures,
          retryAt: outcome.fetchedAt + minutes * 60_000,
          lastFetchedAt: outcome.fetchedAt,
          lastError: outcome.error
        })
        failed.push(planned.source.id)
        continue
      }
      s.feedState.set(planned.key, {
        ok: true,
        itemCount: outcome.itemCount,
        failures: 0,
        retryAt: 0,
        etag: outcome.notModified ? previous?.etag : outcome.etag,
        lastModified: outcome.notModified ? previous?.lastModified : outcome.lastModified,
        lastFetchedAt: outcome.fetchedAt
      })
      for (const { article, detail } of outcome.items) {
        const existing = s.articles.get(article.id)
        s.articles.set(article.id, existing ? mergeArticle(existing, article) : article)
        if (article.isBreaking) s.marked.add(article.id)
        const known = s.details.get(article.id)
        if (detail && (!known || detailSize(detail) > detailSize(known))) s.details.set(article.id, detail)
      }
    }
    collapseDuplicates(s)
    prune(s)
    recluster(s)
    // "Updated" means some feed answered; a run that fetched nothing (all failing, or backing off) is no update.
    if (full && outcomes.some((outcome) => outcome.ok)) s.lastCompletedAt = time
    saveNews(s)

    const articles = [...s.articles.values()]
    const fresh = articles.filter((article) => !before.has(article.id))
    // New breaking news, and earlier reports that a second source has just corroborated.
    const newBreaking = articles.filter((article) => article.isBreaking && !wasBreaking.has(article.id))
    if (full || fresh.length > 0 || failed.length > 0) {
      logger.info(
        `Fetched ${outcomes.length} feeds in ${time - startedAt} ms: ${fresh.length} new, ${s.articles.size} total` +
          (failed.length ? `; failing: ${[...new Set(failed)].join(', ')}` : '')
      )
    }
    if (full || fresh.length > 0 || newBreaking.length > 0) {
      options.onUpdated({ updatedAt: time, newCount: fresh.length, newBreaking: newBreaking.length })
    }
    if (s.cold) {
      if (s.articles.size > 0) s.cold = false
      for (const article of newBreaking) s.announced.add(article.id)
    } else {
      const alerts = newBreaking.filter(
        (article) => article.publishedAt >= time - BREAKING_ALERT_WINDOW_MS && !s.announced.has(article.id)
      )
      for (const article of alerts) s.announced.add(article.id)
      if (alerts.length > 0) options.onBreaking(alerts)
    }
  }

  async function execute(scope: Scope, force: boolean, runGeneration: number): Promise<void> {
    const full = scope === 'full'
    const s = state
    if (!s.pack) {
      if (full) setStatus({ state: 'idle', done: 0, total: 0, lastCompletedAt: s.lastCompletedAt }, true)
      return
    }
    const startedAt = now()
    const planned = planFeeds(s.pack, options.getSettings()).filter((p) => inScope(scope, p))
    const due = force ? planned : planned.filter((p) => (s.feedState.get(p.key)?.retryAt ?? 0) <= startedAt)
    const total = due.length
    let done = 0
    if (full) setStatus({ state: 'refreshing', done, total, lastCompletedAt: s.lastCompletedAt }, true)
    const outcomes = await Promise.all(
      due.map((p) =>
        limitFeeds(() => fetchFeed(p, force, s)).then((outcome) => {
          done++
          if (full && runGeneration === generation) {
            setStatus({ state: 'refreshing', done, total, lastCompletedAt: s.lastCompletedAt })
          }
          return outcome
        })
      )
    )
    if (runGeneration !== generation || stopped) return
    commit(s, outcomes, full, startedAt)
    if (full) {
      setStatus({ state: 'idle', done: total, total, lastCompletedAt: s.lastCompletedAt }, true)
      scheduleFull()
    }
  }

  /** Start a refresh (full, or just the breaking-news or markets feeds) and track it as the in-flight one. */
  function run(scope: Scope, force: boolean): Promise<void> {
    const runGeneration = generation
    const promise: Promise<void> = execute(scope, force, runGeneration)
      .catch((error: unknown) => logger.error('Refresh failed', error))
      .finally(() => {
        if (inflight?.promise === promise) inflight = undefined
        if (rerun && !stopped) {
          rerun = false
          void refresh()
        }
      })
    inflight = { promise, full: scope === 'full', generation: runGeneration }
    return promise
  }

  function refresh(force = false): Promise<void> {
    if (inflight && inflight.generation === generation) {
      return inflight.full ? inflight.promise : inflight.promise.then(() => refresh(force))
    }
    return run('full', force)
  }

  let marketsRunAt = -Infinity

  /** The markets feeds, unless another refresh is under way or they were fetched under a minute ago. */
  function refreshMarkets(): Promise<void> {
    if (!started || stopped) return Promise.resolve()
    if (inflight && inflight.generation === generation) return inflight.promise
    if (now() - marketsRunAt < MARKETS_INTERVAL_MS) return Promise.resolve()
    marketsRunAt = now()
    return run('markets', false)
  }

  /** Refresh as soon as possible: now, or right after the refresh already running. */
  function requestRefresh(): void {
    if (manualRefresh || !started || stopped) return
    if (inflight && inflight.generation === generation) rerun = true
    else void refresh()
  }

  async function switchCountry(country: CountryCode): Promise<void> {
    const switchGeneration = ++generation
    const previous = state
    await Promise.all([previous.newsFile.flush(), previous.imageFile.flush()])
    const next = await loadState(country)
    if (switchGeneration !== generation) return
    state = next
    snapshotCache = undefined
    setStatus({ state: 'idle', done: 0, total: 0, lastCompletedAt: next.lastCompletedAt }, true)
    options.onUpdated({ updatedAt: next.lastCompletedAt, newCount: 0, newBreaking: 0 })
    refreshWhenStale()
  }

  async function fetchPageImage(url: string): Promise<{ image: string | null; definitive: boolean }> {
    try {
      const res = await fetchText(url, {
        fetch: fetchUntilStopped,
        timeoutMs: IMAGE_TIMEOUT_MS,
        maxBytes: IMAGE_MAX_BYTES,
        accept: PAGE_ACCEPT,
        ...requestLocale(state.pack)
      })
      if (!res.ok) return { image: null, definitive: res.status === 404 || res.status === 410 }
      return { image: extractPageImage(res.text, res.url || url), definitive: true }
    } catch {
      return { image: null, definitive: false }
    }
  }

  return {
    async start() {
      if (started) return
      started = true
      stopped = false
      lifetime = new AbortController()
      const loadGeneration = generation
      const loaded = await loadState(options.getSettings().country)
      if (loadGeneration === generation) state = loaded
      snapshotCache = undefined
      status = { state: 'idle', done: 0, total: 0, lastCompletedAt: state.lastCompletedAt }
      options.onUpdated({ updatedAt: state.lastCompletedAt, newCount: 0, newBreaking: 0 })
      startBreakingTimer()
      refreshWhenStale()
    },

    async stop() {
      stopped = true
      started = false
      clearTimeout(fullTimer)
      clearInterval(breakingTimer)
      clearTimeout(statusTimer)
      lifetime.abort()
      await inflight?.promise
      await Promise.all([state.newsFile.flush(), state.imageFile.flush()])
    },

    snapshot,

    status: () => status,

    refresh,

    refreshMarkets,

    resolveImage(articleId) {
      const s = state
      const article = s.articles.get(articleId)
      if (!article) return Promise.resolve(null)
      // Even with a feed image we look the page up: the renderer only asks when that
      // image is missing, broken, or too small for a large slot (the manşet).
      if (s.images.has(articleId)) return Promise.resolve(s.images.get(articleId) ?? null)
      if (imageMisses.has(articleId)) return Promise.resolve(null)
      const pending = pendingImages.get(articleId)
      if (pending) return pending
      const promise = limitImages(() => fetchPageImage(article.url))
        .then(({ image, definitive }) => {
          if (s !== state) return image
          if (!definitive) {
            imageMisses.add(articleId)
            return null
          }
          return storeResolvedImage(s, article, image)
        })
        .finally(() => pendingImages.delete(articleId))
      pendingImages.set(articleId, promise)
      return promise
    },

    detail(articleId) {
      return Promise.resolve(state.details.get(articleId) ?? null)
    },

    settingsChanged(prev, next) {
      if (next.country !== state.country) {
        void switchCountry(next.country).catch((error: unknown) =>
          logger.error('Country switch failed', error)
        )
        return
      }
      snapshotCache = undefined
      // Compare what is switched on, not the raw lists: opt-in sources live in `enabled`.
      const wasEnabled = enabledSources(state.pack, prev)
      const isEnabled = enabledSources(state.pack, next)
      const disabledNow = new Set([...wasEnabled].filter((id) => !isEnabled.has(id)))
      const enabledNow = [...isEnabled].filter((id) => !wasEnabled.has(id))
      const locationChanged =
        prev.location.provinceCode !== next.location.provinceCode ||
        prev.location.regionId !== next.location.regionId

      if (disabledNow.size > 0) {
        const s = state
        for (const [id, article] of s.articles) if (disabledNow.has(article.sourceId)) removeArticle(s, id)
        // Forget their conditional-GET validators and backoff so re-enabling fetches everything again.
        for (const source of s.pack?.sources ?? []) {
          if (!disabledNow.has(source.id)) continue
          for (const feed of source.feeds) s.feedState.delete(feedKey(source, feed))
        }
        recluster(s)
        saveNews(s)
        saveImages(s)
        options.onUpdated({ updatedAt: now(), newCount: 0, newBreaking: 0 })
      }
      // A full refresh under way reschedules itself when it ends; a breaking-only one does not.
      const fullRunning = inflight?.full === true && inflight.generation === generation
      if (prev.refresh.intervalMinutes !== next.refresh.intervalMinutes && !fullRunning) {
        scheduleFull(intervalMs() - (now() - state.lastCompletedAt))
      }
      if (enabledNow.length > 0 || locationChanged) requestRefresh()
    }
  }
}
