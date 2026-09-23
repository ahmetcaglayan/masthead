import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CountryPack } from '../../../src/shared/countries/types'
import type { Province, RegionId } from '../../../src/shared/types'

const FEEDS = join(__dirname, '../../fixtures/feeds')

/** A real feed sample from tests/fixtures/feeds. */
export function fixture(name: string): string {
  return readFileSync(join(FEEDS, name), 'utf8')
}

export function fixtureBytes(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(FEEDS, name)))
}

/** 22 Sep 2026, 23:00 in Istanbul: just after the fixtures were fetched. */
export const NOW = Date.UTC(2026, 8, 22, 20, 0, 0)

const province = (code: string, name: string, region: RegionId, extra: Partial<Province> = {}): Province => ({
  code,
  name,
  slug: name.toLowerCase(),
  region,
  aliases: [],
  ...extra
})

/** A small Turkey-like pack: a few provinces (ambiguous ones included), some districts, all seven regions. */
export const testPack: CountryPack = {
  code: 'tr',
  language: 'tr',
  locale: 'tr-TR',
  timeZone: 'Europe/Istanbul',
  available: true,
  sources: [],
  regions: [
    { id: 'marmara', provinces: ['34', '41'] },
    { id: 'aegean', provinces: ['35', '09', '48', '45'] },
    { id: 'mediterranean', provinces: ['07'] },
    { id: 'central-anatolia', provinces: ['06', '42'] },
    { id: 'black-sea', provinces: ['52', '55', '60', '61'] },
    { id: 'eastern-anatolia', provinces: ['44', '65'] },
    { id: 'southeastern-anatolia', provinces: ['27', '72'] }
  ],
  provinces: [
    province('06', 'Ankara', 'central-anatolia'),
    province('07', 'Antalya', 'mediterranean'),
    province('09', 'Aydın', 'aegean', { ambiguous: true }),
    province('27', 'Gaziantep', 'southeastern-anatolia', { aliases: ['Antep'] }),
    province('34', 'İstanbul', 'marmara'),
    province('35', 'İzmir', 'aegean'),
    province('41', 'Kocaeli', 'marmara', { aliases: ['İzmit'] }),
    province('42', 'Konya', 'central-anatolia'),
    province('44', 'Malatya', 'eastern-anatolia'),
    province('45', 'Manisa', 'aegean'),
    province('48', 'Muğla', 'aegean'),
    province('52', 'Ordu', 'black-sea', { ambiguous: true }),
    province('55', 'Samsun', 'black-sea', { ambiguous: true }),
    province('60', 'Tokat', 'black-sea', { ambiguous: true }),
    province('61', 'Trabzon', 'black-sea'),
    province('65', 'Van', 'eastern-anatolia', { ambiguous: true }),
    province('72', 'Batman', 'southeastern-anatolia', { ambiguous: true })
  ],
  districts: [
    { name: 'Kadıköy', provinceCode: '34' },
    { name: 'Üsküdar', provinceCode: '34' },
    { name: 'Bodrum', provinceCode: '48' },
    { name: 'Kuşadası', provinceCode: '09' },
    { name: 'Battalgazi', provinceCode: '44' },
    { name: 'Turgutlu', provinceCode: '45' },
    { name: 'Konyaaltı', provinceCode: '07' },
    // In two provinces: must not decide either.
    { name: 'Ereğli', provinceCode: '42' },
    { name: 'Ereğli', provinceCode: '67' }
  ]
}
