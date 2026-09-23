import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getSource } from '@shared/countries'
import type { Article } from '@shared/types'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useNowSelect } from '@/hooks/useNow'
import { useProgressive } from '@/hooks/useProgressive'
import { useLanguage } from '@/i18n'
import { tameCaps } from '@/lib/format'
import { clock } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'
import { openArticle } from './actions'

/** Items in the loop; the ticker is a glance, the Breaking page has the rest. */
const MAX_ITEMS = 24
/** Up to this many stories rotate one at a time; more scroll past as a marquee. */
const ROTATE_MAX = 5
/** Time each story stays in the rotator. */
const ROTATE_MS = 7000
/** Marquee speed in px per second. */
const SPEED = 40
/** The live dot pulses only while the newest story is this fresh. */
const PULSE_FRESH = 15 * 60_000

function TickerItems({
  articles,
  queue,
  inert = false
}: {
  articles: readonly Article[]
  queue: readonly string[]
  inert?: boolean
}): React.JSX.Element {
  const lang = useLanguage()
  const country = useSettings((s) => s.settings.country)
  return (
    <ul
      inert={inert}
      aria-hidden={inert || undefined}
      // The leading space clears the edge fade, so the first item starts whole.
      className={cn('flex shrink-0 items-center pl-10', inert && 'motion-reduce:hidden')}
    >
      {articles.map((article) => {
        const source = getSource(country, article.sourceId)
        return (
          <li key={article.id} className="flex items-center">
            <button
              type="button"
              onClick={() => openArticle(article, queue)}
              className="group/tick flex h-9 items-center gap-2 rounded-lg px-3 font-ui text-[13.5px] whitespace-nowrap"
            >
              <span className="font-semibold text-breaking tabular-nums">
                {clock(article.publishedAt, lang)}
              </span>
              <SourceLogo source={source} size="xs" />
              <span className="font-semibold text-fg-muted">{source?.name ?? article.sourceId}</span>
              <span
                lang="tr"
                className="headline text-[15px] font-medium text-fg decoration-line-strong underline-offset-4 group-hover/tick:underline"
              >
                {tameCaps(article.title)}
              </span>
            </button>
            <span aria-hidden className="size-1 shrink-0 rounded-full bg-line-strong" />
          </li>
        )
      })}
    </ul>
  )
}

/** Many stories: a seamless scrolling loop that pauses on hover, focus or its pause button. */
function Marquee({
  items,
  queue
}: {
  items: readonly Article[]
  queue: readonly string[]
}): React.JSX.Element {
  const { t } = useTranslation('news')
  const [paused, setPaused] = useState(false)
  const [duration, setDuration] = useState(60)
  const trackRef = useRef<HTMLDivElement>(null)
  // The second copy (for the seamless loop) is only needed once the ticker moves: add it after the first paint.
  const copies = useProgressive(2, 1, 1)

  // Measured when the browser lays the track out anyway (the observer's first report), not by forcing a
  // layout of the whole page while React commits.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.borderBoxSize?.[0]?.inlineSize ?? track.scrollWidth
      setDuration(Math.max(20, Math.round(width / copies / SPEED)))
    })
    observer.observe(track)
    return () => observer.disconnect()
  }, [copies])

  return (
    <>
      <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_3rem,black_calc(100%-3rem),transparent)] motion-reduce:overflow-x-auto">
        <div
          ref={trackRef}
          style={{ '--ticker-duration': `${duration}s` } as React.CSSProperties}
          className={cn(
            'flex w-max animate-ticker hover:[animation-play-state:paused] has-[:focus-visible]:[animation-play-state:paused] motion-reduce:animate-none',
            paused && '[animation-play-state:paused]'
          )}
        >
          <TickerItems articles={items} queue={queue} />
          {copies > 1 && <TickerItems articles={items} queue={queue} inert />}
        </div>
      </div>
      <IconButton
        size="sm"
        icon={paused ? Play : Pause}
        label={paused ? t('ticker.play') : t('ticker.pause')}
        onClick={() => setPaused((p) => !p)}
        className="motion-reduce:hidden"
      />
    </>
  )
}

/**
 * A few stories: one at a time, the full headline (wrapping to a second line
 * if it must), crossfading every 7 s. Pauses on hover and focus; ‹ › step by
 * hand. With reduced motion it only moves when asked.
 */
function Rotator({
  items,
  queue
}: {
  items: readonly Article[]
  queue: readonly string[]
}): React.JSX.Element {
  const { t } = useTranslation('news')
  const lang = useLanguage()
  const country = useSettings((s) => s.settings.country)
  const reducedMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const count = items.length
  const current = items[index % count]
  const source = getSource(country, current.sourceId)
  const still = hovered || focused || reducedMotion === true || count < 2

  useEffect(() => {
    if (still) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [still, count])

  const step = (by: 1 | -1): void => setIndex((i) => (i + by + count) % count)

  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-1"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <div aria-live={still ? 'polite' : 'off'} className="grid min-w-0 flex-1">
        <AnimatePresence initial={false}>
          <motion.button
            key={current.id}
            type="button"
            onClick={() => openArticle(current, queue)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="group/tick flex min-w-0 items-center gap-x-2 rounded-lg px-3 py-2 text-left font-ui text-[13.5px] [grid-area:1/1]"
          >
            <span className="shrink-0 font-semibold text-breaking tabular-nums">
              {clock(current.publishedAt, lang)}
            </span>
            <SourceLogo source={source} size="xs" />
            <span className="shrink-0 font-semibold text-fg-muted">{source?.name ?? current.sourceId}</span>
            <span
              lang="tr"
              className="headline min-w-0 text-[15px] leading-snug font-medium text-pretty text-fg decoration-line-strong underline-offset-4 group-hover/tick:underline"
            >
              {tameCaps(current.title)}
            </span>
          </motion.button>
        </AnimatePresence>
      </div>
      {count > 1 && (
        <div className="flex shrink-0 items-center">
          <IconButton size="sm" icon={ChevronLeft} label={t('ticker.previous')} onClick={() => step(-1)} />
          <span className="min-w-8 text-center font-ui text-[12px] text-fg-subtle tabular-nums">
            {t('ticker.position', { current: (index % count) + 1, total: count })}
          </span>
          <IconButton size="sm" icon={ChevronRight} label={t('ticker.next')} onClick={() => step(1)} />
        </div>
      )}
    </div>
  )
}

export interface BreakingTickerProps {
  /** Breaking stories, newest first. Nothing renders when empty. */
  articles: readonly Article[]
  className?: string
}

/**
 * Slim "BREAKING" bar. A handful of stories rotate one at a time with their
 * full headline; six or more scroll past as a slow marquee. Either way it ends
 * with a link to the Breaking page. The live dot pulses only while the newest
 * story is under 15 minutes old.
 */
export function BreakingTicker({ articles, className }: BreakingTickerProps): React.JSX.Element | null {
  const { t } = useTranslation('news')
  const items = useMemo(() => articles.slice(0, MAX_ITEMS), [articles])
  const queue = useMemo(() => items.map((a) => a.id), [items])
  const newest = items[0]?.publishedAt ?? 0
  const live = useNowSelect(60_000, (now) => now - newest < PULSE_FRESH)

  if (items.length === 0) return null

  return (
    <section
      aria-label={t('ticker.label')}
      className={cn(
        'flex min-h-12 items-stretch gap-1 overflow-hidden rounded-card border border-line bg-surface pr-1.5 shadow-soft in-data-[density=compact]:min-h-11',
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-r border-line bg-breaking-soft px-4 font-ui text-[11px] font-bold tracking-wider text-breaking uppercase">
        <span aria-hidden className={cn('size-2 rounded-full bg-breaking', live && 'animate-pulse-dot')} />
        {t('kicker.breaking')}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {items.length <= ROTATE_MAX ? (
          <Rotator items={items} queue={queue} />
        ) : (
          <Marquee items={items} queue={queue} />
        )}
        <Button
          variant="ghost"
          size="sm"
          iconRight={ArrowRight}
          onClick={() => useUi.getState().navigate({ name: 'breaking' })}
          className="hidden sm:inline-flex"
        >
          {t('ticker.all', { count: articles.length })}
        </Button>
      </div>
    </section>
  )
}
