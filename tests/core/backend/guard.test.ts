import { describe, expect, it, vi } from 'vitest'
import {
  assertPublicUrl,
  createSafeFetch,
  isPrivateAddress,
  UnsafeUrlError
} from '../../../src/core/reader/guard'

const resolveTo =
  (...addresses: string[]) =>
  async (): Promise<string[]> =>
    addresses

describe('isPrivateAddress', () => {
  it.each([
    '127.0.0.1',
    '127.255.0.9',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '0.0.0.0',
    '100.64.0.1',
    '224.0.0.1',
    '255.255.255.255',
    '::1',
    '::',
    'fc00::1',
    'fd12:3456:789a::1',
    'fe80::1',
    'fe80::1%eth0',
    'ff02::1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '::ffff:10.0.0.1',
    '64:ff9b::192.168.0.1',
    'not-an-ip'
  ])('blocks %s', (address) => {
    expect(isPrivateAddress(address)).toBe(true)
  })

  it.each([
    '8.8.8.8',
    '93.184.216.34',
    '172.32.0.1',
    '192.169.0.1',
    '100.128.0.1',
    '2606:4700:4700::1111',
    '::ffff:8.8.8.8'
  ])('allows %s', (address) => {
    expect(isPrivateAddress(address)).toBe(false)
  })
})

describe('assertPublicUrl', () => {
  it.each([
    'ftp://haber.example/dosya',
    'file:///etc/passwd',
    'javascript:alert(1)',
    'data:text/html,<p>x</p>',
    'not a url',
    'http://localhost:5173/api',
    'http://LOCALHOST./',
    'http://app.localhost/',
    'http://printer.local/',
    'http://127.0.0.1/',
    'http://[::1]:8080/',
    'http://[::ffff:127.0.0.1]/',
    'http://2130706433/',
    'http://0x7f.0.0.1/',
    'http://169.254.169.254/latest/meta-data/',
    'https://10.0.0.8/'
  ])('rejects %s', async (url) => {
    const lookup = vi.fn(resolveTo('93.184.216.34'))
    await expect(assertPublicUrl(url, lookup)).rejects.toBeInstanceOf(UnsafeUrlError)
  })

  it('accepts public hosts and IP literals without resolving literals', async () => {
    const lookup = vi.fn(resolveTo('93.184.216.34'))
    await expect(assertPublicUrl('https://haber.example/a?b=1', lookup)).resolves.toBeInstanceOf(URL)
    expect(lookup).toHaveBeenCalledWith('haber.example')
    lookup.mockClear()
    await expect(assertPublicUrl('http://93.184.216.34/', lookup)).resolves.toBeInstanceOf(URL)
    expect(lookup).not.toHaveBeenCalled()
  })

  it('rejects hosts that resolve to a private address, even among public ones', async () => {
    await expect(assertPublicUrl('https://rebind.example/', resolveTo('10.0.0.1'))).rejects.toThrow(
      /private address 10\.0\.0\.1/
    )
    await expect(
      assertPublicUrl('https://mixed.example/', resolveTo('93.184.216.34', '::1'))
    ).rejects.toBeInstanceOf(UnsafeUrlError)
    await expect(assertPublicUrl('https://nothing.example/', resolveTo())).rejects.toBeInstanceOf(
      UnsafeUrlError
    )
  })
})

describe('createSafeFetch', () => {
  const ok = (body = 'ok'): Response => new Response(body, { status: 200 })
  const redirect = (location: string, status = 302): Response =>
    new Response(null, { status, headers: { location } })

  it('follows redirects manually, checking every hop, and reports the final URL', async () => {
    const base = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      expect(init?.redirect).toBe('manual')
      const url = String(input)
      if (url === 'https://a.example/start') return redirect('/middle')
      if (url === 'https://a.example/middle') return redirect('https://b.example/end', 301)
      return ok()
    })
    const lookup = vi.fn(resolveTo('93.184.216.34'))
    const response = await createSafeFetch(base, { lookup })('https://a.example/start')
    expect(await response.text()).toBe('ok')
    expect(response.url).toBe('https://b.example/end')
    expect(base).toHaveBeenCalledTimes(3)
    expect(lookup).toHaveBeenCalledTimes(3)
  })

  it('refuses a redirect into the private network', async () => {
    const base = vi.fn(async () => redirect('http://169.254.169.254/latest/meta-data/'))
    await expect(
      createSafeFetch(base, { lookup: resolveTo('93.184.216.34') })('https://a.example/')
    ).rejects.toBeInstanceOf(UnsafeUrlError)
    expect(base).toHaveBeenCalledOnce()
  })

  it('gives up after too many redirects', async () => {
    const base = vi.fn(async () => redirect('https://a.example/loop'))
    await expect(
      createSafeFetch(base, { lookup: resolveTo('93.184.216.34'), maxRedirects: 3 })('https://a.example/loop')
    ).rejects.toThrow(/Too many redirects/)
    expect(base).toHaveBeenCalledTimes(4)
  })

  it('passes non-redirect 3xx responses through', async () => {
    const base = vi.fn(async () => new Response(null, { status: 304 }))
    const response = await createSafeFetch(base, { lookup: resolveTo('93.184.216.34') })('https://a.example/')
    expect(response.status).toBe(304)
  })
})
