import type { CountryPack } from '../types'
import { sources } from './sources.ts'

/** India: Hindi and English national sources. No state pack yet. */
export const inPack: CountryPack = {
  code: 'in',
  language: 'hi',
  languages: ['hi', 'en'],
  locale: 'hi-IN',
  timeZone: 'Asia/Kolkata',
  available: true,
  sources,
  regions: [],
  provinces: [],
  districts: [],
  googleNews: { hl: 'hi', gl: 'IN', ceid: 'IN:hi' }
}
