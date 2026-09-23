import { keywordMatcher, type WatchItem } from '@shared/markets'
import type { Article } from '@shared/types'
import { foldText } from './fold'

/** What the markets page shows from the news, worked out from the enabled sources' articles. */
export interface MarketsNews {
  /** Economy and business stories and every story about a watched item, newest first. */
  feed: Article[]
  /** Stories about each watched item (by id), newest first. */
  byItem: ReadonlyMap<string, Article[]>
  /** The watched items each story is about (by article id). */
  tags: ReadonlyMap<string, string[]>
}

/** Folding every headline and summary is the costly part; stories repeat across snapshots. */
const folded = new Map<string, string>()
const FOLDED_MAX = 20_000

function foldedText(article: Article): string {
  let text = folded.get(article.id)
  if (text === undefined) {
    if (folded.size >= FOLDED_MAX) folded.clear()
    text = foldText(`${article.title}\n${article.summary}`)
    folded.set(article.id, text)
  }
  return text
}

/**
 * The markets news: every economy story or story from a business outlet, plus any story
 * that names a watched company or market. Currencies, metals and crypto are only looked for
 * in economy and business stories — "dollar" and "gold" turn up in sport and culture too.
 * `articles` must be newest first.
 */
export function marketsNews(
  articles: readonly Article[],
  items: readonly WatchItem[],
  isBusinessSource: (sourceId: string) => boolean
): MarketsNews {
  const matchers = items.flatMap((item) => {
    const matches = keywordMatcher(item.keywords)
    return matches ? [{ item, matches }] : []
  })
  const feed: Article[] = []
  const byItem = new Map<string, Article[]>(items.map((item) => [item.id, []]))
  const tags = new Map<string, string[]>()
  for (const article of articles) {
    const economic = article.categories.includes('economy') || isBusinessSource(article.sourceId)
    const text = foldedText(article)
    const found: string[] = []
    for (const { item, matches } of matchers) {
      if ((economic || item.kind === 'equity') && matches(text)) {
        found.push(item.id)
        byItem.get(item.id)?.push(article)
      }
    }
    if (found.length > 0) tags.set(article.id, found)
    if (economic || found.length > 0) feed.push(article)
  }
  return { feed, byItem, tags }
}
