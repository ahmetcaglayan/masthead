import { describe, expect, it } from 'vitest'
import { categoriesFromLabel, categoriesFromUrl } from '../../../src/core/news/categories'

describe('categoriesFromLabel', () => {
  it('reads Turkish section names', () => {
    expect(categoriesFromLabel('Kültür Sanat')).toEqual(['culture'])
    expect(categoriesFromLabel('Bilim ve Teknoloji')).toEqual(['science', 'technology'])
  })

  it('reads accented labels in other languages', () => {
    expect(categoriesFromLabel('Économie', 'fr')).toEqual(['economy'])
    expect(categoriesFromLabel('Santé', 'fr')).toEqual(['health'])
    expect(categoriesFromLabel('Société', 'fr')).toEqual(['general'])
    expect(categoriesFromLabel('Planète', 'fr')).toEqual(['environment'])
    expect(categoriesFromLabel('Saúde', 'pt')).toEqual(['health'])
    expect(categoriesFromLabel('Educação', 'pt')).toEqual(['education'])
  })
})

describe('categoriesFromUrl', () => {
  it('reads French section paths', () => {
    expect(
      categoriesFromUrl('https://www.lemonde.fr/international/article/2026/09/24/x_1.html', 'fr')
    ).toEqual(['world'])
    expect(categoriesFromUrl('https://www.lefigaro.fr/politique/le-gouvernement-x-20260924', 'fr')).toEqual([
      'politics'
    ])
    expect(categoriesFromUrl('https://www.francetvinfo.fr/faits-divers/x.html', 'fr')).toEqual(['general'])
    expect(categoriesFromUrl('https://www.lemonde.fr/pixels/article/x.html', 'fr')).toEqual(['technology'])
  })

  it('keeps Turkish-only words out of other languages', () => {
    expect(categoriesFromUrl('https://g1.globo.com/para/noticia/x.ghtml', 'pt')).toEqual([])
    expect(categoriesFromUrl('https://www.haberturk.com/para/x', 'tr')).toEqual(['economy'])
  })
})
