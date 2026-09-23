import type { CountryPack } from '../types'
import { sources } from './sources.ts'

/** India: English-language national sources. No state pack yet. */
export const inPack: CountryPack = {
  code: 'in',
  language: 'en',
  locale: 'en-IN',
  timeZone: 'Asia/Kolkata',
  available: true,
  sources,
  regions: [],
  provinces: [],
  districts: [],
  googleNews: { hl: 'en-IN', gl: 'IN', ceid: 'IN:en' }
}
