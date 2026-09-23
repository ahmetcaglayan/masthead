/**
 * SSRF guard for fetches made on behalf of the UI (reader extraction, frame probing):
 * only http(s), and never to loopback, private, link-local or `.local` hosts —
 * including hosts that merely resolve to such addresses, and redirect targets.
 */
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

/** Resolves a hostname to all of its IP addresses. */
export type HostLookup = (hostname: string) => Promise<string[]>

export class UnsafeUrlError extends Error {
  constructor(url: string, reason: string) {
    super(`Refusing to fetch ${url}: ${reason}`)
    this.name = 'UnsafeUrlError'
  }
}

const systemLookup: HostLookup = async (hostname) =>
  (await lookup(hostname, { all: true, verbatim: true })).map((entry) => entry.address)

/** Throws `UnsafeUrlError` unless `url` is http(s) and every address its host resolves to is public. */
export async function assertPublicUrl(url: string, resolve: HostLookup = systemLookup): Promise<URL> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new UnsafeUrlError(url, 'not a valid URL')
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new UnsafeUrlError(url, `${parsed.protocol} is not allowed`)
  }
  const host = parsed.hostname
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
    .toLowerCase()
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    throw new UnsafeUrlError(url, 'local host')
  }
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new UnsafeUrlError(url, 'private address')
    return parsed
  }
  const addresses = await resolve(host)
  if (addresses.length === 0) throw new UnsafeUrlError(url, 'host did not resolve')
  const blocked = addresses.find(isPrivateAddress)
  if (blocked) throw new UnsafeUrlError(url, `host resolves to private address ${blocked}`)
  return parsed
}

/** True for loopback, private, link-local, unspecified, CGNAT, multicast and reserved addresses (and non-IPs). */
export function isPrivateAddress(address: string): boolean {
  const version = isIP(address)
  if (version === 4) return isPrivateV4(address.split('.').map(Number))
  if (version === 6) return isPrivateV6(address)
  return true
}

function isPrivateV4([a, b]: number[]): boolean {
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

function isPrivateV6(address: string): boolean {
  const words = expandV6(address)
  if (!words) return true
  const [w0, w1, w2, w3, w4, w5, w6, w7] = words
  const upperZero = w0 === 0 && w1 === 0 && w2 === 0 && w3 === 0 && w4 === 0
  if (upperZero && w5 === 0 && w6 === 0 && (w7 === 0 || w7 === 1)) return true // :: and ::1
  // IPv4-mapped (::ffff:a.b.c.d) and NAT64 (64:ff9b::a.b.c.d) carry an IPv4 address in the last 32 bits.
  const embedsV4 = (upperZero && w5 === 0xffff) || (w0 === 0x64 && w1 === 0xff9b && !w2 && !w3 && !w4 && !w5)
  if (embedsV4) return isPrivateV4([w6 >> 8, w6 & 0xff])
  return (
    (w0 & 0xfe00) === 0xfc00 || // fc00::/7 unique local
    (w0 & 0xffc0) === 0xfe80 || // fe80::/10 link-local
    (w0 & 0xff00) === 0xff00 // ff00::/8 multicast
  )
}

/** Expand an IPv6 address (with optional embedded IPv4 and zone id) into eight 16-bit words. */
function expandV6(address: string): number[] | undefined {
  let text = address.toLowerCase().replace(/%.*$/, '')
  const v4 = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(text)
  if (v4) {
    const [a, b, c, d] = v4.slice(1).map(Number)
    text = `${text.slice(0, v4.index)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`
  }
  const [head, tail] = text.split('::')
  const parse = (part: string | undefined): number[] =>
    part ? part.split(':').map((word) => Number.parseInt(word, 16)) : []
  const left = parse(head)
  const right = parse(tail)
  const words =
    tail === undefined ? left : [...left, ...Array(8 - left.length - right.length).fill(0), ...right]
  return words.length === 8 && words.every((word) => Number.isInteger(word) && word >= 0 && word <= 0xffff)
    ? words
    : undefined
}

export interface SafeFetchOptions {
  lookup?: HostLookup
  /** Default 5. */
  maxRedirects?: number
}

/**
 * Wrap a fetch so that the initial URL and every redirect hop pass `assertPublicUrl`.
 * Redirects are followed manually; the returned response's `url` is the final URL.
 */
export function createSafeFetch(baseFetch: typeof fetch, options: SafeFetchOptions = {}): typeof fetch {
  const { lookup: resolve = systemLookup, maxRedirects = 5 } = options
  return async (input, init) => {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    for (let hop = 0; ; hop++) {
      await assertPublicUrl(url, resolve)
      const response = await baseFetch(url, { ...init, redirect: 'manual' })
      const location =
        response.status >= 300 && response.status < 400 ? response.headers.get('location') : null
      if (response.type === 'opaqueredirect') throw new Error(`Cannot follow the redirect from ${url}`)
      if (!location) {
        // Responses built by hand (tests, some fetch shims) have no url; report the one we requested.
        if (!response.url) Object.defineProperty(response, 'url', { value: url })
        return response
      }
      await response.body?.cancel().catch(() => undefined)
      if (hop >= maxRedirects) throw new Error(`Too many redirects from ${url}`)
      url = new URL(location, url).href
    }
  }
}
