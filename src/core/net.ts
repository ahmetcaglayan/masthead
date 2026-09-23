/**
 * Shared HTTP helper for the core: timeouts, size limits, conditional GET and —
 * important for Turkish sites — charset detection (windows-1254 / iso-8859-9).
 */
import iconv from 'iconv-lite'

export const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

export interface FetchTextOptions {
  timeoutMs?: number
  /** Abort when the body exceeds this many bytes (default 5 MB). */
  maxBytes?: number
  etag?: string
  lastModified?: string
  /** Charset override, wins over headers and XML/HTML declarations. */
  encoding?: string
  accept?: string
  /** `Accept-Language` for this request; defaults to the Turkish pack's preference. */
  acceptLanguage?: string
  /**
   * The 8-bit codepage to fall back to when a body claims `iso-8859-1` or turns out not to be
   * UTF-8 after all. Turkish sites mean windows-1254; everyone else means windows-1252.
   */
  legacyCharset?: string
  headers?: Record<string, string>
  fetch?: typeof fetch
}

export interface FetchTextResult {
  status: number
  ok: boolean
  /** 304 — the caller's cached copy is still current; `text` is empty. */
  notModified: boolean
  text: string
  /** Final URL after redirects. */
  url: string
  contentType: string
  etag?: string
  lastModified?: string
  headers: Headers
}

const DECLARED_CHARSET = /<\?xml[^>]*encoding=["']([\w-]+)["']|<meta[^>]+charset=["']?([\w-]+)/i

/** Pick a charset: explicit override → Content-Type header → XML/HTML declaration → utf-8. */
export function detectCharset(bytes: Uint8Array, contentType: string, override?: string): string {
  if (override) return override.toLowerCase()
  const header = /charset=["']?([\w-]+)/i.exec(contentType)?.[1]
  if (header) return header.toLowerCase()
  const head = Buffer.from(bytes.subarray(0, 2048)).toString('latin1')
  const declared = DECLARED_CHARSET.exec(head)
  return (declared?.[1] ?? declared?.[2] ?? 'utf-8').toLowerCase()
}

/**
 * Whether text decoded as UTF-8 is really windows-1254: then most of its non-ASCII characters come
 * out broken (U+FFFD). Real UTF-8 with a few bad bytes (a summary cut mid-letter by the CMS, stray
 * replacement characters in the source) keeps most of its Turkish letters and stays UTF-8.
 */
function isMisdecodedUtf8(text: string): boolean {
  let broken = 0
  let nonAscii = 0
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code < 0x80) continue
    nonAscii++
    if (code === 0xfffd) broken++
  }
  return broken > 3 && broken * 2 > nonAscii
}

/**
 * Decode bytes with the detected charset; falls back to `legacyCharset` when a body claims
 * `iso-8859-1` (Turkish and Brazilian CMSs both do, meaning different codepages) or when UTF-8
 * decoding is clearly broken.
 */
export function decodeBody(
  bytes: Uint8Array,
  contentType: string,
  override?: string,
  legacyCharset = 'windows-1254'
): string {
  let charset = detectCharset(bytes, contentType, override)
  if (charset === 'iso-8859-1' || charset === 'latin1') charset = legacyCharset
  const buffer = Buffer.from(bytes)
  let text = iconv.encodingExists(charset) ? iconv.decode(buffer, charset) : buffer.toString('utf8')
  if (!override && (charset === 'utf-8' || charset === 'utf8') && isMisdecodedUtf8(text)) {
    text = iconv.decode(buffer, legacyCharset)
  }
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

export async function fetchText(url: string, options: FetchTextOptions = {}): Promise<FetchTextResult> {
  const { timeoutMs = 15_000, maxBytes = 5 * 1024 * 1024 } = options
  const doFetch = options.fetch ?? fetch
  const headers: Record<string, string> = {
    'User-Agent': BROWSER_UA,
    Accept: options.accept ?? '*/*',
    'Accept-Language': options.acceptLanguage ?? 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    ...options.headers
  }
  if (options.etag) headers['If-None-Match'] = options.etag
  if (options.lastModified) headers['If-Modified-Since'] = options.lastModified

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error(`Timed out after ${timeoutMs} ms`)), timeoutMs)
  try {
    const res = await doFetch(url, { headers, redirect: 'follow', signal: controller.signal })
    const contentType = res.headers.get('content-type') ?? ''
    const base = {
      status: res.status,
      ok: res.ok,
      url: res.url || url,
      contentType,
      etag: res.headers.get('etag') ?? undefined,
      lastModified: res.headers.get('last-modified') ?? undefined,
      headers: res.headers
    }
    if (res.status === 304) return { ...base, ok: true, notModified: true, text: '' }

    const chunks: Uint8Array[] = []
    let size = 0
    if (res.body) {
      const reader = res.body.getReader()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > maxBytes) {
          await reader.cancel()
          throw new Error(`Response larger than ${maxBytes} bytes`)
        }
        chunks.push(value)
      }
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    return { ...base, notModified: false, text: decodeBody(bytes, contentType, options.encoding, options.legacyCharset) }
  } finally {
    clearTimeout(timer)
  }
}
