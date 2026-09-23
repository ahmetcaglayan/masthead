import { useState } from 'react'
import { Newspaper, RefreshCw, Rss, SearchX, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { useArticles } from '@/hooks/useArticles'
import { cn } from '@/lib/cn'
import { useNews } from '@/stores/news'
import { useUi } from '@/stores/ui'
import { useOnline } from './utils'

/** A placeholder news card: image, kicker, two headline lines and a summary. */
export function CardSkeleton({
  className,
  image = true
}: {
  className?: string
  image?: boolean
}): React.JSX.Element {
  return (
    <div aria-hidden className={cn('flex flex-col gap-3', className)}>
      {image && <Skeleton shape="card" className="aspect-[16/9]" />}
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-11/12" />
      <Skeleton className="h-5 w-3/4" />
      <SkeletonText lines={3} className="mt-1" />
    </div>
  )
}

/** Placeholder grid for feed pages. */
export function FeedSkeleton({
  count = 6,
  className
}: {
  count?: number
  className?: string
}): React.JSX.Element {
  return (
    <div className={cn('grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Placeholder for the front page, laid out like it: dateline, ticker, manşet and its row, the Latest column. */
export function HomeSkeleton(): React.JSX.Element {
  return (
    <div aria-hidden className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-6 border-b-[3px] border-double border-line-strong pb-3">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton shape="card" className="h-12 rounded-card" />
      </div>
      <div className="grid gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton shape="card" className="aspect-[16/9] max-h-[28rem] rounded-panel" />
          <SkeletonText lines={3} />
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-3 w-24" />
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-3 w-10" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RetryButton(): React.JSX.Element {
  const { t } = useTranslation('common')
  const refreshing = useNews((s) => s.status.state === 'refreshing')
  const [busy, setBusy] = useState(false)
  const retry = async (): Promise<void> => {
    setBusy(true)
    try {
      await useNews.getState().refresh(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Button variant="primary" icon={RefreshCw} loading={busy || refreshing} onClick={() => void retry()}>
      {refreshing ? t('actions.refreshing') : t('actions.retry')}
    </Button>
  )
}

export interface NoMatchesProps {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Show "Clear filters", resetting the filter bar. Default true. */
  clearable?: boolean
  className?: string
}

/** Empty result for a filtered list, with a way to clear the filters. */
export function NoMatches({
  title,
  description,
  clearable = true,
  className
}: NoMatchesProps): React.JSX.Element {
  const { t } = useTranslation('news')
  return (
    <EmptyState
      icon={SearchX}
      title={title ?? t('filters.noMatchTitle')}
      description={description ?? t('filters.noMatchBody')}
      className={className}
      action={
        clearable && (
          <Button variant="primary" onClick={() => useUi.getState().resetFilters()}>
            {t('filters.clearAll')}
          </Button>
        )
      }
    />
  )
}

export interface NewsGateProps {
  children: React.ReactNode
  /** Shown while the first stories load; defaults to a card grid. */
  skeleton?: React.ReactNode
}

/**
 * Renders its children once there are stories from the user's sources.
 * Before that: a skeleton while loading, or a friendly empty, offline or
 * "all sources off" state with a way forward.
 */
export function NewsGate({ children, skeleton }: NewsGateProps): React.JSX.Element {
  const { t } = useTranslation('news')
  const snapshot = useNews((s) => s.snapshot)
  const refreshing = useNews((s) => s.status.state === 'refreshing')
  const articles = useArticles()
  const online = useOnline()

  if (articles.length > 0) return <>{children}</>
  if (!snapshot || (refreshing && online)) {
    return (
      <div role="status" aria-label={t('common:states.loading')}>
        {skeleton ?? <FeedSkeleton />}
      </div>
    )
  }
  if (snapshot.articles.length > 0) {
    return (
      <EmptyState
        icon={Rss}
        tone="accent"
        title={t('gate.allOffTitle')}
        description={t('gate.allOffBody')}
        action={
          <Button variant="primary" onClick={() => useUi.getState().navigate({ name: 'sources' })}>
            {t('gate.manageSources')}
          </Button>
        }
      />
    )
  }
  if (!online) {
    return (
      <EmptyState
        icon={WifiOff}
        title={t('common:states.offline')}
        description={t('gate.offlineBody')}
        action={<RetryButton />}
      />
    )
  }
  return (
    <EmptyState
      icon={Newspaper}
      tone="accent"
      title={t('gate.emptyTitle')}
      description={t('gate.emptyBody')}
      action={<RetryButton />}
    />
  )
}
