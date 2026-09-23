import { useCallback, useSyncExternalStore } from 'react'
import { create } from 'zustand'
import type { CategoryId } from '@shared/categories'
import type { Article, ArticleDetail, NewsSnapshot, RefreshStatus, StoryCluster } from '@shared/types'
import { api } from '@/lib/api'
import { isBreakingNews } from '@/lib/headline'

/** Lookups over one snapshot, built once when it arrives. */
export interface SnapshotIndex {
  /** Every article, newest first. */
  sorted: Article[]
  /** Articles per source (switched-off sources included), newest first. */
  bySource: ReadonlyMap<string, readonly Article[]>
  clusters: readonly StoryCluster[]
  clustersById: ReadonlyMap<string, StoryCluster>
}

/**
 * The snapshot narrowed to the sources that are switched on, indexed once per
 * snapshot and source selection (`selectView`). Every list is newest first and
 * shared between callers, so it is safe to use as a memo dependency.
 */
export interface NewsView {
  /** Articles from enabled sources. */
  articles: Article[]
  byCategory: ReadonlyMap<CategoryId, readonly Article[]>
  bySource: ReadonlyMap<string, readonly Article[]>
  byProvince: ReadonlyMap<string, readonly Article[]>
  byRegion: ReadonlyMap<string, readonly Article[]>
  /** Articles from breaking-news streams, minus routine scheduled items (see `isBreakingNews`). */
  breaking: Article[]
  /** The snapshot's story clusters (members may include switched-off sources). */
  clusters: readonly StoryCluster[]
  clustersById: ReadonlyMap<string, StoryCluster>
}

interface NewsState {
  snapshot: NewsSnapshot | null
  index: SnapshotIndex
  byId: Map<string, Article>
  clustersById: Map<string, StoryCluster>
  status: RefreshStatus
  /** New articles that arrived since the user last acknowledged (drives the "N new stories" pill). */
  unseen: number
  init(): Promise<void>
  reload(): Promise<void>
  refresh(force?: boolean): Promise<void>
  acknowledge(): void
  /** The page's og:image for an article whose feed had none; cached, see `useResolvedImage`. */
  resolveImage(articleId: string): Promise<string | null>
  /** Long-form feed body for inline "read more"; cached per article. */
  detail(articleId: string): Promise<ArticleDetail | null>
}

const IDLE: RefreshStatus = { state: 'idle', done: 0, total: 0, lastCompletedAt: 0 }
const EMPTY_INDEX: SnapshotIndex = { sorted: [], bySource: new Map(), clusters: [], clustersById: new Map() }

const newestFirst = (a: Article, b: Article): number => b.publishedAt - a.publishedAt

function push<K>(map: Map<K, Article[]>, key: K, article: Article): void {
  const list = map.get(key)
  if (list) list.push(article)
  else map.set(key, [article])
}

function isSorted(articles: readonly Article[]): boolean {
  for (let i = 1; i < articles.length; i++)
    if (articles[i - 1].publishedAt < articles[i].publishedAt) return false
  return true
}

function indexSnapshot(
  snapshot: NewsSnapshot
): Pick<NewsState, 'snapshot' | 'index' | 'byId' | 'clustersById'> {
  // The backend already sends newest first; only sort when it did not.
  const sorted = isSorted(snapshot.articles) ? snapshot.articles : [...snapshot.articles].sort(newestFirst)
  const bySource = new Map<string, Article[]>()
  for (const article of sorted) push(bySource, article.sourceId, article)
  const clustersById = new Map(snapshot.clusters.map((c) => [c.id, c]))
  return {
    snapshot,
    index: { sorted, bySource, clusters: snapshot.clusters, clustersById },
    byId: new Map(snapshot.articles.map((a) => [a.id, a])),
    clustersById
  }
}

let viewCache: { index: SnapshotIndex; isEnabled: (id: string) => boolean; view: NewsView } | null = null

/**
 * The indexed view of a snapshot for a source filter (`useSources().isEnabled`,
 * whose identity changes only with the settings). Cached on both inputs, so it
 * is built once per snapshot and source selection, not per component.
 */
export function selectView(index: SnapshotIndex, isEnabled: (sourceId: string) => boolean): NewsView {
  if (viewCache && viewCache.index === index && viewCache.isEnabled === isEnabled) return viewCache.view
  const articles: Article[] = []
  const byCategory = new Map<CategoryId, Article[]>()
  const bySource = new Map<string, Article[]>()
  const byProvince = new Map<string, Article[]>()
  const byRegion = new Map<string, Article[]>()
  const breaking: Article[] = []
  for (const article of index.sorted) {
    if (!isEnabled(article.sourceId)) continue
    articles.push(article)
    push(bySource, article.sourceId, article)
    for (const c of article.categories) push(byCategory, c, article)
    for (const p of article.provinces) push(byProvince, p, article)
    for (const r of article.regions) push(byRegion, r, article)
    if (isBreakingNews(article)) breaking.push(article)
  }
  const view: NewsView = {
    articles,
    byCategory,
    bySource,
    byProvince,
    byRegion,
    breaking,
    clusters: index.clusters,
    clustersById: index.clustersById
  }
  viewCache = { index, isEnabled, view }
  return view
}

// Resolved og:images live outside the zustand state: one lookup must not copy a
// map of thousands of entries or wake every card on the page, only its own.
const images = new Map<string, string | null>()
const imageListeners = new Map<string, Set<() => void>>()
const pendingImages = new Map<string, Promise<string | null>>()
const details = new Map<string, Promise<ArticleDetail | null>>()

function subscribeImage(articleId: string, listener: () => void): () => void {
  let set = imageListeners.get(articleId)
  if (!set) imageListeners.set(articleId, (set = new Set()))
  set.add(listener)
  return () => {
    set.delete(listener)
    if (set.size === 0) imageListeners.delete(articleId)
  }
}

/**
 * The og:image found for an article: a URL, `null` when the page has none, or
 * undefined while unknown. Re-renders only when this article's lookup finishes.
 */
export function useResolvedImage(articleId: string): string | null | undefined {
  const subscribe = useCallback((listener: () => void) => subscribeImage(articleId, listener), [articleId])
  return useSyncExternalStore(subscribe, () => images.get(articleId))
}

export const useNews = create<NewsState>((set, get) => ({
  snapshot: null,
  index: EMPTY_INDEX,
  byId: new Map(),
  clustersById: new Map(),
  status: IDLE,
  unseen: 0,

  async init() {
    api.news.onStatus((status) => set({ status }))
    api.news.onUpdated(async (update) => {
      await get().reload()
      if (update.newCount > 0) set((s) => ({ unseen: s.unseen + update.newCount }))
    })
    await get().reload()
  },

  async reload() {
    const snapshot = await api.news.snapshot()
    set(indexSnapshot(snapshot))
  },

  async refresh(force = false) {
    await api.news.refresh(force)
  },

  acknowledge() {
    set({ unseen: 0 })
  },

  resolveImage(articleId) {
    if (images.has(articleId)) return Promise.resolve(images.get(articleId) ?? null)
    let pending = pendingImages.get(articleId)
    if (!pending) {
      pending = api.news
        .resolveImage(articleId)
        .catch(() => null)
        .then((url) => {
          pendingImages.delete(articleId)
          images.set(articleId, url)
          imageListeners.get(articleId)?.forEach((listener) => listener())
          return url
        })
      pendingImages.set(articleId, pending)
    }
    return pending
  },

  detail(articleId) {
    let pending = details.get(articleId)
    if (!pending) {
      pending = api.news.detail(articleId).catch(() => {
        details.delete(articleId)
        return null
      })
      details.set(articleId, pending)
    }
    return pending
  }
}))
