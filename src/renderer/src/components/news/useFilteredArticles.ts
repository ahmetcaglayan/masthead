import { useMemo } from 'react'
import type { Article } from '@shared/types'
import { useNow } from '@/hooks/useNow'
import { useSources } from '@/hooks/useSources'
import { applyFilters } from '@/lib/filter'
import { useLibrary } from '@/stores/library'
import { useNews } from '@/stores/news'
import { DEFAULT_FILTERS, useUi, type Filters } from '@/stores/ui'
import type { FilterControl } from './FilterBar'

const NO_IDS: ReadonlySet<string> = new Set()

/** The filters with every control a page fixes itself reset to its default. */
function effectiveFilters(filters: Filters, ignore: readonly FilterControl[]): Filters {
  if (ignore.length === 0) return filters
  const next = { ...filters }
  for (const control of ignore) {
    if (control === 'time') next.timeRange = DEFAULT_FILTERS.timeRange
    else if (control === 'sources') next.sourceIds = DEFAULT_FILTERS.sourceIds
    else if (control === 'location') Object.assign(next, { provinceCode: null, regionId: null })
    else if (control === 'sort') next.sort = DEFAULT_FILTERS.sort
    else if (control === 'images') next.withImagesOnly = false
    else next.hideRead = false
  }
  return next
}

export interface FilteredArticles {
  articles: Article[]
  /** The filters that were applied. */
  filters: Filters
  /** Changes whenever the applied filters do — reset pagination with it. */
  resetKey: string
}

/**
 * Apply the filter bar's choices (`useUi.filters`) to a list, ignoring the
 * controls the page hides (pass the same `hide` list as to `FilterBar`).
 * Recomputed only when the list, the filters or what they depend on change.
 */
export function useFilteredArticles(
  articles: readonly Article[],
  ignore: readonly FilterControl[] = []
): FilteredArticles {
  const raw = useUi((s) => s.filters)
  const filters = useMemo(() => effectiveFilters(raw, ignore), [raw, ignore])
  const readIds = useLibrary((s) => (filters.hideRead ? s.readIds : NO_IDS))
  const clustersById = useNews((s) => s.clustersById)
  const { isEnabled } = useSources()
  const minute = useNow(60_000)
  const now = filters.timeRange === 'all' ? 0 : minute

  return useMemo(
    () => ({
      articles: applyFilters(articles, filters, { now, readIds, clustersById, isEnabled }),
      filters,
      resetKey: JSON.stringify(filters)
    }),
    [articles, filters, now, readIds, clustersById, isEnabled]
  )
}
