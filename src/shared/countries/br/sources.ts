import type { SourceDef } from '../../types'

/*
 * Brazil — Portuguese-language national sources. Every feed was checked on
 * 2026-09-23 (re-check with `npm run verify:feeds br`).
 *
 * Not included: the old estadao.com.br/rss/* paths (404; the paper now publishes
 * through its Arc outbound feed) and the G1 science feed, stale for years.
 */

export const sources: SourceDef[] = [
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
      { url: 'https://g1.globo.com/rss/g1/carros/', category: 'automotive' }
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
      { url: 'https://feeds.folha.uol.com.br/esporte/rss091.xml', category: 'sports' }
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
      { url: 'https://rss.uol.com.br/feed/esporte.xml', category: 'sports' }
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
      { url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', category: 'national' }
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
    feeds: [{ url: 'https://veja.abril.com.br/feed/', category: 'general' }]
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
  }
]
