import { create } from 'zustand'
import type { CategoryId } from '@shared/categories'
import type { ReaderMode, TimeRange } from '@shared/settings'
import type { Article } from '@shared/types'
import { getSettings } from './settings'

export type Route =
  | { name: 'home' }
  /** "Gündem Özeti": clustered stories with every source's headline, readable without clicking. */
  | { name: 'digest' }
  | { name: 'latest' }
  | { name: 'breaking' }
  | { name: 'foryou' }
  | { name: 'local' }
  | { name: 'category'; id: CategoryId }
  | { name: 'source'; id: string }
  | { name: 'search'; query: string }
  | { name: 'saved' }
  | { name: 'history' }
  | { name: 'sources' }
  | { name: 'settings'; section?: string }

export type SortOrder = 'latest' | 'popular'

export interface Filters {
  timeRange: TimeRange
  /** Restrict to these sources; empty = all enabled sources. */
  sourceIds: string[]
  provinceCode: string | null
  regionId: string | null
  withImagesOnly: boolean
  hideRead: boolean
  sort: SortOrder
}

export const DEFAULT_FILTERS: Filters = {
  timeRange: 'all',
  sourceIds: [],
  provinceCode: null,
  regionId: null,
  withImagesOnly: false,
  hideRead: false,
  sort: 'latest'
}

export interface ReaderState {
  article: Article
  mode: ReaderMode
  /** Ordered article ids of the list the article was opened from, for next/previous. */
  queue: string[]
}

/**
 * Pages keep their own filters: a source or time filter set on Latest does not
 * quietly narrow Economy or Search later. Keyed by route name (+ id).
 */
export const filterKey = (route: Route): string =>
  route.name === 'category' || route.name === 'source' ? `${route.name}:${route.id}` : route.name

interface UiState {
  route: Route
  history: Route[]
  /** The current page's filters (`filtersByRoute` for the route, or the defaults). */
  filters: Filters
  filtersByRoute: Record<string, Filters>
  reader: ReaderState | null
  commandOpen: boolean
  navigate(route: Route): void
  back(): void
  /** Change the current page's filters. */
  setFilters(patch: Partial<Filters>): void
  /** Back to the defaults on the current page. */
  resetFilters(): void
  openArticle(article: Article, queue?: string[], mode?: ReaderMode): void
  setReaderMode(mode: ReaderMode): void
  closeArticle(): void
  setCommandOpen(open: boolean): void
}

const sameRoute = (a: Route, b: Route): boolean => JSON.stringify(a) === JSON.stringify(b)

export const useUi = create<UiState>((set, get) => ({
  route: { name: 'home' },
  history: [],
  filters: DEFAULT_FILTERS,
  filtersByRoute: {},
  reader: null,
  commandOpen: false,

  navigate(route) {
    const current = get().route
    if (sameRoute(current, route)) return
    set((s) => ({
      route,
      history: [...s.history.slice(-30), current],
      filters: s.filtersByRoute[filterKey(route)] ?? DEFAULT_FILTERS
    }))
  },

  back() {
    const history = get().history
    if (history.length === 0) return
    const route = history[history.length - 1]
    set((s) => ({
      route,
      history: history.slice(0, -1),
      filters: s.filtersByRoute[filterKey(route)] ?? DEFAULT_FILTERS
    }))
  },

  setFilters(patch) {
    set((s) => {
      const filters = { ...s.filters, ...patch }
      return { filters, filtersByRoute: { ...s.filtersByRoute, [filterKey(s.route)]: filters } }
    })
  },

  resetFilters() {
    set((s) => {
      const filtersByRoute = { ...s.filtersByRoute }
      delete filtersByRoute[filterKey(s.route)]
      return { filters: DEFAULT_FILTERS, filtersByRoute }
    })
  },

  openArticle(article, queue = [], mode) {
    set((s) => ({
      reader: { article, queue, mode: mode ?? s.reader?.mode ?? getSettings().reader.defaultMode }
    }))
  },

  setReaderMode(mode) {
    set((s) => (s.reader ? { reader: { ...s.reader, mode } } : s))
  },

  closeArticle() {
    set({ reader: null })
  },

  setCommandOpen(open) {
    set({ commandOpen: open })
  }
}))
