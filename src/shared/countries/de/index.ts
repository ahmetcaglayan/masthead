import type { CountryPack } from '../types'
import { districts, provinces, regions } from './places.ts'
import { sources } from './sources.ts'

/** Germany: national sources, 4 regions and the 16 Länder with their regional news. */
export const de: CountryPack = {
  code: 'de',
  language: 'de',
  locale: 'de-DE',
  timeZone: 'Europe/Berlin',
  available: true,
  sources,
  regions,
  provinces,
  districts,
  localUnit: 'land',
  googleNews: { hl: 'de', gl: 'DE', ceid: 'DE:de' }
}
