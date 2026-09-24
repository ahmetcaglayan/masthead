import type { FeedDef, SourceDef } from '../../types'
import { favicon, localOutlet, provinceFeeds, type LocalOutlet } from '../build.ts'
import { provinces, type FrRegionId } from './places.ts'

/*
 * Local news for every department: France 3 Régions' page for each of the 96 metropolitan
 * departments, the ici (ex-France Bleu) station of the area, the regional dailies' department
 * editions, and the overseas newsrooms. Every feed is only fetched for the user's selected
 * department (region-wide feeds for its region). Checked on 2026-09-24.
 *
 * Not included: La Montagne, Le Berry républicain, La République du Centre, L'Yonne
 * républicaine, L'Écho républicain, Le Journal du Centre and Le Populaire du Centre (their
 * sites answer 403 to feed readers); Le Courrier picard, L'Union, L'Ardennais, L'Est-Éclair
 * and La Provence (no public feed); La Dépêche's department pages and the France-Antilles
 * front-page feeds (empty or years old); la 1ère (no feed); ici Elsass (the ici Alsace news again).
 */

/** France 3's path for each region. */
const F3_REGION: Record<Exclude<FrRegionId, 'overseas'>, string> = {
  'ile-de-france': 'paris-ile-de-france',
  'hauts-de-france': 'hauts-de-france',
  'grand-est': 'grand-est',
  normandy: 'normandie',
  brittany: 'bretagne',
  'pays-de-la-loire': 'pays-de-la-loire',
  'centre-val-de-loire': 'centre-val-de-loire',
  'bourgogne-franche-comte': 'bourgogne-franche-comte',
  'auvergne-rhone-alpes': 'auvergne-rhone-alpes',
  'nouvelle-aquitaine': 'nouvelle-aquitaine',
  occitanie: 'occitanie',
  'provence-alpes-cote-d-azur': 'provence-alpes-cote-d-azur',
  corsica: 'corse'
}

const france3: SourceDef = {
  id: 'france3-regions',
  name: 'France 3 Régions',
  homepage: 'https://france3-regions.franceinfo.fr',
  icon: favicon('france3-regions.franceinfo.fr'),
  color: '#1E4EA1',
  kind: 'local',
  language: 'fr',
  feeds: provinceFeeds(
    Object.fromEntries(
      provinces
        .filter((p) => p.region !== 'overseas')
        .map((p) => [
          p.code,
          `https://france3-regions.franceinfo.fr/${F3_REGION[p.region as Exclude<FrRegionId, 'overseas'>]}/${p.slug}/rss`
        ])
    )
  )
}

/** The ici (ex-France Bleu) stations, each under the department it broadcasts from. */
const ICI_STATIONS: Record<string, string> = {
  '107-1': '75',
  alsace: '67',
  armorique: '35',
  auxerre: '89',
  azur: '06',
  bearn: '64',
  'belfort-montbeliard': '90',
  berry: '18',
  besancon: '25',
  bourgogne: '21',
  'breizh-izel': '29',
  'champagne-ardenne': '51',
  cotentin: '50',
  creuse: '23',
  'drome-ardeche': '26',
  'gard-lozere': '30',
  gascogne: '40',
  gironde: '33',
  herault: '34',
  isere: '38',
  'la-rochelle': '17',
  limousin: '87',
  'loire-ocean': '44',
  'lorraine-nord': '57',
  maine: '72',
  mayenne: '53',
  nord: '59',
  'normandie-caen': '14',
  'normandie-rouen': '76',
  orleans: '45',
  'pays-basque': '64',
  'pays-d-auvergne': '63',
  'pays-de-savoie': '73',
  perigord: '24',
  picardie: '80',
  poitou: '86',
  provence: '13',
  roussillon: '66',
  'saint-etienne-loire': '42',
  'sud-lorraine': '54',
  toulouse: '31',
  touraine: '37',
  vaucluse: '84'
}

const ici = (station: string): string => `https://www.ici.fr/rss/${station}/rubrique/infos.xml`

const iciLocal: SourceDef = {
  id: 'ici-local',
  name: 'ici',
  homepage: 'https://www.ici.fr',
  icon: favicon('ici.fr'),
  color: '#0F1E3C',
  kind: 'local',
  language: 'fr',
  feeds: [
    ...Object.entries(ICI_STATIONS).map(([station, province]): FeedDef => ({
      url: ici(station),
      category: 'local',
      province
    })),
    // ici RCFM covers both Corsican departments.
    { url: ici('rcfm'), category: 'local', region: 'corsica' }
  ]
}

/** actu.fr's regional feeds (Publihebdos' local weeklies), one per region. */
const ACTU_REGIONS: Partial<Record<FrRegionId, string>> = {
  'ile-de-france': 'ile-de-france',
  'hauts-de-france': 'hauts-de-france',
  'grand-est': 'grand-est',
  normandy: 'normandie',
  brittany: 'bretagne',
  'pays-de-la-loire': 'pays-de-la-loire',
  'centre-val-de-loire': 'centre-val-de-loire',
  'bourgogne-franche-comte': 'bourgogne-franche-comte',
  'auvergne-rhone-alpes': 'auvergne-rhone-alpes',
  'nouvelle-aquitaine': 'nouvelle-aquitaine',
  occitanie: 'occitanie'
}

const actu: SourceDef = {
  id: 'actu-fr',
  name: 'actu.fr',
  homepage: 'https://actu.fr',
  icon: favicon('actu.fr'),
  color: '#E4002B',
  kind: 'local',
  language: 'fr',
  feeds: Object.entries(ACTU_REGIONS).map(([region, path]) => ({
    url: `https://actu.fr/${path}/rss.xml`,
    category: 'local',
    region
  }))
}

/** A regional daily with a feed per department it covers. */
function paper(
  id: string,
  name: string,
  homepage: string,
  feeds: Record<string, string>,
  color?: string
): SourceDef {
  return {
    id,
    name,
    homepage,
    icon: favicon(new URL(homepage).hostname.replace(/^www\./, '')),
    ...(color ? { color } : {}),
    kind: 'local',
    language: 'fr',
    provinces: Object.keys(feeds),
    feeds: provinceFeeds(feeds)
  }
}

const ebra = (host: string, departments: string[], codes: string[]): Record<string, string> =>
  Object.fromEntries(departments.map((slug, i) => [codes[i], `https://www.${host}/${slug}/rss`]))

const papers: SourceDef[] = [
  paper('le-parisien-local', 'Le Parisien Local', 'https://www.leparisien.fr', {
    '75': 'https://feeds.leparisien.fr/leparisien/rss/paris-75',
    '77': 'https://feeds.leparisien.fr/leparisien/rss/seine-et-marne-77',
    '78': 'https://feeds.leparisien.fr/leparisien/rss/yvelines-78',
    '91': 'https://feeds.leparisien.fr/leparisien/rss/essonne-91',
    '92': 'https://feeds.leparisien.fr/leparisien/rss/hauts-de-seine-92',
    '93': 'https://feeds.leparisien.fr/leparisien/rss/seine-saint-denis-93',
    '94': 'https://feeds.leparisien.fr/leparisien/rss/val-de-marne-94',
    '95': 'https://feeds.leparisien.fr/leparisien/rss/val-d-oise-95',
    '60': 'https://feeds.leparisien.fr/leparisien/rss/oise-60'
  }),
  paper('le-telegramme', 'Le Télégramme', 'https://www.letelegramme.fr', {
    '29': 'https://www.letelegramme.fr/finistere/rss.xml',
    '22': 'https://www.letelegramme.fr/cotes-d-armor/rss.xml',
    '56': 'https://www.letelegramme.fr/morbihan/rss.xml',
    '35': 'https://www.letelegramme.fr/ille-et-vilaine/rss.xml'
  }),
  paper(
    'sud-ouest',
    'Sud Ouest',
    'https://www.sudouest.fr',
    {
      '33': 'https://www.sudouest.fr/gironde/rss.xml',
      '40': 'https://www.sudouest.fr/landes/rss.xml',
      '64': 'https://www.sudouest.fr/pyrenees-atlantiques/rss.xml',
      '17': 'https://www.sudouest.fr/charente-maritime/rss.xml',
      '16': 'https://www.sudouest.fr/charente/rss.xml',
      '24': 'https://www.sudouest.fr/dordogne/rss.xml',
      '47': 'https://www.sudouest.fr/lot-et-garonne/rss.xml'
    },
    '#E30613'
  ),
  paper('midi-libre', 'Midi Libre', 'https://www.midilibre.fr', {
    '34': 'https://www.midilibre.fr/herault/rss.xml',
    '30': 'https://www.midilibre.fr/gard/rss.xml',
    '12': 'https://www.midilibre.fr/aveyron/rss.xml',
    '48': 'https://www.midilibre.fr/lozere/rss.xml',
    '11': 'https://www.midilibre.fr/aude/rss.xml',
    '66': 'https://www.midilibre.fr/pyrenees-orientales/rss.xml'
  }),
  paper('lindependant', "L'Indépendant", 'https://www.lindependant.fr', {
    '66': 'https://www.lindependant.fr/pyrenees-orientales/rss.xml',
    '11': 'https://www.lindependant.fr/aude/rss.xml'
  }),
  paper(
    'le-progres',
    'Le Progrès',
    'https://www.leprogres.fr',
    ebra('leprogres.fr', ['rhone', 'loire', 'ain', 'jura', 'haute-loire'], ['69', '42', '01', '39', '43'])
  ),
  paper(
    'le-dauphine',
    'Le Dauphiné Libéré',
    'https://www.ledauphine.com',
    ebra(
      'ledauphine.com',
      ['isere', 'savoie', 'haute-savoie', 'drome', 'ardeche', 'hautes-alpes', 'vaucluse', 'ain'],
      ['38', '73', '74', '26', '07', '05', '84', '01']
    )
  ),
  paper(
    'lest-republicain',
    "L'Est Républicain",
    'https://www.estrepublicain.fr',
    ebra(
      'estrepublicain.fr',
      ['meurthe-et-moselle', 'meuse', 'doubs', 'haute-saone', 'territoire-de-belfort'],
      ['54', '55', '25', '70', '90']
    )
  ),
  paper('la-nouvelle-republique', 'La Nouvelle République', 'https://www.lanouvellerepublique.fr', {
    '37': 'https://www.lanouvellerepublique.fr/api/v1/rss/5e206fd2fb1714762f8b4592',
    '86': 'https://www.lanouvellerepublique.fr/api/v1/rss/5e20732239a34f77578b457c',
    '36': 'https://www.lanouvellerepublique.fr/api/v1/rss/5e20725dcc4d8d75408b458d',
    '41': 'https://www.lanouvellerepublique.fr/api/v1/rss/5e2072c23915ea8c028b4582',
    '79': 'https://www.lanouvellerepublique.fr/api/v1/rss/5e2072f9f30f8cdd4c8b4594'
  })
]

const outlets: LocalOutlet[] = [
  // Regional dailies with one feed
  {
    id: 'la-voix-du-nord',
    name: 'La Voix du Nord',
    province: '59',
    feed: 'https://www.lavoixdunord.fr/rss2/610477/cible_principale'
  },
  { id: 'la-depeche', name: 'La Dépêche du Midi', province: '31', feed: 'https://www.ladepeche.fr/rss.xml' },
  { id: 'dna', name: 'Dernières Nouvelles d’Alsace', province: '67', feed: 'https://www.dna.fr/rss' },
  { id: 'lalsace', name: "L'Alsace", province: '68', feed: 'https://www.lalsace.fr/haut-rhin/rss' },
  {
    id: 'le-republicain-lorrain',
    name: 'Le Républicain Lorrain',
    province: '57',
    feed: 'https://www.republicain-lorrain.fr/rss'
  },
  { id: 'vosges-matin', name: 'Vosges Matin', province: '88', feed: 'https://www.vosgesmatin.fr/rss' },
  { id: 'le-bien-public', name: 'Le Bien Public', province: '21', feed: 'https://www.bienpublic.com/rss' },
  { id: 'le-jsl', name: 'Le Journal de Saône-et-Loire', province: '71', feed: 'https://www.lejsl.com/rss' },
  {
    id: 'nice-matin',
    name: 'Nice-Matin',
    province: '06',
    feed: 'https://www.nicematin.com/alpes-maritimes/rss'
  },
  { id: 'var-matin', name: 'Var-Matin', province: '83', feed: 'https://www.nicematin.com/var/rss' },
  {
    id: 'paris-normandie',
    name: 'Paris-Normandie',
    province: '76',
    feed: 'https://www.paris-normandie.fr/rss.xml'
  },
  {
    id: 'charente-libre',
    name: 'Charente Libre',
    province: '16',
    feed: 'https://www.charentelibre.fr/charente/rss.xml'
  },
  {
    id: 'la-republique-des-pyrenees',
    name: 'La République des Pyrénées',
    province: '64',
    feed: 'https://www.larepubliquedespyrenees.fr/rss.xml'
  },
  {
    id: 'centre-presse-aveyron',
    name: 'Centre Presse Aveyron',
    province: '12',
    feed: 'https://www.centrepresseaveyron.fr/rss.xml'
  },
  {
    id: 'le-petit-bleu',
    name: "Le Petit Bleu d'Agen",
    province: '47',
    feed: 'https://www.petitbleu.fr/rss.xml'
  },

  // City newsrooms
  { id: 'lyon-capitale', name: 'Lyon Capitale', province: '69', feed: 'https://www.lyoncapitale.fr/feed' },
  { id: 'rue89lyon', name: 'Rue89Lyon', province: '69', feed: 'https://www.rue89lyon.fr/feed/' },
  {
    id: 'rue89-strasbourg',
    name: 'Rue89 Strasbourg',
    province: '67',
    feed: 'https://www.rue89strasbourg.com/feed'
  },
  { id: 'rue89-bordeaux', name: 'Rue89 Bordeaux', province: '33', feed: 'https://rue89bordeaux.com/feed/' },

  // Corsica and the overseas departments
  {
    id: 'corse-net-infos',
    name: 'Corse Net Infos',
    region: 'corsica',
    feed: 'https://www.corsenetinfos.corsica/xml/syndication.rss'
  },
  {
    id: 'outremers360',
    name: 'Outremers360',
    region: 'overseas',
    feed: 'https://api.outremers360.com/rss/fil-info.xml'
  },
  {
    id: 'france-antilles-guadeloupe',
    name: 'France-Antilles Guadeloupe',
    province: '971',
    feed: 'https://www.guadeloupe.franceantilles.fr/actualite/vielocale/rss.xml'
  },
  { id: 'karibinfo', name: 'KaribInfo', province: '971', feed: 'https://www.karibinfo.com/feed/' },
  {
    id: 'france-antilles-martinique',
    name: 'France-Antilles Martinique',
    province: '972',
    feed: 'https://www.martinique.franceantilles.fr/actualite/vielocale/rss.xml'
  },
  { id: 'madinin-art', name: "Madinin'Art", province: '972', feed: 'https://www.madinin-art.net/feed/' },
  {
    id: 'france-guyane',
    name: 'France-Guyane',
    province: '973',
    feed: 'https://www.franceguyane.fr/actualite/vielocale/rss.xml'
  },
  { id: 'guyaweb', name: 'Guyaweb', province: '973', feed: 'https://www.guyaweb.com/feed/' },
  {
    id: 'clicanoo',
    name: "Le Journal de l'île de La Réunion",
    province: '974',
    feed: 'https://www.clicanoo.re/rss'
  },
  { id: 'imaz-press', name: 'Imaz Press Réunion', province: '974', feed: 'https://imazpress.com/feed' },
  {
    id: 'le-journal-de-mayotte',
    name: 'Le Journal de Mayotte',
    province: '976',
    feed: 'https://lejournaldemayotte.yt/feed/'
  },
  { id: 'mayotte-hebdo', name: 'Mayotte Hebdo', province: '976', feed: 'https://www.mayottehebdo.com/feed/' }
]

export const localSources: SourceDef[] = [
  france3,
  iciLocal,
  actu,
  ...papers,
  ...outlets.map((outlet) => localOutlet(outlet, 'fr'))
]
