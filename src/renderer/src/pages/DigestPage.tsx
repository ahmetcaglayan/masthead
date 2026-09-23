import { useDeferredValue, useMemo } from 'react'
import { ChevronDown, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/layout/Page'
import { ClusterCard } from '@/components/news/ClusterCard'
import { FeedSkeleton, NewsGate } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { usePaged } from '@/components/news/usePaged'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { EmptyState } from '@/components/ui/EmptyState'
import { useNewsView } from '@/hooks/useArticles'
import { useNow } from '@/hooks/useNow'
import { useProgressive } from '@/hooks/useProgressive'
import { useSources } from '@/hooks/useSources'
import { cn } from '@/lib/cn'
import { buildDigest, type DigestStory } from '@/lib/curation'
import { formatNumber } from '@/lib/format'

const PAGE_SIZE = 12
/** The biggest stories get the full card; the rest are denser rows, so the page scans quickly. */
const FULL_CARDS = 3

function StoryList({
  stories,
  rankFrom,
  fullCards = 0
}: {
  stories: readonly DigestStory[]
  rankFrom?: number
  /** How many of the first stories get the full card. */
  fullCards?: number
}): React.JSX.Element {
  return (
    <ol className="flex flex-col gap-6 in-data-[density=compact]:gap-5">
      {stories.map((story, i) => (
        <li key={story.id} className={cn(i > 0 && i === fullCards && 'mt-4')}>
          <ClusterCard
            story={story}
            variant={i < fullCards ? 'full' : 'list'}
            rank={rankFrom === undefined ? undefined : rankFrom + i}
          />
        </li>
      ))}
    </ol>
  )
}

function Digest(): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const view = useDeferredValue(useNewsView())
  // The five-minute re-rank happens in the background, like a refresh.
  const now = useDeferredValue(useNow(5 * 60_000))
  // Cached per snapshot, source selection and clock tick; each card compares its reports when shown.
  const stories = useMemo(() => buildDigest(view, now), [view, now])
  const { limit, hasMore, more, sentinelRef } = usePaged(stories.length, PAGE_SIZE)
  // A page of cards is heavy: the first few paint at once, the rest of the page follows.
  const rendered = useProgressive(Math.min(limit, stories.length), 4, 4)

  const visible = stories.slice(0, rendered)
  const shared = visible.filter((s) => s.sourceCount >= 2)
  const solo = visible.filter((s) => s.sourceCount < 2)
  const sharedTotal = useMemo(() => stories.filter((s) => s.sourceCount >= 2).length, [stories])
  const { isEnabled } = useSources()
  const sourceTotal = useMemo(
    () => new Set(stories.flatMap((s) => s.cluster.sourceIds).filter(isEnabled)).size,
    [stories, isEnabled]
  )

  return (
    <>
      <PageHeader
        kicker={t('digest.kicker')}
        title={t('digest.title')}
        icon={Layers}
        description={t('digest.description')}
        details={[
          t('digest.summary', {
            count: sharedTotal,
            formatted: formatNumber(sharedTotal, i18n.language),
            sources: sourceTotal
          })
        ]}
        showUpdated
      />
      {stories.length === 0 ? (
        <EmptyState icon={Layers} title={t('digest.emptyTitle')} description={t('digest.emptyBody')} />
      ) : (
        <div className="flex flex-col gap-12">
          {shared.length > 0 && (
            <section aria-labelledby="digest-shared">
              <h2 id="digest-shared" className="sr-only">
                {t('digest.sharedTitle')}
              </h2>
              <StoryList stories={shared} rankFrom={1} fullCards={FULL_CARDS} />
            </section>
          )}
          {solo.length > 0 && (
            <section aria-labelledby="digest-solo" className="flex flex-col gap-6">
              <h2 id="digest-solo" className="sr-only">
                {t('digest.soloTitle')}
              </h2>
              <div>
                <Divider label={t('digest.soloTitle')} />
                <p className="mt-2 text-center font-ui text-[13px] text-fg-subtle">{t('digest.soloBody')}</p>
              </div>
              <StoryList stories={solo} />
            </section>
          )}
          {hasMore && rendered >= limit && (
            <div ref={sentinelRef} className="flex justify-center">
              <Button variant="outline" iconRight={ChevronDown} onClick={more}>
                {t('digest.more')}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

/**
 * "Gündem Özeti": every current story as one card with what each outlet
 * headlined — the page for following the agenda without clicking. Stories
 * several sources covered come first, then notable single-source ones.
 */
export function DigestPage(): React.JSX.Element {
  return (
    <Page measure="6xl">
      <NewsGate skeleton={<FeedSkeleton count={3} />}>
        <Digest />
      </NewsGate>
    </Page>
  )
}
