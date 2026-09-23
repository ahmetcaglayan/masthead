import { useDeferredValue, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TOPIC_CATEGORIES, type CategoryId } from '@shared/categories'
import { Page } from '@/components/layout/Page'
import { ArticleFeed } from '@/components/news/ArticleFeed'
import { NewsGate } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { ToggleChip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { useNewsView } from '@/hooks/useArticles'
import { useNow } from '@/hooks/useNow'
import { useSelectedProvince } from '@/hooks/useSources'
import { CATEGORY_ICONS, categoryLabel } from '@/lib/categories'
import { rankForYou } from '@/lib/curation'
import { cn } from '@/lib/cn'
import { useLibrary } from '@/stores/library'
import { useSettings } from '@/stores/settings'

function toggleInterest(interests: readonly CategoryId[], id: CategoryId, on: boolean): void {
  const next = on ? [...interests, id] : interests.filter((c) => c !== id)
  void useSettings.getState().update({ interests: next })
}

/** Every topic as a chip; selected ones are the user's interests (in the order they were picked). */
function InterestPicker({ prominent }: { prominent: boolean }): React.JSX.Element {
  const { t } = useTranslation('news')
  const interests = useSettings((s) => s.settings.interests)
  const country = useSettings((s) => s.settings.country)
  return (
    <section
      aria-labelledby="interests-title"
      className={cn(
        'rounded-panel border border-line',
        prominent ? 'bg-surface p-6 shadow-soft sm:p-8' : 'bg-canvas p-4 sm:p-5'
      )}
    >
      <h2
        id="interests-title"
        className={cn(
          prominent
            ? 'headline text-2xl font-semibold text-fg'
            : 'font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase'
        )}
      >
        {prominent ? t('forYou.pickTitle') : t('forYou.interests')}
      </h2>
      {prominent && <p className="mt-1.5 text-[15px] text-fg-muted">{t('forYou.pickBody')}</p>}
      <div className={cn('flex flex-wrap gap-2', prominent ? 'mt-5' : 'mt-3')}>
        {TOPIC_CATEGORIES.map((id) => (
          <ToggleChip
            key={id}
            size={prominent ? 'md' : 'sm'}
            icon={CATEGORY_ICONS[id]}
            showCheck
            selected={interests.includes(id)}
            onSelectedChange={(on) => toggleInterest(interests, id, on)}
          >
            {categoryLabel(t, id, country)}
          </ToggleChip>
        ))}
      </div>
    </section>
  )
}

function ForYou(): React.JSX.Element {
  const { t } = useTranslation('news')
  const interests = useSettings((s) => s.settings.interests)
  const location = useSettings((s) => s.settings.location)
  const province = useSelectedProvince()
  const { articles, clustersById } = useDeferredValue(useNewsView())
  // The five-minute re-rank happens in the background, like a refresh.
  const now = useDeferredValue(useNow(5 * 60_000))
  // Read stories sink to the end on the next visit, not under the reader's cursor.
  const [readIds] = useState(() => useLibrary.getState().readIds)

  const ranked = useMemo(
    () => rankForYou(articles, { interests, location }, { now, readIds, clustersById }),
    [articles, interests, location, now, readIds, clustersById]
  )
  const prominent = interests.length === 0

  return (
    <>
      <PageHeader
        kicker={t('forYou.kicker')}
        icon={Sparkles}
        title={t('forYou.title')}
        description={
          province ? t('forYou.descriptionWithCity', { city: province.name }) : t('forYou.description')
        }
        count={ranked.length}
        showUpdated
      />
      <InterestPicker prominent={prominent} />
      {ranked.length > 0 ? (
        <ArticleFeed articles={ranked} showProvince className="mt-12" />
      ) : (
        !prominent && (
          <EmptyState icon={Sparkles} title={t('forYou.emptyTitle')} description={t('forYou.emptyBody')} />
        )
      )}
    </>
  )
}

/** "Size Özel": stories picked by the user's interests and location, with interests editable in place. */
export function ForYouPage(): React.JSX.Element {
  return (
    <Page>
      <NewsGate>
        <ForYou />
      </NewsGate>
    </Page>
  )
}
