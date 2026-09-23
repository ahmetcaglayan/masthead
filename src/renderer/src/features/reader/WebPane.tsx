import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { ArrowUpRight, BookOpen, CloudOff, Globe, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Article, SourceDef } from '@shared/types'
import { ArticleImage } from '@/components/ui/ArticleImage'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonText } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import { domain, paragraphs } from '@/lib/format'
import { cn } from '@/lib/cn'

/** Reveal an iframe that never reports `load` after this long, rather than hiding the page for good. */
const FRAME_REVEAL_TIMEOUT_MS = 10_000

/** The page area inside the content region: inset so the page reads as a rounded sheet (radius 20 − 8 = 12). */
const SHEET = 'absolute inset-2 overflow-hidden rounded-[12px]'

/**
 * Keep the native page view glued to `ref`'s box: sends its rectangle (window
 * CSS px, rounded) now, on every resize of the box and on window resizes.
 * Only while `enabled`: during the dialog's scale-in the box is transformed.
 */
function useNativeBounds(ref: React.RefObject<HTMLElement | null>, enabled: boolean): void {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let last = ''
    let frame = 0
    const send = (): void => {
      const rect = el.getBoundingClientRect()
      const bounds = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      }
      const key = `${bounds.x},${bounds.y},${bounds.width},${bounds.height}`
      if (key === last) return
      last = key
      api.reader.setBounds(bounds)
    }
    const schedule = (): void => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(send)
    }
    send()
    const observer = new ResizeObserver(schedule)
    observer.observe(el)
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [ref, enabled])
}

export interface NativePageProps {
  /** The dialog has finished animating in, so the measured box is final. */
  measured: boolean
  /** Shown underneath while the native view is hidden (preview, error). */
  children?: React.ReactNode
}

/**
 * Electron: an empty, measured box that the native page view (drawn by the main
 * process above all DOM) is positioned over.
 */
export function NativePage({ measured, children }: NativePageProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  useNativeBounds(ref, measured)
  return (
    <div ref={ref} className={SHEET}>
      {children}
    </div>
  )
}

export interface FramePageProps {
  /** Undefined while the site is still being checked for framing. */
  url?: string
  article: Article
  source?: SourceDef
  loaded: boolean
  onLoad(): void
}

/** Web host: the publisher's page in a sandboxed iframe, faded in over the preview once it loads. */
export function FramePage({ url, article, source, loaded, onLoad }: FramePageProps): React.JSX.Element {
  useEffect(() => {
    if (!url || loaded) return
    const timer = window.setTimeout(onLoad, FRAME_REVEAL_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [url, loaded, onLoad])

  return (
    <div className={cn(SHEET, url && 'ring-1 ring-line')}>
      {!loaded && <PagePreview article={article} source={source} />}
      {url && (
        <iframe
          src={url}
          title={article.title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={onLoad}
          className={cn(
            'absolute inset-0 size-full border-0 transition-opacity duration-200 ease-out',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  )
}

/** Loading state for a page reached through a link, which has no feed summary to preview. */
export function PageLoading({ url }: { url: string }): React.JSX.Element {
  const { t } = useTranslation('reader')
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-surface text-sm text-fg-muted">
      <Spinner size={18} label={null} />
      {t('web.loading', { site: domain(url) })}
    </div>
  )
}

/**
 * What the reader sees while the page loads: the headline, the feed summary and
 * the picture, so the story can be followed before the site has painted.
 */
export function PagePreview({
  article,
  source
}: {
  article: Article
  source?: SourceDef
}): React.JSX.Element {
  const { t } = useTranslation('reader')
  const summary = useMemo(() => paragraphs(article.summary), [article.summary])
  const lang = source?.language ?? 'tr'
  return (
    <div className="absolute inset-0 overflow-hidden bg-surface">
      <div className="mx-auto w-full max-w-[68ch] px-8 pt-12 pb-10">
        <p className="flex items-center gap-2 text-[12.5px] text-fg-subtle">
          <Spinner size={14} label={null} />
          {t('web.loading', { site: domain(article.url) })}
        </p>
        <h2 lang={lang} className="headline mt-4 text-3xl leading-tight font-semibold text-fg">
          {article.title}
        </h2>
        {summary.length > 0 && (
          <div
            lang={lang}
            className="mt-4 space-y-3 font-reading text-[1.0625rem] leading-[1.75] text-fg-muted"
          >
            {summary.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        )}
        <ArticleImage
          article={article}
          source={source}
          priority
          zoomOnHover={false}
          className="mt-8 aspect-[16/9] rounded-card"
        />
        <SkeletonText lines={4} className="mt-8" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-surface to-transparent"
      />
    </div>
  )
}

export interface PageErrorProps {
  url: string
  /** Chromium's error name, e.g. `ERR_NAME_NOT_RESOLVED`. */
  detail?: string
  onRetry(): void
  onReader(): void
}

/** The page failed to load in the native view. */
export function PageError({ url, detail, onRetry, onReader }: PageErrorProps): React.JSX.Element {
  const { t } = useTranslation('reader')
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-surface px-6">
      <EmptyState
        icon={CloudOff}
        tone="error"
        title={t('web.failedTitle')}
        description={
          <>
            {t('web.failedDescription', { site: domain(url) })}
            {detail && <span className="mt-2 block font-mono text-[11px] text-fg-subtle">{detail}</span>}
          </>
        }
        action={
          <>
            <Button variant="primary" icon={RotateCw} onClick={onRetry}>
              {t('web.retry')}
            </Button>
            <Button icon={BookOpen} onClick={onReader}>
              {t('web.tryReader')}
            </Button>
          </>
        }
      />
    </div>
  )
}

/** Web host: the user asked for Web mode on a site that refuses to be framed. */
export function EmbedBlocked({ url, onReader }: { url: string; onReader(): void }): React.JSX.Element {
  const { t } = useTranslation('reader')
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto px-6">
      <EmptyState
        icon={Globe}
        tone="accent"
        title={t('web.blockedTitle')}
        description={t('web.blockedDescription', { site: domain(url) })}
        action={
          <>
            <Button
              variant="primary"
              iconRight={ArrowUpRight}
              onClick={() => void api.reader.openExternal(url).catch(() => undefined)}
            >
              {t('web.openOriginal')}
            </Button>
            <Button icon={BookOpen} onClick={onReader}>
              {t('mode.reader')}
            </Button>
          </>
        }
      />
    </div>
  )
}
