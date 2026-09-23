import { describe, expect, it } from 'vitest'
import { jsonLdDeclaresPaywall } from '../../src/shared/paywall'

describe('jsonLdDeclaresPaywall', () => {
  it('finds isAccessibleForFree: false on the article, its parts or in a graph', () => {
    expect(jsonLdDeclaresPaywall({ '@type': 'NewsArticle', isAccessibleForFree: false })).toBe(true)
    expect(jsonLdDeclaresPaywall({ '@type': 'NewsArticle', isAccessibleForFree: 'False' })).toBe(true)
    expect(
      jsonLdDeclaresPaywall({
        '@graph': [{ '@type': 'WebSite' }, { hasPart: [{ isAccessibleForFree: false }] }]
      })
    ).toBe(true)
  })

  it('does not see one in free or unmarked articles', () => {
    expect(jsonLdDeclaresPaywall({ '@type': 'NewsArticle', isAccessibleForFree: true })).toBe(false)
    expect(jsonLdDeclaresPaywall({ '@type': 'NewsArticle', isAccessibleForFree: 'True' })).toBe(false)
    expect(jsonLdDeclaresPaywall([{ '@type': 'NewsArticle' }, null, 'text'])).toBe(false)
    // A free article of a paid publication, or one that says it is free above a locked part.
    expect(
      jsonLdDeclaresPaywall({
        '@type': 'NewsArticle',
        isPartOf: { '@type': 'Periodical', isAccessibleForFree: false }
      })
    ).toBe(false)
    expect(
      jsonLdDeclaresPaywall({ isAccessibleForFree: true, hasPart: { isAccessibleForFree: false } })
    ).toBe(false)
  })
})
