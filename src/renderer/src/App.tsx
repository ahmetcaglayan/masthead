import { useEffect } from 'react'
import { MotionConfig, useReducedMotion } from 'motion/react'
import { AppShell } from '@/components/layout/AppShell'
import { focusSearch } from '@/components/layout/search'
import { toggleSaved } from '@/components/news/actions'
import { Toaster } from '@/components/ui/Toaster'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { Onboarding } from '@/features/onboarding/Onboarding'
import { CommandPalette } from '@/features/palette/CommandPalette'
import { ShortcutsDialog } from '@/features/palette/ShortcutsDialog'
import { ArticleDialog } from '@/features/reader/ArticleDialog'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { SourcesPage } from '@/features/sources/SourcesPage'
import { UpdateDialog } from '@/features/updates/UpdateDialog'
import { useHotkeys } from '@/hooks/useHotkeys'
import i18n from '@/i18n'
import { api } from '@/lib/api'
import { focusedStoryId, moveStoryFocus, openFocusedStory } from '@/lib/feedNav'
import { BreakingPage } from '@/pages/BreakingPage'
import { CategoryPage } from '@/pages/CategoryPage'
import { DigestPage } from '@/pages/DigestPage'
import { ForYouPage } from '@/pages/ForYouPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { HomePage } from '@/pages/HomePage'
import { LatestPage } from '@/pages/LatestPage'
import { LocalPage } from '@/pages/LocalPage'
import { SavedPage } from '@/pages/SavedPage'
import { SearchPage } from '@/pages/SearchPage'
import { SourcePage } from '@/pages/SourcePage'
import { StoryPage } from '@/pages/StoryPage'
import { useNews } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { useUi, type Route } from '@/stores/ui'

function RoutePage({ route }: { route: Route }): React.JSX.Element {
  switch (route.name) {
    case 'home':
      return <HomePage />
    case 'digest':
      return <DigestPage />
    case 'latest':
      return <LatestPage />
    case 'breaking':
      return <BreakingPage />
    case 'foryou':
      return <ForYouPage />
    case 'local':
      return <LocalPage />
    case 'category':
      return <CategoryPage id={route.id} />
    case 'source':
      return <SourcePage id={route.id} />
    case 'search':
      return <SearchPage query={route.query} />
    case 'saved':
      return <SavedPage />
    case 'history':
      return <HistoryPage />
    case 'story':
      return <StoryPage id={route.id} />
    case 'sources':
      return <SourcesPage />
    case 'settings':
      return <SettingsPage section={route.section} />
  }
}

/** Open an article the host asked for (e.g. a clicked breaking-news notification). */
async function openFromHost(articleId: string): Promise<void> {
  const news = useNews.getState()
  if (!news.byId.has(articleId)) await news.reload()
  const article = useNews.getState().byId.get(articleId)
  if (article) useUi.getState().openArticle(article)
}

/** S on a focused story: save it, or take it out of Saved. */
function saveFocusedStory(): void {
  const id = focusedStoryId()
  const article = id ? useNews.getState().byId.get(id) : undefined
  if (article) void toggleSaved(article, i18n.t)
}

function useGlobalHotkeys(shell: boolean): void {
  const readerOpen = useUi((s) => s.reader !== null)
  const overlay = useUi((s) => s.commandOpen || s.shortcutsOpen)
  const reducedMotion = useReducedMotion() ?? false
  const inShell = shell && !readerOpen
  // Single-letter keys only act on the page itself, not under a dialog or the palette.
  const onPage = inShell && !overlay
  const refresh = (): void => void useNews.getState().refresh(true)
  useHotkeys([
    {
      combo: 'Mod+K',
      handler: () => useUi.getState().setCommandOpen(!useUi.getState().commandOpen),
      allowInInputs: true,
      enabled: inShell
    },
    { combo: ['Mod+R', 'F5'], handler: refresh, allowInInputs: true },
    {
      combo: 'Mod+,',
      handler: () => useUi.getState().navigate({ name: 'settings' }),
      allowInInputs: true,
      enabled: inShell
    },
    { combo: 'Alt+ArrowLeft', handler: () => useUi.getState().back(), enabled: inShell },
    { combo: '/', handler: focusSearch, enabled: onPage },
    { combo: 'R', handler: refresh, enabled: onPage },
    { combo: 'J', handler: () => moveStoryFocus(1, reducedMotion), enabled: onPage },
    { combo: 'K', handler: () => moveStoryFocus(-1, reducedMotion), enabled: onPage },
    { combo: 'O', handler: () => void openFocusedStory(), enabled: onPage },
    { combo: 'S', handler: saveFocusedStory, enabled: onPage },
    { combo: '?', handler: () => useUi.getState().setShortcutsOpen(true), enabled: onPage }
  ])
}

/** Root component: onboarding on first run, otherwise the app shell with the current page. */
export function App(): React.JSX.Element {
  const onboarded = useSettings((s) => s.settings.onboardingCompleted)
  const route = useUi((s) => s.route)
  useGlobalHotkeys(onboarded)

  useEffect(() => api.news.onOpenArticle((id) => void openFromHost(id)), [])

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        {onboarded ? (
          <AppShell>
            <RoutePage route={route} />
          </AppShell>
        ) : (
          <Onboarding />
        )}
        <ArticleDialog />
        {onboarded && (
          <>
            <CommandPalette />
            <ShortcutsDialog />
            <UpdateDialog />
          </>
        )}
        <Toaster />
      </TooltipProvider>
    </MotionConfig>
  )
}
