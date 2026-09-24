import type { SourceDef } from '../../types'
import { localOutlet, provinceFeeds, type LocalOutlet } from '../build.ts'

/*
 * Local news: g1's page for every state (the Globo affiliates' newsrooms) and the regional
 * papers with working feeds. Every feed is only fetched for the user's selected state.
 * Checked on 2026-09-24.
 *
 * Not included: GZH, Correio do Povo, O Tempo, Itatiaia, Hoje em Dia, Diário do Nordeste,
 * Diário de Pernambuco, Folha de Pernambuco, A Crítica, Portal do Holanda, D24am, O Popular,
 * Jornal Opção, Mais Goiás, Jornal do Tocantins, Bem Paraná, Bahia Notícias, BNews,
 * ac24horas, Folha de Boa Vista, Gazeta Digital, MídiaNews, Correio do Estado, GP1 and Cada
 * Minuto (their feeds answer 403/404 or they have none), Correio Braziliense (its feed
 * stopped in 2024), Correio (stopped in 2023), O Dia (stopped in 2018), Conexão Tocantins
 * (no item dates) and Imirante (a single 1,000-item feed).
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
  { id: 'extra', name: 'Extra', province: 'RJ', feed: 'https://extra.globo.com/rss/extra' },
  {
    id: 'o-globo-rio',
    name: 'O Globo Rio',
    province: 'RJ',
    feed: 'https://oglobo.globo.com/rss/oglobo/rio/'
  },
  { id: 'estado-de-minas', name: 'Estado de Minas', province: 'MG', feed: 'https://www.em.com.br/feed' },
  {
    id: 'jornal-do-comercio-rs',
    name: 'Jornal do Comércio',
    province: 'RS',
    feed: 'https://www.jornaldocomercio.com/_conteudo/home/rss.xml'
  },
  { id: 'sul21', name: 'Sul21', province: 'RS', feed: 'https://sul21.com.br/feed/' },
  {
    id: 'jornal-do-commercio',
    name: 'Jornal do Commercio',
    province: 'PE',
    feed: 'https://jc.uol.com.br/ultimas/rss.xml'
  },
  {
    id: 'o-povo',
    name: 'O Povo',
    province: 'CE',
    feed: 'https://www.opovo.com.br/noticias/fortaleza/rss.xml'
  },
  {
    id: 'o-liberal',
    name: 'O Liberal',
    province: 'PA',
    feed: 'https://www.oliberal.com/cmlink/oliberal-com-1.169551'
  },
  { id: 'metro1', name: 'Metro1', province: 'BA', feed: 'https://www.metro1.com.br/rss' },
  {
    id: 'jornal-de-brasilia',
    name: 'Jornal de Brasília',
    province: 'DF',
    feed: 'https://jornaldebrasilia.com.br/feed/'
  },
  { id: 'gazetaweb', name: 'GazetaWeb', province: 'AL', feed: 'https://www.gazetaweb.com/rss' },
  { id: 'portal-o-dia', name: 'Portal O Dia', province: 'PI', feed: 'https://portalodia.com/rss' },
  { id: 'o-imparcial', name: 'O Imparcial', province: 'MA', feed: 'https://oimparcial.com.br/feed/' },
  { id: 'infonet', name: 'Infonet', province: 'SE', feed: 'https://infonet.com.br/feed/' },
  { id: 'em-tempo', name: 'Em Tempo', province: 'AM', feed: 'https://emtempo.com.br/feed/' },
  { id: 'contilnet', name: 'ContilNet', province: 'AC', feed: 'https://contilnet.com.br/feed/' },
  { id: 'news-rondonia', name: 'News Rondônia', province: 'RO', feed: 'https://newsrondonia.com.br/feed' },
  { id: 'roraima-1', name: 'Roraima 1', province: 'RR', feed: 'https://roraima1.com.br/feed/' },
  { id: 'rdnews', name: 'RDNews', province: 'MT', feed: 'https://www.rdnews.com.br/feed' },
  { id: 'o-hoje', name: 'O Hoje', province: 'GO', feed: 'https://ohoje.com/feed/' }
]

export const localSources: SourceDef[] = [g1Regional, ...outlets.map((outlet) => localOutlet(outlet, 'pt'))]
