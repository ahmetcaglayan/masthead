import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WatchItem } from '@shared/markets'
import type { Article } from '@shared/types'
import { openArticle } from '@/components/news/actions'
import { Button } from '@/components/ui/Button'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useSource } from '@/hooks/useSources'
import { cn } from '@/lib/cn'
import { tameCaps } from '@/lib/format'
import { clock, dayLabel, startOfDay } from '@/lib/time'
import { useAssetName } from './hooks'

const PAGE = 50

/** "14:05", or "Yesterday 14:05" for another day. */
function when(ts: number, lang: string, now: number): string {
  return startOfDay(ts) === startOfDay(now)
    ? clock(ts, lang)
    : `${dayLabel(ts, lang, now)} ${clock(ts, lang)}`
}

interface RowProps {
  article: Article
  /** The watched items the story is about. */
  tags: readonly WatchItem[]
  fresh: boolean
  queue: readonly string[]
  now: number
}

function Row({ article, tags, fresh, queue, now }: RowProps): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const source = useSource(article.sourceId)
  const name = useAssetName()
  return (
    <li
      data-article-id={article.id}
      className={cn(
        '-mx-3 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 rounded-lg border-t border-line px-3 py-3 first:border-t-0',
        fresh && 'animate-arrive'
      )}
    >
      <time
        dateTime={new Date(article.publishedAt).toISOString()}
        className="pt-0.5 font-ui text-[12.5px] leading-snug text-fg-subtle tabular-nums"
      >
        {when(article.publishedAt, i18n.language, now)}
      </time>
      <div className="min-w-0">
        <button
          type="button"
          lang={source?.language}
          onClick={() => openArticle(article, queue)}
          className="headline text-left text-[1.05rem] leading-snug font-semibold text-pretty text-fg decoration-line-strong underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {tameCaps(article.title)}
        </button>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[12px] text-fg-muted">
          <SourceLogo source={source} size="xs" />
          <span>{source?.name ?? article.sourceId}</span>
          {fresh && (
            <span className="rounded-[4px] bg-accent-soft px-1.5 text-[11px] font-semibold text-accent">
              {t('markets.new')}
            </span>
          )}
          {tags.map((item) => (
            <span key={item.id} className="rounded-full border border-line px-2 text-[11px] text-fg-muted">
              {name(item)}
            </span>
          ))}
        </div>
      </div>
    </li>
  )
}

export interface MarketsNewsListProps {
  articles: readonly Article[]
  tags: ReadonlyMap<string, string[]>
  items: readonly WatchItem[]
  now: number
  /** Reset the "show more" count when the list changes to another item. */
  listKey: string
}

/**
 * The markets news as a wire, newest first. Stories that come in while the page is open
 * slide in at the top with a "New" tag; the page does not jump (the browser keeps what is
 * on screen in place when rows are added above it).
 */
export function MarketsNewsList({
  articles,
  tags,
  items,
  now,
  listKey
}: MarketsNewsListProps): React.JSX.Element {
  const { t } = useTranslation('news')
  const [shown, setShown] = useState({ key: listKey, count: PAGE })
  const count = shown.key === listKey ? shown.count : PAGE
  // Everything on the list when the page opened; later arrivals are "new".
  const [seen, setSeen] = useState<ReadonlySet<string> | null>(null)
  if (seen === null && articles.length > 0) setSeen(new Set(articles.map((a) => a.id)))

  const visible = useMemo(() => articles.slice(0, count), [articles, count])
  const queue = useMemo(() => visible.map((a) => a.id), [visible])
  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])

  if (articles.length === 0) {
    return <p className="py-6 font-ui text-[13.5px] text-fg-muted">{t('markets.emptyNews')}</p>
  }
  return (
    <>
      <ol>
        {visible.map((article) => (
          <Row
            key={article.id}
            article={article}
            tags={(tags.get(article.id) ?? []).flatMap((id) => itemsById.get(id) ?? [])}
            fresh={seen !== null && !seen.has(article.id)}
            queue={queue}
            now={now}
          />
        ))}
      </ol>
      {articles.length > count && (
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => setShown({ key: listKey, count: count + PAGE })}
        >
          {t('markets.more')}
        </Button>
      )}
    </>
  )
}
