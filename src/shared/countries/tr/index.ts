import type { CountryPack } from '../types'
import { districts } from './districts.ts'
import { provinces } from './provinces.ts'
import { regions } from './regions.ts'
import { sources } from './sources.ts'

/** Turkey: national, international and local Turkish-language sources, 7 regions, 81 provinces. */
export const tr: CountryPack = {
  code: 'tr',
  language: 'tr',
  locale: 'tr-TR',
  timeZone: 'Europe/Istanbul',
  available: true,
  sources,
  regions,
  provinces,
  districts,
  googleNews: { hl: 'tr', gl: 'TR', ceid: 'TR:tr' }
}
