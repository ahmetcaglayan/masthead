import type { CountryPack } from '../types'
import { sources } from './sources.ts'

/** United Kingdom: English-language national sources. No province pack yet. */
export const gb: CountryPack = {
  code: 'gb',
  language: 'en',
  locale: 'en-GB',
  timeZone: 'Europe/London',
  available: true,
  sources,
  regions: [],
  provinces: [],
  districts: [],
  googleNews: { hl: 'en-GB', gl: 'GB', ceid: 'GB:en' }
}
