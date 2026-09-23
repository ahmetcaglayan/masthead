import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Dialog as RDialog } from 'radix-ui'
import {
  AArrowDown,
  AArrowUp,
  ALargeSmall,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Link,
  RotateCw,
  X
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getSource } from '@shared/countries'
import type { ReaderNavigation } from '@shared/ipc'
import { fontById, type ReaderMode } from '@shared/settings'
import type { Article, SourceDef } from '@shared/types'
import { openStory } from '@/components/news/actions'
import { Divider } from '@/components/ui/Divider'
import { IconButton, type IconButtonProps } from '@/components/ui/IconButton'
import { Kbd } from '@/components/ui/Kbd'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { toast } from '@/components/ui/Toaster'
import { Tooltip } from '@/components/ui/Tooltip'
import { useNow } from '@/hooks/useNow'
import { useSources } from '@/hooks/useSources'
import { api } from '@/lib/api'
import { domain, formatPercent, tameCaps } from '@/lib/format'
import { formatHotkey } from '@/lib/hotkeys'
import { fullDate, relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useLibrary } from '@/stores/library'
import { useNews } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'
import { READER_SCALE, useReaderPrefs, type ReaderTypeface } from './prefs'
import { ProgressLine } from './ProgressLine'

const COPIED_MS = 1800

/**
 * True while the native page view is on screen. Nothing in the DOM can draw
 * over it, so buttons use the OS tooltip (`title`) instead of ours, which
 * would open below the header, behind the page.
 */
const NativeTooltips = createContext(false)

function ToolButton({ label, shortcut, ...props }: IconButtonProps): React.JSX.Element {
  const native = useContext(NativeTooltips)
  if (!native) return <IconButton label={label} shortcut={shortcut} {...props} />
  const title = shortcut ? `${label} (${formatHotkey(shortcut)})` : label
  return <IconButton label={label} tooltip={false} title={title} {...props} />
}

function Separator(): React.JSX.Element {
  return <Divider orientation="vertical" className="mx-1.5 h-5 self-center" />
}

/** Browser-style back / forward / reload for the embedded page (Electron, Web mode). */
export interface PageNavigation {
  canGoBack: boolean
  canGoForward: boolean
  onNavigate(action: ReaderNavigation): void
}

export interface ReaderHeaderProps {
  article: Article
  source?: SourceDef
  /** Headline shown in the bar: the article's, or the page title after browsing away from it. */
  title: string
  /** The page the share actions act on. */
  url: string
  mode: ReaderMode
  onModeChange(mode: ReaderMode): void
  /** The native page view is showing (see `NativeTooltips`). */
  nativeView: boolean
  navigation?: PageNavigation
  progress: { active: boolean; value?: number }
  /** The list the article is stepped through (it is always in it). */
  queue: readonly string[]
  /** The articles ‹ and › open, if any (their headlines are the buttons' tooltips). */
  previous?: Article
  next?: Article
  onStep(step: 1 | -1): void
  onClose(): void
  /** A popover opened or closed (Esc then belongs to it). */
  onPopoverChange(open: boolean): void
  /** Say something to screen readers (toasts are hidden behind the modal). */
  announce(message: string): void
}

/** The reader dialog's top bar: source and headline, the Web | Reader switch, and the page actions. */
export function ReaderHeader({
  article,
  source,
  title,
  url,
  mode,
  onModeChange,
  nativeView,
  navigation,
  progress,
  queue,
  previous,
  next,
  onStep,
  onClose,
  onPopoverChange,
  announce
}: ReaderHeaderProps): React.JSX.Element {
  const { t, i18n } = useTranslation('reader')
  const now = useNow(30_000)
  const index = queue.indexOf(article.id)
  // "Article 3 of 12: <next headline>" — the two arrow pairs no longer look alike.
  const stepLabel = (label: string, target?: Article): string =>
    target ? `${label}: ${tameCaps(target.title)}` : label

  return (
    <NativeTooltips.Provider value={nativeView}>
      {/* The coverage row lives inside the header, so the native page view below moves down with it. */}
      <header className="relative shrink-0 border-b border-line">
        <div className="flex h-14 items-center gap-3 px-3 in-data-[density=compact]:h-12">
          <div className="flex min-w-0 flex-1 basis-0 items-center gap-2.5">
            {navigation && (
              <div className="flex shrink-0 items-center">
                <ToolButton
                  label={t('toolbar.back')}
                  icon={ArrowLeft}
                  size="sm"
                  disabled={!navigation.canGoBack}
                  onClick={() => navigation.onNavigate('back')}
                />
                <ToolButton
                  label={t('toolbar.forward')}
                  icon={ArrowRight}
                  size="sm"
                  disabled={!navigation.canGoForward}
                  onClick={() => navigation.onNavigate('forward')}
                />
                <ToolButton
                  label={t('toolbar.reload')}
                  icon={RotateCw}
                  size="sm"
                  onClick={() => navigation.onNavigate('reload')}
                />
                <Separator />
              </div>
            )}
            <SourceLogo source={source} size="md" className={cn(!navigation && 'ml-1')} />
            <div className="min-w-0">
              <RDialog.Title className="truncate font-headline text-[15px] leading-snug font-semibold tracking-[-0.01em] text-fg">
                {title}
              </RDialog.Title>
              <p className="truncate text-xs leading-snug text-fg-muted">
                <span className="font-medium text-fg">{source?.name ?? domain(article.url)}</span>
                <span aria-hidden className="mx-1.5 text-fg-subtle">
                  ·
                </span>
                <time
                  dateTime={new Date(article.publishedAt).toISOString()}
                  title={fullDate(article.publishedAt, i18n.language)}
                >
                  {relativeTime(article.publishedAt, i18n.language, now)}
                </time>
              </p>
            </div>
          </div>

          <SegmentedControl<ReaderMode>
            size="sm"
            aria-label={t('mode.label')}
            value={mode}
            onChange={onModeChange}
            options={[
              { value: 'web', label: t('mode.web'), icon: Globe },
              { value: 'reader', label: t('mode.reader'), icon: BookOpen }
            ]}
          />

          <div className="flex flex-1 basis-0 items-center justify-end">
            {mode === 'reader' && <TextSettings onOpenChange={onPopoverChange} />}
            <SaveButton article={article} />
            <CopyLinkButton url={url} quiet={nativeView} announce={announce} />
            <ToolButton
              label={t('toolbar.openInBrowser')}
              icon={ExternalLink}
              onClick={() => void api.reader.openExternal(url).catch(() => undefined)}
            />
            <Separator />
            <ToolButton
              label={stepLabel(t('toolbar.previous'), previous)}
              icon={ChevronLeft}
              shortcut="Alt+ArrowLeft"
              disabled={!previous}
              onClick={() => onStep(-1)}
            />
            {queue.length > 1 && index >= 0 && (
              <span
                className="min-w-10 text-center font-ui text-[12px] text-fg-subtle tabular-nums"
                aria-label={t('toolbar.position', { current: index + 1, total: queue.length })}
              >
                {index + 1}/{queue.length}
              </span>
            )}
            <ToolButton
              label={stepLabel(t('toolbar.next'), next)}
              icon={ChevronRight}
              shortcut="Alt+ArrowRight"
              disabled={!next}
              onClick={() => onStep(1)}
            />
            <CloseButton onClose={onClose} />
          </div>
        </div>
        <CoverageRow article={article} queue={queue} />

        <ProgressLine active={progress.active} value={progress.value} />
      </header>
    </NativeTooltips.Provider>
  )
}

/** The other outlets that carried the article's story: one report per source, newest first. */
function useCoverage(article: Article): Article[] {
  const cluster = useNews((s) => (article.clusterId ? s.clustersById.get(article.clusterId) : undefined))
  const byId = useNews((s) => s.byId)
  const { isEnabled } = useSources()
  return useMemo(() => {
    if (!cluster) return []
    const bySource = new Map<string, Article>()
    for (const id of cluster.articleIds) {
      const report = byId.get(id)
      if (!report || report.sourceId === article.sourceId || !isEnabled(report.sourceId)) continue
      const current = bySource.get(report.sourceId)
      if (!current || report.publishedAt > current.publishedAt) bySource.set(report.sourceId, report)
    }
    return [...bySource.values()].sort((a, b) => b.publishedAt - a.publishedAt)
  }, [cluster, byId, article.sourceId, isEnabled])
}

/**
 * "Also covered by": a chip per other outlet that carried the story; a click
 * shows that outlet's version in the same mode, right after this one in the
 * queue. Hidden when only one source had the story.
 */
function CoverageRow({
  article,
  queue
}: {
  article: Article
  queue: readonly string[]
}): React.JSX.Element | null {
  const { t } = useTranslation('reader')
  const country = useSettings((s) => s.settings.country)
  const others = useCoverage(article)
  if (others.length === 0) return null

  const open = (other: Article): void => {
    const at = queue.indexOf(article.id)
    const next = queue.includes(other.id)
      ? [...queue]
      : [...queue.slice(0, at + 1), other.id, ...queue.slice(at + 1)]
    useUi.getState().openArticle(other, next)
  }

  return (
    <div className="flex h-9 items-center gap-2 border-t border-line pr-3 pl-4">
      <span className="shrink-0 font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
        {t('coverage.label', { count: others.length })}
      </span>
      {/* Scrolls sideways when many outlets carried it; the fade hints at more. */}
      <ul className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {others.map((other) => {
          const source = getSource(country, other.sourceId)
          return (
            <li key={other.id} className="shrink-0">
              <button
                type="button"
                // The OS tooltip: ours would open behind the native page view.
                title={tameCaps(other.title)}
                onClick={() => open(other)}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface pr-2.5 pl-1 font-ui text-[12px] font-medium text-fg-muted transition-colors duration-150 hover:border-line-strong hover:bg-muted hover:text-fg"
              >
                <SourceLogo source={source} size="xs" />
                {source?.name ?? other.sourceId}
              </button>
            </li>
          )
        })}
      </ul>
      {article.clusterId && (
        <button
          type="button"
          onClick={() => openStory(article.clusterId!)}
          className="shrink-0 rounded-full px-2.5 py-1 font-ui text-[12px] font-semibold text-accent transition-colors duration-150 hover:bg-accent-soft"
        >
          {t('coverage.all')}
        </button>
      )}
    </div>
  )
}

function SaveButton({ article }: { article: Article }): React.JSX.Element {
  const { t } = useTranslation('reader')
  const saved = useLibrary((s) => s.savedIds.has(article.id))
  const toggle = (): void => {
    useLibrary
      .getState()
      .toggleSave(article)
      .catch(() => undefined)
  }
  return (
    <ToolButton
      label={saved ? t('toolbar.unsave') : t('toolbar.save')}
      icon={saved ? BookmarkCheck : Bookmark}
      pressed={saved}
      onClick={toggle}
    />
  )
}

function CopyLinkButton({
  url,
  quiet,
  announce
}: {
  url: string
  /** Skip the toast (it would sit behind the native page view). */
  quiet: boolean
  announce(message: string): void
}): React.JSX.Element {
  const { t } = useTranslation('reader')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      announce(t('toolbar.linkCopied'))
      if (!quiet) toast.success(t('toolbar.linkCopied'))
    } catch {
      announce(t('toolbar.copyFailed'))
      if (!quiet) toast.error(t('toolbar.copyFailed'))
    }
  }

  return (
    <ToolButton
      label={copied ? t('toolbar.linkCopied') : t('toolbar.copyLink')}
      icon={copied ? Check : Link}
      iconClassName={cn(copied && 'text-accent')}
      onClick={() => void copy()}
    />
  )
}

function CloseButton({ onClose }: { onClose(): void }): React.JSX.Element {
  const { t } = useTranslation('reader')
  const native = useContext(NativeTooltips)
  const label = t('toolbar.close')
  return (
    <Tooltip content={native ? false : label} shortcut="Escape">
      <button
        type="button"
        aria-label={label}
        aria-keyshortcuts="Escape"
        title={native ? `${label} (Esc)` : undefined}
        onClick={onClose}
        className="ml-1.5 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full pr-2 pl-1.5 text-fg-muted transition-colors duration-150 hover:bg-muted hover:text-fg"
      >
        <Kbd className="bg-transparent">Esc</Kbd>
        <X size={18} strokeWidth={1.75} aria-hidden />
      </button>
    </Tooltip>
  )
}

/** "Aa" popover for Reader mode: text size and typeface. */
function TextSettings({ onOpenChange }: { onOpenChange(open: boolean): void }): React.JSX.Element {
  const { t, i18n } = useTranslation('reader')
  const scale = useReaderPrefs((s) => s.scale)
  const typeface = useReaderPrefs((s) => s.typeface)
  const readingFont = useSettings((s) => s.settings.typography.readingFont)
  const uiFont = useSettings((s) => s.settings.typography.uiFont)
  const { setScale, setTypeface } = useReaderPrefs.getState()

  // Radix reports no close when the popover goes away open (Alt+R switches to Web mode, which has none).
  useEffect(() => () => onOpenChange(false), [onOpenChange])

  const faces: { id: ReaderTypeface; font: ReturnType<typeof fontById>; hint: string }[] = [
    { id: 'reading', font: fontById(readingFont), hint: t('text.readingFont') },
    { id: 'ui', font: fontById(uiFont), hint: t('text.uiFont') }
  ]

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <ToolButton label={t('toolbar.textSettings')} icon={ALargeSmall} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <p className="text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">{t('text.size')}</p>
        <div className="mt-2 flex items-center gap-1 rounded-full bg-muted p-1">
          <IconButton
            label={t('text.smaller')}
            icon={AArrowDown}
            size="sm"
            tooltip={false}
            disabled={scale <= READER_SCALE.min}
            onClick={() => setScale(scale - READER_SCALE.step)}
          />
          <span
            className="flex-1 text-center text-[13px] font-medium text-fg tabular-nums"
            aria-live="polite"
          >
            {formatPercent(scale, i18n.language)}
          </span>
          <IconButton
            label={t('text.larger')}
            icon={AArrowUp}
            size="sm"
            tooltip={false}
            disabled={scale >= READER_SCALE.max}
            onClick={() => setScale(scale + READER_SCALE.step)}
          />
        </div>

        {readingFont !== uiFont && (
          <>
            <p className="mt-4 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
              {t('text.typeface')}
            </p>
            <div role="radiogroup" aria-label={t('text.typeface')} className="mt-2 grid grid-cols-2 gap-2">
              {faces.map(({ id, font, hint }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={typeface === id}
                  onClick={() => setTypeface(id)}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-card border px-3 py-2.5 text-left transition-colors duration-150',
                    typeface === id
                      ? 'border-accent bg-accent-soft'
                      : 'border-line-strong hover:border-fg-subtle hover:bg-muted'
                  )}
                >
                  <span className="text-2xl leading-none text-fg" style={{ fontFamily: font.stack }}>
                    Ag
                  </span>
                  <span className="text-[12.5px] font-medium text-fg">{font.label}</span>
                  <span className="text-[11px] text-fg-muted">{hint}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
