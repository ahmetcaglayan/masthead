import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, CircleAlert, Globe, Info, LockKeyhole, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Article, SourceDef } from '@shared/types'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useNow } from '@/hooks/useNow'
import { foldText } from '@/lib/fold'
import { domain, paragraphs, tameCaps, upperContent } from '@/lib/format'
import { fullDate, relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useArticleDetail, type ExtractionState } from './content'
import { useReaderPrefs } from './prefs'
import { prepareArticle } from './sanitize'
import './reader.css'

export interface ReaderPaneProps {
  article: Article
  source?: SourceDef
  extraction: ExtractionState
  onRetry(): void
  /** Show the publisher's page in Web mode; undefined when that is not possible here (the original opens instead). */
  onShowWeb?: () => void
  onOpenOriginal(): void
  /** A link in the article was followed; `external` for modifier or middle clicks. */
  onLink(url: string, external: boolean): void
  /** Web host only: the page can't be framed, so Reader mode was chosen automatically. */
  blockedNotice?: boolean
  /** The scrolling element, focused when the dialog opens so the keyboard scrolls the article. */
  scrollRef?: React.Ref<HTMLDivElement>
}

const compact = (text: string): string =>
  foldText(text)
    .replace(/^www\./, '')
    .replace(/\s+/g, '')

/** A byline that only repeats the outlet ("Cnnturk.com" under CNN TÜRK) is extraction noise. */
function isSourceByline(byline: string, sourceName: string, url: string): boolean {
  const byl = compact(byline)
  const site = compact(domain(url))
  const name = compact(sourceName)
  return byl === site || (byl.length >= 3 && site.startsWith(byl)) || (name.length > 0 && byl.includes(name))
}

/** Reader mode: the extracted article, typeset for reading, or the feed's text when extraction fails. */
export function ReaderPane({
  article,
  source,
  extraction,
  onRetry,
  onShowWeb,
  onOpenOriginal,
  onLink,
  blockedNotice = false,
  scrollRef
}: ReaderPaneProps): React.JSX.Element {
  const { t, i18n } = useTranslation('reader')
  const now = useNow(30_000)
  const scale = useReaderPrefs((s) => s.scale)
  const typeface = useReaderPrefs((s) => s.typeface)
  const ready = extraction.status === 'ready' ? extraction.content : undefined
  // Kept for subscribers: no text of the page, only the feed's own summary and the way there.
  const paywalled = ready?.paywalled === true
  const content = paywalled ? undefined : ready
  // The gist on the first screen: the feed summary's opening paragraph, unless it only repeats the headline.
  const lede = useMemo(() => {
    const first = paragraphs(article.summary)[0] ?? ''
    return first && foldText(first) !== foldText(article.title) ? first : ''
  }, [article.summary, article.title])
  const prepared = useMemo(
    () => (content ? prepareArticle(content, article.image, lede || undefined) : undefined),
    [content, article.image, lede]
  )
  const fallback = extraction.status === 'failed' || paywalled
  const standfirst = !fallback && (!prepared || prepared.standfirst) ? lede : ''
  const lang = source?.language ?? 'tr'
  const sourceName = source?.name ?? content?.siteName ?? domain(article.url)
  const rawByline = content?.byline ?? article.author
  const byline = rawByline && !isSourceByline(rawByline, sourceName, article.url) ? rawByline : undefined
  // The feed picture stands in while extracting; the same element stays if the article keeps it.
  const lead = prepared ? prepared.lead : article.image

  const onClick = (event: React.MouseEvent): void => {
    const anchor = (event.target as Element).closest('a[href]')
    if (!anchor) return
    event.preventDefault()
    onLink(anchor.getAttribute('href') ?? '', event.ctrlKey || event.metaKey || event.shiftKey)
  }
  const onAuxClick = (event: React.MouseEvent): void => {
    const anchor = (event.target as Element).closest('a[href]')
    if (!anchor || event.button !== 1) return
    event.preventDefault()
    onLink(anchor.getAttribute('href') ?? '', true)
  }

  return (
    <div ref={scrollRef} tabIndex={-1} className="absolute inset-0 overflow-y-auto outline-none">
      {blockedNotice && <BlockedNotice onOpenOriginal={onOpenOriginal} />}
      <article
        className={cn(
          'mx-auto w-full max-w-[70ch] px-8 pt-12 pb-20 in-data-[density=compact]:pt-9',
          typeface === 'ui' ? 'font-ui' : 'font-reading'
        )}
        style={{ fontSize: `${1.125 * scale}rem` }}
      >
        <header>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[11px] font-semibold tracking-wider text-fg-subtle">
            <span className="text-accent-ink">{upperContent(sourceName)}</span>
            <span aria-hidden>·</span>
            <time
              className="uppercase"
              dateTime={new Date(article.publishedAt).toISOString()}
              title={fullDate(article.publishedAt, i18n.language)}
            >
              {relativeTime(article.publishedAt, i18n.language, now)}
            </time>
            {prepared && (
              <>
                <span aria-hidden>·</span>
                <span className="uppercase">{t('reader.minutes', { count: prepared.minutes })}</span>
              </>
            )}
          </p>
          <h1
            lang={lang}
            className="headline selectable mt-3 text-[2em] leading-[1.15] font-semibold text-fg"
          >
            {tameCaps(article.title)}
          </h1>
          {standfirst && (
            <p lang={lang} className="selectable mt-4 text-[1.15em] leading-snug text-pretty text-fg-muted">
              {standfirst}
            </p>
          )}
          {byline && <p className="mt-4 font-ui text-sm text-fg-muted">{byline}</p>}
        </header>

        {fallback ? (
          <FeedFallback
            article={article}
            sourceName={sourceName}
            lang={lang}
            paywalled={paywalled}
            onRetry={onRetry}
            onShowWeb={onShowWeb}
            onOpenOriginal={onOpenOriginal}
          />
        ) : (
          <>
            {lead ? (
              <LeadImage key={lead} src={lead} />
            ) : (
              !prepared && <Skeleton shape="card" className="mt-8 aspect-[16/9]" />
            )}
            {prepared ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <ArticleBody html={prepared.html} lang={lang} onClick={onClick} onAuxClick={onAuxClick} />
              </motion.div>
            ) : (
              <BodySkeleton article={article} lang={lang} withOpening={!standfirst} />
            )}
          </>
        )}

        {extraction.status !== 'loading' && (
          <footer className="mt-14 flex items-center gap-3 border-t border-line pt-6 font-ui">
            <SourceLogo source={source} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
                {t('reader.sourceLabel')}
              </p>
              <p className="truncate text-sm text-fg">
                <span className="font-medium">{sourceName}</span>
                <span className="text-fg-subtle"> · {domain(article.url)}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconRight={ArrowUpRight}
              onClick={onShowWeb ?? onOpenOriginal}
            >
              {t('reader.viewOriginal')}
            </Button>
          </footer>
        )}
      </article>
    </div>
  )
}

function BlockedNotice({ onOpenOriginal }: { onOpenOriginal(): void }): React.JSX.Element {
  const { t } = useTranslation('reader')
  return (
    <div
      role="status"
      className="sticky top-0 z-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-b border-line bg-glass px-4 py-2 text-center font-ui text-[13px] text-fg-muted backdrop-blur-md"
    >
      <Info size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-accent-ink" />
      <span>{t('web.blockedNotice')}</span>
      <span aria-hidden className="text-fg-subtle">
        ·
      </span>
      <button
        type="button"
        onClick={onOpenOriginal}
        className="inline-flex items-center gap-0.5 rounded font-medium text-accent-ink hover:underline"
      >
        {t('web.openOriginal')}
        <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}

function LeadImage({ src }: { src: string }): React.JSX.Element | null {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading')
  if (state === 'failed') return null
  return (
    <figure className="mt-8 aspect-[16/9] overflow-hidden rounded-card bg-muted">
      <img
        src={src}
        alt=""
        decoding="async"
        referrerPolicy="no-referrer"
        draggable={false}
        onLoad={() => setState('loaded')}
        onError={() => setState('failed')}
        className={cn(
          'size-full object-cover transition-opacity duration-300 ease-out',
          state === 'loaded' ? 'opacity-100' : 'opacity-0'
        )}
      />
    </figure>
  )
}

interface ArticleBodyProps {
  html: string
  lang: string
  onClick(event: React.MouseEvent): void
  onAuxClick(event: React.MouseEvent): void
}

/** The sanitised article HTML. Pictures that fail to load are hidden with their figure. */
function ArticleBody({ html, lang, onClick, onAuxClick }: ArticleBodyProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // `error` does not bubble, but it can be caught on the way down.
    const onError = (event: Event): void => {
      const target = event.target
      if (!(target instanceof HTMLImageElement)) return
      const figure = target.closest('figure, picture')
      ;(figure && el.contains(figure) ? figure : target).setAttribute('hidden', '')
    }
    el.addEventListener('error', onError, true)
    return () => el.removeEventListener('error', onError, true)
  }, [])

  return (
    <div
      ref={ref}
      lang={lang}
      className="reader-prose selectable mt-8"
      onClick={onClick}
      onAuxClick={onAuxClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Placeholder body while the article is extracted: the feed's opening paragraph
 * (unless the standfirst already shows it), then shimmering lines.
 */
function BodySkeleton({
  article,
  lang,
  withOpening
}: {
  article: Article
  lang: string
  withOpening: boolean
}): React.JSX.Element {
  const opening = useMemo(
    () => (withOpening ? paragraphs(article.summary)[0] : undefined),
    [article.summary, withOpening]
  )
  return (
    <div className="mt-8">
      {opening && (
        <p lang={lang} className="mb-8 leading-[1.8] text-fg-muted">
          {opening}
        </p>
      )}
      <div aria-hidden className="flex flex-col gap-[1.1em]">
        {[4, 3, 5].map((lines, block) => (
          <div key={block} className="flex flex-col gap-[0.85em]">
            {Array.from({ length: lines }, (_, i) => (
              <Skeleton key={i} className={cn('h-[0.7em]', i === lines - 1 ? 'w-2/3' : 'w-full')} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface FeedFallbackProps {
  article: Article
  sourceName: string
  lang: string
  /** The publisher keeps the article for subscribers (rather than the extraction failing). */
  paywalled: boolean
  onRetry(): void
  onShowWeb?: () => void
  onOpenOriginal(): void
}

/**
 * No article text: extraction failed, or the publisher keeps the article for subscribers
 * (Masthead does not get round a paywall). Say which plainly, then show what the feed itself
 * carried, and offer the publisher's page.
 */
function FeedFallback({
  article,
  sourceName,
  lang,
  paywalled,
  onRetry,
  onShowWeb,
  onOpenOriginal
}: FeedFallbackProps): React.JSX.Element {
  const { t } = useTranslation('reader')
  const detail = useArticleDetail(article.id, article.hasDetail)
  const text = useMemo(
    () => (detail?.paragraphs.length ? detail.paragraphs : paragraphs(article.summary)),
    [detail, article.summary]
  )

  return (
    <div className="mt-8">
      <div role="status" className="flex gap-3 rounded-card border border-line bg-muted px-4 py-3.5 font-ui">
        {paywalled ? (
          <LockKeyhole size={18} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-fg-muted" />
        ) : (
          <CircleAlert size={18} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-fg-muted" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">
            {paywalled ? t('reader.paywallTitle') : t('reader.failedTitle')}
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-fg-muted">
            {paywalled
              ? t('reader.paywallDescription', { source: sourceName })
              : t('reader.failedDescription', { source: sourceName })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {onShowWeb ? (
              <Button variant="primary" size="sm" icon={Globe} onClick={onShowWeb}>
                {t('reader.showWeb')}
              </Button>
            ) : (
              <Button variant="primary" size="sm" iconRight={ArrowUpRight} onClick={onOpenOriginal}>
                {t('web.openOriginal')}
              </Button>
            )}
            {!paywalled && (
              <Button variant="ghost" size="sm" icon={RotateCw} onClick={onRetry}>
                {t('reader.retry')}
              </Button>
            )}
          </div>
        </div>
      </div>
      {article.image && <LeadImage src={article.image} />}
      {text.length > 0 && (
        <div lang={lang} className="reader-prose selectable mt-8">
          {text.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  )
}
