import { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import { AppShell } from '@/components/layout/AppShell'
import { focusSearch } from '@/components/layout/search'
import { Toaster } from '@/components/ui/Toaster'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { Onboarding } from '@/features/onboarding/Onboarding'
import { ArticleDialog } from '@/features/reader/ArticleDialog'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { SourcesPage } from '@/features/sources/SourcesPage'
import { useHotkeys } from '@/hooks/useHotkeys'
import { api } from '@/lib/api'
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

function useGlobalHotkeys(shell: boolean): void {
  const readerOpen = useUi((s) => s.reader !== null)
  const inShell = shell && !readerOpen
  useHotkeys([
    { combo: 'Mod+K', handler: focusSearch, allowInInputs: true, enabled: inShell },
    { combo: ['Mod+R', 'F5'], handler: () => void useNews.getState().refresh(true), allowInInputs: true },
    {
      combo: 'Mod+,',
      handler: () => useUi.getState().navigate({ name: 'settings' }),
      allowInInputs: true,
      enabled: inShell
    },
    { combo: 'Alt+ArrowLeft', handler: () => useUi.getState().back(), enabled: inShell }
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
        <Toaster />
      </TooltipProvider>
    </MotionConfig>
  )
}
