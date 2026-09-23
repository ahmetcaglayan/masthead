import { describe, expect, it } from 'vitest'
import { cleanMutedKeywords, createMuteMatcher, muteMatcherFor } from '../../src/shared/mute'
import { DEFAULT_SETTINGS, mergeSettings } from '../../src/shared/settings'

const story = (title: string, summary = '') => ({ title, summary })

describe('createMuteMatcher', () => {
  it('ignores case, Turkish characters and accents, and hides inflected forms of longer words', () => {
    const isMuted = createMuteMatcher(['seçim', 'Deprem'])!
    expect(isMuted(story('SEÇİMDE son durum'))).toBe(true)
    expect(isMuted(story('Yerel secimi kim kazandi?'))).toBe(true)
    expect(isMuted(story('Ege’de depremin ardından'))).toBe(true)
    expect(isMuted(story('Ekonomide son durum', 'Merkez Bankası faizi sabit tuttu.'))).toBe(false)
  })

  it('matches from the start of a word only', () => {
    const isMuted = createMuteMatcher(['adam'])!
    expect(isMuted(story('Madam Tussauds yeni figür'))).toBe(false)
    expect(isMuted(story('Adama saldırı'))).toBe(true)
  })

  it('keeps short words whole, so "war" does not hide "warning"', () => {
    const isMuted = createMuteMatcher(['war', 'AI'])!
    expect(isMuted(story('Storm warning for the coast'))).toBe(false)
    expect(isMuted(story('The war in the east'))).toBe(true)
    expect(isMuted(story('AI chips'))).toBe(true)
    expect(isMuted(story('Aid arrives'))).toBe(false)
  })

  it('matches phrases with any spacing, the Turkish suffix after an apostrophe, and literal symbols', () => {
    const isMuted = createMuteMatcher(['Mansur Yavaş', 'C++'])!
    expect(isMuted(story("Mansur  Yavaş'ın açıklaması"))).toBe(true)
    expect(isMuted(story('Mansur Bey ile Yavaş görüştü'))).toBe(false)
    expect(isMuted(story('Yeni C++ standardı'))).toBe(true)
    expect(isMuted(story('C sharp'))).toBe(false)
  })

  it('reads the summary too', () => {
    expect(createMuteMatcher(['transfer'])!(story('Son dakika', 'Galatasaray transferi açıkladı'))).toBe(true)
  })

  it('returns no matcher when nothing is muted, and reuses one for the same list', () => {
    expect(createMuteMatcher([])).toBeNull()
    expect(createMuteMatcher(['  '])).toBeNull()
    const first = muteMatcherFor(['seçim'])
    expect(muteMatcherFor(['seçim'])).toBe(first)
    expect(muteMatcherFor(['deprem'])).not.toBe(first)
  })
})

describe('cleanMutedKeywords', () => {
  it('trims, collapses spaces, drops empties and duplicates, and caps the list', () => {
    expect(cleanMutedKeywords(['  Seçim ', 'SECIM', '', 42, 'Mansur   Yavaş'])).toEqual([
      'Seçim',
      'Mansur Yavaş'
    ])
    expect(cleanMutedKeywords(Array.from({ length: 250 }, (_, i) => `kelime${i}`))).toHaveLength(200)
    expect(cleanMutedKeywords(['x'.repeat(100)])[0]).toHaveLength(60)
  })

  it('is what settings store', () => {
    const settings = mergeSettings(DEFAULT_SETTINGS, { muted: { keywords: ['seçim', 'Seçim', ' deprem '] } })
    expect(settings.muted.keywords).toEqual(['seçim', 'deprem'])
    expect(mergeSettings(DEFAULT_SETTINGS, {}).muted.keywords).toEqual([])
  })
})
