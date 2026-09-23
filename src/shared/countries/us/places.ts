import type { District, Province } from '../../types'
import { regionsOf } from '../build.ts'

/** The four Census Bureau regions, in the order the picker lists them. */
export const US_REGION_IDS = ['northeast', 'midwest', 'south', 'west'] as const

type UsRegionId = (typeof US_REGION_IDS)[number]

interface UsProvince extends Province {
  region: UsRegionId
}

const state = (
  code: string,
  name: string,
  region: UsRegionId,
  extra: Partial<Pick<Province, 'aliases' | 'ambiguous'>> = {}
): UsProvince => ({
  code,
  name,
  slug: name.toLowerCase().replace(/[^a-z]+/g, '-'),
  region,
  aliases: extra.aliases ?? [],
  ...(extra.ambiguous ? { ambiguous: true } : {})
})

/** The 50 states and the District of Columbia, keyed by their postal code. */
export const provinces: UsProvince[] = [
  // Northeast
  state('CT', 'Connecticut', 'northeast'),
  state('ME', 'Maine', 'northeast'),
  state('MA', 'Massachusetts', 'northeast'),
  state('NH', 'New Hampshire', 'northeast'),
  state('RI', 'Rhode Island', 'northeast'),
  state('VT', 'Vermont', 'northeast'),
  state('NJ', 'New Jersey', 'northeast'),
  state('NY', 'New York', 'northeast'),
  state('PA', 'Pennsylvania', 'northeast'),
  // Midwest
  state('IL', 'Illinois', 'midwest'),
  state('IN', 'Indiana', 'midwest'),
  state('MI', 'Michigan', 'midwest'),
  state('OH', 'Ohio', 'midwest'),
  state('WI', 'Wisconsin', 'midwest'),
  state('IA', 'Iowa', 'midwest'),
  state('KS', 'Kansas', 'midwest'),
  state('MN', 'Minnesota', 'midwest'),
  state('MO', 'Missouri', 'midwest'),
  state('NE', 'Nebraska', 'midwest'),
  state('ND', 'North Dakota', 'midwest'),
  state('SD', 'South Dakota', 'midwest'),
  // South
  state('DE', 'Delaware', 'south'),
  state('DC', 'District of Columbia', 'south', { aliases: ['D.C.'] }),
  state('FL', 'Florida', 'south'),
  // Also the country in the Caucasus.
  state('GA', 'Georgia', 'south', { ambiguous: true }),
  state('MD', 'Maryland', 'south'),
  state('NC', 'North Carolina', 'south'),
  state('SC', 'South Carolina', 'south'),
  state('VA', 'Virginia', 'south'),
  state('WV', 'West Virginia', 'south'),
  state('AL', 'Alabama', 'south'),
  state('KY', 'Kentucky', 'south'),
  state('MS', 'Mississippi', 'south'),
  state('TN', 'Tennessee', 'south'),
  state('AR', 'Arkansas', 'south'),
  state('LA', 'Louisiana', 'south'),
  state('OK', 'Oklahoma', 'south'),
  state('TX', 'Texas', 'south'),
  // West
  state('AZ', 'Arizona', 'west'),
  state('CO', 'Colorado', 'west'),
  state('ID', 'Idaho', 'west'),
  state('MT', 'Montana', 'west'),
  state('NV', 'Nevada', 'west'),
  state('NM', 'New Mexico', 'west'),
  state('UT', 'Utah', 'west'),
  state('WY', 'Wyoming', 'west'),
  state('AK', 'Alaska', 'west'),
  state('CA', 'California', 'west'),
  state('HI', 'Hawaii', 'west', { aliases: ['Hawaiʻi'] }),
  state('OR', 'Oregon', 'west'),
  // Most often the federal government ("Washington weighs sanctions").
  state('WA', 'Washington', 'west', { ambiguous: true })
]

export const regions = regionsOf(US_REGION_IDS, provinces)

/** Words after an ambiguous state name that make it the state: "Washington state", "Georgia Gov.". */
export const placeWords = [
  'state',
  'governor',
  'gov',
  'legislature',
  'lawmakers',
  'county',
  'senator',
  'voters'
]

/**
 * Cities news copy names without their state. Left out: names several states or countries
 * share (Portland, Columbus, Springfield, Birmingham, Toledo) and names that are also first
 * names, surnames or words (Phoenix, Charlotte, Austin, Lincoln, Jackson, Madison).
 */
const cities: Record<string, string[]> = {
  CA: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Oakland', 'Fresno'],
  TX: ['Houston', 'Dallas', 'San Antonio', 'Fort Worth', 'El Paso'],
  FL: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee'],
  IL: ['Chicago'],
  PA: ['Philadelphia', 'Pittsburgh', 'Harrisburg'],
  GA: ['Atlanta'],
  MA: ['Boston'],
  WA: ['Seattle', 'Spokane', 'Tacoma'],
  CO: ['Denver', 'Colorado Springs', 'Boulder'],
  MI: ['Detroit', 'Grand Rapids', 'Lansing'],
  MN: ['Minneapolis', 'St. Paul'],
  NV: ['Las Vegas', 'Reno'],
  TN: ['Nashville', 'Memphis', 'Knoxville'],
  LA: ['New Orleans', 'Baton Rouge'],
  MD: ['Baltimore', 'Annapolis'],
  OH: ['Cleveland', 'Cincinnati'],
  WI: ['Milwaukee'],
  MO: ['St. Louis', 'Kansas City'],
  UT: ['Salt Lake City'],
  NM: ['Albuquerque', 'Santa Fe'],
  HI: ['Honolulu'],
  AK: ['Anchorage', 'Juneau'],
  ID: ['Boise'],
  KY: ['Louisville'],
  IN: ['Indianapolis'],
  NE: ['Omaha'],
  IA: ['Des Moines'],
  AL: ['Huntsville', 'Tuscaloosa'],
  AR: ['Little Rock'],
  CT: ['Hartford', 'New Haven'],
  RI: ['Providence'],
  NJ: ['Newark', 'Trenton'],
  NY: ['Manhattan', 'Buffalo', 'Albany'],
  VA: ['Richmond'],
  NC: ['Raleigh', 'Durham'],
  AZ: ['Tucson', 'Scottsdale'],
  WY: ['Cheyenne'],
  MT: ['Billings'],
  ND: ['Fargo', 'Bismarck'],
  SD: ['Sioux Falls'],
  OK: ['Oklahoma City', 'Tulsa']
}

export const districts: District[] = Object.entries(cities).flatMap(([provinceCode, names]) =>
  names.map((name) => ({ name, provinceCode }))
)
