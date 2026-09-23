import { Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/layout/Page'
import { ArticleFeed } from '@/components/news/ArticleFeed'
import { FilterBar, FilterSummary } from '@/components/news/FilterBar'
import { NewsGate, NoMatches } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { useFilteredArticles } from '@/components/news/useFilteredArticles'
import { useArticles } from '@/hooks/useArticles'

function Latest(): React.JSX.Element {
  const { t } = useTranslation('news')
  const all = useArticles()
  const { articles, filters, resetKey } = useFilteredArticles(all)
  const chronological = filters.sort === 'latest'

  return (
    <>
      <PageHeader
        kicker={t('latest.kicker')}
        icon={Clock3}
        title={t('latest.title')}
        description={t('latest.description')}
        count={all.length}
        showUpdated
        actions={<FilterSummary />}
      />
      <FilterBar count={articles.length} />
      {articles.length > 0 ? (
        <ArticleFeed
          articles={articles}
          layout={chronological ? 'timeline' : undefined}
          groupBy={chronological ? 'hour' : 'none'}
          resetKey={resetKey}
          showProvince
          className="mt-6"
        />
      ) : (
        <NoMatches />
      )}
    </>
  )
}

/**
 * "Son Haberler": every story from the enabled sources as a minute-by-minute
 * timeline (clock times beside a rail, sticky hour rules), with filters.
 */
export function LatestPage(): React.JSX.Element {
  return (
    <Page>
      <NewsGate>
        <Latest />
      </NewsGate>
    </Page>
  )
}
