import type { CountryPack } from '../types'
import { sources } from './sources.ts'

/** Germany: German-language national sources. No Bundesland pack yet. */
export const de: CountryPack = {
  code: 'de',
  language: 'de',
  locale: 'de-DE',
  timeZone: 'Europe/Berlin',
  available: true,
  sources,
  regions: [],
  provinces: [],
  districts: [],
  googleNews: { hl: 'de', gl: 'DE', ceid: 'DE:de' }
}
