import type { CountryPack } from '../types'
import { sources } from './sources.ts'

/** United States: English-language national sources. No province pack yet. */
export const us: CountryPack = {
  code: 'us',
  language: 'en',
  locale: 'en-US',
  timeZone: 'America/New_York',
  available: true,
  sources,
  regions: [],
  provinces: [],
  districts: [],
  googleNews: { hl: 'en-US', gl: 'US', ceid: 'US:en' }
}
