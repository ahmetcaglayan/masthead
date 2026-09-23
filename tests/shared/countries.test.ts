import { describe, expect, it } from 'vitest'
import { isCategoryId } from '../../src/shared/categories'
import { COUNTRY_OPTIONS, getCountryPack, hasLocalNews } from '../../src/shared/countries/index'
import type { CountryPack } from '../../src/shared/countries/types'

const packs: CountryPack[] = COUNTRY_OPTIONS.filter((o) => o.available).map(
  (o) => getCountryPack(o.code) as CountryPack
)

describe('country packs', () => {
  it('ships a pack for every country offered as available', () => {
    expect(packs).toHaveLength(COUNTRY_OPTIONS.filter((o) => o.available).length)
    expect(packs.map((p) => p.code)).toEqual(['tr', 'us', 'in', 'gb', 'de', 'br'])
  })

  it.each(packs.map((pack) => [pack.code, pack] as const))('%s: source ids are unique', (_code, pack) => {
    const ids = pack.sources.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(packs.map((pack) => [pack.code, pack] as const))('%s: feed urls are unique', (_code, pack) => {
    const urls = pack.sources.flatMap((s) => s.feeds.map((f) => f.url))
    expect(new Set(urls).size).toBe(urls.length)
  })

  it.each(packs.map((pack) => [pack.code, pack] as const))(
    '%s: every feed has an https url and a known category',
    (_code, pack) => {
      for (const source of pack.sources) {
        expect(source.feeds.length, `${source.id} has no feed`).toBeGreaterThan(0)
        for (const feed of source.feeds) {
          expect(feed.url, `${source.id}: ${feed.url}`).toMatch(/^https:\/\//)
          expect(isCategoryId(feed.category), `${source.id}: ${feed.category}`).toBe(true)
        }
      }
    }
  )

  it.each(packs.map((pack) => [pack.code, pack] as const))(
    '%s: has front-page feeds and sources that are on by default',
    (_code, pack) => {
      const enabled = pack.sources.filter((s) => s.defaultEnabled !== false)
      expect(enabled.length).toBeGreaterThanOrEqual(5)
      const headlines = pack.sources.flatMap((s) => s.feeds.filter((f) => f.headline))
      expect(headlines.length).toBeGreaterThan(0)
    }
  )

  it.each(packs.map((pack) => [pack.code, pack] as const))(
    '%s: source language matches the pack and the locale starts with it',
    (_code, pack) => {
      expect(pack.locale.startsWith(pack.language)).toBe(true)
      const foreign = pack.sources.filter((s) => s.language !== pack.language)
      expect(foreign.map((s) => s.id)).toEqual([])
    }
  )

  it('only claims local news where the pack ships provinces', () => {
    for (const pack of packs) {
      expect(hasLocalNews(pack.code)).toBe(pack.provinces.length > 0)
      // A province feed only makes sense when that province exists in the pack.
      const codes = new Set(pack.provinces.map((p) => p.code))
      for (const source of pack.sources)
        for (const feed of source.feeds)
          if (feed.province) expect(codes.has(feed.province), `${source.id}: ${feed.province}`).toBe(true)
    }
  })
})
