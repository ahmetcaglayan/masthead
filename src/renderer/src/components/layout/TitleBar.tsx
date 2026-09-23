import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Monitor, Moon, RefreshCw, Settings, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ThemeMode } from '@shared/settings'
import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { Logo } from '@/components/ui/Logo'
import { SearchInput } from '@/components/ui/SearchInput'
import { Tooltip } from '@/components/ui/Tooltip'
import { useAppInfo } from '@/hooks/useAppInfo'
import { useArticles } from '@/hooks/useArticles'
import { useNow } from '@/hooks/useNow'
import { isElectron } from '@/lib/api'
import { IS_MAC } from '@/lib/hotkeys'
import { prepareSearch } from '@/lib/search'
import { relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useNews } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'
import { goSearch, registerSearchInput } from './search'

interface WindowControlsOverlay extends EventTarget {
  visible: boolean
}

function windowControlsOverlay(): WindowControlsOverlay | undefined {
  return (navigator as Navigator & { windowControlsOverlay?: WindowControlsOverlay }).windowControlsOverlay
}

function subscribeOverlay(onChange: () => void): () => void {
  const overlay = windowControlsOverlay()
  overlay?.addEventListener('geometrychange', onChange)
  return () => overlay?.removeEventListener('geometrychange', onChange)
}

/** Whether the OS draws caption buttons over our title bar (Window Controls Overlay). */
function useOverlayVisible(): boolean {
  return useSyncExternalStore(subscribeOverlay, () => windowControlsOverlay()?.visible === true)
}

const NEXT_THEME: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'system', system: 'light' }
const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const

function SearchField(): React.JSX.Element {
  const { t } = useTranslation('common')
  const routeQuery = useUi((s) => (s.route.name === 'search' ? s.route.query : ''))
  const [query, setQuery] = useState(routeQuery)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const setInput = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el
    registerSearchInput(el)
  }, [])

  // Get the stories ready for instant search while the app is idle.
  const articles = useArticles()
  useEffect(() => prepareSearch(articles), [articles])

  // Follow the route (back/forward, leaving search) unless the user is typing.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setQuery(routeQuery)
  }, [routeQuery])

  // Instant search: settle for a moment, then show results.
  useEffect(() => {
    const q = query.trim()
    const { route } = useUi.getState()
    if (route.name === 'search' ? route.query === q : q.length < 2) return
    const timer = setTimeout(() => goSearch(q), 250)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <SearchInput
      ref={setInput}
      value={query}
      onValueChange={setQuery}
      onSubmit={(value) => goSearch(value.trim())}
      placeholder={t('titlebar.searchPlaceholder')}
      shortcut="Mod+K"
      size="sm"
      className="no-drag w-full"
    />
  )
}

function RefreshButton(): React.JSX.Element {
  const { t, i18n } = useTranslation('common')
  const status = useNews((s) => s.status)
  const snapshotUpdatedAt = useNews((s) => s.snapshot?.updatedAt ?? 0)
  const now = useNow(30_000)
  const refreshing = status.state === 'refreshing'
  const last = status.lastCompletedAt || snapshotUpdatedAt

  // "Updated 5 min ago", never a bare "now" that reads like a "refresh now" button.
  const updated = !last
    ? t('titlebar.neverUpdated')
    : now - last < 60_000
      ? t('titlebar.updatedJustNow')
      : t('titlebar.updated', { time: relativeTime(last, i18n.language, now) })
  const tooltip = refreshing
    ? status.total
      ? t('titlebar.refreshProgress', { done: status.done, total: status.total })
      : t('actions.refreshing')
    : updated

  return (
    <Tooltip content={tooltip} shortcut="Mod+R">
      <button
        type="button"
        aria-label={t('actions.refresh')}
        aria-busy={refreshing}
        onClick={() => void useNews.getState().refresh(true)}
        className="no-drag inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-fg-muted transition-colors duration-150 hover:bg-muted hover:text-fg"
      >
        <RefreshCw size={17} strokeWidth={1.75} aria-hidden className={cn(refreshing && 'animate-spin')} />
        {last > 0 && (
          <span className="hidden pr-0.5 text-xs tabular-nums lg:inline" aria-hidden>
            {refreshing ? t('actions.refreshing') : updated}
          </span>
        )}
      </button>
    </Tooltip>
  )
}

function RefreshProgress(): React.JSX.Element {
  const status = useNews((s) => s.status)
  const active = status.state === 'refreshing'
  const ratio = status.total ? Math.max(0.04, status.done / status.total) : 0.04
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-accent"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: ratio, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  )
}

/**
 * The 44px window title bar: drag region with the logo, the search field and
 * quick actions. Leaves room for macOS traffic lights and Windows/Linux
 * caption buttons; no insets in web mode.
 */
export function TitleBar(): React.JSX.Element {
  const { t } = useTranslation('common')
  const info = useAppInfo()
  const overlay = useOverlayVisible()
  const theme = useSettings((s) => s.settings.theme)
  const onSettings = useUi((s) => s.route.name === 'settings')
  // Best guesses until the host answers, so the first frame is already laid out right.
  const web = info ? info.host === 'web' : !isElectron
  const mac = info ? info.platform === 'darwin' : IS_MAC
  const ThemeIcon = THEME_ICONS[theme]

  // Room for native window controls: traffic lights on the left (macOS), caption buttons on the right.
  const paddingLeft = mac && !web ? 80 : 12
  const insets = {
    paddingLeft,
    paddingRight:
      web || mac
        ? 12
        : overlay
          ? 'calc(100vw - env(titlebar-area-x, 0px) - env(titlebar-area-width, 100vw) + 8px)'
          : 140,
    // The search field starts on the page gutter: sidebar + 32px page padding − 16px column gap.
    '--titlebar-lead': `max(11rem, calc(var(--sidebar-w, 248px) + 16px - ${paddingLeft}px))`
  } as React.CSSProperties

  return (
    <header
      style={insets}
      className="drag relative z-30 grid h-(--titlebar-height) shrink-0 grid-cols-[var(--titlebar-lead)_minmax(0,28rem)_1fr] items-center gap-4 border-b border-line bg-canvas"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Logo size={24} className="text-[16px]" />
        {web && (
          <Tooltip content={t('titlebar.webBadgeHint')}>
            <Badge variant="accent" className="no-drag" tabIndex={0}>
              {t('titlebar.webBadge')}
            </Badge>
          </Tooltip>
        )}
      </div>

      <SearchField />

      <div className="flex items-center justify-end gap-1">
        <RefreshButton />
        <IconButton
          className="no-drag"
          label={t('titlebar.themeTooltip', { mode: t(`theme.${theme}`) })}
          icon={ThemeIcon}
          onClick={() => void useSettings.getState().update({ theme: NEXT_THEME[theme] })}
        />
        <IconButton
          className="no-drag"
          label={t('nav.settings')}
          icon={Settings}
          shortcut="Mod+,"
          pressed={onSettings}
          onClick={() => useUi.getState().navigate({ name: 'settings' })}
        />
      </div>

      <RefreshProgress />
    </header>
  )
}
