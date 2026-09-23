import type { District, Province } from '../../types'
import { regionsOf } from '../build.ts'

/** England's nine regions and the three other nations, in the order the picker lists them. */
export const GB_REGION_IDS = [
  'london',
  'south-east',
  'south-west',
  'east-of-england',
  'east-midlands',
  'west-midlands',
  'north-west',
  'north-east',
  'yorkshire',
  'scotland',
  'wales',
  'northern-ireland'
] as const

type GbRegionId = (typeof GB_REGION_IDS)[number]

interface GbProvince extends Province {
  region: GbRegionId
}

const area = (
  code: string,
  name: string,
  region: GbRegionId,
  aliases: string[] = [],
  ambiguous = false
): GbProvince => ({ code, name, slug: code, region, aliases, ...(ambiguous ? { ambiguous: true } : {}) })

/**
 * The areas BBC local news is organised in: English counties and city regions, Scotland's
 * and Wales' news regions, and Northern Ireland. Codes are short slugs. Names like "Beds,
 * Herts & Bucks" never appear in copy as such; their aliases carry what does.
 */
export const provinces: GbProvince[] = [
  area('london', 'London', 'london'),

  area('kent', 'Kent', 'south-east'),
  // The Duke and Duchess of Sussex are rarely news about the county.
  area('sussex', 'Sussex', 'south-east', ['East Sussex', 'West Sussex'], true),
  area('surrey', 'Surrey', 'south-east'),
  area('hampshire', 'Hampshire & Isle of Wight', 'south-east', ['Hampshire', 'Isle of Wight']),
  // Berkshire Hathaway.
  area('berkshire', 'Berkshire', 'south-east', [], true),
  area('oxford', 'Oxfordshire', 'south-east', ['Oxford']),

  area('bristol', 'Bristol', 'south-west'),
  area('devon', 'Devon', 'south-west'),
  area('cornwall', 'Cornwall', 'south-west'),
  area('somerset', 'Somerset', 'south-west'),
  area('gloucestershire', 'Gloucestershire', 'south-west'),
  area('wiltshire', 'Wiltshire', 'south-west'),
  area('dorset', 'Dorset', 'south-west'),

  area('norfolk', 'Norfolk', 'east-of-england'),
  area('suffolk', 'Suffolk', 'east-of-england'),
  area('cambridgeshire', 'Cambridgeshire', 'east-of-england', ['Cambridge']),
  area('essex', 'Essex', 'east-of-england'),
  area('beds-herts-bucks', 'Beds, Herts & Bucks', 'east-of-england', [
    'Bedfordshire',
    'Hertfordshire',
    'Buckinghamshire'
  ]),

  area('nottingham', 'Nottinghamshire', 'east-midlands', ['Nottingham']),
  area('derby', 'Derbyshire', 'east-midlands', ['Derby']),
  area('leicester', 'Leicestershire', 'east-midlands', ['Leicester']),
  area('lincolnshire', 'Lincolnshire', 'east-midlands'),
  area('northampton', 'Northamptonshire', 'east-midlands', ['Northampton']),

  area('birmingham', 'Birmingham & Black Country', 'west-midlands', ['Birmingham', 'Black Country']),
  area('coventry', 'Coventry & Warwickshire', 'west-midlands', ['Coventry', 'Warwickshire']),
  area('stoke', 'Stoke & Staffordshire', 'west-midlands', ['Stoke-on-Trent', 'Staffordshire']),
  area('shropshire', 'Shropshire', 'west-midlands'),
  area('hereford-worcester', 'Hereford & Worcester', 'west-midlands', [
    'Herefordshire',
    'Worcestershire',
    'Hereford',
    'Worcester'
  ]),

  area('manchester', 'Greater Manchester', 'north-west', ['Manchester']),
  area('merseyside', 'Merseyside', 'north-west', ['Liverpool']),
  area('lancashire', 'Lancashire', 'north-west'),
  area('cumbria', 'Cumbria', 'north-west'),

  area('tyne', 'Tyne & Wear', 'north-east', ['Newcastle', 'Sunderland', 'Gateshead', 'Northumberland']),
  area('tees', 'Tees Valley & County Durham', 'north-east', ['Teesside', 'Middlesbrough', 'County Durham']),

  area('west-yorkshire', 'West Yorkshire', 'yorkshire', ['Leeds', 'Bradford', 'Wakefield', 'Huddersfield']),
  area('south-yorkshire', 'South Yorkshire', 'yorkshire', [
    'Sheffield',
    'Rotherham',
    'Doncaster',
    'Barnsley'
  ]),
  area('north-yorkshire', 'North Yorkshire', 'yorkshire', ['Harrogate', 'Scarborough']),
  area('hull', 'Hull & East Yorkshire', 'yorkshire', ['Hull', 'East Yorkshire']),

  area('glasgow-west', 'Glasgow & West Scotland', 'scotland', ['Glasgow', 'Paisley', 'Ayrshire']),
  area('edinburgh-east-fife', 'Edinburgh, Fife & East', 'scotland', ['Edinburgh', 'Fife', 'Lothian']),
  area('north-east-scotland', 'North East, Orkney & Shetland', 'scotland', [
    'Aberdeen',
    'Aberdeenshire',
    'Orkney',
    'Shetland'
  ]),
  area('highlands-islands', 'Highlands & Islands', 'scotland', ['Inverness', 'Highlands', 'Western Isles']),
  area('south-scotland', 'South of Scotland', 'scotland', ['Dumfries', 'Galloway', 'Scottish Borders']),
  area('tayside-central', 'Tayside & Central Scotland', 'scotland', [
    'Dundee',
    'Stirling',
    'Tayside',
    'Falkirk'
  ]),

  area('north-west-wales', 'North West Wales', 'wales', ['Gwynedd', 'Anglesey', 'Conwy']),
  area('north-east-wales', 'North East Wales', 'wales', ['Wrexham', 'Flintshire', 'Denbighshire']),
  area('mid-wales', 'Mid Wales', 'wales', ['Powys', 'Ceredigion', 'Aberystwyth']),
  area('south-west-wales', 'South West Wales', 'wales', [
    'Swansea',
    'Pembrokeshire',
    'Carmarthenshire',
    'Llanelli'
  ]),
  area('south-east-wales', 'South East Wales', 'wales', ['Cardiff', 'Newport', 'Caerphilly', 'Rhondda']),

  area('northern-ireland', 'Northern Ireland', 'northern-ireland', [
    'Belfast',
    'Derry',
    'Londonderry',
    'Antrim',
    'Armagh',
    'Tyrone',
    'Fermanagh'
  ])
]

/** Regions news copy names on their own; London and Northern Ireland are provinces already. */
export const regions = regionsOf(GB_REGION_IDS, provinces, {
  scotland: ['Scotland'],
  wales: ['Wales'],
  yorkshire: ['Yorkshire'],
  'north-east': ['North East England'],
  'south-west': ['South West England'],
  'east-midlands': ['East Midlands'],
  'west-midlands': ['West Midlands']
})

/** Words after an ambiguous area name that make it the place: "Sussex Police", "Berkshire County". */
export const placeWords = ['police', 'council', 'county', 'constabulary', 'coast', 'hospital', 'mp']

/**
 * Towns news copy names without their county. Left out: York ("New York"), Reading and Bath
 * (ordinary words), Rugby (the sport), Perth (Australia), Windsor (the royal house), Boston
 * and Lincoln.
 */
const towns: Record<string, string[]> = {
  kent: ['Canterbury', 'Maidstone', 'Dover', 'Folkestone', 'Margate'],
  sussex: ['Brighton', 'Hove', 'Crawley', 'Eastbourne', 'Hastings', 'Chichester'],
  surrey: ['Guildford', 'Woking', 'Epsom'],
  hampshire: ['Southampton', 'Portsmouth', 'Winchester', 'Basingstoke'],
  berkshire: ['Slough', 'Maidenhead', 'Bracknell', 'Newbury'],
  oxford: ['Banbury', 'Didcot'],
  devon: ['Plymouth', 'Exeter', 'Torquay'],
  cornwall: ['Truro', 'Falmouth', 'Newquay'],
  somerset: ['Taunton', 'Yeovil'],
  gloucestershire: ['Gloucester', 'Cheltenham'],
  wiltshire: ['Swindon', 'Salisbury'],
  dorset: ['Bournemouth', 'Poole'],
  norfolk: ['Norwich', "King's Lynn", 'Great Yarmouth'],
  suffolk: ['Ipswich', 'Lowestoft'],
  cambridgeshire: ['Peterborough'],
  essex: ['Chelmsford', 'Colchester', 'Southend', 'Basildon'],
  'beds-herts-bucks': ['Luton', 'Watford', 'St Albans', 'Milton Keynes', 'Aylesbury', 'Stevenage'],
  nottingham: ['Mansfield'],
  derby: ['Chesterfield'],
  lincolnshire: ['Grimsby', 'Scunthorpe', 'Skegness'],
  northampton: ['Kettering', 'Corby'],
  birmingham: ['Wolverhampton', 'Walsall', 'West Bromwich', 'Solihull'],
  coventry: ['Nuneaton', 'Leamington Spa'],
  shropshire: ['Shrewsbury', 'Telford'],
  manchester: ['Salford', 'Stockport', 'Bolton', 'Wigan', 'Oldham', 'Rochdale'],
  merseyside: ['Birkenhead', 'Southport', 'St Helens', 'Wirral'],
  lancashire: ['Preston', 'Blackpool', 'Blackburn', 'Burnley', 'Lancaster'],
  cumbria: ['Carlisle', 'Barrow-in-Furness', 'Kendal'],
  tees: ['Darlington', 'Hartlepool', 'Stockton-on-Tees'],
  hull: ['Beverley', 'Bridlington']
}

export const districts: District[] = Object.entries(towns).flatMap(([provinceCode, names]) =>
  names.map((name) => ({ name, provinceCode }))
)
