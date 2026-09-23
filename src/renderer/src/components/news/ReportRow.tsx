import type { Article } from '@shared/types'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useSource } from '@/hooks/useSources'
import { cn } from '@/lib/cn'
import { tameCaps } from '@/lib/format'
import { openArticle } from './actions'
import { RelativeTime } from './ArticleMeta'

export interface ReportRowProps {
  article: Article
  /** List the row belongs to, for next/previous in the reader. */
  queue?: readonly string[]
  className?: string
}

/** One outlet's report of a story: logo, source name, time and its full headline; opens the article. */
export function ReportRow({ article, queue, className }: ReportRowProps): React.JSX.Element {
  const source = useSource(article.sourceId)
  return (
    <button
      type="button"
      onClick={() => openArticle(article, queue)}
      className={cn('group/report relative z-10 flex w-full gap-3 rounded-lg py-3 text-left', className)}
    >
      <SourceLogo source={source} size="sm" className="mt-0.5" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-1.5 font-ui text-[12px] text-fg-muted">
          <span className="font-semibold text-fg">{source?.name ?? article.sourceId}</span>
          <span aria-hidden className="text-fg-subtle">
            ·
          </span>
          <RelativeTime ts={article.publishedAt} />
        </span>
        <span
          lang={source?.language ?? 'tr'}
          className="headline mt-0.5 block text-[15.5px] leading-snug text-pretty text-fg decoration-line-strong underline-offset-4 group-hover/report:underline"
        >
          {tameCaps(article.title)}
        </span>
      </span>
    </button>
  )
}
