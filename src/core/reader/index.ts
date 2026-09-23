import type { ReaderProbe } from '../../shared/ipc'
import type { ReaderContent } from '../../shared/types'
import type { Logger } from '../backend'
import { describeError } from '../log'
import { extractArticle } from './extract'
import type { HostLookup } from './guard'
import { LruCache } from './lru'
import { createProbe } from './probe'

export { extractArticle, extractFromHtml, MIN_TEXT_LENGTH } from './extract'
export { assertPublicUrl, createSafeFetch, isPrivateAddress, UnsafeUrlError, type HostLookup } from './guard'
export { createProbe, isFrameable, probeFrameable } from './probe'

/** Extracted articles kept in memory. */
export const EXTRACT_CACHE_SIZE = 50

export interface ReaderServiceOptions {
  fetch?: typeof fetch
  logger?: Logger
  now?: () => number
  lookup?: HostLookup
}

export interface ReaderService {
  /** Readable article, or null when it cannot be extracted (failures are logged, never thrown). */
  extract(url: string): Promise<ReaderContent | null>
  probe(url: string): Promise<ReaderProbe>
}

/** Reader extraction with an LRU of recent articles (concurrent requests share one fetch) and cached frame probes. */
export function createReaderService(options: ReaderServiceOptions = {}): ReaderService {
  const { fetch: fetchImpl, logger, lookup } = options
  const extracted = new LruCache<string, Promise<ReaderContent | null>>(EXTRACT_CACHE_SIZE)
  const probe = createProbe({ fetch: fetchImpl, lookup, now: options.now })

  return {
    extract(url) {
      const key = url.replace(/#.*$/, '')
      const cached = extracted.get(key)
      if (cached) return cached
      const task = extractArticle(url, { fetch: fetchImpl, lookup })
        .catch((error: unknown) => {
          logger?.warn(`Extraction failed for ${url}: ${describeError(error)}`)
          return null
        })
        .then((content) => {
          // Only successes are worth remembering; failures may be transient.
          if (!content && extracted.get(key) === task) extracted.delete(key)
          return content
        })
      extracted.set(key, task)
      return task
    },
    probe
  }
}
