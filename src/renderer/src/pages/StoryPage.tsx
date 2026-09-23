import { useMemo, useState } from 'react'
import { Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getSource } from '@shared/countries'
import { muteMatcherFor } from '@shared/mute'
import type { SourceKind } from '@shared/types'
import { Page } from '@/components/layout/Page'
import { openArticle } from '@/components/news/actions'
import { ArticleCard } from '@/components/news/ArticleCard'
import { ExpandableSummary } from '@/components/news/ExpandableSummary'
import { NewsGate } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useNow } from '@/hooks/useNow'
import { useSource, useSources } from '@/hooks/useSources'
import { tameCaps } from '@/lib/format'
import { buildStoryView, type StoryReport } from '@/lib/storyView'
import { clock, dayLabel, relativeTime, startOfDay } from '@/lib/time'
import { useNews } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'

type Order = 'first' | 'latest'

/** "14:05", or "Yesterday 14:05" for another day. */
function when(ts: number, lang: string, now: number): string {
  return startOfDay(ts) === startOfDay(now)
    ? clock(ts, lang)
    : `${dayLabel(ts, lang, now)} ${clock(ts, lang)}`
}

/** One outlet's report: who, what kind of outlet, when it first reported, its headline and summary. */
function ReportItem({
  report,
  first,
  queue,
  now
}: {
  report: StoryReport
  first: boolean
  queue: readonly string[]
  now: number
}): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const { article } = report
  const source = useSource(article.sourceId)
  return (
    <li data-article-id={article.id} className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[12.5px] text-fg-muted">
        <SourceLogo source={source} size="sm" />
        <span className="font-semibold text-fg">{source?.name ?? article.sourceId}</span>
        {source && (
          <>
            <span aria-hidden className="text-fg-subtle">
              ·
            </span>
            <span>{t(`common:sourceKind.${source.kind}`)}</span>
          </>
        )}
        <span aria-hidden className="text-fg-subtle">
          ·
        </span>
        <time dateTime={new Date(report.firstAt).toISOString()} className="tabular-nums">
          {when(report.firstAt, i18n.language, now)}
        </time>
        {first && (
          <Badge variant="accent" className="ml-0.5">
            {t('story.first')}
          </Badge>
        )}
      </div>
      <h3 className="mt-2">
        <button
          type="button"
          lang={source?.language}
          onClick={() => openArticle(article, queue)}
          className="headline text-left text-xl leading-snug font-semibold text-pretty text-fg decoration-line-strong underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {tameCaps(article.title)}
        </button>
      </h3>
      {article.summary && (
        <ExpandableSummary article={article} maxSentences={2} queue={queue} className="mt-2" />
      )}
    </li>
  )
}

/** Who covered the story, by kind of outlet (public broadcasters, agencies, mainstream…). */
function CoverageCard({ reports }: { reports: readonly StoryReport[] }): React.JSX.Element {
  const { t } = useTranslation('news')
  const country = useSettings((s) => s.settings.country)
  const kinds = useMemo(() => {
    const counts = new Map<SourceKind, number>()
    for (const { article } of reports) {
      const kind = getSource(country, article.sourceId)?.kind
      if (kind) counts.set(kind, (counts.get(kind) ?? 0) + 1)
    }
    return [...counts].sort((a, b) => b[1] - a[1])
  }, [reports, country])

  return (
    <section
      aria-labelledby="story-coverage"
      className="rounded-panel border border-line bg-surface p-5 shadow-soft lg:sticky lg:top-6"
    >
      <h2
        id="story-coverage"
        className="font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase"
      >
        {t('story.coverage')}
      </h2>
      <ul className="mt-3 flex flex-col gap-1.5 font-ui text-[13.5px]">
        {kinds.map(([kind, count]) => (
          <li key={kind} className="flex items-center justify-between gap-3">
            <span className="text-fg">{t(`common:sourceKind.${kind}`)}</span>
            <span className="text-fg-muted tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
      <ul aria-label={t('story.outlets')} className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-4">
        {reports.map(({ article }) => {
          const source = getSource(country, article.sourceId)
          return (
            <li key={article.sourceId} title={source?.name}>
              <SourceLogo source={source} size="sm" />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Story({ id }: { id: string }): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const cluster = useNews((s) => s.clustersById.get(id))
  const byId = useNews((s) => s.byId)
  const { isEnabled } = useSources()
  const isMuted = muteMatcherFor(useSettings((s) => s.settings.muted.keywords))
  const now = useNow(60_000)
  const [order, setOrder] = useState<Order>('first')

  const story = useMemo(
    () =>
      cluster ? buildStoryView(cluster, byId, (a) => isEnabled(a.sourceId) && !isMuted?.(a), now) : null,
    [cluster, byId, isEnabled, isMuted, now]
  )
  const reports = useMemo(() => {
    if (!story) return []
    return order === 'first'
      ? story.reports
      : [...story.reports].sort((a, b) => b.article.publishedAt - a.article.publishedAt)
  }, [story, order])
  const queue = useMemo(() => reports.map((r) => r.article.id), [reports])

  if (!story) {
    return (
      <EmptyState
        icon={Layers}
        title={t('story.goneTitle')}
        description={t('story.goneBody')}
        action={
          <Button variant="outline" onClick={() => useUi.getState().navigate({ name: 'digest' })}>
            {t('story.toDigest')}
          </Button>
        }
      />
    )
  }

  const firstSource = story.reports[0].article.sourceId
  return (
    <>
      <PageHeader
        kicker={t('story.kicker')}
        icon={Layers}
        title={tameCaps(story.lead.title)}
        description={t('story.description', {
          count: story.reports.length,
          first: when(story.firstAt, i18n.language, now)
        })}
        details={[t('story.updated', { time: relativeTime(story.updatedAt, i18n.language, now) })]}
      />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
        <div className="min-w-0">
          <ArticleCard
            article={story.lead}
            variant="feature"
            queue={queue}
            // The count is in the header; a badge here would only link to this page again.
            sourceCount={1}
            updatedAt={story.updatedAt}
            maxChars={0}
            priority
          />
          <section aria-labelledby="story-reports" className="mt-14">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 id="story-reports" className="headline text-2xl font-semibold text-fg">
                {t('story.reports', { count: story.reports.length })}
              </h2>
              <SegmentedControl<Order>
                size="sm"
                aria-label={t('story.order')}
                value={order}
                onChange={setOrder}
                options={[
                  { value: 'first', label: t('story.orderFirst') },
                  { value: 'latest', label: t('story.orderLatest') }
                ]}
              />
            </div>
            <ol>
              {reports.map((report) => (
                <ReportItem
                  key={report.article.sourceId}
                  report={report}
                  first={report.article.sourceId === firstSource && story.reports.length > 1}
                  queue={queue}
                  now={now}
                />
              ))}
            </ol>
          </section>
        </div>
        <aside className="min-w-0">
          <CoverageCard reports={story.reports} />
        </aside>
      </div>
    </>
  )
}

/**
 * One story, every outlet: the lead report in full, then how each outlet that carried it
 * reported it — who was first, what they headlined — with the kinds of outlets that
 * covered it on the side.
 */
export function StoryPage({ id }: { id: string }): React.JSX.Element {
  return (
    <Page measure="6xl">
      <NewsGate>
        <Story id={id} />
      </NewsGate>
    </Page>
  )
}
