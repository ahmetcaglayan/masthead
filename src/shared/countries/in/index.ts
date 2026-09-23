import type { CountryPack } from '../types'
import { districts, provinces, regions } from './places.ts'
import { sources } from './sources.ts'

/** India: the Hindi national press, 6 zones, 28 states and 8 union territories. */
export const inPack: CountryPack = {
  code: 'in',
  language: 'hi',
  locale: 'hi-IN',
  timeZone: 'Asia/Kolkata',
  available: true,
  sources,
  regions,
  provinces,
  districts,
  localUnit: 'state',
  googleNews: { hl: 'hi', gl: 'IN', ceid: 'IN:hi' }
}
