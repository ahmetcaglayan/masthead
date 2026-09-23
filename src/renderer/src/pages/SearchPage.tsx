import { useDeferredValue, useMemo, useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/layout/Page'
import { focusSearch } from '@/components/layout/search'
import { ArticleFeed } from '@/components/news/ArticleFeed'
import { FilterBar, FilterSummary, type FilterControl } from '@/components/news/FilterBar'
import { NewsGate } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { useFilteredArticles } from '@/components/news/useFilteredArticles'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Kbd } from '@/components/ui/Kbd'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useArticles } from '@/hooks/useArticles'
import { activeFilterCount } from '@/lib/filter'
import { formatNumber } from '@/lib/format'
import { parseQuery, searchArticles } from '@/lib/search'
import { useUi } from '@/stores/ui'

/** Results have their own order (relevance or newest), so the feed sort is not offered. */
const HIDE: readonly FilterControl[] = ['sort']

type Order = 'relevance' | 'latest'

function Results({ query }: { query: string }): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const deferred = useDeferredValue(query)
  const terms = useMemo(() => parseQuery(deferred), [deferred])
  const all = useArticles()
  const { articles, filters, resetKey } = useFilteredArticles(all, HIDE)
  const [order, setOrder] = useState<Order>('relevance')
  const results = useMemo(() => {
    const hits = searchArticles(articles, terms)
    return order === 'latest' ? hits.sort((a, b) => b.publishedAt - a.publishedAt) : hits
  }, [articles, terms, order])
  const filtered = activeFilterCount({ ...filters, sort: 'latest' }) > 0
  const trimmed = query.trim()

  if (!trimmed) {
    return (
      <>
        <PageHeader kicker={t('search.startKicker')} icon={Search} title={t('search.title')} />
        <EmptyState
          icon={Search}
          tone="accent"
          title={t('search.startTitle')}
          description={t('search.startBody')}
          action={
            <Button variant="primary" icon={Search} onClick={focusSearch}>
              {t('search.focus')}
              <Kbd combo="Mod+K" className="ml-1" />
            </Button>
          }
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        kicker={t('search.kicker')}
        icon={Search}
        title={t('search.titleFor', { query: trimmed })}
        details={[
          t('search.results', {
            count: results.length,
            formatted: formatNumber(results.length, i18n.language)
          })
        ]}
        actions={
          <>
            <FilterSummary hide={HIDE} />
            <SegmentedControl<Order>
              size="sm"
              aria-label={t('search.order')}
              value={order}
              onChange={setOrder}
              options={[
                { value: 'relevance', label: t('search.relevance') },
                { value: 'latest', label: t('search.newest') }
              ]}
            />
          </>
        }
      />
      <FilterBar hide={HIDE} count={results.length} />
      {results.length > 0 && <h2 className="sr-only">{t('search.resultsHeading')}</h2>}
      {results.length > 0 ? (
        <ArticleFeed
          articles={results}
          layout="list"
          highlight={terms}
          resetKey={`${resetKey}|${deferred}|${order}`}
          showProvince
          className="mt-10"
        />
      ) : (
        <EmptyState
          icon={SearchX}
          title={t('common:states.noResultsFor', { query: trimmed })}
          description={filtered ? t('search.noResultsFiltered') : t('search.noResultsBody')}
          action={
            filtered && (
              <Button variant="primary" onClick={() => useUi.getState().resetFilters()}>
                {t('filters.clearAll')}
              </Button>
            )
          }
        />
      )}
    </>
  )
}

/**
 * Search results for the title-bar query: Turkish-aware matching over headlines
 * and summaries, matches highlighted, with filters. Follows the `query` prop
 * as the user types (the page is not remounted per keystroke).
 */
export function SearchPage({ query }: { query: string }): React.JSX.Element {
  return (
    <Page>
      <NewsGate>
        <Results query={query} />
      </NewsGate>
    </Page>
  )
}
