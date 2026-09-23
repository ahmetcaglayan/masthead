import { join } from 'node:path'
import { isCategoryId } from '../../shared/categories'
import type { Article, HistoryEntry, Library, SavedArticle } from '../../shared/types'
import { JsonFile } from './json-file'
import type { StoreOptions } from './settings-store'

/** Most saved articles kept; saving more drops the oldest. */
export const SAVED_LIMIT = 1000
/** Most history entries kept. */
export const HISTORY_LIMIT = 500

export type LibraryListener = (library: Library) => void

export interface LibraryStoreOptions extends StoreOptions {
  /** Injectable clock for `savedAt` / `readAt`. */
  now?: () => number
}

/** Saved articles and reading history in `<dataDir>/library.json`, both newest first. */
export class LibraryStore {
  private readonly listeners = new Set<LibraryListener>()

  private constructor(
    private readonly file: JsonFile<Library>,
    private current: Library,
    private readonly options: LibraryStoreOptions
  ) {}

  static async open(dataDir: string, options: LibraryStoreOptions = {}): Promise<LibraryStore> {
    const file = new JsonFile<Library>(join(dataDir, 'library.json'), options)
    const library = await file.load({ saved: [], history: [] }, validateLibrary)
    return new LibraryStore(file, library, options)
  }

  get(): Library {
    return this.current
  }

  isSaved(articleId: string): boolean {
    return this.current.saved.some((entry) => entry.article.id === articleId)
  }

  /** Save the article, or unsave it if it is already saved. */
  toggleSave(input: Article): Library {
    const article = normalizeArticle(input)
    if (!article) return this.current
    const { saved } = this.current
    const next = this.isSaved(article.id)
      ? saved.filter((entry) => entry.article.id !== article.id)
      : [{ article, savedAt: this.now() }, ...saved].slice(0, SAVED_LIMIT)
    return this.commit({ ...this.current, saved: next })
  }

  /** Record a read; re-reading moves the article back to the top. */
  markRead(input: Article): Library {
    const article = normalizeArticle(input)
    if (!article) return this.current
    const history = [
      { article, readAt: this.now() },
      ...this.current.history.filter((entry) => entry.article.id !== article.id)
    ].slice(0, HISTORY_LIMIT)
    return this.commit({ ...this.current, history })
  }

  clearHistory(): Library {
    if (this.current.history.length === 0) return this.current
    return this.commit({ ...this.current, history: [] })
  }

  /** Called after every change. Returns an unsubscribe function. */
  onChange(listener: LibraryListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  flush(): Promise<void> {
    return this.file.flush()
  }

  private now(): number {
    return (this.options.now ?? Date.now)()
  }

  private commit(next: Library): Library {
    this.current = next
    this.file.save(next)
    for (const listener of this.listeners) {
      try {
        listener(next)
      } catch (error) {
        this.options.logger?.error('Library listener failed', error)
      }
    }
    return next
  }
}

function validateLibrary(raw: unknown): Library {
  if (!isRecord(raw)) throw new Error('Library file is not a JSON object')
  return {
    saved: readEntries(raw.saved, 'savedAt', SAVED_LIMIT).map(({ article, at }): SavedArticle => ({
      article,
      savedAt: at
    })),
    history: readEntries(raw.history, 'readAt', HISTORY_LIMIT).map(({ article, at }): HistoryEntry => ({
      article,
      readAt: at
    }))
  }
}

/** Valid entries, newest first, one per article id, capped at `limit`. */
function readEntries(
  raw: unknown,
  key: 'savedAt' | 'readAt',
  limit: number
): { article: Article; at: number }[] {
  if (!Array.isArray(raw)) return []
  const entries: { article: Article; at: number }[] = []
  for (const item of raw) {
    if (!isRecord(item)) continue
    const article = normalizeArticle(item.article)
    const at = finite(item[key])
    if (article && at !== undefined) entries.push({ article, at })
  }
  entries.sort((a, b) => b.at - a.at)
  const seen = new Set<string>()
  const unique = entries.filter(({ article }) => {
    if (seen.has(article.id)) return false
    seen.add(article.id)
    return true
  })
  return unique.slice(0, limit)
}

/**
 * Keep only the known, well-typed fields of an article coming from disk or the UI.
 * Returns null when the identifying fields are missing.
 */
export function normalizeArticle(raw: unknown): Article | null {
  if (!isRecord(raw)) return null
  const { id, url, title, sourceId } = raw
  if (!nonEmpty(id) || !nonEmpty(url) || typeof title !== 'string' || !nonEmpty(sourceId)) return null
  const publishedAt = finite(raw.publishedAt) ?? finite(raw.fetchedAt) ?? 0
  const article: Article = {
    id,
    url,
    title,
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    hasDetail: raw.hasDetail === true,
    publishedAt,
    fetchedAt: finite(raw.fetchedAt) ?? publishedAt,
    sourceId,
    categories: Array.isArray(raw.categories) ? raw.categories.filter(isCategoryId) : [],
    isBreaking: raw.isBreaking === true,
    isHeadline: raw.isHeadline === true,
    provinces: strings(raw.provinces),
    regions: strings(raw.regions)
  }
  if (nonEmpty(raw.image)) article.image = raw.image
  if (nonEmpty(raw.author)) article.author = raw.author
  return article
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function finite(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}
