import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, mergeSettings } from '../../src/shared/settings'

describe('mergeSettings', () => {
  it('keeps a place that belongs to the country', () => {
    const erzurum = mergeSettings(DEFAULT_SETTINGS, {
      country: 'tr',
      location: { provinceCode: '25', regionId: 'eastern-anatolia' }
    })
    expect(erzurum.location).toEqual({ provinceCode: '25', regionId: 'eastern-anatolia' })
    const up = mergeSettings(DEFAULT_SETTINGS, {
      country: 'in',
      location: { provinceCode: 'UP', regionId: 'north' }
    })
    expect(up.location).toEqual({ provinceCode: 'UP', regionId: 'north' })
    const scotland = mergeSettings(DEFAULT_SETTINGS, {
      country: 'gb',
      location: { provinceCode: null, regionId: 'scotland' }
    })
    expect(scotland.location).toEqual({ provinceCode: null, regionId: 'scotland' })
  })

  it('drops a place another country left behind', () => {
    const india = mergeSettings(DEFAULT_SETTINGS, {
      country: 'in',
      location: { provinceCode: '25', regionId: 'eastern-anatolia' }
    })
    expect(india.location).toEqual({ provinceCode: null, regionId: null })
    const germany = mergeSettings(DEFAULT_SETTINGS, {
      country: 'de',
      location: { provinceCode: null, regionId: 'north' }
    })
    expect(germany.location).toEqual({ provinceCode: null, regionId: 'north' })
    const unshipped = mergeSettings(DEFAULT_SETTINGS, {
      country: 'fr',
      location: { provinceCode: 'BY', regionId: null }
    })
    expect(unshipped.location).toEqual({ provinceCode: null, regionId: null })
  })
})
