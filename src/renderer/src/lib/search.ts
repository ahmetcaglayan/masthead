import type { Article } from '@shared/types'
import { foldText } from './fold'

export { foldText }

/** A `[start, end)` range of the original text to wrap in `<mark>`. */
export type HighlightRange = readonly [start: number, end: number]

const EDGE_PUNCTUATION = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu

/**
 * Split a query into folded search terms. Words are ANDed; a "quoted phrase"
 * stays one term. Punctuation at the edges of a term is ignored.
 */
export function parseQuery(query: string): string[] {
  const terms: string[] = []
  for (const match of query.matchAll(/"([^"]+)"|(\S+)/g)) {
    const term = foldText(match[1] ?? match[2])
      .replace(EDGE_PUNCTUATION, '')
      .replace(/\s+/g, ' ')
    if (term && !terms.includes(term)) terms.push(term)
  }
  // Longer terms first, so highlighting prefers "istanbul" over "is".
  return terms.sort((a, b) => b.length - a.length)
}

interface Folded {
  title: string
  summary: string
}

const folded = new WeakMap<Article, Folded>()

function foldedOf(article: Article): Folded {
  let entry = folded.get(article)
  if (!entry) {
    entry = { title: foldText(article.title), summary: foldText(article.summary) }
    folded.set(article, entry)
  }
  return entry
}

/** Articles folded per idle slice when the browser is too busy to report idle time. */
const WARM_BATCH = 150

/**
 * Fold the articles' text for search in idle time, a slice at a time, so the
 * first query does not fold thousands of summaries in one long task. Returns a
 * function that cancels what is left.
 */
export function prepareSearch(articles: readonly Article[]): () => void {
  let i = 0
  let handle = 0
  const step = (deadline: IdleDeadline): void => {
    const end = deadline.didTimeout ? Math.min(articles.length, i + WARM_BATCH) : articles.length
    while (i < end && (deadline.didTimeout || deadline.timeRemaining() > 1)) foldedOf(articles[i++])
    if (i < articles.length) handle = requestIdleCallback(step, { timeout: 1000 })
  }
  handle = requestIdleCallback(step, { timeout: 1000 })
  return () => cancelIdleCallback(handle)
}

const isWordStart = (text: string, index: number): boolean =>
  index === 0 || !/[\p{L}\p{N}]/u.test(text[index - 1])

function atWordStart(text: string, term: string): boolean {
  for (let i = text.indexOf(term); i !== -1; i = text.indexOf(term, i + 1)) {
    if (isWordStart(text, i)) return true
  }
  return false
}

/**
 * Relevance of an article for the terms, or -1 when a term is missing. Every
 * term must appear in the title or the summary; title matches weigh most,
 * then the whole query appearing as a phrase, then matches at word starts.
 */
function relevance(article: Article, terms: readonly string[], phrase: string): number {
  const { title, summary } = foldedOf(article)
  let titleHits = 0
  let wordStarts = 0
  for (const term of terms) {
    if (title.includes(term)) {
      titleHits++
      if (atWordStart(title, term)) wordStarts++
    } else if (!summary.includes(term)) {
      return -1
    }
  }
  const phraseBonus = terms.length > 1 && title.includes(phrase) ? 2 : 0
  return titleHits * 4 + phraseBonus + (wordStarts === terms.length ? 1 : 0)
}

/**
 * Articles matching every term, most relevant first (title hits before
 * summary-only hits), newest first among equals. `terms` come from `parseQuery`.
 */
export function searchArticles(articles: readonly Article[], terms: readonly string[]): Article[] {
  if (terms.length === 0) return []
  const phrase = terms.join(' ')
  const hits: { article: Article; score: number }[] = []
  for (const article of articles) {
    const score = relevance(article, terms, phrase)
    if (score >= 0) hits.push({ article, score })
  }
  hits.sort((a, b) => b.score - a.score || b.article.publishedAt - a.article.publishedAt)
  return hits.map((h) => h.article)
}

/** Per-character folds; a text only has a few dozen distinct characters, so this stays tiny. */
const charFolds = new Map<string, string>()

function foldChar(char: string): string {
  let folded = charFolds.get(char)
  if (folded === undefined) {
    folded = foldText(char)
    charFolds.set(char, folded)
  }
  return folded
}

/**
 * Where the terms occur in `text`, as merged ranges of the ORIGINAL string
 * (folding can change lengths, so matching runs on a per-character fold that
 * remembers where every folded character came from).
 */
export function highlightRanges(text: string, terms: readonly string[]): HighlightRange[] {
  if (terms.length === 0 || !text) return []
  let foldedText = ''
  const starts: number[] = []
  const ends: number[] = []
  let index = 0
  for (const char of text) {
    const f = foldChar(char)
    if (f.length === 0 && ends.length > 0) {
      ends[ends.length - 1] = index + char.length // a stray combining mark joins the previous letter
    }
    for (let k = 0; k < f.length; k++) {
      starts.push(index)
      ends.push(index + char.length)
    }
    foldedText += f
    index += char.length
  }

  const raw: [number, number][] = []
  for (const term of terms) {
    for (let i = foldedText.indexOf(term); i !== -1; i = foldedText.indexOf(term, i + term.length)) {
      raw.push([starts[i], ends[i + term.length - 1]])
    }
  }
  raw.sort((a, b) => a[0] - b[0])

  const merged: [number, number][] = []
  for (const [start, end] of raw) {
    const last = merged[merged.length - 1]
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }
  return merged
}
