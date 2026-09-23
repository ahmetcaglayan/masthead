import { describe, expect, it, vi } from 'vitest'
import { createProbe, isFrameable, probeFrameable } from '../../../src/core/reader/probe'

const lookup = async (): Promise<string[]> => ['93.184.216.34']

function page(headers: Record<string, string> = {}, status = 200): Response {
  return new Response('<html></html>', { status, headers: { 'content-type': 'text/html', ...headers } })
}

describe('isFrameable', () => {
  it.each<[Record<string, string>, boolean]>([
    [{}, true],
    [{ 'x-frame-options': 'DENY' }, false],
    [{ 'x-frame-options': 'sameorigin' }, false],
    [{ 'x-frame-options': 'SAMEORIGIN, SAMEORIGIN' }, false],
    [{ 'x-frame-options': 'ALLOW-FROM https://a.example' }, true],
    [{ 'content-security-policy': "default-src 'self'; frame-ancestors 'none'" }, false],
    [{ 'content-security-policy': "frame-ancestors 'self' https://*.example.com" }, false],
    [{ 'content-security-policy': 'frame-ancestors *' }, true],
    [{ 'content-security-policy': 'upgrade-insecure-requests; img-src *' }, true],
    // frame-ancestors, when present, overrides X-Frame-Options.
    [{ 'content-security-policy': 'frame-ancestors *', 'x-frame-options': 'DENY' }, true],
    [{ 'content-security-policy': "img-src 'self'", 'x-frame-options': 'DENY' }, false],
    // Every enforced policy must allow it.
    [{ 'content-security-policy': "frame-ancestors *, frame-ancestors 'self'" }, false],
    // Report-only policies are not enforced.
    [{ 'content-security-policy-report-only': "frame-ancestors 'none'" }, true]
  ])('%j → %s', (headers, expected) => {
    expect(isFrameable(new Headers(headers))).toBe(expected)
  })
})

describe('probeFrameable', () => {
  it('reports the verdict and the final URL after redirects', async () => {
    const fetch = vi.fn(async (input: string | URL | Request) =>
      String(input) === 'http://haber.example/a'
        ? new Response(null, { status: 301, headers: { location: 'https://haber.example/a' } })
        : page({ 'x-frame-options': 'DENY' })
    )
    await expect(probeFrameable('http://haber.example/a', { fetch, lookup })).resolves.toEqual({
      frameable: false,
      finalUrl: 'https://haber.example/a'
    })
  })

  it('treats error statuses, network failures and unsafe URLs as not frameable', async () => {
    await expect(
      probeFrameable('https://haber.example/a', { fetch: async () => page({}, 503), lookup })
    ).resolves.toEqual({
      frameable: false,
      finalUrl: 'https://haber.example/a'
    })
    const failing = vi.fn(async () => {
      throw new TypeError('fetch failed')
    })
    await expect(probeFrameable('https://haber.example/b', { fetch: failing, lookup })).resolves.toEqual({
      frameable: false,
      finalUrl: 'https://haber.example/b'
    })
    await expect(probeFrameable('http://192.168.0.1/', { fetch: failing })).resolves.toEqual({
      frameable: false,
      finalUrl: 'http://192.168.0.1/'
    })
    expect(failing).toHaveBeenCalledOnce()
  })

  it('times out slow servers', async () => {
    const hanging = (_input: string | URL | Request, init?: RequestInit): Promise<Response> =>
      new Promise((_resolve, reject) =>
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
      )
    await expect(
      probeFrameable('https://slow.example/', { fetch: hanging, lookup, timeoutMs: 20 })
    ).resolves.toEqual({
      frameable: false,
      finalUrl: 'https://slow.example/'
    })
  })
})

describe('createProbe', () => {
  it('caches the verdict per host for an hour', async () => {
    let clock = 0
    const fetch = vi.fn(async () => page())
    const probe = createProbe({ fetch, lookup, now: () => clock })

    await expect(probe('https://haber.example/1')).resolves.toEqual({
      frameable: true,
      finalUrl: 'https://haber.example/1'
    })
    await expect(probe('https://haber.example/2')).resolves.toEqual({
      frameable: true,
      finalUrl: 'https://haber.example/2'
    })
    expect(fetch).toHaveBeenCalledOnce()

    await probe('https://baska.example/1')
    expect(fetch).toHaveBeenCalledTimes(2)

    clock = 60 * 60 * 1000 + 1
    await probe('https://haber.example/3')
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('does not cache failures', async () => {
    const fetch = vi.fn(async () => page({}, 500))
    const probe = createProbe({ fetch, lookup })
    await probe('https://haber.example/1')
    await probe('https://haber.example/2')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('caches under the host that answered, not the redirector', async () => {
    const fetch = vi.fn(async (input: string | URL | Request) =>
      String(input).startsWith('https://yonlendir.example/')
        ? new Response(null, { status: 302, headers: { location: 'https://yayinci.example/haber' } })
        : page({ 'x-frame-options': 'DENY' })
    )
    const probe = createProbe({ fetch, lookup })
    await expect(probe('https://yonlendir.example/1')).resolves.toEqual({
      frameable: false,
      finalUrl: 'https://yayinci.example/haber'
    })
    await probe('https://yonlendir.example/2')
    expect(fetch).toHaveBeenCalledTimes(4)
    await probe('https://yayinci.example/baska-haber')
    expect(fetch).toHaveBeenCalledTimes(4)
  })
})
