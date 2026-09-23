import type { ReaderProbe } from '../../shared/ipc'
import { BROWSER_UA } from '../net'
import { createSafeFetch, type HostLookup } from './guard'

export interface ProbeOptions {
  fetch?: typeof fetch
  lookup?: HostLookup
  /** Default 8 s. */
  timeoutMs?: number
}

export interface CachedProbeOptions extends ProbeOptions {
  now?: () => number
  /** How long a verdict is reused for other pages of the same host. Default 1 h. */
  ttlMs?: number
}

interface Inspection extends ReaderProbe {
  /** The verdict reflects the site's headers (not a network error or error status), so it may be cached. */
  conclusive: boolean
}

const MAX_CACHED_HOSTS = 500

/**
 * Whether a response may be shown inside an iframe. `Content-Security-Policy: frame-ancestors`
 * wins when present (framable only with `*`); otherwise `X-Frame-Options: DENY | SAMEORIGIN` blocks.
 */
export function isFrameable(headers: Headers): boolean {
  const csp = headers.get('content-security-policy')
  if (csp) {
    const ancestors = csp
      .split(/[,;]/)
      .map((directive) => directive.trim().toLowerCase().split(/\s+/))
      .filter(([name]) => name === 'frame-ancestors')
    if (ancestors.length > 0) return ancestors.every(([, ...sources]) => sources.includes('*'))
  }
  const xfo = headers.get('x-frame-options')?.toLowerCase() ?? ''
  return !xfo.split(',').some((value) => ['deny', 'sameorigin'].includes(value.trim()))
}

/** Fetch the page (headers only) and decide whether it can be framed. Never throws. */
export async function probeFrameable(url: string, options: ProbeOptions = {}): Promise<ReaderProbe> {
  const { frameable, finalUrl } = await inspect(url, options)
  return { frameable, finalUrl }
}

/** `probeFrameable` with a per-host verdict cache (1 h by default); errors are not cached. */
export function createProbe(options: CachedProbeOptions = {}): (url: string) => Promise<ReaderProbe> {
  const { now = Date.now, ttlMs = 60 * 60 * 1000 } = options
  const cache = new Map<string, { frameable: boolean; expires: number }>()

  return async (url) => {
    const host = hostOf(url)
    const hit = host ? cache.get(host) : undefined
    if (hit && hit.expires > now()) return { frameable: hit.frameable, finalUrl: url }

    const { frameable, finalUrl, conclusive } = await inspect(url, options)
    // Keyed by the host that answered, so a redirector (e.g. a news aggregator) never caches
    // one publisher's verdict for the next article.
    const finalHost = hostOf(finalUrl)
    if (conclusive && finalHost) {
      cache.delete(finalHost)
      cache.set(finalHost, { frameable, expires: now() + ttlMs })
      if (cache.size > MAX_CACHED_HOSTS) cache.delete(cache.keys().next().value as string)
    }
    return { frameable, finalUrl }
  }
}

async function inspect(url: string, options: ProbeOptions): Promise<Inspection> {
  const safeFetch = createSafeFetch(options.fetch ?? ((input, init) => fetch(input, init)), {
    lookup: options.lookup
  })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000)
  try {
    const response = await safeFetch(url, {
      headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8' },
      signal: controller.signal
    })
    await response.body?.cancel().catch(() => undefined)
    const finalUrl = response.url || url
    if (!response.ok) return { frameable: false, finalUrl, conclusive: false }
    return { frameable: isFrameable(response.headers), finalUrl, conclusive: true }
  } catch {
    return { frameable: false, finalUrl: url, conclusive: false }
  } finally {
    clearTimeout(timer)
  }
}

function hostOf(url: string): string | undefined {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return undefined
  }
}
