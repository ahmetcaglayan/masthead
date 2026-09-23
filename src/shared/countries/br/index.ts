import type { CountryPack } from '../types'
import { districts, provinces, regions } from './places.ts'
import { sources } from './sources.ts'

/** Brazil: national sources, 5 regions, 26 states and the Federal District with their local news. */
export const br: CountryPack = {
  code: 'br',
  language: 'pt',
  locale: 'pt-BR',
  timeZone: 'America/Sao_Paulo',
  available: true,
  sources,
  regions,
  provinces,
  districts,
  localUnit: 'state',
  googleNews: { hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419' }
}
