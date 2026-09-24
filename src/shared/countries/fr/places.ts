import type { District, Province } from '../../types'
import { regionsOf } from '../build.ts'

/** The 13 regions of metropolitan France and the overseas departments, in the order the picker lists them. */
export const FR_REGION_IDS = [
  'ile-de-france',
  'hauts-de-france',
  'grand-est',
  'normandy',
  'brittany',
  'pays-de-la-loire',
  'centre-val-de-loire',
  'bourgogne-franche-comte',
  'auvergne-rhone-alpes',
  'nouvelle-aquitaine',
  'occitanie',
  'provence-alpes-cote-d-azur',
  'corsica',
  'overseas'
] as const

export type FrRegionId = (typeof FR_REGION_IDS)[number]

interface FrProvince extends Province {
  region: FrRegionId
}

/** "Côte-d'Or" → "cote-d-or": the department's path on France 3 Régions. */
export const slugOf = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’\s]+/g, '-')

/** Cities news copy names without their department; the first one is where the weather is taken. */
const cities: Record<string, string[]> = {}

const dep = (
  code: string,
  name: string,
  region: FrRegionId,
  towns: string[],
  extra: Partial<Pick<Province, 'aliases' | 'ambiguous' | 'isoCountry'>> = {}
): FrProvince => {
  cities[code] = towns
  return { code, name, slug: slugOf(name), region, aliases: extra.aliases ?? [], ...extra }
}

/*
 * The 101 departments, keyed by their official number (2A/2B for Corsica, 971–976 overseas),
 * which French readers know like Turkish plate codes. Left out of the city lists: names that
 * are ordinary words or mean somewhere else in French copy — Valence (also Valencia), Vienne
 * (Vienna), Orange (the operator), Sens, Cognac, La Défense (the ministry), Nancy and Laval
 * (also names) — and Saint-Denis and Saint-Louis, which exist in two departments.
 */
export const provinces: FrProvince[] = [
  dep('75', 'Paris', 'ile-de-france', []),
  dep('77', 'Seine-et-Marne', 'ile-de-france', [
    'Melun',
    'Meaux',
    'Chelles',
    'Fontainebleau',
    'Marne-la-Vallée'
  ]),
  dep('78', 'Yvelines', 'ile-de-france', [
    'Versailles',
    'Saint-Germain-en-Laye',
    'Mantes-la-Jolie',
    'Poissy',
    'Rambouillet'
  ]),
  dep('91', 'Essonne', 'ile-de-france', [
    'Évry-Courcouronnes',
    'Évry',
    'Corbeil-Essonnes',
    'Massy',
    'Palaiseau',
    'Étampes'
  ]),
  dep('92', 'Hauts-de-Seine', 'ile-de-france', [
    'Nanterre',
    'Boulogne-Billancourt',
    'Courbevoie',
    'Neuilly-sur-Seine',
    'Colombes',
    'Asnières-sur-Seine'
  ]),
  dep('93', 'Seine-Saint-Denis', 'ile-de-france', [
    'Bobigny',
    'Montreuil',
    'Aubervilliers',
    'Aulnay-sous-Bois',
    'Bondy',
    'Pantin'
  ]),
  dep('94', 'Val-de-Marne', 'ile-de-france', [
    'Créteil',
    'Vitry-sur-Seine',
    'Champigny-sur-Marne',
    'Ivry-sur-Seine',
    'Vincennes'
  ]),
  dep('95', "Val-d'Oise", 'ile-de-france', ['Cergy', 'Pontoise', 'Argenteuil', 'Sarcelles'], {
    aliases: ["Val d'Oise"]
  }),

  dep('02', 'Aisne', 'hauts-de-france', ['Laon', 'Saint-Quentin', 'Soissons', 'Château-Thierry']),
  dep('59', 'Nord', 'hauts-de-france', [
    'Lille',
    'Roubaix',
    'Tourcoing',
    'Dunkerque',
    'Valenciennes',
    'Douai',
    'Cambrai',
    'Maubeuge',
    "Villeneuve-d'Ascq"
  ]),
  dep('60', 'Oise', 'hauts-de-france', ['Beauvais', 'Compiègne', 'Creil', 'Senlis']),
  dep('62', 'Pas-de-Calais', 'hauts-de-france', [
    'Arras',
    'Calais',
    'Boulogne-sur-Mer',
    'Lens',
    'Liévin',
    'Béthune',
    'Hénin-Beaumont'
  ]),
  dep('80', 'Somme', 'hauts-de-france', ['Amiens', 'Abbeville']),

  dep('08', 'Ardennes', 'grand-est', ['Charleville-Mézières', 'Sedan', 'Rethel']),
  dep('10', 'Aube', 'grand-est', ['Troyes', 'Romilly-sur-Seine']),
  dep('51', 'Marne', 'grand-est', ['Reims', 'Châlons-en-Champagne', 'Épernay']),
  dep('52', 'Haute-Marne', 'grand-est', ['Chaumont', 'Saint-Dizier', 'Langres']),
  dep('54', 'Meurthe-et-Moselle', 'grand-est', ['Lunéville', 'Toul', 'Pont-à-Mousson', 'Longwy']),
  dep('55', 'Meuse', 'grand-est', ['Bar-le-Duc', 'Verdun', 'Commercy']),
  dep('57', 'Moselle', 'grand-est', ['Metz', 'Thionville', 'Forbach', 'Sarreguemines']),
  dep('67', 'Bas-Rhin', 'grand-est', ['Strasbourg', 'Haguenau', 'Sélestat', 'Saverne']),
  dep('68', 'Haut-Rhin', 'grand-est', ['Mulhouse', 'Colmar']),
  dep('88', 'Vosges', 'grand-est', ['Épinal', 'Saint-Dié-des-Vosges', 'Remiremont']),

  dep('14', 'Calvados', 'normandy', ['Caen', 'Lisieux', 'Bayeux', 'Deauville', 'Honfleur']),
  dep('27', 'Eure', 'normandy', ['Évreux', 'Vernon', 'Louviers']),
  // "La Manche" is also the Channel (see notPlaces).
  dep('50', 'Manche', 'normandy', [
    'Cherbourg-en-Cotentin',
    'Cherbourg',
    'Saint-Lô',
    'Granville',
    'Coutances',
    'Avranches'
  ]),
  dep('61', 'Orne', 'normandy', ['Alençon', 'Argentan', 'Flers']),
  dep('76', 'Seine-Maritime', 'normandy', ['Rouen', 'Le Havre', 'Dieppe', 'Fécamp']),

  dep('22', "Côtes-d'Armor", 'brittany', ['Saint-Brieuc', 'Lannion', 'Dinan', 'Guingamp'], {
    aliases: ["Côtes d'Armor"]
  }),
  dep('29', 'Finistère', 'brittany', ['Brest', 'Quimper', 'Morlaix', 'Concarneau']),
  dep('35', 'Ille-et-Vilaine', 'brittany', ['Rennes', 'Saint-Malo', 'Fougères', 'Vitré']),
  dep('56', 'Morbihan', 'brittany', ['Vannes', 'Lorient', 'Pontivy']),

  dep('44', 'Loire-Atlantique', 'pays-de-la-loire', ['Nantes', 'Saint-Nazaire', 'Rezé']),
  dep('49', 'Maine-et-Loire', 'pays-de-la-loire', ['Angers', 'Cholet', 'Saumur']),
  dep('53', 'Mayenne', 'pays-de-la-loire', ['Château-Gontier']),
  dep('72', 'Sarthe', 'pays-de-la-loire', ['Le Mans', 'La Flèche', 'Sablé-sur-Sarthe']),
  dep('85', 'Vendée', 'pays-de-la-loire', ['La Roche-sur-Yon', "Les Sables-d'Olonne", 'Challans']),

  dep('18', 'Cher', 'centre-val-de-loire', ['Bourges', 'Vierzon']),
  dep('28', 'Eure-et-Loir', 'centre-val-de-loire', ['Chartres', 'Dreux', 'Châteaudun']),
  dep('36', 'Indre', 'centre-val-de-loire', ['Châteauroux', 'Issoudun']),
  dep('37', 'Indre-et-Loire', 'centre-val-de-loire', ['Tours', 'Amboise', 'Chinon']),
  dep('41', 'Loir-et-Cher', 'centre-val-de-loire', ['Blois', 'Vendôme', 'Romorantin-Lanthenay']),
  dep('45', 'Loiret', 'centre-val-de-loire', ['Orléans', 'Montargis']),

  dep('21', "Côte-d'Or", 'bourgogne-franche-comte', ['Dijon', 'Beaune'], { aliases: ["Côte d'Or"] }),
  dep('25', 'Doubs', 'bourgogne-franche-comte', ['Besançon', 'Montbéliard', 'Pontarlier']),
  dep('39', 'Jura', 'bourgogne-franche-comte', ['Lons-le-Saunier', 'Dole', 'Saint-Claude']),
  dep('58', 'Nièvre', 'bourgogne-franche-comte', ['Nevers', 'Cosne-Cours-sur-Loire']),
  dep('70', 'Haute-Saône', 'bourgogne-franche-comte', ['Vesoul', 'Lure', 'Luxeuil-les-Bains']),
  dep('71', 'Saône-et-Loire', 'bourgogne-franche-comte', [
    'Chalon-sur-Saône',
    'Mâcon',
    'Le Creusot',
    'Montceau-les-Mines',
    'Autun'
  ]),
  dep('89', 'Yonne', 'bourgogne-franche-comte', ['Auxerre', 'Joigny']),
  dep('90', 'Territoire de Belfort', 'bourgogne-franche-comte', ['Belfort']),

  dep('01', 'Ain', 'auvergne-rhone-alpes', ['Bourg-en-Bresse', 'Oyonnax', 'Ambérieu-en-Bugey']),
  dep('03', 'Allier', 'auvergne-rhone-alpes', ['Montluçon', 'Moulins', 'Vichy']),
  dep('07', 'Ardèche', 'auvergne-rhone-alpes', ['Annonay', 'Privas', 'Aubenas']),
  dep('15', 'Cantal', 'auvergne-rhone-alpes', ['Aurillac', 'Saint-Flour']),
  dep('26', 'Drôme', 'auvergne-rhone-alpes', ['Montélimar', 'Romans-sur-Isère']),
  dep('38', 'Isère', 'auvergne-rhone-alpes', ['Grenoble', 'Voiron', 'Bourgoin-Jallieu']),
  dep('42', 'Loire', 'auvergne-rhone-alpes', ['Saint-Étienne', 'Roanne', 'Montbrison'], {
    aliases: ['Saint-Etienne']
  }),
  dep('43', 'Haute-Loire', 'auvergne-rhone-alpes', ['Le Puy-en-Velay', 'Yssingeaux']),
  dep('63', 'Puy-de-Dôme', 'auvergne-rhone-alpes', ['Clermont-Ferrand', 'Riom', 'Thiers', 'Issoire']),
  dep('69', 'Rhône', 'auvergne-rhone-alpes', [
    'Lyon',
    'Villeurbanne',
    'Vénissieux',
    'Villefranche-sur-Saône'
  ]),
  dep('73', 'Savoie', 'auvergne-rhone-alpes', ['Chambéry', 'Aix-les-Bains', 'Albertville']),
  dep('74', 'Haute-Savoie', 'auvergne-rhone-alpes', ['Annecy', 'Annemasse', 'Thonon-les-Bains', 'Chamonix']),

  dep('16', 'Charente', 'nouvelle-aquitaine', ['Angoulême']),
  dep('17', 'Charente-Maritime', 'nouvelle-aquitaine', ['La Rochelle', 'Rochefort', 'Saintes', 'Royan']),
  dep('19', 'Corrèze', 'nouvelle-aquitaine', ['Brive-la-Gaillarde', 'Tulle']),
  dep('23', 'Creuse', 'nouvelle-aquitaine', ['Guéret', 'Aubusson']),
  dep('24', 'Dordogne', 'nouvelle-aquitaine', ['Périgueux', 'Bergerac', 'Sarlat-la-Canéda']),
  dep('33', 'Gironde', 'nouvelle-aquitaine', ['Bordeaux', 'Mérignac', 'Pessac', 'Libourne', 'Arcachon']),
  dep('40', 'Landes', 'nouvelle-aquitaine', ['Mont-de-Marsan', 'Dax', 'Biscarrosse']),
  dep('47', 'Lot-et-Garonne', 'nouvelle-aquitaine', ['Agen', 'Villeneuve-sur-Lot', 'Marmande']),
  dep('64', 'Pyrénées-Atlantiques', 'nouvelle-aquitaine', [
    'Pau',
    'Bayonne',
    'Biarritz',
    'Anglet',
    'Saint-Jean-de-Luz'
  ]),
  dep('79', 'Deux-Sèvres', 'nouvelle-aquitaine', ['Niort', 'Bressuire', 'Parthenay']),
  // Also Vienna in French (see notPlaces).
  dep('86', 'Vienne', 'nouvelle-aquitaine', ['Poitiers', 'Châtellerault']),
  dep('87', 'Haute-Vienne', 'nouvelle-aquitaine', ['Limoges', 'Saint-Junien']),

  dep('09', 'Ariège', 'occitanie', ['Pamiers', 'Foix']),
  dep('11', 'Aude', 'occitanie', ['Narbonne', 'Carcassonne', 'Castelnaudary']),
  dep('12', 'Aveyron', 'occitanie', ['Rodez', 'Millau', 'Villefranche-de-Rouergue']),
  dep('30', 'Gard', 'occitanie', ['Nîmes', 'Alès', 'Bagnols-sur-Cèze', 'Beaucaire']),
  dep('31', 'Haute-Garonne', 'occitanie', ['Toulouse', 'Blagnac', 'Muret', 'Saint-Gaudens']),
  dep('32', 'Gers', 'occitanie', ['Auch']),
  dep('34', 'Hérault', 'occitanie', ['Montpellier', 'Béziers', 'Sète', 'Agde', 'Lunel']),
  dep('46', 'Lot', 'occitanie', ['Cahors', 'Figeac']),
  dep('48', 'Lozère', 'occitanie', ['Mende']),
  dep('65', 'Hautes-Pyrénées', 'occitanie', ['Tarbes', 'Lourdes']),
  dep('66', 'Pyrénées-Orientales', 'occitanie', ['Perpignan', 'Céret', 'Prades']),
  dep('81', 'Tarn', 'occitanie', ['Albi', 'Castres', 'Gaillac']),
  dep('82', 'Tarn-et-Garonne', 'occitanie', ['Montauban', 'Castelsarrasin', 'Moissac']),

  dep('04', 'Alpes-de-Haute-Provence', 'provence-alpes-cote-d-azur', [
    'Manosque',
    'Digne-les-Bains',
    'Sisteron'
  ]),
  dep('05', 'Hautes-Alpes', 'provence-alpes-cote-d-azur', ['Gap', 'Briançon', 'Embrun']),
  dep('06', 'Alpes-Maritimes', 'provence-alpes-cote-d-azur', [
    'Nice',
    'Cannes',
    'Antibes',
    'Grasse',
    'Menton'
  ]),
  dep('13', 'Bouches-du-Rhône', 'provence-alpes-cote-d-azur', [
    'Marseille',
    'Aix-en-Provence',
    'Arles',
    'Martigues',
    'Aubagne',
    'Istres',
    'Salon-de-Provence'
  ]),
  dep('83', 'Var', 'provence-alpes-cote-d-azur', [
    'Toulon',
    'Fréjus',
    'Hyères',
    'Draguignan',
    'Saint-Tropez',
    'La Seyne-sur-Mer'
  ]),
  dep('84', 'Vaucluse', 'provence-alpes-cote-d-azur', ['Avignon', 'Carpentras', 'Cavaillon']),

  dep('2A', 'Corse-du-Sud', 'corsica', ['Ajaccio', 'Porto-Vecchio']),
  dep('2B', 'Haute-Corse', 'corsica', ['Bastia', 'Corte', 'Calvi']),

  dep('971', 'Guadeloupe', 'overseas', ['Pointe-à-Pitre', 'Les Abymes', 'Basse-Terre'], { isoCountry: 'GP' }),
  dep('972', 'Martinique', 'overseas', ['Fort-de-France', 'Le Lamentin'], { isoCountry: 'MQ' }),
  dep('973', 'Guyane', 'overseas', ['Cayenne', 'Kourou', 'Saint-Laurent-du-Maroni'], {
    aliases: ['Guyane française'],
    isoCountry: 'GF'
  }),
  dep('974', 'La Réunion', 'overseas', ['Saint-Pierre', 'Le Tampon', 'Saint-Paul'], {
    aliases: ['île de La Réunion'],
    isoCountry: 'RE'
  }),
  dep('976', 'Mayotte', 'overseas', ['Mamoudzou', 'Dzaoudzi'], { isoCountry: 'YT' })
]

export const regions = regionsOf(FR_REGION_IDS, provinces, {
  'ile-de-france': ['Île-de-France', 'Ile-de-France'],
  'hauts-de-france': ['Hauts-de-France', 'Nord-Pas-de-Calais', 'Picardie'],
  'grand-est': ['Grand Est', 'Grand-Est', 'Alsace', 'Lorraine', 'Champagne-Ardenne'],
  normandy: ['Normandie'],
  brittany: ['Bretagne'],
  'pays-de-la-loire': ['Pays de la Loire', 'Pays-de-la-Loire'],
  'centre-val-de-loire': ['Centre-Val de Loire', 'Centre-Val-de-Loire'],
  'bourgogne-franche-comte': ['Bourgogne-Franche-Comté', 'Bourgogne', 'Franche-Comté'],
  'auvergne-rhone-alpes': ['Auvergne-Rhône-Alpes', 'Auvergne', 'Rhône-Alpes'],
  'nouvelle-aquitaine': [
    'Nouvelle-Aquitaine',
    'Aquitaine',
    'Limousin',
    'Poitou-Charentes',
    'Poitou-Charente',
    'Pays basque',
    'Béarn',
    'Périgord'
  ],
  occitanie: ['Occitanie', 'Languedoc-Roussillon', 'Languedoc', 'Midi-Pyrénées'],
  'provence-alpes-cote-d-azur': ["Provence-Alpes-Côte d'Azur", 'PACA', 'Provence', "Côte d'Azur"],
  corsica: ['Corse'],
  overseas: ['Outre-mer', 'Antilles']
})

export const districts: District[] = Object.entries(cities).flatMap(([provinceCode, names]) =>
  names.map((name) => ({ name, provinceCode }))
)

/**
 * Names that hold a department's or region's name but mean something else. Matched as written:
 * "VAR" in capitals is football's video referee, "Var" the department.
 */
export const notPlaces = [
  'Grande-Bretagne',
  'Corée du Nord',
  'Afrique du Nord',
  'Amérique du Nord',
  'Irlande du Nord',
  'Macédoine du Nord',
  'Chypre du Nord',
  'Europe du Nord',
  'Dakota du Nord',
  'Caroline du Nord',
  'Pôle Nord',
  'Cap Nord',
  'mer du Nord',
  'Mer du Nord',
  'pôle Nord',
  'hémisphère Nord',
  'Grand Nord',
  'Nord-Kivu',
  'Nord Stream',
  'Nord-Est',
  'Nord-Ouest',
  'Atlantique Nord',
  'Nord-Coréen',
  'Nord-Coréens',
  'Nord-Coréenne',
  'Nord-Coréennes',
  'Gare du Nord',
  'traversée de la Manche',
  'traversées de la Manche',
  'traverser la Manche',
  'tunnel sous la Manche',
  'outre-Manche',
  'Outre-Manche',
  'à Vienne',
  'de Vienne',
  'Vienne (Autriche)',
  'Jura suisse',
  'canton du Jura',
  // The rivers and the wine, not the departments named after them.
  'châteaux de la Loire',
  'Châteaux de la Loire',
  'Val de Loire',
  'val de Loire',
  'bords de Loire',
  'bords de la Loire',
  'estuaire de la Loire',
  'vallée du Rhône',
  'Vallée du Rhône',
  'côtes-du-rhône',
  'Côtes du Rhône',
  'Côtes-du-Rhône',
  'delta du Rhône',
  'bords de Marne',
  // History, not Allier.
  'régime de Vichy',
  'gouvernement de Vichy',
  'France de Vichy',
  'VAR',
  'Paris Hilton'
]
