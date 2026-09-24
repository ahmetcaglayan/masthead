import type { FeedDef, SourceDef, SourceKind } from '../../types'
import { favicon } from '../build.ts'
import { localSources } from './local.ts'

/*
 * France — French-language national sources, plus local news for every department (see
 * `local.ts`). Every feed was checked on 2026-09-24 (re-check with `npm run verify:feeds fr`).
 * Newsrooms outside France (Le Soir, RTBF, RTS, Radio-Canada) are left out.
 *
 * Not included: Le Point, CNews, Europe 1, Première and La Montagne (they answer 403 to feed
 * readers), RTL, Eurosport, Elle, Marie Claire, Madame Figaro, Cosmopolitan, Gala, Boursorama
 * and Le Routard (no public feed), the France Inter and France Culture feeds (programmes, not
 * news), Le Figaro's culture feed (weeks old) and L'Obs's tech, health and science feeds (stale).
 * The celebrity weeklies (Voici, Closer, Public) are off by default, like the tabloids in the
 * Turkey pack, and so are the subscriber-only Arrêt sur images and Les Jours.
 */

interface Extra {
  color?: string
  defaultEnabled?: false
}

function fr(
  id: string,
  name: string,
  homepage: string,
  kind: SourceKind,
  feeds: FeedDef[],
  extra: Extra = {}
): SourceDef {
  return {
    id,
    name,
    homepage,
    icon: favicon(new URL(homepage).hostname.replace(/^www\./, '')),
    kind,
    language: 'fr',
    feeds,
    ...extra
  }
}

const lemonde = (section: string): string => `https://www.lemonde.fr/${section}/rss_full.xml`
const figaro = (feed: string): string => `https://www.lefigaro.fr/rss/figaro_${feed}.xml`
const franceinfo = (section: string): string => `https://www.franceinfo.fr/${section}.rss`
const vingt = (feed: string): string => `https://www.20minutes.fr/feeds/rss-${feed}.xml`
const bfm = (section: string): string => `https://www.bfmtv.com/rss/${section}/`
const lexpress = (section: string): string => `https://www.lexpress.fr/arc/outboundfeeds/rss/${section}.xml`
const obs = (section: string): string => `https://www.nouvelobs.com/${section}/rss.xml`
const libe = (category: string): string =>
  `https://www.liberation.fr/arc/outboundfeeds/rss/category/${category}/?outputType=xml`
const echos = (feed: string): string => `https://services.lesechos.fr/rss/les-echos-${feed}.xml`
const lequipe = (path: string): string => `https://dwh.lequipe.fr/api/edito/rss?path=/${path}`
const parisien = (section: string): string => `https://feeds.leparisien.fr/leparisien/rss/${section}`
const prisma = (brand: string): string => `https://feed.prismamediadigital.com/v1/${brand}/rss?limit=20`

const nationalSources: SourceDef[] = [
  // Public service
  fr(
    'franceinfo',
    'franceinfo',
    'https://www.franceinfo.fr',
    'public',
    [
      { url: franceinfo('titres'), category: 'top', headline: true },
      { url: franceinfo('france'), category: 'national' },
      { url: franceinfo('politique'), category: 'politics' },
      { url: franceinfo('monde'), category: 'world' },
      { url: franceinfo('economie'), category: 'economy' },
      { url: franceinfo('societe'), category: 'general' },
      { url: franceinfo('faits-divers'), category: 'general' },
      { url: franceinfo('sports'), category: 'sports' },
      { url: franceinfo('culture'), category: 'culture' },
      { url: franceinfo('sante'), category: 'health' },
      { url: franceinfo('sciences'), category: 'science' },
      { url: franceinfo('internet'), category: 'technology' },
      { url: franceinfo('environnement'), category: 'environment' }
    ],
    { color: '#1B2A4E' }
  ),
  fr(
    'france24',
    'France 24',
    'https://www.france24.com/fr',
    'international',
    [
      { url: 'https://www.france24.com/fr/rss', category: 'general' },
      { url: 'https://www.france24.com/fr/france/rss', category: 'national' },
      { url: 'https://www.france24.com/fr/europe/rss', category: 'world' },
      { url: 'https://www.france24.com/fr/afrique/rss', category: 'world' },
      { url: 'https://www.france24.com/fr/%C3%A9co-tech/rss', category: 'economy' }
    ],
    { color: '#00A0DD' }
  ),
  fr(
    'rfi',
    'RFI',
    'https://www.rfi.fr/fr',
    'international',
    [
      { url: 'https://www.rfi.fr/fr/rss', category: 'general' },
      { url: 'https://www.rfi.fr/fr/france/rss', category: 'national' },
      { url: 'https://www.rfi.fr/fr/monde/rss', category: 'world' },
      { url: 'https://www.rfi.fr/fr/afrique/rss', category: 'world' },
      { url: 'https://www.rfi.fr/fr/europe/rss', category: 'world' }
    ],
    { color: '#D40030' }
  ),
  fr('euronews-fr', 'Euronews', 'https://fr.euronews.com', 'international', [
    { url: 'https://fr.euronews.com/rss', category: 'world' }
  ]),

  // National dailies and weeklies
  fr(
    'le-monde',
    'Le Monde',
    'https://www.lemonde.fr',
    'mainstream',
    [
      { url: 'https://www.lemonde.fr/rss/une.xml', category: 'top', headline: true },
      { url: 'https://www.lemonde.fr/rss/en_continu.xml', category: 'breaking', breaking: true },
      { url: lemonde('politique'), category: 'politics' },
      { url: lemonde('international'), category: 'world' },
      { url: lemonde('afrique'), category: 'world' },
      { url: lemonde('economie'), category: 'economy' },
      { url: lemonde('argent'), category: 'economy' },
      { url: lemonde('societe'), category: 'national' },
      { url: lemonde('sport'), category: 'sports' },
      { url: lemonde('pixels'), category: 'technology' },
      { url: lemonde('sciences'), category: 'science' },
      { url: lemonde('sante'), category: 'health' },
      { url: lemonde('planete'), category: 'environment' },
      { url: lemonde('culture'), category: 'culture' },
      { url: lemonde('m-le-mag'), category: 'lifestyle' },
      { url: lemonde('education'), category: 'education' },
      { url: lemonde('idees'), category: 'opinion' }
    ],
    { color: '#1A1A1A' }
  ),
  fr(
    'le-figaro',
    'Le Figaro',
    'https://www.lefigaro.fr',
    'mainstream',
    [
      { url: figaro('actualites'), category: 'top', headline: true },
      { url: figaro('flash-actu'), category: 'breaking', breaking: true },
      { url: figaro('actualite-france'), category: 'national' },
      { url: figaro('politique'), category: 'politics' },
      { url: figaro('international'), category: 'world' },
      { url: figaro('economie'), category: 'economy' },
      { url: figaro('sport'), category: 'sports' },
      { url: figaro('secteur_high-tech'), category: 'technology' },
      { url: figaro('sciences'), category: 'science' },
      { url: figaro('sante'), category: 'health' },
      { url: figaro('lifestyle'), category: 'lifestyle' },
      { url: figaro('voyages'), category: 'travel' },
      { url: figaro('automobile'), category: 'automotive' },
      { url: figaro('vox'), category: 'opinion' }
    ],
    { color: '#163860' }
  ),
  // Its feeds carry no dates: stories take the day in their URL, or today's when first seen.
  fr(
    'le-parisien',
    'Le Parisien',
    'https://www.leparisien.fr',
    'mainstream',
    [
      { url: 'https://feeds.leparisien.fr/leparisien/rss', category: 'general' },
      { url: parisien('politique'), category: 'politics' },
      { url: parisien('international'), category: 'world' },
      { url: parisien('economie'), category: 'economy' },
      { url: parisien('societe'), category: 'national' },
      { url: parisien('faits-divers'), category: 'general' },
      { url: parisien('sports'), category: 'sports' },
      { url: parisien('culture-loisirs'), category: 'culture' }
    ],
    { color: '#0F6FAF' }
  ),
  fr(
    '20-minutes',
    '20 Minutes',
    'https://www.20minutes.fr',
    'mainstream',
    [
      { url: vingt('une'), category: 'top', headline: true },
      { url: vingt('politique'), category: 'politics' },
      { url: vingt('monde'), category: 'world' },
      { url: vingt('economie'), category: 'economy' },
      { url: vingt('sport'), category: 'sports' },
      { url: vingt('high-tech'), category: 'technology' },
      { url: vingt('sciences'), category: 'science' },
      { url: vingt('sante'), category: 'health' },
      { url: vingt('planete'), category: 'environment' },
      { url: vingt('culture'), category: 'culture' },
      { url: vingt('television'), category: 'entertainment' }
    ],
    { color: '#0C3D8C' }
  ),
  fr(
    'ouest-france',
    'Ouest-France',
    'https://www.ouest-france.fr',
    'mainstream',
    [
      { url: 'https://www.ouest-france.fr/rss/une', category: 'top', headline: true },
      { url: 'https://www.ouest-france.fr/rss/france', category: 'national' },
      { url: 'https://www.ouest-france.fr/rss/monde', category: 'world' },
      { url: 'https://www.ouest-france.fr/rss/sport', category: 'sports' }
    ],
    { color: '#E2001A' }
  ),
  fr(
    'bfmtv',
    'BFMTV',
    'https://www.bfmtv.com',
    'mainstream',
    [
      { url: bfm('news-24-7'), category: 'breaking', breaking: true },
      { url: bfm('politique'), category: 'politics' },
      { url: bfm('international'), category: 'world' },
      { url: bfm('economie'), category: 'economy' },
      { url: bfm('crypto'), category: 'economy' },
      { url: bfm('societe'), category: 'national' },
      { url: bfm('police-justice'), category: 'general' },
      { url: bfm('tech'), category: 'technology' },
      { url: bfm('sante'), category: 'health' },
      { url: bfm('people'), category: 'entertainment' },
      { url: bfm('auto'), category: 'automotive' }
    ],
    { color: '#1B3B8C' }
  ),
  fr('tf1-info', 'TF1 Info', 'https://www.tf1info.fr', 'mainstream', [
    { url: 'https://www.tf1info.fr/feeds/rss-une.xml', category: 'top', headline: true }
  ]),
  fr(
    'lexpress',
    "L'Express",
    'https://www.lexpress.fr',
    'mainstream',
    [
      { url: lexpress('alaune'), category: 'top', headline: true },
      { url: lexpress('politique'), category: 'politics' },
      { url: lexpress('monde'), category: 'world' },
      { url: lexpress('economie'), category: 'economy' },
      { url: lexpress('societe'), category: 'national' },
      { url: lexpress('sciences-sante'), category: 'health' },
      { url: lexpress('culture'), category: 'culture' }
    ],
    { color: '#E30613' }
  ),
  fr(
    'lobs',
    "L'Obs",
    'https://www.nouvelobs.com',
    'mainstream',
    [
      { url: obs('a-la-une'), category: 'top', headline: true },
      { url: obs('politique'), category: 'politics' },
      { url: obs('monde'), category: 'world' },
      { url: obs('economie'), category: 'economy' },
      { url: obs('societe'), category: 'national' },
      { url: obs('culture'), category: 'culture' }
    ],
    { color: '#C8102E' }
  ),
  fr(
    'liberation',
    'Libération',
    'https://www.liberation.fr',
    'mainstream',
    [
      { url: 'https://www.liberation.fr/arc/outboundfeeds/rss-all/?outputType=xml', category: 'general' },
      { url: libe('politique'), category: 'politics' },
      { url: libe('international'), category: 'world' },
      { url: libe('economie'), category: 'economy' },
      { url: libe('societe'), category: 'national' },
      { url: libe('sports'), category: 'sports' },
      { url: libe('sciences'), category: 'science' },
      { url: libe('environnement'), category: 'environment' },
      { url: libe('culture'), category: 'culture' }
    ],
    { color: '#E6001A' }
  ),
  fr('le-jdd', 'Le JDD', 'https://www.lejdd.fr', 'mainstream', [
    { url: 'https://www.lejdd.fr/rss.xml', category: 'general' }
  ]),
  fr('la-croix', 'La Croix', 'https://www.la-croix.com', 'mainstream', [
    { url: 'https://www.la-croix.com/feeds/rss/site.xml', category: 'general' }
  ]),
  fr('lhumanite', "L'Humanité", 'https://www.humanite.fr', 'mainstream', [
    { url: 'https://www.humanite.fr/feed', category: 'general' }
  ]),
  fr('lopinion', "L'Opinion", 'https://www.lopinion.fr', 'mainstream', [
    { url: 'https://www.lopinion.fr/index.rss', category: 'politics' }
  ]),
  fr('marianne', 'Marianne', 'https://www.marianne.net', 'mainstream', [
    { url: 'https://www.marianne.net/rss.xml', category: 'general' }
  ]),
  fr('valeurs-actuelles', 'Valeurs actuelles', 'https://www.valeursactuelles.com', 'mainstream', [
    { url: 'https://www.valeursactuelles.com/feed?post_type=post', category: 'general' }
  ]),
  fr('huffpost-fr', 'HuffPost', 'https://www.huffingtonpost.fr', 'mainstream', [
    { url: 'https://www.huffingtonpost.fr/rss/all_headline.xml', category: 'general' }
  ]),
  fr('slate-fr', 'Slate.fr', 'https://www.slate.fr', 'mainstream', [
    { url: 'https://www.slate.fr/rss.xml', category: 'general' }
  ]),
  fr('sud-radio', 'Sud Radio', 'https://www.sudradio.fr', 'mainstream', [
    { url: 'https://www.sudradio.fr/feed', category: 'general' }
  ]),
  fr(
    'courrier-international',
    'Courrier international',
    'https://www.courrierinternational.com',
    'international',
    [{ url: 'https://www.courrierinternational.com/feed/all/rss.xml', category: 'world' }]
  ),

  // Independent
  fr('mediapart', 'Mediapart', 'https://www.mediapart.fr', 'independent', [
    { url: 'https://www.mediapart.fr/articles/feed', category: 'general' }
  ]),
  fr('le-monde-diplomatique', 'Le Monde diplomatique', 'https://www.monde-diplomatique.fr', 'independent', [
    { url: 'https://www.monde-diplomatique.fr/recents.xml', category: 'world' }
  ]),
  fr('blast', 'Blast', 'https://www.blast-info.fr', 'independent', [
    { url: 'https://api.blast-info.fr/rss_articles.xml', category: 'general' }
  ]),
  fr('basta', 'Basta!', 'https://basta.media', 'independent', [
    { url: 'https://basta.media/spip.php?page=backend', category: 'general' }
  ]),
  fr('reporterre', 'Reporterre', 'https://reporterre.net', 'independent', [
    { url: 'https://reporterre.net/spip.php?page=backend', category: 'environment' }
  ]),
  fr('vert', 'Vert', 'https://vert.eco', 'independent', [
    { url: 'https://vert.eco/feed/', category: 'environment' }
  ]),
  fr('atlantico', 'Atlantico', 'https://atlantico.fr', 'independent', [
    { url: 'https://rss.atlantico.fr/', category: 'opinion' }
  ]),
  fr('causeur', 'Causeur', 'https://www.causeur.fr', 'independent', [
    { url: 'https://www.causeur.fr/feed', category: 'opinion' }
  ]),
  fr(
    'contrepoints',
    'Contrepoints',
    'https://contrepoints.org',
    'independent',
    [{ url: 'https://contrepoints.org/feed/', category: 'opinion' }],
    { defaultEnabled: false }
  ),
  fr(
    'arret-sur-images',
    'Arrêt sur images',
    'https://www.arretsurimages.net',
    'independent',
    [{ url: 'https://api.arretsurimages.net/api/public/rss/all-content', category: 'culture' }],
    { defaultEnabled: false }
  ),
  fr(
    'les-jours',
    'Les Jours',
    'https://lesjours.fr',
    'independent',
    [{ url: 'https://lesjours.fr/rss.xml', category: 'general' }],
    { defaultEnabled: false }
  ),

  // Business
  fr(
    'les-echos',
    'Les Echos',
    'https://www.lesechos.fr',
    'business',
    [
      { url: echos('economie'), category: 'economy' },
      { url: echos('finance-marches'), category: 'economy' },
      { url: echos('entreprises'), category: 'economy' },
      { url: echos('patrimoine'), category: 'economy' },
      { url: echos('politique'), category: 'politics' },
      { url: echos('monde'), category: 'world' },
      { url: echos('tech-medias'), category: 'technology' }
    ],
    { color: '#E30613' }
  ),
  fr('la-tribune', 'La Tribune', 'https://www.latribune.fr', 'business', [
    { url: 'https://www.latribune.fr/rss/homepage', category: 'economy' }
  ]),
  fr('challenges', 'Challenges', 'https://www.challenges.fr', 'business', [
    { url: 'https://www.challenges.fr/rss.xml', category: 'economy' }
  ]),
  fr('capital', 'Capital', 'https://www.capital.fr', 'business', [
    { url: prisma('cap'), category: 'economy' }
  ]),
  fr('le-revenu', 'Le Revenu', 'https://www.lerevenu.com', 'business', [
    { url: 'https://www.lerevenu.com/rss.xml', category: 'economy' }
  ]),

  // Sport
  fr(
    'lequipe',
    "L'Équipe",
    'https://www.lequipe.fr',
    'sports',
    [
      { url: lequipe(''), category: 'sports' },
      { url: lequipe('Football/'), category: 'sports' },
      { url: lequipe('Rugby/'), category: 'sports' },
      { url: lequipe('Tennis/'), category: 'sports' },
      { url: lequipe('Cyclisme/'), category: 'sports' },
      { url: lequipe('Basket/'), category: 'sports' },
      { url: lequipe('Handball/'), category: 'sports' },
      { url: lequipe('Formule-1/'), category: 'sports' }
    ],
    { color: '#E2001A' }
  ),
  fr('rmc-sport', 'RMC Sport', 'https://rmcsport.bfmtv.com', 'sports', [
    { url: 'https://rmcsport.bfmtv.com/rss/fil-sport/', category: 'sports' },
    { url: 'https://rmcsport.bfmtv.com/rss/football/', category: 'sports' }
  ]),
  fr('so-foot', 'So Foot', 'https://www.sofoot.com', 'sports', [
    { url: 'https://www.sofoot.com/rss', category: 'sports' }
  ]),
  fr('foot-mercato', 'Foot Mercato', 'https://www.footmercato.net', 'sports', [
    { url: 'https://www.footmercato.net/flux-rss', category: 'sports' }
  ]),

  // Technology
  fr('numerama', 'Numerama', 'https://www.numerama.com', 'technology', [
    { url: 'https://www.numerama.com/feed/', category: 'technology' }
  ]),
  fr('01net', '01net', 'https://www.01net.com', 'technology', [
    { url: 'https://www.01net.com/feed/', category: 'technology' }
  ]),
  fr('frandroid', 'Frandroid', 'https://www.frandroid.com', 'technology', [
    { url: 'https://www.frandroid.com/feed', category: 'technology' }
  ]),
  fr('les-numeriques', 'Les Numériques', 'https://www.lesnumeriques.com', 'technology', [
    { url: 'https://www.lesnumeriques.com/rss.xml', category: 'technology' }
  ]),
  fr('clubic', 'Clubic', 'https://www.clubic.com', 'technology', [
    { url: 'https://www.clubic.com/feed/rss', category: 'technology' }
  ]),
  fr('journal-du-geek', 'Journal du Geek', 'https://www.journaldugeek.com', 'technology', [
    { url: 'https://www.journaldugeek.com/feed/', category: 'technology' }
  ]),
  fr('presse-citron', 'Presse-citron', 'https://www.presse-citron.net', 'technology', [
    { url: 'https://www.presse-citron.net/feed/', category: 'technology' }
  ]),
  fr('korben', 'Korben', 'https://korben.info', 'technology', [
    { url: 'https://korben.info/feed', category: 'technology' }
  ]),

  // Science and health
  fr('futura', 'Futura', 'https://www.futura-sciences.com', 'mainstream', [
    { url: 'https://www.futura-sciences.com/rss/actualites.xml', category: 'science' }
  ]),
  fr('sciences-et-avenir', 'Sciences et Avenir', 'https://www.sciencesetavenir.fr', 'mainstream', [
    { url: 'https://www.sciencesetavenir.fr/rss.xml', category: 'science' }
  ]),
  fr('science-et-vie', 'Science & Vie', 'https://www.science-et-vie.com', 'mainstream', [
    { url: 'https://www.science-et-vie.com/feed', category: 'science' }
  ]),
  fr('ca-minteresse', "Ça m'intéresse", 'https://www.caminteresse.fr', 'mainstream', [
    { url: prisma('cam'), category: 'science' }
  ]),
  fr('national-geographic-fr', 'National Geographic', 'https://www.nationalgeographic.fr', 'mainstream', [
    { url: 'https://www.nationalgeographic.fr/api/rss/latest_contents.xml', category: 'science' }
  ]),
  fr('geo', 'GEO', 'https://www.geo.fr', 'mainstream', [{ url: prisma('geo'), category: 'travel' }]),
  fr('doctissimo', 'Doctissimo', 'https://www.doctissimo.fr', 'mainstream', [
    { url: 'https://www.doctissimo.fr/feed', category: 'health' }
  ]),
  fr('sante-magazine', 'Santé Magazine', 'https://www.santemagazine.fr', 'mainstream', [
    { url: 'https://www.santemagazine.fr/feeds/rss', category: 'health' }
  ]),
  fr('top-sante', 'Top Santé', 'https://www.topsante.com', 'mainstream', [
    { url: 'https://www.topsante.com/feed', category: 'health' }
  ]),

  // Culture and entertainment
  fr('allocine', 'AlloCiné', 'https://www.allocine.fr', 'mainstream', [
    { url: 'https://www.allocine.fr/rss/news.xml', category: 'entertainment' }
  ]),
  fr('telerama', 'Télérama', 'https://www.telerama.fr', 'mainstream', [
    { url: 'https://www.telerama.fr/rss/une.xml', category: 'culture' }
  ]),
  fr('les-inrocks', 'Les Inrocks', 'https://www.lesinrocks.com', 'mainstream', [
    { url: 'https://www.lesinrocks.com/feed/', category: 'culture' }
  ]),
  fr('konbini', 'Konbini', 'https://www.konbini.com', 'mainstream', [
    { url: 'https://www.konbini.com/feed/', category: 'entertainment' }
  ]),
  fr('paris-match', 'Paris Match', 'https://www.parismatch.com', 'mainstream', [
    { url: 'https://www.parismatch.com/rss.xml', category: 'entertainment' }
  ]),
  fr('tele-loisirs', 'Télé-Loisirs', 'https://www.programme-tv.net', 'mainstream', [
    { url: 'https://feed.prismamediadigital.com/v1/tel/rss?size=50', category: 'entertainment' }
  ]),
  fr('tele-star', 'Télé Star', 'https://www.telestar.fr', 'mainstream', [
    { url: 'https://www.telestar.fr/feed', category: 'entertainment' }
  ]),
  fr(
    'voici',
    'Voici',
    'https://www.voici.fr',
    'mainstream',
    [{ url: prisma('voi'), category: 'entertainment' }],
    {
      defaultEnabled: false
    }
  ),
  fr(
    'closer',
    'Closer',
    'https://www.closermag.fr',
    'mainstream',
    [{ url: 'https://www.closermag.fr/feed', category: 'entertainment' }],
    { defaultEnabled: false }
  ),
  fr(
    'public-fr',
    'Public',
    'https://www.public.fr',
    'mainstream',
    [{ url: 'https://www.public.fr/feed', category: 'entertainment' }],
    {
      defaultEnabled: false
    }
  ),

  // Lifestyle, cars, education
  fr('vogue-fr', 'Vogue France', 'https://www.vogue.fr', 'mainstream', [
    { url: 'https://www.vogue.fr/feed/rss', category: 'lifestyle' }
  ]),
  fr('grazia', 'Grazia', 'https://www.grazia.fr', 'mainstream', [
    { url: 'https://www.grazia.fr/feed', category: 'lifestyle' }
  ]),
  fr('femme-actuelle', 'Femme Actuelle', 'https://www.femmeactuelle.fr', 'mainstream', [
    { url: prisma('fac'), category: 'lifestyle' }
  ]),
  fr('caradisiac', 'Caradisiac', 'https://www.caradisiac.com', 'mainstream', [
    { url: 'https://www.caradisiac.com/rss.xml', category: 'automotive' }
  ]),
  fr('largus', "L'argus", 'https://www.largus.fr', 'mainstream', [
    { url: 'https://www.largus.fr/RSS', category: 'automotive' }
  ]),
  fr('auto-plus', 'Auto Plus', 'https://www.autoplus.fr', 'mainstream', [
    { url: 'https://www.autoplus.fr/feed', category: 'automotive' }
  ]),
  fr('letudiant', "L'Etudiant", 'https://www.letudiant.fr', 'mainstream', [
    { url: 'https://www.letudiant.fr/rss.xml', category: 'education' }
  ])
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
