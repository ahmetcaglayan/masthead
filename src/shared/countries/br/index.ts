import type { CountryPack } from '../types'
import { sources } from './sources.ts'

/** Brazil: Portuguese-language national sources. No state pack yet. */
export const br: CountryPack = {
  code: 'br',
  language: 'pt',
  locale: 'pt-BR',
  timeZone: 'America/Sao_Paulo',
  available: true,
  sources,
  regions: [],
  provinces: [],
  districts: [],
  googleNews: { hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419' }
}
