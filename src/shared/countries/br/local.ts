import type { SourceDef } from '../../types'
import { localOutlet, provinceFeeds, type LocalOutlet } from '../build.ts'

/*
 * Local news: g1's page for every state (the Globo affiliates' newsrooms) and the regional
 * papers with working feeds. Every feed is only fetched for the user's selected state.
 * Checked on 2026-09-23.
 *
 * Not included: GZH, Correio do Povo, O Tempo, Estado de Minas, O Povo, Diário do Nordeste,
 * Jornal do Commercio, O Liberal, A Crítica and O Popular (their feeds answer 403/404),
 * Correio (its feed stopped in 2023) and Imirante (a single 1,000-item feed).
 */

const g1 = (uf: string): string => `https://g1.globo.com/rss/g1/${uf}/`

const g1Regional: SourceDef = {
  id: 'g1-regional',
  name: 'g1 Regional',
  homepage: 'https://g1.globo.com',
  icon: 'https://g1.globo.com/apple-touch-icon.png',
  color: '#C4170C',
  kind: 'local',
  language: 'pt',
  feeds: provinceFeeds(
    Object.fromEntries(
      [
        'AC',
        'AL',
        'AP',
        'AM',
        'BA',
        'CE',
        'DF',
        'ES',
        'GO',
        'MA',
        'MT',
        'MS',
        'MG',
        'PA',
        'PB',
        'PR',
        'PE',
        'PI',
        'RJ',
        'RN',
        'RS',
        'RO',
        'RR',
        'SC',
        'SP',
        'SE',
        'TO'
      ].map((code) => [code, g1(code.toLowerCase())])
    )
  )
}

const outlets: LocalOutlet[] = [
  { id: 'nsc-total', name: 'NSC Total', province: 'SC', feed: 'https://www.nsctotal.com.br/feed' },
  { id: 'nd-mais', name: 'ND+', province: 'SC', feed: 'https://ndmais.com.br/feed/' },
  {
    id: 'gazeta-do-povo-parana',
    name: 'Gazeta do Povo Paraná',
    province: 'PR',
    feed: 'https://www.gazetadopovo.com.br/feed/rss/parana.xml'
  },
  { id: 'band-b', name: 'Band B', province: 'PR', feed: 'https://www.bandab.com.br/feed/' },
  { id: 'a-tarde', name: 'A Tarde', province: 'BA', feed: 'https://atarde.com.br/rss' },
  {
    id: 'metropoles-df',
    name: 'Metrópoles DF',
    province: 'DF',
    feed: 'https://www.metropoles.com/distrito-federal/feed'
  },
  { id: 'a-gazeta', name: 'A Gazeta', province: 'ES', feed: 'https://www.agazeta.com.br/rss' },
  {
    id: 'campo-grande-news',
    name: 'Campo Grande News',
    province: 'MS',
    feed: 'https://www.campograndenews.com.br/rss/rss.xml'
  },
  {
    id: 'jornal-da-paraiba',
    name: 'Jornal da Paraíba',
    province: 'PB',
    feed: 'https://jornaldaparaiba.com.br/feed'
  },
  { id: 'cidade-verde', name: 'Cidade Verde', province: 'PI', feed: 'https://cidadeverde.com/rss' },
  { id: 'tnh1', name: 'TNH1', province: 'AL', feed: 'https://www.tnh1.com.br/feed/completo' },
  {
    id: 'diario-do-amapa',
    name: 'Diário do Amapá',
    province: 'AP',
    feed: 'https://www.diariodoamapa.com.br/feed/'
  },
  {
    id: 'tribuna-do-norte',
    name: 'Tribuna do Norte',
    province: 'RN',
    feed: 'https://tribunadonorte.com.br/feed/'
  },
  {
    id: 'estadao-sao-paulo',
    name: 'Estadão São Paulo',
    province: 'SP',
    feed: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/sao-paulo/?outputType=xml'
  },
  { id: 'extra', name: 'Extra', province: 'RJ', feed: 'https://extra.globo.com/rss/extra' }
]

export const localSources: SourceDef[] = [g1Regional, ...outlets.map((outlet) => localOutlet(outlet, 'pt'))]
