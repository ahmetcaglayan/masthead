import { useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CategoryId } from '@shared/categories'
import type { Article } from '@shared/types'
import { Page } from '@/components/layout/Page'
import { ArticleCard } from '@/components/news/ArticleCard'
import { ArticleFeed } from '@/components/news/ArticleFeed'
import { FilterBar, FilterSummary } from '@/components/news/FilterBar'
import { NewsGate, NoMatches } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { useFilteredArticles } from '@/components/news/useFilteredArticles'
import { EmptyState } from '@/components/ui/EmptyState'
import { useNewsView } from '@/hooks/useArticles'
import { useNow } from '@/hooks/useNow'
import { CATEGORY_ICONS, categoryLabel } from '@/lib/categories'
import { storyFor, storyKey, topStories } from '@/lib/curation'
import { activeFilterCount } from '@/lib/filter'
import { storySources } from '@/lib/story'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'

const NONE: readonly Article[] = []

function Category({ id }: { id: CategoryId }): React.JSX.Element {
  const { t } = useTranslation('news')
  const country = useSettings((s) => s.settings.country)
  const view = useDeferredValue(useNewsView())
  // The five-minute re-rank happens in the background, like a refresh.
  const now = useDeferredValue(useNow(5 * 60_000))
  // With filters set, the list starts at the top: the lead block would ignore them.
  const filtering = useUi((s) => activeFilterCount(s.filters) > 0)

  const inCategory = view.byCategory.get(id) ?? NONE
  const leads = useMemo(() => topStories(inCategory, now, 4), [inCategory, now])
  // Coverage within the topic: a loosely attached report does not carry a big cluster's count.
  const inTopic = storySources(inCategory)
  const hero = useMemo(() => (leads[0] ? storyFor(leads[0], view) : undefined), [leads, view])
  const leadQueue = useMemo(() => leads.map((a) => a.id), [leads])
  const rest = useMemo(() => {
    if (filtering) return inCategory
    const shown = new Set(leads.map(storyKey))
    return inCategory.filter((a) => !shown.has(storyKey(a)))
  }, [inCategory, leads, filtering])
  const { articles, resetKey } = useFilteredArticles(rest)
  const Icon = CATEGORY_ICONS[id]
  const label = categoryLabel(t, id, country)
  const updatedAt = (article: Article): number | undefined =>
    article.clusterId ? view.clustersById.get(article.clusterId)?.updatedAt : undefined

  return (
    <>
      <PageHeader
        kicker={t('category.kicker')}
        icon={Icon}
        title={label}
        count={inCategory.length}
        showUpdated
        actions={<FilterSummary />}
      />
      {inCategory.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={t('category.emptyTitle', { topic: label })}
          description={t('category.emptyBody')}
        />
      ) : (
        <>
          {hero && !filtering && (
            <section
              aria-label={t('category.top', { topic: label })}
              className="mb-14 grid gap-x-10 gap-y-10 lg:grid-cols-3"
            >
              <ArticleCard
                article={hero.lead}
                variant="hero"
                related={hero.related}
                sourceCount={inTopic.get(storyKey(hero.lead))}
                updatedAt={hero.updatedAt}
                queue={leadQueue}
                priority
                breakingOnly
                className="lg:col-span-2"
              />
              {leads.length > 1 && (
                <ul className="flex flex-col divide-y divide-line">
                  {leads.slice(1).map((article) => (
                    <li key={article.id} className="py-5 first:pt-0 in-data-[density=compact]:py-4">
                      <ArticleCard
                        article={article}
                        variant="compact"
                        sourceCount={inTopic.get(storyKey(article))}
                        updatedAt={updatedAt(article)}
                        queue={leadQueue}
                        breakingOnly
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          <FilterBar count={articles.length} />
          {articles.length > 0 ? (
            <ArticleFeed
              articles={articles}
              resetKey={resetKey}
              breakingOnly
              showProvince
              className="mt-10"
            />
          ) : (
            <NoMatches />
          )}
        </>
      )}
    </>
  )
}

/** A topic front: the category's lead story and runners-up, then every story in it with filters. */
export function CategoryPage({ id }: { id: CategoryId }): React.JSX.Element {
  return (
    <Page>
      <NewsGate>
        <Category id={id} />
      </NewsGate>
    </Page>
  )
}
