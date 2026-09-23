import type { SourceDef } from '../../types'
import { localSources } from './local.ts'

/*
 * Brazil — Portuguese-language national sources, plus g1's page for every state and the
 * regional papers (see `local.ts`). Every feed was checked on 2026-09-23 (re-check with
 * `npm run verify:feeds br`).
 *
 * The default set runs from Intercept Brasil, Agência Pública and Nexo to Jovem Pan and
 * Revista Oeste around the big dailies and broadcasters; the partisan weeklies and the
 * tabloid-leaning sites stay off by default, as before.
 *
 * Not included: the old estadao.com.br/rss/* paths (404; the paper now publishes through
 * its Arc outbound feed), the G1 science and health feeds (stale for years), R7, Terra,
 * Band and SBT (no working feed), CNN Brasil's section feeds (404) and Brasil de Fato (404).
 */

const nationalSources: SourceDef[] = [
  // Mainstream
  {
    id: 'g1',
    name: 'G1',
    homepage: 'https://g1.globo.com',
    icon: 'https://g1.globo.com/apple-touch-icon.png',
    color: '#C4170C',
    kind: 'mainstream',
    language: 'pt',
    feeds: [
      { url: 'https://g1.globo.com/rss/g1/', category: 'top', headline: true },
      { url: 'https://g1.globo.com/rss/g1/politica/', category: 'politics' },
      { url: 'https://g1.globo.com/rss/g1/economia/', category: 'economy' },
      { url: 'https://g1.globo.com/rss/g1/mundo/', category: 'world' },
      { url: 'https://g1.globo.com/rss/g1/tecnologia/', category: 'technology' },
      { url: 'https://g1.globo.com/rss/g1/educacao/', category: 'education' },
      { url: 'https://g1.globo.com/rss/g1/pop-arte/', category: 'culture' },
      { url: 'https://g1.globo.com/rss/g1/carros/', category: 'automotive' },
      { url: 'https://g1.globo.com/rss/g1/turismo-e-viagem/', category: 'travel' }
    ]
  },
  {
    id: 'folha',
    name: 'Folha de S.Paulo',
    homepage: 'https://www.folha.uol.com.br',
    icon: 'https://www1.folha.uol.com.br/favicon.ico',
    color: '#0A3D7C',
    kind: 'mainstream',
    language: 'pt',
    feeds: [
      { url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', category: 'top', headline: true },
      { url: 'https://feeds.folha.uol.com.br/cotidiano/rss091.xml', category: 'national' },
      { url: 'https://feeds.folha.uol.com.br/poder/rss091.xml', category: 'politics' },
      { url: 'https://feeds.folha.uol.com.br/mercado/rss091.xml', category: 'economy' },
      { url: 'https://feeds.folha.uol.com.br/mundo/rss091.xml', category: 'world' },
      { url: 'https://feeds.folha.uol.com.br/ciencia/rss091.xml', category: 'science' },
      { url: 'https://feeds.folha.uol.com.br/ilustrada/rss091.xml', category: 'culture' },
      { url: 'https://feeds.folha.uol.com.br/esporte/rss091.xml', category: 'sports' },
      { url: 'https://feeds.folha.uol.com.br/equilibrioesaude/rss091.xml', category: 'health' },
      { url: 'https://feeds.folha.uol.com.br/tec/rss091.xml', category: 'technology' },
      { url: 'https://feeds.folha.uol.com.br/ambiente/rss091.xml', category: 'environment' },
      { url: 'https://feeds.folha.uol.com.br/educacao/rss091.xml', category: 'education' },
      { url: 'https://feeds.folha.uol.com.br/turismo/rss091.xml', category: 'travel' },
      { url: 'https://feeds.folha.uol.com.br/opiniao/rss091.xml', category: 'opinion' }
    ]
  },
  {
    id: 'uol',
    name: 'UOL',
    homepage: 'https://www.uol.com.br',
    color: '#E8A400',
    kind: 'mainstream',
    language: 'pt',
    feeds: [
      { url: 'https://rss.uol.com.br/feed/noticias.xml', category: 'top', headline: true },
      { url: 'https://rss.uol.com.br/feed/economia.xml', category: 'economy' },
      { url: 'https://rss.uol.com.br/feed/tecnologia.xml', category: 'technology' },
      { url: 'https://rss.uol.com.br/feed/esporte.xml', category: 'sports' },
      { url: 'https://rss.uol.com.br/feed/entretenimento.xml', category: 'entertainment' },
      { url: 'https://rss.uol.com.br/feed/carros.xml', category: 'automotive' },
      { url: 'https://rss.uol.com.br/feed/viagem.xml', category: 'travel' },
      { url: 'https://rss.uol.com.br/feed/educacao.xml', category: 'education' }
    ]
  },
  {
    id: 'estadao',
    name: 'Estadão',
    homepage: 'https://www.estadao.com.br',
    color: '#123B7A',
    kind: 'mainstream',
    language: 'pt',
    feeds: [
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/ultimas/?outputType=xml',
        category: 'general'
      },
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/politica/?outputType=xml',
        category: 'politics'
      },
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/economia/?outputType=xml',
        category: 'economy'
      },
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/internacional/?outputType=xml',
        category: 'world'
      },
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/esportes/?outputType=xml',
        category: 'sports'
      },
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/cultura/?outputType=xml',
        category: 'culture'
      },
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/jornal-do-carro/?outputType=xml',
        category: 'automotive'
      },
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/viagem/?outputType=xml',
        category: 'travel'
      },
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/opiniao/?outputType=xml',
        category: 'opinion'
      }
    ]
  },
  {
    id: 'cnn-brasil',
    name: 'CNN Brasil',
    homepage: 'https://www.cnnbrasil.com.br',
    icon: 'https://www.cnnbrasil.com.br/apple-touch-icon.png',
    color: '#CC0000',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://www.cnnbrasil.com.br/feed/', category: 'general' }]
  },
  {
    id: 'o-globo',
    name: 'O Globo',
    homepage: 'https://oglobo.globo.com',
    icon: 'https://www.google.com/s2/favicons?domain=oglobo.globo.com&sz=128',
    color: '#1D4F91',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://oglobo.globo.com/rss/oglobo', category: 'general' }]
  },
  {
    id: 'jovem-pan',
    name: 'Jovem Pan',
    homepage: 'https://jovempan.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=jovempan.com.br&sz=128',
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://jovempan.com.br/feed/', category: 'general' }]
  },
  {
    id: 'istoe',
    name: 'IstoÉ',
    homepage: 'https://istoe.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=istoe.com.br&sz=128',
    color: '#D71920',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://istoe.com.br/feed', category: 'general' }]
  },
  {
    id: 'revista-oeste',
    name: 'Revista Oeste',
    homepage: 'https://revistaoeste.com',
    icon: 'https://www.google.com/s2/favicons?domain=revistaoeste.com&sz=128',
    color: '#0B2340',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://revistaoeste.com/feed/', category: 'politics' }]
  },
  {
    id: 'intercept-brasil',
    name: 'Intercept Brasil',
    homepage: 'https://www.intercept.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=intercept.com.br&sz=128',
    color: '#1A1A1A',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://www.intercept.com.br/feed/', category: 'politics' }]
  },
  {
    id: 'agencia-publica',
    name: 'Agência Pública',
    homepage: 'https://apublica.org',
    icon: 'https://www.google.com/s2/favicons?domain=apublica.org&sz=128',
    color: '#E94E1B',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://apublica.org/feed/', category: 'national' }]
  },
  {
    id: 'nexo',
    name: 'Nexo Jornal',
    homepage: 'https://www.nexojornal.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=nexojornal.com.br&sz=128',
    color: '#1A1A1A',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://www.nexojornal.com.br/rss.xml', category: 'general' }]
  },
  {
    id: 'piaui',
    name: 'piauí',
    homepage: 'https://piaui.uol.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=piaui.uol.com.br&sz=128',
    color: '#E3051B',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://piaui.uol.com.br/feed/', category: 'culture' }]
  },
  {
    id: 'metropoles',
    name: 'Metrópoles',
    homepage: 'https://www.metropoles.com',
    icon: 'https://www.metropoles.com/apple-touch-icon.png',
    color: '#1B365D',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.metropoles.com/feed', category: 'general' }]
  },

  // Public agency and international
  {
    id: 'agencia-brasil',
    name: 'Agência Brasil',
    homepage: 'https://agenciabrasil.ebc.com.br',
    color: '#1B7A43',
    kind: 'agency',
    language: 'pt',
    feeds: [
      { url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', category: 'national' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/politica/feed.xml', category: 'politics' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml', category: 'economy' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml', category: 'world' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/saude/feed.xml', category: 'health' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml', category: 'education' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/meio-ambiente/feed.xml', category: 'environment' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/cultura/feed.xml', category: 'culture' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml', category: 'sports' }
    ]
  },
  {
    id: 'bbc-brasil',
    name: 'BBC News Brasil',
    homepage: 'https://www.bbc.com/portuguese',
    icon: 'https://www.bbc.co.uk/apple-touch-icon.png',
    color: '#BB1919',
    kind: 'international',
    language: 'pt',
    feeds: [{ url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', category: 'world' }]
  },

  // Independent
  {
    id: 'poder360',
    name: 'Poder360',
    homepage: 'https://www.poder360.com.br',
    icon: 'https://www.poder360.com.br/apple-touch-icon.png',
    color: '#16324F',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://www.poder360.com.br/feed/', category: 'politics' }]
  },
  {
    id: 'carta-capital',
    name: 'CartaCapital',
    homepage: 'https://www.cartacapital.com.br',
    color: '#E4002B',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.cartacapital.com.br/feed/', category: 'politics' }]
  },
  {
    id: 'gazeta-do-povo',
    name: 'Gazeta do Povo',
    homepage: 'https://www.gazetadopovo.com.br',
    icon: 'https://www.gazetadopovo.com.br/favicon.ico',
    color: '#005CA9',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.gazetadopovo.com.br/feed/rss/republica.xml', category: 'politics' }]
  },
  {
    id: 'veja',
    name: 'Veja',
    homepage: 'https://veja.abril.com.br',
    color: '#D71920',
    kind: 'mainstream',
    language: 'pt',
    feeds: [
      { url: 'https://veja.abril.com.br/feed/', category: 'general' },
      { url: 'https://veja.abril.com.br/politica/feed/', category: 'politics' },
      { url: 'https://veja.abril.com.br/saude/feed/', category: 'health' }
    ]
  },

  // Business, technology, sport
  {
    id: 'infomoney',
    name: 'InfoMoney',
    homepage: 'https://www.infomoney.com.br',
    color: '#FF6B00',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://www.infomoney.com.br/feed/', category: 'economy' }]
  },
  {
    id: 'exame',
    name: 'Exame',
    homepage: 'https://exame.com',
    icon: 'https://exame.com/favicon.ico',
    color: '#EC1C24',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://exame.com/feed/', category: 'economy' }]
  },
  {
    id: 'olhar-digital',
    name: 'Olhar Digital',
    homepage: 'https://olhardigital.com.br',
    icon: 'https://olhardigital.com.br/apple-touch-icon.png',
    color: '#F15A24',
    kind: 'technology',
    language: 'pt',
    feeds: [{ url: 'https://olhardigital.com.br/feed/', category: 'technology' }]
  },
  {
    id: 'tecnoblog',
    name: 'Tecnoblog',
    homepage: 'https://tecnoblog.net',
    icon: 'https://tecnoblog.net/apple-touch-icon.png',
    color: '#0C8CE9',
    kind: 'technology',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://tecnoblog.net/feed/', category: 'technology' }]
  },
  {
    id: 'globo-esporte',
    name: 'ge',
    homepage: 'https://ge.globo.com',
    icon: 'https://ge.globo.com/favicon.ico',
    color: '#00B04F',
    kind: 'sports',
    language: 'pt',
    feeds: [{ url: 'https://ge.globo.com/rss/ge/', category: 'sports' }]
  },
  {
    id: 'valor-economico',
    name: 'Valor Econômico',
    homepage: 'https://valor.globo.com',
    icon: 'https://www.google.com/s2/favicons?domain=valor.globo.com&sz=128',
    color: '#0B6B3A',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://valor.globo.com/rss/valor/', category: 'economy' }]
  },
  {
    id: 'epoca-negocios',
    name: 'Época Negócios',
    homepage: 'https://epocanegocios.globo.com',
    icon: 'https://www.google.com/s2/favicons?domain=epocanegocios.globo.com&sz=128',
    color: '#C8102E',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://epocanegocios.globo.com/rss/epocanegocios/', category: 'economy' }]
  },
  {
    id: 'seu-dinheiro',
    name: 'Seu Dinheiro',
    homepage: 'https://www.seudinheiro.com',
    icon: 'https://www.google.com/s2/favicons?domain=seudinheiro.com&sz=128',
    color: '#00A859',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://www.seudinheiro.com/feed/', category: 'economy' }]
  },
  {
    id: 'money-times',
    name: 'Money Times',
    homepage: 'https://www.moneytimes.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=moneytimes.com.br&sz=128',
    color: '#0C2340',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://www.moneytimes.com.br/feed/', category: 'economy' }]
  },
  {
    id: 'canaltech',
    name: 'Canaltech',
    homepage: 'https://canaltech.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=canaltech.com.br&sz=128',
    color: '#E4032E',
    kind: 'technology',
    language: 'pt',
    feeds: [{ url: 'https://canaltech.com.br/rss/', category: 'technology' }]
  },
  {
    id: 'superinteressante',
    name: 'Superinteressante',
    homepage: 'https://super.abril.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=super.abril.com.br&sz=128',
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://super.abril.com.br/feed/', category: 'science' }]
  },
  {
    id: 'veja-saude',
    name: 'Veja Saúde',
    homepage: 'https://saude.abril.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=saude.abril.com.br&sz=128',
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://saude.abril.com.br/feed/', category: 'health' }]
  },
  {
    id: 'porvir',
    name: 'Porvir',
    homepage: 'https://porvir.org',
    icon: 'https://www.google.com/s2/favicons?domain=porvir.org&sz=128',
    color: '#F39200',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://porvir.org/feed/', category: 'education' }]
  },
  {
    id: 'oeco',
    name: '((o))eco',
    homepage: 'https://oeco.org.br',
    icon: 'https://www.google.com/s2/favicons?domain=oeco.org.br&sz=128',
    color: '#2E7D32',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://oeco.org.br/feed/', category: 'environment' }]
  },
  {
    id: 'um-so-planeta',
    name: 'Um Só Planeta',
    homepage: 'https://umsoplaneta.globo.com',
    icon: 'https://www.google.com/s2/favicons?domain=umsoplaneta.globo.com&sz=128',
    color: '#1B8A5A',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://umsoplaneta.globo.com/rss/umsoplaneta/', category: 'environment' }]
  },
  {
    id: 'autoesporte',
    name: 'Autoesporte',
    homepage: 'https://autoesporte.globo.com',
    icon: 'https://www.google.com/s2/favicons?domain=autoesporte.globo.com&sz=128',
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://autoesporte.globo.com/rss/autoesporte/', category: 'automotive' }]
  },
  {
    id: 'quatro-rodas',
    name: 'Quatro Rodas',
    homepage: 'https://quatrorodas.abril.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=quatrorodas.abril.com.br&sz=128',
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://quatrorodas.abril.com.br/feed/', category: 'automotive' }]
  },
  {
    id: 'viagem-e-turismo',
    name: 'Viagem e Turismo',
    homepage: 'https://viagemeturismo.abril.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=viagemeturismo.abril.com.br&sz=128',
    color: '#00A0DF',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://viagemeturismo.abril.com.br/feed/', category: 'travel' }]
  },
  {
    id: 'placar',
    name: 'Placar',
    homepage: 'https://placar.com',
    icon: 'https://www.google.com/s2/favicons?domain=placar.com&sz=128',
    color: '#1A1A1A',
    kind: 'sports',
    language: 'pt',
    feeds: [{ url: 'https://placar.com/feed/', category: 'sports' }]
  },
  {
    id: 'trivela',
    name: 'Trivela',
    homepage: 'https://trivela.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=trivela.com.br&sz=128',
    color: '#0B5E2B',
    kind: 'sports',
    language: 'pt',
    feeds: [{ url: 'https://trivela.com.br/feed/', category: 'sports' }]
  },
  {
    id: 'noticias-da-tv',
    name: 'Notícias da TV',
    homepage: 'https://noticiasdatv.uol.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=noticiasdatv.uol.com.br&sz=128',
    color: '#6A1B9A',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://noticiasdatv.uol.com.br/feed', category: 'entertainment' }]
  },
  {
    id: 'rolling-stone-brasil',
    name: 'Rolling Stone Brasil',
    homepage: 'https://rollingstone.com.br',
    icon: 'https://www.google.com/s2/favicons?domain=rollingstone.com.br&sz=128',
    color: '#D32323',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://rollingstone.com.br/feed/', category: 'entertainment' }]
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
