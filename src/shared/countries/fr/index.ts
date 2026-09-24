import type { CountryPack } from '../types'
import { districts, notPlaces, provinces, regions } from './places.ts'
import { sources } from './sources.ts'

/** France: national sources, 13 regions and the overseas departments, and all 101 departments with their local news. */
export const fr: CountryPack = {
  code: 'fr',
  language: 'fr',
  locale: 'fr-FR',
  timeZone: 'Europe/Paris',
  available: true,
  sources,
  regions,
  provinces,
  districts,
  localUnit: 'department',
  notPlaces,
  googleNews: { hl: 'fr', gl: 'FR', ceid: 'FR:fr' }
}
