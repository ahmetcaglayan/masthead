import type { CountryPack } from '../types'
import { districts, placeWords, provinces, regions } from './places.ts'
import { sources } from './sources.ts'

/** United States: national sources, 4 regions, 50 states and D.C. with their local newsrooms. */
export const us: CountryPack = {
  code: 'us',
  language: 'en',
  locale: 'en-US',
  timeZone: 'America/New_York',
  available: true,
  sources,
  regions,
  provinces,
  districts,
  localUnit: 'state',
  placeWords,
  googleNews: { hl: 'en-US', gl: 'US', ceid: 'US:en' }
}
