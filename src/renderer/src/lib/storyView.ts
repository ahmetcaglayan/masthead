import type { Article, StoryCluster } from '@shared/types'
import { pickLead } from './curation'

/** One outlet's part in a story: its latest report, and when it first reported the story. */
export interface StoryReport {
  article: Article
  /** The outlet's first report of the story (epoch ms). */
  firstAt: number
}

/** Everything the story page shows about one clustered event. */
export interface StoryView {
  cluster: StoryCluster
  /** The report the page leads with (see `pickLead`). */
  lead: Article
  /** One per outlet, the outlet that reported first first. */
  reports: StoryReport[]
  /** When the first outlet reported it, and the newest report (epoch ms). */
  firstAt: number
  updatedAt: number
}

/**
 * The story behind a cluster, limited to the reports `include` accepts (enabled sources,
 * nothing muted): one entry per outlet with its latest headline, ordered by who reported
 * first. Null when no report is left.
 */
export function buildStoryView(
  cluster: StoryCluster,
  byId: ReadonlyMap<string, Article>,
  include: (article: Article) => boolean,
  now: number
): StoryView | null {
  const bySource = new Map<string, StoryReport>()
  const members: Article[] = []
  for (const id of cluster.articleIds) {
    const article = byId.get(id)
    if (!article || !include(article)) continue
    members.push(article)
    const current = bySource.get(article.sourceId)
    if (!current) {
      bySource.set(article.sourceId, { article, firstAt: article.publishedAt })
      continue
    }
    if (article.publishedAt > current.article.publishedAt) current.article = article
    current.firstAt = Math.min(current.firstAt, article.publishedAt)
  }
  if (members.length === 0) return null
  const reports = [...bySource.values()].sort(
    (a, b) => a.firstAt - b.firstAt || a.article.sourceId.localeCompare(b.article.sourceId)
  )
  return {
    cluster,
    lead: pickLead(members, now),
    reports,
    firstAt: reports[0].firstAt,
    updatedAt: Math.max(...members.map((a) => a.publishedAt))
  }
}
