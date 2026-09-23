import { useMemo } from 'react'
import type { NewsSnapshot } from '@shared/types'
import { useNews } from '@/stores/news'

/** Fetch results of one source's feeds in the current snapshot. */
export interface SourceHealth {
  ok: number
  failing: number
  /** Error of the most recently failed feed. */
  lastError?: string
  /** Newest fetch time of any of its feeds (epoch ms). */
  checkedAt: number
}

export type HealthState = 'ok' | 'partial' | 'failing' | 'idle'

export interface SourceStats {
  /** Per source id; missing when none of its feeds was fetched yet. */
  health: ReadonlyMap<string, SourceHealth>
  /** Articles per source id in the snapshot. */
  articles: ReadonlyMap<string, number>
  feeds: { total: number; failing: number }
}

export function healthState(health: SourceHealth | undefined): HealthState {
  if (!health) return 'idle'
  if (health.failing === 0) return 'ok'
  return health.ok === 0 ? 'failing' : 'partial'
}

function computeStats(snapshot: NewsSnapshot | null): SourceStats {
  const health = new Map<string, SourceHealth>()
  const articles = new Map<string, number>()
  let failing = 0
  for (const feed of snapshot?.feeds ?? []) {
    // Never tried yet (first run, or a city just picked): neither working nor failing.
    if (!feed.ok && feed.lastFetchedAt === undefined) continue
    let entry = health.get(feed.sourceId)
    if (!entry) {
      entry = { ok: 0, failing: 0, checkedAt: 0 }
      health.set(feed.sourceId, entry)
    }
    if (feed.ok) entry.ok++
    else {
      entry.failing++
      failing++
      if (feed.lastError && (feed.lastFetchedAt ?? 0) >= entry.checkedAt) entry.lastError = feed.lastError
    }
    entry.checkedAt = Math.max(entry.checkedAt, feed.lastFetchedAt ?? 0)
  }
  for (const article of snapshot?.articles ?? []) {
    articles.set(article.sourceId, (articles.get(article.sourceId) ?? 0) + 1)
  }
  return { health, articles, feeds: { total: snapshot?.feeds.length ?? 0, failing } }
}

/** Feed health and article counts per source, derived once per snapshot. */
export function useSourceStats(): SourceStats {
  const snapshot = useNews((s) => s.snapshot)
  return useMemo(() => computeStats(snapshot), [snapshot])
}
