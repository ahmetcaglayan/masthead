import { memo, useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CategoryId } from '@shared/categories'
import type { Article } from '@shared/types'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CATEGORY_ICONS, categoryLabel } from '@/lib/categories'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'
import { ArticleCard } from './ArticleCard'

export interface CategorySectionProps {
  category: CategoryId
  /** 3–7 stories; the first is featured. */
  articles: readonly Article[]
  className?: string
}

/**
 * A topic block of the front page: serif section head with "See all", a
 * featured story beside a column of compact ones, and a row of cards below.
 */
export const CategorySection = memo(function CategorySection({
  category,
  articles,
  className
}: CategorySectionProps): React.JSX.Element {
  const { t } = useTranslation('news')
  const country = useSettings((s) => s.settings.country)
  const queue = useMemo(() => articles.map((a) => a.id), [articles])
  const [lead, ...rest] = articles
  // Up to four stories fit beside the lead; beyond that three go beside it and the rest below.
  const side = rest.length <= 4 ? rest : rest.slice(0, 3)
  const below = rest.length <= 4 ? [] : rest.slice(3)
  const headingId = `section-${category}`

  return (
    <section aria-labelledby={headingId} className={className}>
      <SectionHeader
        id={headingId}
        title={categoryLabel(t, category, country)}
        icon={CATEGORY_ICONS[category]}
        action={
          <Button
            variant="ghost"
            size="sm"
            iconRight={ArrowRight}
            onClick={() => useUi.getState().navigate({ name: 'category', id: category })}
          >
            {t('common:actions.seeAll')}
          </Button>
        }
      />
      {lead && (
        <div className="mt-6 grid gap-x-8 gap-y-8 lg:grid-cols-12 in-data-[density=compact]:mt-4 in-data-[density=compact]:gap-y-6">
          <ArticleCard
            article={lead}
            variant="feature"
            queue={queue}
            breakingOnly
            className={side.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}
          />
          {side.length > 0 && (
            <ul className="flex flex-col divide-y divide-line lg:col-span-5">
              {side.map((article) => (
                <li key={article.id} className="py-4 first:pt-0 last:pb-0 in-data-[density=compact]:py-3">
                  <ArticleCard article={article} variant="compact" queue={queue} breakingOnly />
                </li>
              ))}
            </ul>
          )}
          {below.length > 0 && (
            <div
              className={cn(
                'grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-12',
                below.length === 3 && 'lg:grid-cols-3'
              )}
            >
              {below.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="standard"
                  queue={queue}
                  breakingOnly
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
})
