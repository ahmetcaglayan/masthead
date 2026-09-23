import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, BookOpenText, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Article, ArticleDetail } from '@shared/types'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { paragraphs } from '@/lib/format'
import { foldText } from '@/lib/search'
import { cn } from '@/lib/cn'
import { useNews } from '@/stores/news'
import { openArticle } from './actions'
import { HighlightText } from './HighlightText'
import { leadSentences } from './utils'

export type SummarySize = 'sm' | 'md' | 'lg' | 'xl'

const TEXT: Record<SummarySize, string> = {
  sm: 'text-[13.5px] leading-relaxed',
  md: 'text-[15px] leading-relaxed',
  lg: 'text-base leading-[1.7]',
  xl: 'font-reading text-[17px] leading-[1.7] in-data-[density=compact]:text-base'
}

/** Inline text button, layered above the card's click target. */
const LINK =
  'relative z-10 inline-flex items-center gap-1 rounded-md font-ui text-[13px] font-semibold text-accent transition-colors duration-150 hover:text-accent-hover'

/** Feed-body paragraphs that add to the summary (the body usually repeats it first). */
function extraParagraphs(body: readonly string[], summary: string): string[] {
  const known = foldText(summary).replace(/[\s.…]+$/, '')
  const opening = known.slice(0, 120)
  return body.filter((p) => {
    const f = foldText(p).replace(/[\s.…]+$/, '')
    return f.length > 0 && !known.includes(f) && !(opening.length >= 40 && f.startsWith(opening))
  })
}

function DetailImage({ src }: { src: string }): React.JSX.Element | null {
  const [broken, setBroken] = useState(false)
  if (broken) return null
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setBroken(true)}
      className="max-h-[28rem] w-full rounded-card bg-muted object-cover"
    />
  )
}

type Detail = { status: 'idle' | 'loading' | 'missing' } | { status: 'ready'; detail: ArticleDetail }

export interface ExpandableSummaryProps {
  article: Article
  /** Clamp to this many lines until "Full summary" is pressed (the tight grid card style only). */
  clamp?: number
  /**
   * Show at most this many sentences until "Full summary" is pressed, cut at a
   * sentence end and never mid-word (narrow columns with long summaries).
   */
  maxSentences?: number
  size?: SummarySize
  /** Folded search terms to highlight. */
  highlight?: readonly string[]
  /** Offer the feed's full text inline when it shipped one. Default true. */
  allowDetail?: boolean
  /** List the article belongs to, for next/previous in the reader. */
  queue?: readonly string[]
  className?: string
}

/**
 * The article's full summary, paragraph by paragraph. The grid card style can
 * clamp it to a few lines, narrow columns can cut it after a few sentences;
 * either way an inline "Full summary" unfolds it in place. When the feed
 * carried a longer body, "Read the rest of the story here" loads it and
 * unfolds the extra paragraphs in place, ending with a button to open the full
 * article.
 */
export function ExpandableSummary({
  article,
  clamp,
  maxSentences,
  size = 'md',
  highlight,
  allowDetail = true,
  queue,
  className
}: ExpandableSummaryProps): React.JSX.Element | null {
  const { t } = useTranslation()
  const paras = useMemo(() => paragraphs(article.summary), [article.summary])
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const [detail, setDetail] = useState<Detail>({ status: 'idle' })
  const [detailOpen, setDetailOpen] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)
  const clamped = clamp !== undefined && !expanded
  const preview = useMemo(
    () => (maxSentences === undefined ? null : leadSentences(paras, maxSentences)),
    [paras, maxSentences]
  )
  const shortened = preview !== null && preview.cut && !expanded
  const shown = shortened ? preview.paragraphs : paras
  const trimmable = clamp !== undefined || (preview?.cut ?? false)

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el || !clamped) return
    const measure = (): void => setOverflowing(el.scrollHeight > el.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [clamped, paras])

  const extra = useMemo(
    () => (detail.status === 'ready' ? extraParagraphs(detail.detail.paragraphs, article.summary) : []),
    [detail, article.summary]
  )
  const image =
    detail.status === 'ready' ? detail.detail.images.find((src) => src !== article.image) : undefined

  const loadDetail = async (): Promise<void> => {
    setExpanded(true)
    if (detail.status === 'ready') {
      setDetailOpen(true)
      return
    }
    setDetail({ status: 'loading' })
    const result = await useNews.getState().detail(article.id)
    const more = result ? extraParagraphs(result.paragraphs, article.summary) : []
    if (result && more.length > 0) {
      setDetail({ status: 'ready', detail: result })
      setDetailOpen(true)
    } else {
      setDetail({ status: 'missing' })
    }
  }

  const canContinue = allowDetail && article.hasDetail && !detailOpen && detail.status !== 'missing'
  const showReadMore = (clamped && overflowing) || shortened
  const showLess = trimmable && expanded && !detailOpen
  if (paras.length === 0 && !canContinue) return null

  return (
    <div className={cn('font-ui text-fg-muted', className)}>
      {paras.length > 0 &&
        (clamped ? (
          <div
            ref={textRef}
            lang="tr"
            className={cn(TEXT[size], 'text-pretty')}
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: clamp,
              overflow: 'hidden'
            }}
          >
            <HighlightText text={paras.join(' ')} terms={highlight} strong />
          </div>
        ) : (
          <div lang="tr" className={cn(TEXT[size], 'space-y-3 in-data-[density=compact]:space-y-2')}>
            {shown.map((p, i) => (
              <p key={i} className="text-pretty">
                <HighlightText text={p} terms={highlight} strong />
              </p>
            ))}
          </div>
        ))}

      {(showReadMore || showLess || canContinue) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {showReadMore && (
            <button type="button" className={LINK} onClick={() => setExpanded(true)}>
              {t('common:actions.readMore')}
              <ChevronDown size={15} strokeWidth={2} aria-hidden />
            </button>
          )}
          {showLess && (
            <button type="button" className={LINK} onClick={() => setExpanded(false)}>
              {t('common:actions.showLess')}
              <ChevronUp size={15} strokeWidth={2} aria-hidden />
            </button>
          )}
          {canContinue && (
            <button
              type="button"
              className={LINK}
              disabled={detail.status === 'loading'}
              aria-busy={detail.status === 'loading' || undefined}
              onClick={() => void loadDetail()}
            >
              {detail.status === 'loading' ? (
                <Spinner size={14} label={null} />
              ) : (
                <BookOpenText size={15} strokeWidth={1.75} aria-hidden />
              )}
              {detail.status === 'loading' ? t('news:summary.loading') : t('news:summary.continueHere')}
            </button>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {detailOpen && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              lang="tr"
              className="mt-4 space-y-4 border-l-2 border-accent-soft pl-4 font-reading text-[16px] leading-[1.75] text-fg"
            >
              {extra.map((p, i) => (
                <p key={i} className="text-pretty">
                  <HighlightText text={p} terms={highlight} strong />
                </p>
              ))}
              {image && <DetailImage src={image} />}
            </div>
            <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                icon={ArrowUpRight}
                onClick={() => openArticle(article, queue)}
              >
                {t('news:summary.openFull')}
              </Button>
              <Button size="sm" variant="ghost" icon={ChevronUp} onClick={() => setDetailOpen(false)}>
                {t('common:actions.showLess')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {detail.status === 'missing' && (
        <p className="mt-2 font-ui text-[12.5px] text-fg-subtle">{t('news:summary.noDetail')}</p>
      )}
    </div>
  )
}
