import { foldText } from './fold'
import type { Article } from './types'

/** How many words a user can mute, and how long one may be. */
export const MAX_MUTED_KEYWORDS = 200
export const MAX_MUTED_LENGTH = 60

/**
 * Words this long or longer also hide their inflected forms: "deprem" hides
 * "depremde" and "depremin", "election" hides "elections". Shorter ones only
 * match whole words, so "war" does not hide "warning".
 */
const PREFIX_MIN = 4

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The user's list, tidied: trimmed, collapsed spaces, no empties, no duplicates (as folded), capped. */
export function cleanMutedKeywords(list: readonly unknown[]): string[] {
  const seen = new Set<string>()
  const clean: string[] = []
  for (const item of list) {
    if (typeof item !== 'string') continue
    const word = item.trim().replace(/\s+/g, ' ').slice(0, MAX_MUTED_LENGTH)
    const key = foldText(word)
    if (!key || seen.has(key)) continue
    seen.add(key)
    clean.push(word)
    if (clean.length >= MAX_MUTED_KEYWORDS) break
  }
  return clean
}

export type MuteMatcher = (article: Pick<Article, 'title' | 'summary'>) => boolean

/**
 * A test for articles that mention any muted word in their headline or summary,
 * or null when nothing is muted. Case, Turkish characters and accents do not
 * matter; a phrase matches with any spacing between its words.
 */
export function createMuteMatcher(keywords: readonly string[]): MuteMatcher | null {
  const parts = keywords
    .map((word) => foldText(word).trim())
    .filter(Boolean)
    .map((word) => {
      const words = word.split(/\s+/)
      const body = words.map(escape).join('\\s+')
      const last = words[words.length - 1]
      return last.length >= PREFIX_MIN ? body : `${body}(?![\\p{L}\\p{N}])`
    })
  if (parts.length === 0) return null
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${parts.join('|')})`, 'u')
  return (article) => pattern.test(foldText(`${article.title}\n${article.summary}`))
}

let cached: { key: string; matcher: MuteMatcher | null } | null = null

/**
 * `createMuteMatcher` for the current list, reused while the list's contents stay the
 * same (settings arrive as fresh arrays after every change, even unrelated ones).
 */
export function muteMatcherFor(keywords: readonly string[]): MuteMatcher | null {
  const key = keywords.join('\n')
  if (cached?.key !== key) cached = { key, matcher: createMuteMatcher(keywords) }
  return cached.matcher
}
