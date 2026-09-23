import { useDeferredValue, useMemo, useState } from 'react'
import { Command } from 'cmdk'
import { Dialog as RDialog } from 'radix-ui'
import {
  Bookmark,
  Clock3,
  History,
  House,
  Keyboard,
  Layers,
  MapPin,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Rss,
  Search,
  Settings,
  Sparkles,
  Sun,
  Zap,
  type LucideIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TOPIC_CATEGORIES } from '@shared/categories'
import { hasLocalNews } from '@shared/countries'
import type { Article } from '@shared/types'
import { goSearch } from '@/components/layout/search'
import { openArticle } from '@/components/news/actions'
import { Kbd } from '@/components/ui/Kbd'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useNewsView } from '@/hooks/useArticles'
import { useSources } from '@/hooks/useSources'
import { CATEGORY_ICONS, categoryLabel } from '@/lib/categories'
import { tameCaps } from '@/lib/format'
import { foldText, parseQuery, searchArticles } from '@/lib/search'
import { relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useNews } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { useUi, type Route } from '@/stores/ui'

const STORIES_SHOWN = 6
const SOURCES_SHOWN = 6

const PAGES: readonly { route: Route; label: string; icon: LucideIcon }[] = [
  { route: { name: 'home' }, label: 'nav.home', icon: House },
  { route: { name: 'digest' }, label: 'nav.digest', icon: Layers },
  { route: { name: 'latest' }, label: 'nav.latest', icon: Clock3 },
  { route: { name: 'breaking' }, label: 'nav.breaking', icon: Zap },
  { route: { name: 'foryou' }, label: 'nav.forYou', icon: Sparkles },
  { route: { name: 'local' }, label: 'nav.local', icon: MapPin },
  { route: { name: 'saved' }, label: 'nav.saved', icon: Bookmark },
  { route: { name: 'history' }, label: 'nav.history', icon: History },
  { route: { name: 'sources' }, label: 'nav.sources', icon: Rss },
  { route: { name: 'settings' }, label: 'nav.settings', icon: Settings }
]

const NEXT_THEME = { system: 'light', light: 'dark', dark: 'system' } as const
const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const

/** A name matches when a word in it starts with the query (folded: "tur" finds "Türkiye"). */
function matches(name: string, query: string): boolean {
  if (!query) return true
  const folded = foldText(name)
  return folded.startsWith(query) || folded.includes(` ${query}`) || folded.includes(query)
}

const ITEM =
  'flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 font-ui text-[14px] text-fg outline-none data-[selected=true]:bg-muted'
const GROUP =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-ui [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-fg-subtle [&_[cmdk-group-heading]]:uppercase'

function StoryItem({ article, onSelect }: { article: Article; onSelect: () => void }): React.JSX.Element {
  const { i18n } = useTranslation()
  const { byId } = useSources()
  const source = byId.get(article.sourceId)
  return (
    <Command.Item value={`story:${article.id}`} onSelect={onSelect} className={cn(ITEM, 'h-auto py-2')}>
      <SourceLogo source={source} size="sm" />
      <span className="min-w-0 flex-1">
        <span lang={source?.language} className="headline line-clamp-1 text-[15px] leading-snug">
          {tameCaps(article.title)}
        </span>
        <span className="block text-[12px] text-fg-subtle">
          {source?.name ?? article.sourceId} · {relativeTime(article.publishedAt, i18n.language)}
        </span>
      </span>
    </Command.Item>
  )
}

/**
 * Ctrl/⌘+K: one box to go anywhere — search the news, jump to a story, a page, a topic or
 * a source, or run an action (refresh, theme, sidebar, shortcuts). Everything is matched
 * the way search is: case and Turkish characters do not matter.
 */
export function CommandPalette(): React.JSX.Element {
  const { t } = useTranslation('common')
  const open = useUi((s) => s.commandOpen)
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const q = foldText(deferred.trim())
  const view = useNewsView()
  const { enabled } = useSources()
  const settings = useSettings((s) => s.settings)
  const country = settings.country

  const stories = useMemo(() => {
    const terms = parseQuery(deferred)
    return terms.length === 0 || q.length < 2
      ? []
      : searchArticles(view.articles, terms).slice(0, STORIES_SHOWN)
  }, [deferred, q, view.articles])

  const pages = PAGES.filter(
    (page) => (page.route.name !== 'local' || hasLocalNews(country)) && matches(t(page.label), q)
  )
  const topics = q ? TOPIC_CATEGORIES.filter((id) => matches(categoryLabel(t, id, country), q)) : []
  const sources = q ? enabled.filter((s) => matches(s.name, q)).slice(0, SOURCES_SHOWN) : []
  const nextTheme = NEXT_THEME[settings.theme]
  const collapsed = settings.layout.sidebarCollapsed
  const actions = [
    {
      id: 'refresh',
      label: t('palette.refresh'),
      icon: RefreshCw,
      run: () => void useNews.getState().refresh(true)
    },
    {
      id: 'theme',
      label: t('palette.theme', { theme: t(`theme.${nextTheme}`) }),
      icon: THEME_ICONS[nextTheme],
      run: () => void useSettings.getState().update({ theme: nextTheme })
    },
    {
      id: 'sidebar',
      label: collapsed ? t('nav.expand') : t('nav.collapse'),
      icon: collapsed ? PanelLeftOpen : PanelLeftClose,
      run: () => void useSettings.getState().update({ layout: { sidebarCollapsed: !collapsed } })
    },
    {
      id: 'shortcuts',
      label: t('palette.shortcuts'),
      icon: Keyboard,
      run: () => useUi.getState().setShortcutsOpen(true)
    }
  ].filter((action) => matches(action.label, q))

  const close = (): void => {
    useUi.getState().setCommandOpen(false)
    setQuery('')
  }
  /** Close first, so a page or the reader opens over a settled screen. */
  const run = (action: () => void) => (): void => {
    close()
    action()
  }
  const go = (route: Route) => run(() => useUi.getState().navigate(route))
  const nothing = !q.length
    ? false
    : stories.length + pages.length + topics.length + sources.length + actions.length === 0

  return (
    <RDialog.Root
      open={open}
      onOpenChange={(next) => (next ? useUi.getState().setCommandOpen(true) : close())}
    >
      <RDialog.Portal>
        <RDialog.Overlay className="mh-overlay fixed inset-0 z-50 bg-overlay backdrop-blur-[3px]" />
        <RDialog.Content
          aria-describedby={undefined}
          className="mh-dialog fixed top-[12vh] left-1/2 z-50 flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-panel border border-line bg-surface text-fg shadow-float outline-none"
        >
          <RDialog.Title className="sr-only">{t('palette.label')}</RDialog.Title>
          <Command label={t('palette.label')} shouldFilter={false} loop className="flex min-h-0 flex-col">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-fg-subtle" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder={t('palette.placeholder')}
                className="selectable h-13 min-w-0 flex-1 bg-transparent font-ui text-[15px] text-fg outline-none placeholder:text-fg-subtle"
              />
              <Kbd>Esc</Kbd>
            </div>
            <Command.List className="min-h-0 overflow-y-auto overscroll-contain p-2">
              {nothing && (
                <Command.Empty className="px-3 py-6 text-center font-ui text-[13.5px] text-fg-muted">
                  {t('palette.empty', { query: query.trim() })}
                </Command.Empty>
              )}
              {query.trim() && (
                <Command.Group heading={t('palette.groups.search')} className={GROUP}>
                  <Command.Item value="search" onSelect={run(() => goSearch(query.trim()))} className={ITEM}>
                    <Search size={16} strokeWidth={1.75} aria-hidden className="text-fg-muted" />
                    <span className="min-w-0 truncate">
                      {t('palette.searchFor', { query: query.trim() })}
                    </span>
                  </Command.Item>
                </Command.Group>
              )}
              {stories.length > 0 && (
                <Command.Group heading={t('palette.groups.stories')} className={GROUP}>
                  {stories.map((article) => (
                    <StoryItem
                      key={article.id}
                      article={article}
                      onSelect={run(() =>
                        openArticle(
                          article,
                          stories.map((s) => s.id)
                        )
                      )}
                    />
                  ))}
                </Command.Group>
              )}
              {pages.length > 0 && (
                <Command.Group heading={t('palette.groups.pages')} className={GROUP}>
                  {pages.map(({ route, label, icon: Icon }) => (
                    <Command.Item
                      key={route.name}
                      value={`page:${route.name}`}
                      onSelect={go(route)}
                      className={ITEM}
                    >
                      <Icon size={16} strokeWidth={1.75} aria-hidden className="text-fg-muted" />
                      {t(label)}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              {topics.length > 0 && (
                <Command.Group heading={t('palette.groups.topics')} className={GROUP}>
                  {topics.map((id) => {
                    const Icon = CATEGORY_ICONS[id]
                    return (
                      <Command.Item
                        key={id}
                        value={`topic:${id}`}
                        onSelect={go({ name: 'category', id })}
                        className={ITEM}
                      >
                        <Icon size={16} strokeWidth={1.75} aria-hidden className="text-fg-muted" />
                        {categoryLabel(t, id, country)}
                      </Command.Item>
                    )
                  })}
                </Command.Group>
              )}
              {sources.length > 0 && (
                <Command.Group heading={t('palette.groups.sources')} className={GROUP}>
                  {sources.map((source) => (
                    <Command.Item
                      key={source.id}
                      value={`source:${source.id}`}
                      onSelect={go({ name: 'source', id: source.id })}
                      className={ITEM}
                    >
                      <SourceLogo source={source} size="xs" />
                      {source.name}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              {actions.length > 0 && (
                <Command.Group heading={t('palette.groups.actions')} className={GROUP}>
                  {actions.map(({ id, label, icon: Icon, run: action }) => (
                    <Command.Item key={id} value={`action:${id}`} onSelect={run(action)} className={ITEM}>
                      <Icon size={16} strokeWidth={1.75} aria-hidden className="text-fg-muted" />
                      {label}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
            <div className="flex items-center gap-4 border-t border-line px-4 py-2 font-ui text-[11.5px] text-fg-subtle">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                {t('palette.move')}
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>Enter</Kbd>
                {t('palette.choose')}
              </span>
            </div>
          </Command>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}
