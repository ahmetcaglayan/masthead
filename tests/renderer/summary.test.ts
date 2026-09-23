import { describe, expect, it } from 'vitest'
import { leadCharacters, leadSentences } from '../../src/renderer/src/lib/summary'

const P1 = 'Sermaye Piyasası Kurulu, tasfiyesine karar verilen 131 fondaki yatırımcı sayısını açıkladı.'
const P2 = 'Açıklamada, Merkezi Kayıt Kuruluşu kayıtlarına göre bu fonlardaki tekil yatırımcı sayısının 455 bin 758 olduğu belirtildi.'
const P3 = 'Kurul, yatırımcı haklarının korunması için gereken adımların atılacağını vurguladı.'

describe('leadCharacters', () => {
  it('keeps a summary that already fits', () => {
    expect(leadCharacters([P1], 300)).toEqual({ paragraphs: [P1], cut: false })
  })

  it('keeps whole paragraphs while they fit and reports the cut', () => {
    const { paragraphs, cut } = leadCharacters([P1, P2, P3], 120)
    expect(paragraphs).toEqual([P1])
    expect(cut).toBe(true)
  })

  it('cuts a long paragraph at a sentence end and closes it with an ellipsis', () => {
    const long = `${P1} ${P2} ${P3}`
    const { paragraphs, cut } = leadCharacters([long], 200)
    expect(cut).toBe(true)
    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].endsWith('…')).toBe(true)
    expect(paragraphs[0].length).toBeLessThanOrEqual(201)
    // It fills the budget and stops at the last sentence end that fits.
    expect(long.startsWith(paragraphs[0].slice(0, -1))).toBe(true)
    expect(paragraphs[0].slice(0, -1)).toMatch(/\d$|\p{L}$/u)
    expect(paragraphs[0].length).toBeGreaterThan(150)
  })

  it('never cuts mid-word when no sentence end fits', () => {
    const word = 'kelime'
    const long = Array.from({ length: 60 }, () => word).join(' ')
    const { paragraphs } = leadCharacters([long], 100)
    const kept = paragraphs[0].replace('…', '').trim()
    expect(long.startsWith(kept)).toBe(true)
    expect(kept.endsWith(word)).toBe(true)
  })

  it('drops a paragraph rather than show a sliver of it', () => {
    const { paragraphs, cut } = leadCharacters([P1, P2], P1.length + 40)
    expect(paragraphs).toEqual([P1])
    expect(cut).toBe(true)
  })

  it('composes with the sentence budget the narrow columns use', () => {
    const bySentence = leadSentences([`${P1} ${P2}`, P3], 1)
    const byLength = leadCharacters(bySentence.paragraphs, 40)
    expect(bySentence.cut).toBe(true)
    expect(byLength.cut).toBe(true)
    expect(byLength.paragraphs[0].endsWith('…')).toBe(true)
  })
})
