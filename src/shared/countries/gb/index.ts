import type { CountryPack } from '../types'
import { districts, placeWords, provinces, regions } from './places.ts'
import { sources } from './sources.ts'

/** United Kingdom: national sources, 12 regions and nations, 51 BBC local-news areas. */
export const gb: CountryPack = {
  code: 'gb',
  language: 'en',
  locale: 'en-GB',
  timeZone: 'Europe/London',
  available: true,
  sources,
  regions,
  provinces,
  districts,
  localUnit: 'area',
  placeWords,
  googleNews: { hl: 'en-GB', gl: 'GB', ceid: 'GB:en' }
}
