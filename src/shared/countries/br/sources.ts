import type { SourceDef } from '../../types'
import { favicon } from '../build.ts'
import { localSources } from './local.ts'

/*
 * Brazil — Portuguese-language national sources, plus g1's page for every state and the
 * regional papers (see `local.ts`). Every feed was checked on 2026-09-24 (re-check with
 * `npm run verify:feeds br`).
 *
 * The default set runs from Intercept Brasil, Agência Pública and Nexo to Jovem Pan and
 * Revista Oeste around the big dailies and broadcasters; the partisan weeklies and sites
 * (CartaCapital, Brasil de Fato, Fórum, Brasil 247, DCM, O Antagonista), the celebrity
 * magazines and the niche trade titles stay off by default, as in the Turkey pack.
 *
 * Not included: the old estadao.com.br/rss/* paths (404; the paper now publishes through
 * its Arc outbound feed) and its E-Investidor, tecnologia, saúde, sustentabilidade and
 * Mobilidade feeds (stale for months), g1's natureza feed (stale), R7 and Record (no feed),
 * Band, BandNews, Forbes Brasil, Observatório da TV, Le Monde Diplomatique Brasil, Agência
 * Lupa, InfoAmazonia, Pleno News, Jornal do Brasil and the IBGE news agency (403 or a bot
 * check), RedeTV! and Aos Fatos (5xx), TV Cultura, Lance!, Omelete, Jovem Nerd, Purepeople,
 * AdoroCinema, NaTelinha, Migalhas, Nova Escola and Minha Vida (no feed), CNN Brasil's,
 * Exame's, Poder360's and InfoMoney's section feeds (404, 403 or empty), Você S/A, Motor Show
 * and Carros.blog.br (empty feeds), Crusoé (a week old at the check), Questão de Ciência
 * (closed), Agência FAPESP (no item dates) and Mongabay Brasil and B9 (their dates use
 * Portuguese month names the feed parser does not read yet).
 */

/** ESPN Brasil stamps Brasília time with "EST" (checked against the newest items at the check). */
const ESPN_BRASIL_TIME = 'America/Sao_Paulo'

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
      { url: 'https://g1.globo.com/rss/g1/ciencia/', category: 'science' },
      { url: 'https://g1.globo.com/rss/g1/saude/', category: 'health' },
      { url: 'https://g1.globo.com/rss/g1/meio-ambiente/', category: 'environment' },
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
      { url: 'https://feeds.folha.uol.com.br/comida/rss091.xml', category: 'lifestyle' },
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
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/brasil/?outputType=xml',
        category: 'national'
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
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/ciencia/?outputType=xml',
        category: 'science'
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
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/emais/?outputType=xml',
        category: 'entertainment'
      },
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/paladar/?outputType=xml',
        category: 'lifestyle'
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
    icon: favicon('oglobo.globo.com'),
    color: '#1D4F91',
    kind: 'mainstream',
    language: 'pt',
    feeds: [
      { url: 'https://oglobo.globo.com/rss/oglobo', category: 'general' },
      { url: 'https://oglobo.globo.com/rss/oglobo/politica/', category: 'politics' },
      { url: 'https://oglobo.globo.com/rss/oglobo/economia/', category: 'economy' },
      { url: 'https://oglobo.globo.com/rss/oglobo/mundo/', category: 'world' },
      { url: 'https://oglobo.globo.com/rss/oglobo/esportes/', category: 'sports' },
      { url: 'https://oglobo.globo.com/rss/oglobo/cultura/', category: 'culture' },
      { url: 'https://oglobo.globo.com/rss/oglobo/opiniao/', category: 'opinion' }
    ]
  },
  {
    id: 'jovem-pan',
    name: 'Jovem Pan',
    homepage: 'https://jovempan.com.br',
    icon: favicon('jovempan.com.br'),
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://jovempan.com.br/feed/', category: 'general' }]
  },
  {
    id: 'istoe',
    name: 'IstoÉ',
    homepage: 'https://istoe.com.br',
    icon: favicon('istoe.com.br'),
    color: '#D71920',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://istoe.com.br/feed', category: 'general' }]
  },
  {
    id: 'revista-oeste',
    name: 'Revista Oeste',
    homepage: 'https://revistaoeste.com',
    icon: favicon('revistaoeste.com'),
    color: '#0B2340',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://revistaoeste.com/feed/', category: 'politics' }]
  },
  {
    id: 'intercept-brasil',
    name: 'Intercept Brasil',
    homepage: 'https://www.intercept.com.br',
    icon: favicon('intercept.com.br'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://www.intercept.com.br/feed/', category: 'politics' }]
  },
  {
    id: 'agencia-publica',
    name: 'Agência Pública',
    homepage: 'https://apublica.org',
    icon: favicon('apublica.org'),
    color: '#E94E1B',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://apublica.org/feed/', category: 'national' }]
  },
  {
    id: 'nexo',
    name: 'Nexo Jornal',
    homepage: 'https://www.nexojornal.com.br',
    icon: favicon('nexojornal.com.br'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://www.nexojornal.com.br/rss.xml', category: 'general' }]
  },
  {
    id: 'piaui',
    name: 'piauí',
    homepage: 'https://piaui.uol.com.br',
    icon: favicon('piaui.uol.com.br'),
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
  {
    id: 'sbt-news',
    name: 'SBT News',
    homepage: 'https://sbtnews.sbt.com.br',
    icon: favicon('sbtnews.sbt.com.br'),
    color: '#0055A5',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://sbtnews.sbt.com.br/rss.xml', category: 'general' }]
  },
  {
    id: 'cbn',
    name: 'CBN',
    homepage: 'https://cbn.globo.com',
    icon: favicon('cbn.globo.com'),
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://cbn.globo.com/rss/cbn/', category: 'general' }]
  },
  {
    id: 'terra',
    name: 'Terra',
    homepage: 'https://www.terra.com.br',
    icon: favicon('terra.com.br'),
    color: '#F26522',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    // A portal feed: mostly partner and wire copy that other sources already carry.
    feeds: [{ url: 'https://www.terra.com.br/rss/', category: 'general' }]
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
  {
    id: 'agencia-senado',
    name: 'Agência Senado',
    homepage: 'https://www12.senado.leg.br/noticias',
    icon: favicon('senado.leg.br'),
    color: '#003366',
    kind: 'public',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www12.senado.leg.br/noticias/rss', category: 'politics' }]
  },
  {
    id: 'agencia-camara',
    name: 'Agência Câmara',
    homepage: 'https://www.camara.leg.br/noticias',
    icon: favicon('camara.leg.br'),
    color: '#006633',
    kind: 'public',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.camara.leg.br/noticias/rss/ultimas-noticias', category: 'politics' }]
  },
  {
    id: 'dw-brasil',
    name: 'DW Brasil',
    homepage: 'https://www.dw.com/pt-br',
    icon: favicon('dw.com'),
    color: '#05141F',
    kind: 'international',
    language: 'pt',
    feeds: [{ url: 'https://rss.dw.com/xml/rss-br-top', category: 'world' }]
  },
  {
    id: 'rfi-brasil',
    name: 'RFI Brasil',
    homepage: 'https://www.rfi.fr/br',
    icon: favicon('rfi.fr'),
    color: '#D8001D',
    kind: 'international',
    language: 'pt',
    feeds: [{ url: 'https://www.rfi.fr/br/rss', category: 'world' }]
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
      { url: 'https://veja.abril.com.br/economia/feed/', category: 'economy' },
      { url: 'https://veja.abril.com.br/mundo/feed/', category: 'world' },
      { url: 'https://veja.abril.com.br/esporte/feed/', category: 'sports' },
      { url: 'https://veja.abril.com.br/tecnologia/feed/', category: 'technology' },
      { url: 'https://veja.abril.com.br/saude/feed/', category: 'health' },
      { url: 'https://veja.abril.com.br/cultura/feed/', category: 'culture' }
    ]
  },
  {
    id: 'congresso-em-foco',
    name: 'Congresso em Foco',
    homepage: 'https://www.congressoemfoco.com.br',
    icon: favicon('congressoemfoco.com.br'),
    color: '#0A4D8C',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://www.congressoemfoco.com.br/feed', category: 'politics' }]
  },
  {
    id: 'jota',
    name: 'JOTA',
    homepage: 'https://www.jota.info',
    icon: favicon('jota.info'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://www.jota.info/feed', category: 'politics' }]
  },
  {
    id: 'conjur',
    name: 'Consultor Jurídico',
    homepage: 'https://conjur.com.br',
    icon: favicon('conjur.com.br'),
    color: '#8B0000',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://conjur.com.br/feed/', category: 'national' }]
  },
  {
    id: 'the-conversation-brasil',
    name: 'The Conversation Brasil',
    homepage: 'https://theconversation.com/br',
    icon: favicon('theconversation.com'),
    color: '#D8352A',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://theconversation.com/br/articles.atom', category: 'science' }]
  },
  {
    id: 'brasil-de-fato',
    name: 'Brasil de Fato',
    homepage: 'https://www.brasildefato.com.br',
    icon: favicon('brasildefato.com.br'),
    color: '#C8102E',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.brasildefato.com.br/feed/', category: 'politics' }]
  },
  {
    id: 'revista-forum',
    name: 'Revista Fórum',
    homepage: 'https://revistaforum.com.br',
    icon: favicon('revistaforum.com.br'),
    color: '#B71C1C',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://revistaforum.com.br/feed', category: 'politics' }]
  },
  {
    id: 'brasil-247',
    name: 'Brasil 247',
    homepage: 'https://www.brasil247.com',
    icon: favicon('brasil247.com'),
    color: '#D32F2F',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.brasil247.com/feed/', category: 'politics' }]
  },
  {
    id: 'diario-do-centro-do-mundo',
    name: 'Diário do Centro do Mundo',
    homepage: 'https://www.diariodocentrodomundo.com.br',
    icon: favicon('diariodocentrodomundo.com.br'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.diariodocentrodomundo.com.br/feed/', category: 'politics' }]
  },
  {
    id: 'o-antagonista',
    name: 'O Antagonista',
    homepage: 'https://oantagonista.com.br',
    icon: favicon('oantagonista.com.br'),
    color: '#0D2C54',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://oantagonista.com.br/feed/', category: 'politics' }]
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
    icon: favicon('valor.globo.com'),
    color: '#0B6B3A',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://valor.globo.com/rss/valor/', category: 'economy' }]
  },
  {
    id: 'epoca-negocios',
    name: 'Época Negócios',
    homepage: 'https://epocanegocios.globo.com',
    icon: favicon('epocanegocios.globo.com'),
    color: '#C8102E',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://epocanegocios.globo.com/rss/epocanegocios/', category: 'economy' }]
  },
  {
    id: 'seu-dinheiro',
    name: 'Seu Dinheiro',
    homepage: 'https://www.seudinheiro.com',
    icon: favicon('seudinheiro.com'),
    color: '#00A859',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://www.seudinheiro.com/feed/', category: 'economy' }]
  },
  {
    id: 'money-times',
    name: 'Money Times',
    homepage: 'https://www.moneytimes.com.br',
    icon: favicon('moneytimes.com.br'),
    color: '#0C2340',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://www.moneytimes.com.br/feed/', category: 'economy' }]
  },
  {
    id: 'canaltech',
    name: 'Canaltech',
    homepage: 'https://canaltech.com.br',
    icon: favicon('canaltech.com.br'),
    color: '#E4032E',
    kind: 'technology',
    language: 'pt',
    feeds: [{ url: 'https://canaltech.com.br/rss/', category: 'technology' }]
  },
  {
    id: 'superinteressante',
    name: 'Superinteressante',
    homepage: 'https://super.abril.com.br',
    icon: favicon('super.abril.com.br'),
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://super.abril.com.br/feed/', category: 'science' }]
  },
  {
    id: 'veja-saude',
    name: 'Veja Saúde',
    homepage: 'https://saude.abril.com.br',
    icon: favicon('saude.abril.com.br'),
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://saude.abril.com.br/feed/', category: 'health' }]
  },
  {
    id: 'porvir',
    name: 'Porvir',
    homepage: 'https://porvir.org',
    icon: favicon('porvir.org'),
    color: '#F39200',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://porvir.org/feed/', category: 'education' }]
  },
  {
    id: 'oeco',
    name: '((o))eco',
    homepage: 'https://oeco.org.br',
    icon: favicon('oeco.org.br'),
    color: '#2E7D32',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://oeco.org.br/feed/', category: 'environment' }]
  },
  {
    id: 'um-so-planeta',
    name: 'Um Só Planeta',
    homepage: 'https://umsoplaneta.globo.com',
    icon: favicon('umsoplaneta.globo.com'),
    color: '#1B8A5A',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://umsoplaneta.globo.com/rss/umsoplaneta/', category: 'environment' }]
  },
  {
    id: 'autoesporte',
    name: 'Autoesporte',
    homepage: 'https://autoesporte.globo.com',
    icon: favicon('autoesporte.globo.com'),
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://autoesporte.globo.com/rss/autoesporte/', category: 'automotive' }]
  },
  {
    id: 'quatro-rodas',
    name: 'Quatro Rodas',
    homepage: 'https://quatrorodas.abril.com.br',
    icon: favicon('quatrorodas.abril.com.br'),
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://quatrorodas.abril.com.br/feed/', category: 'automotive' }]
  },
  {
    id: 'viagem-e-turismo',
    name: 'Viagem e Turismo',
    homepage: 'https://viagemeturismo.abril.com.br',
    icon: favicon('viagemeturismo.abril.com.br'),
    color: '#00A0DF',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://viagemeturismo.abril.com.br/feed/', category: 'travel' }]
  },
  {
    id: 'placar',
    name: 'Placar',
    homepage: 'https://placar.com',
    icon: favicon('placar.com'),
    color: '#1A1A1A',
    kind: 'sports',
    language: 'pt',
    feeds: [{ url: 'https://placar.com/feed/', category: 'sports' }]
  },
  {
    id: 'trivela',
    name: 'Trivela',
    homepage: 'https://trivela.com.br',
    icon: favicon('trivela.com.br'),
    color: '#0B5E2B',
    kind: 'sports',
    language: 'pt',
    feeds: [{ url: 'https://trivela.com.br/feed/', category: 'sports' }]
  },
  {
    id: 'noticias-da-tv',
    name: 'Notícias da TV',
    homepage: 'https://noticiasdatv.uol.com.br',
    icon: favicon('noticiasdatv.uol.com.br'),
    color: '#6A1B9A',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://noticiasdatv.uol.com.br/feed', category: 'entertainment' }]
  },
  {
    id: 'rolling-stone-brasil',
    name: 'Rolling Stone Brasil',
    homepage: 'https://rollingstone.com.br',
    icon: favicon('rollingstone.com.br'),
    color: '#D32323',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://rollingstone.com.br/feed/', category: 'entertainment' }]
  },

  // Business
  {
    id: 'brazil-journal',
    name: 'Brazil Journal',
    homepage: 'https://braziljournal.com',
    icon: favicon('braziljournal.com'),
    color: '#0B1F3A',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://braziljournal.com/feed/', category: 'economy' }]
  },
  {
    id: 'neofeed',
    name: 'NeoFeed',
    homepage: 'https://neofeed.com.br',
    icon: favicon('neofeed.com.br'),
    color: '#FF6A13',
    kind: 'business',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://neofeed.com.br/feed/', category: 'economy' }]
  },
  {
    id: 'istoe-dinheiro',
    name: 'IstoÉ Dinheiro',
    homepage: 'https://istoedinheiro.com.br',
    icon: favicon('istoedinheiro.com.br'),
    color: '#D71920',
    kind: 'business',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://istoedinheiro.com.br/feed/rss2', category: 'economy' }]
  },
  {
    id: 'valor-investe',
    name: 'Valor Investe',
    homepage: 'https://valorinveste.globo.com',
    icon: favicon('valorinveste.globo.com'),
    color: '#0B6B3A',
    kind: 'business',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://valorinveste.globo.com/rss/valorinveste/', category: 'economy' }]
  },
  {
    id: 'pegn',
    name: 'Pequenas Empresas & Grandes Negócios',
    homepage: 'https://revistapegn.globo.com',
    icon: favicon('revistapegn.globo.com'),
    color: '#E4032E',
    kind: 'business',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://revistapegn.globo.com/rss/pegn/', category: 'economy' }]
  },
  {
    id: 'globo-rural',
    name: 'Globo Rural',
    homepage: 'https://globorural.globo.com',
    icon: favicon('globorural.globo.com'),
    color: '#3A7D22',
    kind: 'business',
    language: 'pt',
    feeds: [{ url: 'https://globorural.globo.com/rss/globorural/', category: 'economy' }]
  },
  {
    id: 'canal-rural',
    name: 'Canal Rural',
    homepage: 'https://www.canalrural.com.br',
    icon: favicon('canalrural.com.br'),
    color: '#00843D',
    kind: 'business',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.canalrural.com.br/feed/', category: 'economy' }]
  },

  // Sport
  {
    id: 'espn-brasil',
    name: 'ESPN Brasil',
    homepage: 'https://www.espn.com.br',
    icon: favicon('espn.com.br'),
    color: '#CC0000',
    kind: 'sports',
    language: 'pt',
    feeds: [{ url: 'https://www.espn.com.br/rss', category: 'sports', timeZone: ESPN_BRASIL_TIME }]
  },
  {
    id: 'gazeta-esportiva',
    name: 'Gazeta Esportiva',
    homepage: 'https://www.gazetaesportiva.com',
    icon: favicon('gazetaesportiva.com'),
    color: '#0057A8',
    kind: 'sports',
    language: 'pt',
    feeds: [{ url: 'https://www.gazetaesportiva.com/feed/', category: 'sports' }]
  },

  // Technology and science
  {
    id: 'tecmundo',
    name: 'TecMundo',
    homepage: 'https://www.estadao.com.br/tecmundo',
    icon: favicon('tecmundo.com.br'),
    color: '#0091EA',
    kind: 'technology',
    language: 'pt',
    feeds: [
      {
        url: 'https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/tecmundo/?outputType=xml',
        category: 'technology'
      }
    ]
  },
  {
    id: 'techtudo',
    name: 'TechTudo',
    homepage: 'https://www.techtudo.com.br',
    icon: favicon('techtudo.com.br'),
    color: '#1E88E5',
    kind: 'technology',
    language: 'pt',
    defaultEnabled: false,
    // 100 items with full text, about 1 MB a fetch.
    feeds: [{ url: 'https://www.techtudo.com.br/rss/techtudo', category: 'technology' }]
  },
  {
    id: 'macmagazine',
    name: 'MacMagazine',
    homepage: 'https://macmagazine.com.br',
    icon: favicon('macmagazine.com.br'),
    color: '#1A1A1A',
    kind: 'technology',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://macmagazine.com.br/feed/', category: 'technology' }]
  },
  {
    id: 'tudocelular',
    name: 'Tudocelular',
    homepage: 'https://www.tudocelular.com',
    icon: favicon('tudocelular.com'),
    color: '#E53935',
    kind: 'technology',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.tudocelular.com/feed/', category: 'technology' }]
  },
  {
    id: 'showmetech',
    name: 'Showmetech',
    homepage: 'https://www.showmetech.com.br',
    icon: favicon('showmetech.com.br'),
    color: '#F7A600',
    kind: 'technology',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.showmetech.com.br/feed/', category: 'technology' }]
  },
  {
    id: 'galileu',
    name: 'Revista Galileu',
    homepage: 'https://revistagalileu.globo.com',
    icon: favicon('revistagalileu.globo.com'),
    color: '#00A0DF',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://revistagalileu.globo.com/rss/galileu/', category: 'science' }]
  },
  {
    id: 'pesquisa-fapesp',
    name: 'Pesquisa FAPESP',
    homepage: 'https://revistapesquisa.fapesp.br',
    icon: favicon('revistapesquisa.fapesp.br'),
    color: '#004B87',
    kind: 'public',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://revistapesquisa.fapesp.br/feed/', category: 'science' }]
  },

  // Health, education and environment
  {
    id: 'drauzio-varella',
    name: 'Portal Drauzio Varella',
    homepage: 'https://drauziovarella.uol.com.br',
    icon: favicon('drauziovarella.uol.com.br'),
    color: '#00A99D',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://drauziovarella.uol.com.br/feed/', category: 'health' }]
  },
  {
    id: 'agencia-fiocruz',
    name: 'Agência Fiocruz',
    homepage: 'https://agencia.fiocruz.br',
    icon: favicon('agencia.fiocruz.br'),
    color: '#005A9C',
    kind: 'public',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://agencia.fiocruz.br/rss.xml', category: 'health' }]
  },
  {
    id: 'guia-do-estudante',
    name: 'Guia do Estudante',
    homepage: 'https://guiadoestudante.abril.com.br',
    icon: favicon('guiadoestudante.abril.com.br'),
    color: '#F7941D',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://guiadoestudante.abril.com.br/feed/', category: 'education' }]
  },
  {
    id: 'amazonia-real',
    name: 'Amazônia Real',
    homepage: 'https://amazoniareal.com.br',
    icon: favicon('amazoniareal.com.br'),
    color: '#2E7D32',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://amazoniareal.com.br/feed/', category: 'environment' }]
  },
  {
    id: 'climainfo',
    name: 'ClimaInfo',
    homepage: 'https://climainfo.org.br',
    icon: favicon('climainfo.org.br'),
    color: '#0F7B6C',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://climainfo.org.br/feed/', category: 'environment' }]
  },

  // Entertainment, culture and lifestyle
  {
    id: 'pipoca-moderna',
    name: 'Pipoca Moderna',
    homepage: 'https://pipocamoderna.com.br',
    icon: favicon('pipocamoderna.com.br'),
    color: '#E53935',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://pipocamoderna.com.br/feed/', category: 'entertainment' }]
  },
  {
    id: 'revista-cult',
    name: 'Revista Cult',
    homepage: 'https://revistacult.uol.com.br',
    icon: favicon('revistacult.uol.com.br'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'pt',
    feeds: [{ url: 'https://revistacult.uol.com.br/home/feed/', category: 'culture' }]
  },
  {
    id: 'gshow',
    name: 'gshow',
    homepage: 'https://gshow.globo.com',
    icon: favicon('gshow.globo.com'),
    color: '#FF6600',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://gshow.globo.com/rss/gshow/', category: 'entertainment' }]
  },
  {
    id: 'quem',
    name: 'Quem',
    homepage: 'https://revistaquem.globo.com',
    icon: favicon('revistaquem.globo.com'),
    color: '#E4007C',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://revistaquem.globo.com/rss/quem/', category: 'entertainment' }]
  },
  {
    id: 'contigo',
    name: 'Contigo!',
    homepage: 'https://contigo.com.br',
    icon: favicon('contigo.com.br'),
    color: '#E30613',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://contigo.com.br/feed', category: 'entertainment' }]
  },
  {
    id: 'caras',
    name: 'Caras',
    homepage: 'https://caras.com.br',
    icon: favicon('caras.com.br'),
    color: '#C8102E',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://caras.com.br/feed', category: 'entertainment' }]
  },
  {
    id: 'hugo-gloss',
    name: 'Hugo Gloss',
    homepage: 'https://hugogloss.uol.com.br',
    icon: favicon('hugogloss.uol.com.br'),
    color: '#E91E63',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://hugogloss.uol.com.br/feed/', category: 'entertainment' }]
  },
  {
    id: 'claudia',
    name: 'Claudia',
    homepage: 'https://claudia.abril.com.br',
    icon: favicon('claudia.abril.com.br'),
    color: '#C2185B',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://claudia.abril.com.br/feed/', category: 'lifestyle' }]
  },
  {
    id: 'marie-claire-brasil',
    name: 'Marie Claire Brasil',
    homepage: 'https://revistamarieclaire.globo.com',
    icon: favicon('revistamarieclaire.globo.com'),
    color: '#1A1A1A',
    kind: 'mainstream',
    language: 'pt',
    feeds: [{ url: 'https://revistamarieclaire.globo.com/rss/marieclaire/', category: 'lifestyle' }]
  },
  {
    id: 'vogue-brasil',
    name: 'Vogue Brasil',
    homepage: 'https://vogue.globo.com',
    icon: favicon('vogue.globo.com'),
    color: '#1A1A1A',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://vogue.globo.com/rss/vogue/', category: 'lifestyle' }]
  },
  {
    id: 'elle-brasil',
    name: 'ELLE Brasil',
    homepage: 'https://elle.com.br',
    icon: favicon('elle.com.br'),
    color: '#1A1A1A',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://elle.com.br/feed', category: 'lifestyle' }]
  },
  {
    id: 'gq-brasil',
    name: 'GQ Brasil',
    homepage: 'https://gq.globo.com',
    icon: favicon('gq.globo.com'),
    color: '#1A1A1A',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://gq.globo.com/rss/gq/', category: 'lifestyle' }]
  },
  {
    id: 'crescer',
    name: 'Crescer',
    homepage: 'https://revistacrescer.globo.com',
    icon: favicon('revistacrescer.globo.com'),
    color: '#F39200',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://revistacrescer.globo.com/rss/crescer/', category: 'lifestyle' }]
  },
  {
    id: 'catraca-livre',
    name: 'Catraca Livre',
    homepage: 'https://catracalivre.com.br',
    icon: favicon('catracalivre.com.br'),
    color: '#E53935',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://catracalivre.com.br/feed/', category: 'lifestyle' }]
  },

  // Travel and motoring
  {
    id: 'melhores-destinos',
    name: 'Melhores Destinos',
    homepage: 'https://www.melhoresdestinos.com.br',
    icon: favicon('melhoresdestinos.com.br'),
    color: '#0077C8',
    kind: 'independent',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.melhoresdestinos.com.br/feed', category: 'travel' }]
  },
  {
    id: 'motor1-brasil',
    name: 'Motor1 Brasil',
    homepage: 'https://motor1.uol.com.br',
    icon: favicon('motor1.uol.com.br'),
    color: '#E4032E',
    kind: 'mainstream',
    language: 'pt',
    defaultEnabled: false,
    feeds: [{ url: 'https://motor1.uol.com.br/rss/news/all/', category: 'automotive' }]
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
