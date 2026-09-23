import { useDeferredValue, useId, useMemo, useState } from 'react'
import { History, Search, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { META_CATEGORIES, TOPIC_CATEGORIES, type CategoryId } from '@shared/categories'
import type { Article } from '@shared/types'
import { Page } from '@/components/layout/Page'
import { goSearch } from '@/components/layout/search'
import { ArticleFeed } from '@/components/news/ArticleFeed'
import { NewsGate } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { Chip, ToggleChip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { Switch } from '@/components/ui/Switch'
import { useNewsView } from '@/hooks/useArticles'
import { useNow } from '@/hooks/useNow'
import { useSelectedProvince } from '@/hooks/useSources'
import { CATEGORY_ICONS, categoryLabel } from '@/lib/categories'
import { cn } from '@/lib/cn'
import { isBreakingNews } from '@/lib/headline'
import {
  EMPTY_PROFILE,
  MIN_READS,
  buildReadingProfile,
  rankForYou,
  type ForYouReason,
  type ReadingProfile
} from '@/lib/forYou'
import { useLibrary } from '@/stores/library'
import { useSettings } from '@/stores/settings'

/** Words from the reading history shown on the page. */
const TERMS_SHOWN = 10

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

/** What the reading history taught the feed, with the switch that turns it off. */
function HistoryPanel({
  profile,
  enabled
}: {
  profile: ReadingProfile
  enabled: boolean
}): React.JSX.Element {
  const { t } = useTranslation('news')
  const country = useSettings((s) => s.settings.country)
  const interests = useSettings((s) => s.settings.interests)
  const switchId = useId()
  const learned = profile.terms.length + profile.topics.size > 0
  // Topics already among the interests are listed just above.
  const topics = [...profile.topics]
    .filter(([id]) => !interests.includes(id))
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)

  let body: React.ReactNode
  if (!enabled) body = t('forYou.history.off')
  else if (profile.reads < MIN_READS)
    body = t('forYou.history.learning', { count: profile.reads, min: MIN_READS })
  else if (!learned) body = t('forYou.history.nothing')
  else body = t('forYou.history.body')

  return (
    <section
      aria-labelledby="history-title"
      className="mt-4 rounded-panel border border-line bg-canvas p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h2
          id="history-title"
          className="flex items-center gap-1.5 font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase"
        >
          <History size={13} strokeWidth={2} aria-hidden />
          {t('forYou.history.title')}
        </h2>
        <div className="flex items-center gap-2.5">
          <label htmlFor={switchId} className="font-ui text-[13px] text-fg-muted">
            {t('forYou.history.use')}
          </label>
          <Switch
            id={switchId}
            size="sm"
            checked={enabled}
            onCheckedChange={(on) =>
              void useSettings.getState().update({ personalization: { useHistory: on } })
            }
          />
        </div>
      </div>
      <p className="mt-2 font-ui text-[13px] leading-relaxed text-fg-muted text-pretty">{body}</p>
      {enabled && learned && (
        <ul aria-label={t('forYou.history.title')} className="mt-3 flex flex-wrap gap-2">
          {topics.map((id) => (
            <li key={id}>
              <Chip icon={CATEGORY_ICONS[id]} className="border-accent/30 text-fg">
                {categoryLabel(t, id, country)}
              </Chip>
            </li>
          ))}
          {profile.terms.slice(0, TERMS_SHOWN).map((term) => (
            <li key={term.word}>
              <Chip
                icon={Search}
                title={t('forYou.history.search', { word: term.word })}
                onClick={() => goSearch(term.word)}
              >
                {term.word}
              </Chip>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** The topic the card already shows above the headline: none under a breaking-news tag. */
const shownTopic = (article: Article): CategoryId | undefined =>
  isBreakingNews(article) ? undefined : article.categories.find((c) => !META_CATEGORIES.includes(c))

/** The note on a card saying why the story is in the feed. */
function useReasonNotes(
  articles: readonly Article[],
  reasons: ReadonlyMap<string, ForYouReason>
): ReadonlyMap<string, string> {
  const { t } = useTranslation('news')
  const country = useSettings((s) => s.settings.country)
  const regionId = useSettings((s) => s.settings.location.regionId)
  const province = useSelectedProvince()
  return useMemo(() => {
    const notes = new Map<string, string>()
    for (const article of articles) {
      const reason = reasons.get(article.id)
      if (!reason) continue
      const topic = (id: CategoryId, key: string): string =>
        shownTopic(article) === id
          ? t(`forYou.reason.${key}`)
          : t(`forYou.reason.${key}In`, { topic: categoryLabel(t, id, country) })
      switch (reason.kind) {
        case 'reads':
          notes.set(article.id, t('forYou.reason.reads', { word: reason.word }))
          break
        case 'local': {
          const place =
            reason.scope === 'province'
              ? province?.name
              : regionId
                ? t(`common:region.${regionId}`)
                : undefined
          if (place) notes.set(article.id, t('forYou.reason.local', { place }))
          break
        }
        case 'interest':
          notes.set(article.id, topic(reason.category, 'interest'))
          break
        case 'habit':
          notes.set(article.id, topic(reason.category, 'habit'))
          break
        case 'popular':
          notes.set(article.id, t('forYou.reason.popular'))
      }
    }
    return notes
  }, [articles, reasons, t, country, regionId, province])
}

function ForYou(): React.JSX.Element {
  const { t } = useTranslation('news')
  const interests = useSettings((s) => s.settings.interests)
  const location = useSettings((s) => s.settings.location)
  const historyOn = useSettings((s) => s.settings.personalization.useHistory)
  const province = useSelectedProvince()
  const { articles, clustersById } = useDeferredValue(useNewsView())
  // The five-minute re-rank happens in the background, like a refresh.
  const now = useDeferredValue(useNow(5 * 60_000))
  // Read stories sink to the end on the next visit, not under the reader's cursor; the
  // profile learns from them on the next visit too.
  const [readIds] = useState(() => useLibrary.getState().readIds)
  const [history] = useState(() => useLibrary.getState().library.history)

  const learned = useMemo(() => buildReadingProfile(history, articles, now), [history, articles, now])
  const profile = historyOn ? learned : EMPTY_PROFILE
  const feed = useMemo(
    () => rankForYou(articles, { interests, location }, { now, readIds, clustersById, profile }),
    [articles, interests, location, now, readIds, clustersById, profile]
  )
  const notes = useReasonNotes(feed.articles, feed.reasons)
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
        count={feed.articles.length}
        showUpdated
      />
      <InterestPicker prominent={prominent} />
      <HistoryPanel profile={learned} enabled={historyOn} />
      {feed.articles.length > 0 ? (
        <ArticleFeed articles={feed.articles} notes={notes} showProvince className="mt-12" />
      ) : (
        !prominent && (
          <EmptyState icon={Sparkles} title={t('forYou.emptyTitle')} description={t('forYou.emptyBody')} />
        )
      )}
    </>
  )
}

/**
 * "Size Özel": stories picked by the user's interests, location and reading history, each
 * with a note saying why, and the interests editable in place.
 */
export function ForYouPage(): React.JSX.Element {
  return (
    <Page>
      <NewsGate>
        <ForYou />
      </NewsGate>
    </Page>
  )
}
