import { useDeferredValue } from 'react'
import { Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/layout/Page'
import { ArticleFeed } from '@/components/news/ArticleFeed'
import { NewsGate } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useNewsView } from '@/hooks/useArticles'
import { useNowSelect } from '@/hooks/useNow'
import { formatNumber } from '@/lib/format'

const RECENT = 2 * 60 * 60 * 1000

function Breaking(): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const { breaking } = useDeferredValue(useNewsView())
  // Newest first, so counting stops at the first older story; re-renders only when the count changes.
  const recent = useNowSelect(60_000, (now) => {
    let n = 0
    while (n < breaking.length && now - breaking[n].publishedAt <= RECENT) n++
    return n
  })
  const details = [
    ...(recent > 0 ? [t('breaking.recent', { count: recent })] : []),
    t('breaking.total', { count: breaking.length, formatted: formatNumber(breaking.length, i18n.language) })
  ]

  return (
    <>
      <PageHeader
        kicker={
          <>
            <span aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-breaking" />
            {t('breaking.live')}
          </>
        }
        kickerTone="breaking"
        icon={Zap}
        title={t('breaking.title')}
        description={t('breaking.description')}
        details={details}
        showUpdated
      />
      {breaking.length > 0 ? (
        // Every story here is breaking: the kicker names the topic instead.
        <ArticleFeed
          articles={breaking}
          layout="timeline"
          groupBy="hour"
          tone="breaking"
          hideBreaking
          showProvince
          className="mt-6"
        />
      ) : (
        <EmptyState icon={Zap} title={t('breaking.emptyTitle')} description={t('breaking.emptyBody')} />
      )}
    </>
  )
}

/** "Son Dakika": the breaking-news streams of every enabled source as a timeline, newest first, by hour. */
export function BreakingPage(): React.JSX.Element {
  return (
    <Page>
      <NewsGate>
        <Breaking />
      </NewsGate>
    </Page>
  )
}
