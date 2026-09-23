import type { District, Province } from '../../types'
import { regionsOf } from '../build.ts'

/** Brazil's five IBGE regions, in the order the picker lists them. */
export const BR_REGION_IDS = ['north', 'northeast', 'central-west', 'southeast', 'south'] as const

type BrRegionId = (typeof BR_REGION_IDS)[number]

interface BrProvince extends Province {
  region: BrRegionId
}

const uf = (code: string, name: string, region: BrRegionId, aliases: string[] = []): BrProvince => ({
  code,
  name,
  slug: code.toLowerCase(),
  region,
  aliases
})

/** The 26 states and the Federal District, keyed by their UF code. */
export const provinces: BrProvince[] = [
  uf('AC', 'Acre', 'north'),
  uf('AP', 'Amapá', 'north'),
  uf('AM', 'Amazonas', 'north'),
  uf('PA', 'Pará', 'north'),
  uf('RO', 'Rondônia', 'north'),
  uf('RR', 'Roraima', 'north'),
  uf('TO', 'Tocantins', 'north'),
  uf('AL', 'Alagoas', 'northeast'),
  uf('BA', 'Bahia', 'northeast'),
  uf('CE', 'Ceará', 'northeast'),
  uf('MA', 'Maranhão', 'northeast'),
  uf('PB', 'Paraíba', 'northeast'),
  uf('PE', 'Pernambuco', 'northeast'),
  uf('PI', 'Piauí', 'northeast'),
  uf('RN', 'Rio Grande do Norte', 'northeast'),
  uf('SE', 'Sergipe', 'northeast'),
  uf('DF', 'Distrito Federal', 'central-west'),
  uf('GO', 'Goiás', 'central-west'),
  uf('MT', 'Mato Grosso', 'central-west'),
  uf('MS', 'Mato Grosso do Sul', 'central-west'),
  uf('ES', 'Espírito Santo', 'southeast'),
  uf('MG', 'Minas Gerais', 'southeast', ['Minas']),
  // "Rio" on its own is the city, and the state around it.
  uf('RJ', 'Rio de Janeiro', 'southeast', ['Rio']),
  uf('SP', 'São Paulo', 'southeast'),
  uf('PR', 'Paraná', 'south'),
  uf('RS', 'Rio Grande do Sul', 'south'),
  uf('SC', 'Santa Catarina', 'south')
]

export const regions = regionsOf(BR_REGION_IDS, provinces, {
  north: ['Região Norte'],
  northeast: ['Nordeste'],
  'central-west': ['Centro-Oeste'],
  southeast: ['Sudeste'],
  south: ['Região Sul']
})

/**
 * State capitals and large cities. Left out: Natal ("Christmas"), Vitória ("victory") and
 * names shared with other states or countries.
 */
const cities: Record<string, string[]> = {
  SP: ['Campinas', 'Santos', 'Guarulhos', 'Ribeirão Preto', 'Sorocaba', 'São José dos Campos'],
  RJ: ['Niterói', 'Duque de Caxias', 'Petrópolis', 'Nova Iguaçu'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Contagem'],
  BA: ['Salvador', 'Feira de Santana'],
  PE: ['Recife', 'Olinda', 'Caruaru'],
  CE: ['Fortaleza'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Foz do Iguaçu'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau'],
  GO: ['Goiânia', 'Anápolis'],
  DF: ['Brasília'],
  AM: ['Manaus'],
  PA: ['Belém', 'Santarém'],
  MA: ['São Luís'],
  PB: ['João Pessoa', 'Campina Grande'],
  AL: ['Maceió'],
  SE: ['Aracaju'],
  PI: ['Teresina'],
  ES: ['Vila Velha'],
  MT: ['Cuiabá'],
  MS: ['Campo Grande'],
  RO: ['Porto Velho'],
  AC: ['Rio Branco'],
  AP: ['Macapá'],
  RR: ['Boa Vista'],
  TO: ['Palmas']
}

export const districts: District[] = Object.entries(cities).flatMap(([provinceCode, names]) =>
  names.map((name) => ({ name, provinceCode }))
)
