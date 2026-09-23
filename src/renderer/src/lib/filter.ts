import type { TimeRange } from '@shared/settings'
import type { Article, StoryCluster } from '@shared/types'
import { DEFAULT_FILTERS, type Filters, type SortOrder } from '@/stores/ui'
import { coverage, onePerStory } from './story'

export { coverage, onePerStory }

const HOUR = 3_600_000

/** Length of each time-range filter in ms (`all` is unbounded). */
export const TIME_RANGE_MS: Record<TimeRange, number> = {
  '1h': HOUR,
  '6h': 6 * HOUR,
  '24h': 24 * HOUR,
  '3d': 72 * HOUR,
  all: Number.POSITIVE_INFINITY
}

export interface FilterContext {
  /** Reference time for the time range (epoch ms). */
  now: number
  /** Articles the user has opened; needed for `hideRead`. */
  readIds?: ReadonlySet<string>
  /** Sources switched off in settings never pass. */
  isEnabled?: (sourceId: string) => boolean
  /** Cluster lookup for the "most covered" sort. */
  clustersById?: ReadonlyMap<string, StoryCluster>
}

/**
 * Order articles. `latest` is newest first; `popular` ranks stories by how many
 * sources covered them (then cluster score, then recency) and keeps one
 * article per story, so a widely covered event is not repeated down the list.
 */
export function sortArticles(
  articles: readonly Article[],
  sort: SortOrder,
  clustersById?: ReadonlyMap<string, StoryCluster>
): Article[] {
  if (sort === 'latest') return [...articles].sort((a, b) => b.publishedAt - a.publishedAt)

  const unique = onePerStory(articles)
  const scoreOf = (a: Article): number =>
    (a.clusterId ? clustersById?.get(a.clusterId)?.score : undefined) ?? 0
  return unique.sort(
    (a, b) =>
      coverage(b, clustersById) - coverage(a, clustersById) ||
      scoreOf(b) - scoreOf(a) ||
      b.publishedAt - a.publishedAt
  )
}

/**
 * Apply the filter bar's choices: time range, sources, province/region,
 * image-only and hide-read, then sort. Switched-off sources are always dropped.
 */
export function applyFilters(articles: readonly Article[], filters: Filters, ctx: FilterContext): Article[] {
  const since = ctx.now - TIME_RANGE_MS[filters.timeRange]
  const sources = filters.sourceIds.length > 0 ? new Set(filters.sourceIds) : null
  const { provinceCode, regionId, withImagesOnly, hideRead } = filters
  const readIds = hideRead ? ctx.readIds : undefined

  const kept = articles.filter(
    (a) =>
      a.publishedAt >= since &&
      (!ctx.isEnabled || ctx.isEnabled(a.sourceId)) &&
      (!sources || sources.has(a.sourceId)) &&
      (provinceCode ? a.provinces.includes(provinceCode) : !regionId || a.regions.includes(regionId)) &&
      (!withImagesOnly || Boolean(a.image)) &&
      (!readIds || !readIds.has(a.id))
  )
  return sortArticles(kept, filters.sort, ctx.clustersById)
}

/** How many filters differ from the defaults (for badges and "Clear all"). */
export function activeFilterCount(filters: Filters): number {
  let count = 0
  if (filters.timeRange !== DEFAULT_FILTERS.timeRange) count++
  if (filters.sourceIds.length > 0) count++
  if (filters.provinceCode || filters.regionId) count++
  if (filters.withImagesOnly) count++
  if (filters.hideRead) count++
  if (filters.sort !== DEFAULT_FILTERS.sort) count++
  return count
}
