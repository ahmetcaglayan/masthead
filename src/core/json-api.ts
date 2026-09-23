/** Small helpers for the free JSON services behind the weather card and the markets page. */
import type { Logger } from './backend'
import { fetchText } from './net'

/** A failed lookup is not tried again sooner than this. */
const FAILURE_TTL = 5 * 60_000

export const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export async function fetchJson<T>(url: string, fetchImpl?: typeof fetch): Promise<T> {
  const res = await fetchText(url, { accept: 'application/json', timeoutMs: 10_000, fetch: fetchImpl })
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`)
  return JSON.parse(res.text) as T
}

/** `load`, with a failure logged and turned into null. */
export function orNull<T>(
  what: string,
  logger: Logger,
  load: () => Promise<T | null>
): () => Promise<T | null> {
  return async () => {
    try {
      return await load()
    } catch (error) {
      logger.warn(`${what} unavailable`, error)
      return null
    }
  }
}

/** Keeps results for a while and shares one request between callers asking at the same time. */
export class Cache<T> {
  private readonly entries = new Map<string, { value: T | null; until: number }>()
  private readonly pending = new Map<string, Promise<T | null>>()

  constructor(
    private readonly now: () => number,
    private readonly ttl: number
  ) {}

  get(key: string, load: () => Promise<T | null>): Promise<T | null> {
    const entry = this.entries.get(key)
    if (entry && entry.until > this.now()) return Promise.resolve(entry.value)
    let promise = this.pending.get(key)
    if (!promise) {
      promise = load()
        .then((value) => {
          this.entries.set(key, { value, until: this.now() + (value === null ? FAILURE_TTL : this.ttl) })
          return value
        })
        .finally(() => this.pending.delete(key))
      this.pending.set(key, promise)
    }
    return promise
  }
}
