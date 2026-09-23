import type { District, Province } from '../../types'
import { regionsOf } from '../build.ts'

/** North, East, South and West Germany, in the order the picker lists them. */
export const DE_REGION_IDS = ['north', 'east', 'south', 'west'] as const

type DeRegionId = (typeof DE_REGION_IDS)[number]

interface DeProvince extends Province {
  region: DeRegionId
}

const land = (
  code: string,
  name: string,
  slug: string,
  region: DeRegionId,
  aliases: string[]
): DeProvince => ({
  code,
  name,
  slug,
  region,
  aliases
})

/**
 * The 16 Länder, keyed by their ISO 3166-2 suffix. Aliases carry the genitive ("Bayerns",
 * "Hessens") that German headlines use constantly, and common abbreviations.
 */
export const provinces: DeProvince[] = [
  land('SH', 'Schleswig-Holstein', 'schleswigholstein', 'north', ['Schleswig-Holsteins']),
  land('HH', 'Hamburg', 'hamburg', 'north', ['Hamburgs']),
  land('HB', 'Bremen', 'bremen', 'north', ['Bremens', 'Bremerhaven']),
  land('NI', 'Niedersachsen', 'niedersachsen', 'north', ['Niedersachsens']),
  land('MV', 'Mecklenburg-Vorpommern', 'mecklenburgvorpommern', 'north', ['Mecklenburg-Vorpommerns', 'MV']),
  land('BE', 'Berlin', 'berlin', 'east', ['Berlins']),
  land('BB', 'Brandenburg', 'brandenburg', 'east', ['Brandenburgs']),
  land('SN', 'Sachsen', 'sachsen', 'east', ['Sachsens']),
  land('ST', 'Sachsen-Anhalt', 'sachsenanhalt', 'east', ['Sachsen-Anhalts']),
  land('TH', 'Thüringen', 'thueringen', 'east', ['Thüringens']),
  land('BY', 'Bayern', 'bayern', 'south', ['Bayerns', 'Freistaat Bayern']),
  land('BW', 'Baden-Württemberg', 'badenwuerttemberg', 'south', ['Baden-Württembergs']),
  land('NW', 'Nordrhein-Westfalen', 'nordrheinwestfalen', 'west', ['Nordrhein-Westfalens', 'NRW']),
  land('HE', 'Hessen', 'hessen', 'west', ['Hessens']),
  land('RP', 'Rheinland-Pfalz', 'rheinlandpfalz', 'west', []),
  land('SL', 'Saarland', 'saarland', 'west', ['Saarlands'])
]

export const regions = regionsOf(DE_REGION_IDS, provinces, {
  north: ['Norddeutschland'],
  east: ['Ostdeutschland'],
  south: ['Süddeutschland'],
  west: ['Westdeutschland']
})

/**
 * Cities news copy names without their Land. Left out: Halle ("Halle" is also a hall),
 * Frankfurt (Oder) and other names that are ordinary nouns or shared.
 */
const cities: Record<string, string[]> = {
  BY: ['München', 'Nürnberg', 'Augsburg', 'Regensburg', 'Würzburg', 'Ingolstadt', 'Erlangen'],
  BW: ['Stuttgart', 'Karlsruhe', 'Mannheim', 'Freiburg', 'Heidelberg', 'Ulm', 'Heilbronn'],
  NW: [
    'Köln',
    'Düsseldorf',
    'Dortmund',
    'Essen',
    'Duisburg',
    'Bochum',
    'Wuppertal',
    'Bielefeld',
    'Bonn',
    'Münster',
    'Aachen',
    'Gelsenkirchen'
  ],
  HE: ['Frankfurt am Main', 'Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach'],
  RP: ['Mainz', 'Ludwigshafen', 'Koblenz', 'Trier', 'Kaiserslautern'],
  SL: ['Saarbrücken'],
  NI: ['Hannover', 'Braunschweig', 'Osnabrück', 'Oldenburg', 'Göttingen', 'Wolfsburg'],
  SH: ['Kiel', 'Lübeck', 'Flensburg'],
  MV: ['Rostock', 'Schwerin', 'Greifswald', 'Stralsund'],
  SN: ['Leipzig', 'Dresden', 'Chemnitz', 'Zwickau'],
  ST: ['Magdeburg', 'Dessau'],
  TH: ['Erfurt', 'Jena', 'Weimar', 'Gera'],
  BB: ['Potsdam', 'Cottbus']
}

export const districts: District[] = Object.entries(cities).flatMap(([provinceCode, names]) =>
  names.map((name) => ({ name, provinceCode }))
)
