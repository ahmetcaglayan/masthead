import { describe, expect, it } from 'vitest'
import { httpSrcset, httpUrl } from '../../src/renderer/src/features/reader/urls'

describe('httpUrl', () => {
  it('keeps absolute http(s) URLs only', () => {
    expect(httpUrl(' https://ok.example/a b.jpg ')).toBe('https://ok.example/a%20b.jpg')
    expect(httpUrl('http://ok.example/')).toBe('http://ok.example/')
    for (const value of ['//evil.example/a.jpg', '/a.jpg', 'a.jpg', 'file://evil.example/share/a.jpg']) {
      expect(httpUrl(value)).toBeNull()
    }
    expect(httpUrl('javascript:alert(1)')).toBeNull()
    expect(httpUrl(null)).toBeNull()
  })
})

describe('httpSrcset', () => {
  it('drops protocol-relative, relative and non-http candidates', () => {
    expect(httpSrcset('//evil.example/share/a.jpg')).toBeNull()
    expect(httpSrcset('//evil.example/share/a.jpg 1x')).toBeNull()
    expect(httpSrcset('/a.jpg 1x, a-2.jpg 2x')).toBeNull()
    expect(httpSrcset('file://evil.example/share/a.jpg 1x')).toBeNull()
    expect(httpSrcset('javascript:alert(1) 1x')).toBeNull()
    expect(httpSrcset('')).toBeNull()
    expect(httpSrcset(null)).toBeNull()
  })

  it('checks every candidate, not just the first', () => {
    expect(httpSrcset('https://ok.example/a.jpg 1x, //evil.example/b.jpg 2x')).toBe(
      'https://ok.example/a.jpg 1x'
    )
    expect(httpSrcset('//evil.example/b.jpg 1x, https://ok.example/a.jpg 2x')).toBe(
      'https://ok.example/a.jpg 2x'
    )
  })

  it('keeps valid candidates, commas inside URLs included', () => {
    expect(
      httpSrcset('https://cdn.example/w_400,h_300/a.jpg 400w,https://cdn.example/w_800,h_600/a.jpg  800w')
    ).toBe('https://cdn.example/w_400,h_300/a.jpg 400w, https://cdn.example/w_800,h_600/a.jpg 800w')
    expect(httpSrcset('https://ok.example/a.jpg, https://ok.example/b.jpg 1.5x')).toBe(
      'https://ok.example/a.jpg, https://ok.example/b.jpg 1.5x'
    )
  })

  it('drops a candidate with a descriptor browsers would reject', () => {
    expect(httpSrcset('https://ok.example/a.jpg big, https://ok.example/b.jpg 2x')).toBe(
      'https://ok.example/b.jpg 2x'
    )
  })
})
