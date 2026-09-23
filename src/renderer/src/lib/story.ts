import type { Article, StoryCluster } from '@shared/types'

/** Identity of the story an article belongs to: its cluster, or the article itself. */
export const storyKey = (article: Article): string => article.clusterId ?? article.id

/** Number of distinct sources that carried the article's story (1 when it is not clustered). */
export function coverage(article: Article, clustersById?: ReadonlyMap<string, StoryCluster>): number {
  const cluster = article.clusterId ? clustersById?.get(article.clusterId) : undefined
  return cluster ? cluster.sourceIds.length : 1
}

/**
 * One report per story, in the given order: the first report of each cluster
 * is kept and later ones dropped, so a widely covered event appears once.
 * On a newest-first list that keeps each story's latest report.
 */
export function onePerStory(articles: readonly Article[]): Article[] {
  const seen = new Set<string>()
  const unique: Article[] = []
  for (const article of articles) {
    if (article.clusterId) {
      if (seen.has(article.clusterId)) continue
      seen.add(article.clusterId)
    }
    unique.push(article)
  }
  return unique
}

const sourcesCache = new WeakMap<readonly Article[], ReadonlyMap<string, number>>()

/**
 * Distinct sources per story among `articles` (keyed by `storyKey`). On a topic
 * or city list this counts only the outlets that filed the story there, so a
 * loosely attached report does not inherit a big cluster's coverage. Cached on
 * the array's identity.
 */
export function storySources(articles: readonly Article[]): ReadonlyMap<string, number> {
  const cached = sourcesCache.get(articles)
  if (cached) return cached
  const sets = new Map<string, Set<string>>()
  for (const article of articles) {
    const key = storyKey(article)
    const set = sets.get(key)
    if (set) set.add(article.sourceId)
    else sets.set(key, new Set([article.sourceId]))
  }
  const counts = new Map([...sets].map(([key, set]) => [key, set.size]))
  sourcesCache.set(articles, counts)
  return counts
}
