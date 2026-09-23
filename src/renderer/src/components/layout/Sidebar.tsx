import { useLayoutEffect } from 'react'
import { motion } from 'motion/react'
import {
  Bookmark,
  ChartCandlestick,
  Clock3,
  History,
  House,
  Layers,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Rss,
  Settings,
  Sparkles,
  Zap,
  type LucideIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TOPIC_CATEGORIES, type CategoryId } from '@shared/categories'
import { getCountryPack, hasLocalNews } from '@shared/countries'
import { hasMarkets } from '@shared/markets'
import { Tooltip } from '@/components/ui/Tooltip'
import { useNewsView } from '@/hooks/useArticles'
import { useNowSelect } from '@/hooks/useNow'
import { useSelectedProvince } from '@/hooks/useSources'
import { CATEGORY_ICONS, categoryLabel } from '@/lib/categories'
import { compactNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useLibrary } from '@/stores/library'
import { useSettings } from '@/stores/settings'
import { useUi, type Route } from '@/stores/ui'

/** Expanded and collapsed sidebar widths in px. */
const SIDEBAR_WIDTH = { expanded: 248, collapsed: 72 } as const

const BREAKING_WINDOW = 2 * 60 * 60 * 1000

function isActive(current: Route, target: Route): boolean {
  if (current.name !== target.name) return false
  if ((current.name === 'category' || current.name === 'source') && 'id' in target)
    return current.id === target.id
  return true
}

interface NavItemProps {
  route: Route
  icon: LucideIcon
  /** Visible label; also the accessible name unless `title` is given. */
  label: string
  /** Accessible name / tooltip when it should say more than the visible label (it should start with it). */
  title?: string
  /** Trailing content in the expanded state (counts, dots). */
  meta?: React.ReactNode
  /** Small marker on the icon, visible when collapsed. */
  marker?: React.ReactNode
  collapsed: boolean
  subtle?: boolean
}

function NavItem({
  route,
  icon: Icon,
  label,
  title,
  meta,
  marker,
  collapsed,
  subtle
}: NavItemProps): React.JSX.Element {
  const active = useUi((s) => isActive(s.route, route))
  const name = title ?? label
  return (
    <li>
      <Tooltip content={collapsed ? name : undefined} side="right" sideOffset={10}>
        {/* Named explicitly in both states: the visible label is hidden (opacity 0) while collapsed. */}
        <button
          type="button"
          aria-current={active ? 'page' : undefined}
          aria-label={name}
          onClick={() => useUi.getState().navigate(route)}
          className={cn(
            'relative flex h-9 w-full items-center rounded-xl text-left font-ui text-[13.5px] font-medium transition-colors duration-150 in-data-[density=compact]:h-8',
            // Collapsed: no side padding, so the icon sits in the middle of its own pill.
            collapsed ? 'justify-center px-0' : 'gap-3 px-[15px]',
            active ? 'bg-accent-soft text-accent-ink' : 'text-fg-muted hover:bg-muted hover:text-fg'
          )}
        >
          {active && (
            <motion.span
              layoutId="sidebar-active"
              aria-hidden
              className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-accent"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
            />
          )}
          <span className="relative flex shrink-0">
            <Icon
              size={18}
              strokeWidth={1.75}
              aria-hidden
              className={cn(!active && subtle && 'text-fg-subtle')}
            />
            {collapsed && marker}
          </span>
          <span
            className={cn(
              'truncate transition-opacity duration-150',
              // Collapsed: kept mounted for the fade, but it must not take width.
              collapsed ? 'pointer-events-none w-0 flex-none opacity-0' : 'min-w-0 flex-1 opacity-100'
            )}
          >
            {label}
          </span>
          {!collapsed && meta}
        </button>
      </Tooltip>
    </li>
  )
}

function Count({ value }: { value: number }): React.JSX.Element {
  const lang = useTranslation().i18n.language
  return (
    <span className="shrink-0 text-[11.5px] text-fg-subtle tabular-nums">{compactNumber(value, lang)}</span>
  )
}

function SectionTitle({
  children,
  collapsed
}: {
  children: React.ReactNode
  collapsed: boolean
}): React.JSX.Element {
  if (collapsed) return <div aria-hidden className="mx-2.5 my-3 h-px bg-line" />
  return (
    <h2 className="mt-5 mb-1.5 truncate px-[15px] font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
      {children}
    </h2>
  )
}

function useCounts(): { topics: ReadonlyMap<CategoryId, readonly unknown[]>; breaking: number } {
  const view = useNewsView()
  // Newest first, so counting stops at the first older story; re-renders only when the count changes.
  const breaking = useNowSelect(60_000, (now) => {
    let n = 0
    while (n < view.breaking.length && now - view.breaking[n].publishedAt <= BREAKING_WINDOW) n++
    return n
  })
  return { topics: view.byCategory, breaking }
}

/**
 * Primary navigation: sections, topics that currently have stories, library
 * and settings. Collapses to an icon rail (persisted in settings).
 */
export function Sidebar(): React.JSX.Element {
  const { t } = useTranslation('common')
  const collapsed = useSettings((s) => s.settings.layout.sidebarCollapsed)
  const country = useSettings((s) => s.settings.country)
  const province = useSelectedProvince()
  const savedCount = useLibrary((s) => s.library.saved.length)
  const { topics, breaking } = useCounts()

  const toggle = (): void => void useSettings.getState().update({ layout: { sidebarCollapsed: !collapsed } })
  const width = collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded

  // The title bar lines its search field up with the page gutter from this.
  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', `${width}px`)
  }, [width])
  const pulse = (
    <span aria-hidden className="block size-1.5 shrink-0 animate-pulse-dot rounded-full bg-breaking" />
  )

  return (
    <motion.nav
      aria-label={t('nav.main')}
      initial={false}
      animate={{ width }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-line bg-canvas"
    >
      {/*
        Expanded: the gutter is always reserved, so these items end where the fixed list below ends
        (pr-[22px]). Collapsed: a reserved gutter would push the whole icon rail off-centre by half its
        width, so the scrollbar is hidden instead and the padding stays symmetric.
      */}
      <div
        className={cn(
          'min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pt-3 pb-4',
          collapsed
            ? '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : '[scrollbar-gutter:stable] [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-line-strong'
        )}
      >
        <ul className="flex flex-col gap-0.5">
          <NavItem collapsed={collapsed} route={{ name: 'home' }} icon={House} label={t('nav.home')} />
          <NavItem collapsed={collapsed} route={{ name: 'digest' }} icon={Layers} label={t('nav.digest')} />
          <NavItem collapsed={collapsed} route={{ name: 'latest' }} icon={Clock3} label={t('nav.latest')} />
          <NavItem
            collapsed={collapsed}
            route={{ name: 'breaking' }}
            icon={Zap}
            label={t('nav.breaking')}
            title={
              breaking > 0
                ? `${t('nav.breaking')} · ${t('nav.breakingCount', { count: breaking })}`
                : undefined
            }
            marker={breaking > 0 && <span className="absolute -top-0.5 -right-0.5">{pulse}</span>}
            meta={
              breaking > 0 && (
                <span className="flex shrink-0 items-center gap-1.5 text-[11.5px] font-semibold text-breaking tabular-nums">
                  {pulse}
                  {breaking}
                </span>
              )
            }
          />
          <NavItem collapsed={collapsed} route={{ name: 'foryou' }} icon={Sparkles} label={t('nav.forYou')} />
          {/* Only countries whose pack ships provinces have local news to offer. */}
          {hasLocalNews(country) && (
            <NavItem
              collapsed={collapsed}
              route={{ name: 'local' }}
              icon={MapPin}
              label={province?.name ?? t('nav.chooseCity', { context: getCountryPack(country)?.localUnit })}
              title={`${t('nav.local')}: ${province?.name ?? t('nav.chooseCity', { context: getCountryPack(country)?.localUnit })}`}
            />
          )}
          {hasMarkets(country) && (
            <NavItem
              collapsed={collapsed}
              route={{ name: 'markets' }}
              icon={ChartCandlestick}
              label={t('nav.markets')}
            />
          )}
        </ul>

        {topics.size > 0 && (
          <>
            <SectionTitle collapsed={collapsed}>{t('nav.topics')}</SectionTitle>
            <ul className="flex flex-col gap-0.5">
              {TOPIC_CATEGORIES.filter((id) => (topics.get(id)?.length ?? 0) > 0).map((id) => (
                <NavItem
                  key={id}
                  collapsed={collapsed}
                  route={{ name: 'category', id }}
                  icon={CATEGORY_ICONS[id]}
                  label={categoryLabel(t, id, country)}
                  meta={<Count value={topics.get(id)?.length ?? 0} />}
                  subtle
                />
              ))}
            </ul>
          </>
        )}

        <SectionTitle collapsed={collapsed}>{t('nav.library')}</SectionTitle>
        <ul className="flex flex-col gap-0.5">
          <NavItem
            collapsed={collapsed}
            route={{ name: 'saved' }}
            icon={Bookmark}
            label={t('nav.saved')}
            meta={savedCount > 0 && <Count value={savedCount} />}
            subtle
          />
          <NavItem
            collapsed={collapsed}
            route={{ name: 'history' }}
            icon={History}
            label={t('nav.history')}
            subtle
          />
        </ul>
      </div>

      <ul
        className={cn(
          'flex flex-col gap-0.5 border-t border-line py-2.5',
          // Expanded: matches the scroll gutter above. Collapsed: symmetric, like the rail above.
          collapsed ? 'px-3' : 'pr-[22px] pl-3'
        )}
      >
        <NavItem
          collapsed={collapsed}
          route={{ name: 'sources' }}
          icon={Rss}
          label={t('nav.sources')}
          subtle
        />
        <NavItem
          collapsed={collapsed}
          route={{ name: 'settings' }}
          icon={Settings}
          label={t('nav.settings')}
          subtle
        />
        <li>
          <Tooltip content={collapsed ? t('nav.expand') : undefined} side="right" sideOffset={10}>
            <button
              type="button"
              aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
              aria-expanded={!collapsed}
              onClick={toggle}
              className={cn(
                'flex h-9 w-full items-center rounded-xl text-left font-ui text-[13px] text-fg-subtle transition-colors duration-150 hover:bg-muted hover:text-fg in-data-[density=compact]:h-8',
                collapsed ? 'justify-center px-0' : 'gap-3 px-[15px]'
              )}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} strokeWidth={1.75} aria-hidden className="shrink-0" />
              ) : (
                <PanelLeftClose size={18} strokeWidth={1.75} aria-hidden className="shrink-0" />
              )}
              <span
                className={cn(
                  'truncate transition-opacity duration-150',
                  collapsed ? 'w-0 flex-none opacity-0' : 'opacity-100'
                )}
              >
                {t('nav.collapse')}
              </span>
            </button>
          </Tooltip>
        </li>
      </ul>
    </motion.nav>
  )
}
