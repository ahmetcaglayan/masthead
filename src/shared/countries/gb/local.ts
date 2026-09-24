import type { SourceDef } from '../../types'
import { localOutlet, provinceFeeds, type LocalOutlet } from '../build.ts'

/*
 * Local news: the BBC's area feeds for every area of the pack, the nation-wide feeds of
 * BBC Scotland and BBC Wales, and the regional papers with working feeds. Area feeds are
 * only fetched for the user's selected area, nation-wide ones for any area in that nation.
 * Checked on 2026-09-24.
 *
 * Not included: The Irish News (not RSS), the Shropshire Star (empty feed), the Express &
 * Star, the Press and Journal and The Courier (403 to feed readers), Berkshire Live, Herts
 * Live and Northants Live (empty feeds) and the South Wales Evening Post (broken certificate).
 */

const bbc = (path: string): string => `https://feeds.bbci.co.uk/news/${path}/rss.xml`

const bbcLocal: SourceDef = {
  id: 'bbc-local',
  name: 'BBC Local',
  homepage: 'https://www.bbc.co.uk/news/england',
  icon: 'https://www.bbc.co.uk/apple-touch-icon.png',
  color: '#BB1919',
  kind: 'local',
  language: 'en',
  feeds: [
    ...provinceFeeds({
      london: bbc('england/london'),
      kent: bbc('england/kent'),
      sussex: bbc('england/sussex'),
      surrey: bbc('england/surrey'),
      hampshire: bbc('england/hampshire'),
      berkshire: bbc('england/berkshire'),
      oxford: bbc('england/oxford'),
      bristol: bbc('england/bristol'),
      devon: bbc('england/devon'),
      cornwall: bbc('england/cornwall'),
      somerset: bbc('england/somerset'),
      gloucestershire: bbc('england/gloucestershire'),
      wiltshire: bbc('england/wiltshire'),
      dorset: bbc('england/dorset'),
      norfolk: bbc('england/norfolk'),
      suffolk: bbc('england/suffolk'),
      cambridgeshire: bbc('england/cambridgeshire'),
      essex: bbc('england/essex'),
      'beds-herts-bucks': bbc('england/beds_bucks_and_herts'),
      nottingham: bbc('england/nottingham'),
      derby: bbc('england/derbyshire'),
      leicester: bbc('england/leicester'),
      lincolnshire: bbc('england/lincolnshire'),
      northampton: bbc('england/northamptonshire'),
      birmingham: bbc('england/birmingham_and_black_country'),
      coventry: bbc('england/coventry_and_warwickshire'),
      stoke: bbc('england/stoke_and_staffordshire'),
      shropshire: bbc('england/shropshire'),
      'hereford-worcester': bbc('england/hereford_and_worcester'),
      manchester: bbc('england/manchester'),
      merseyside: bbc('england/merseyside'),
      lancashire: bbc('england/lancashire'),
      cumbria: bbc('england/cumbria'),
      tyne: bbc('england/tyne'),
      tees: bbc('england/tees'),
      'west-yorkshire': bbc('england/west_yorkshire'),
      'south-yorkshire': bbc('england/south_yorkshire'),
      'north-yorkshire': bbc('england/north_yorkshire'),
      hull: bbc('england/hull_and_east_yorkshire'),
      'glasgow-west': bbc('scotland/glasgow_and_west'),
      'edinburgh-east-fife': bbc('scotland/edinburgh_east_and_fife'),
      'north-east-scotland': bbc('scotland/north_east_orkney_and_shetland'),
      'highlands-islands': bbc('scotland/highlands_and_islands'),
      'south-scotland': bbc('scotland/south_scotland'),
      'tayside-central': bbc('scotland/tayside_and_central'),
      'north-west-wales': bbc('wales/north_west_wales'),
      'north-east-wales': bbc('wales/north_east_wales'),
      'mid-wales': bbc('wales/mid_wales'),
      'south-west-wales': bbc('wales/south_west_wales'),
      'south-east-wales': bbc('wales/south_east_wales'),
      'northern-ireland': bbc('northern_ireland')
    }),
    { url: bbc('scotland'), category: 'local', region: 'scotland' },
    { url: bbc('wales'), category: 'local', region: 'wales' }
  ]
}

const reach = (host: string): string => `https://www.${host}/news/?service=rss`
const newsquest = (host: string): string => `https://www.${host}/news/rss/`
const nationalWorld = (host: string): string => `https://www.${host}/rss`

const papers: LocalOutlet[] = [
  {
    id: 'mylondon',
    name: 'MyLondon',
    province: 'london',
    feed: 'https://www.mylondon.news/news/?service=rss'
  },
  {
    id: 'kentonline',
    name: 'KentOnline',
    province: 'kent',
    feed: 'https://www.kentonline.co.uk/_api/rss/kent_online_news_feed.xml'
  },
  {
    id: 'sussex-express',
    name: 'Sussex Express',
    province: 'sussex',
    feed: nationalWorld('sussexexpress.co.uk')
  },
  { id: 'the-argus-brighton', name: 'The Argus', province: 'sussex', feed: newsquest('theargus.co.uk') },
  { id: 'surrey-live', name: 'SurreyLive', province: 'surrey', feed: reach('getsurrey.co.uk') },
  { id: 'daily-echo', name: 'Daily Echo', province: 'hampshire', feed: newsquest('dailyecho.co.uk') },
  {
    id: 'reading-chronicle',
    name: 'Reading Chronicle',
    province: 'berkshire',
    feed: newsquest('readingchronicle.co.uk')
  },
  { id: 'oxford-mail', name: 'Oxford Mail', province: 'oxford', feed: newsquest('oxfordmail.co.uk') },
  { id: 'bristol-post', name: 'Bristol Post', province: 'bristol', feed: reach('bristolpost.co.uk') },
  {
    id: 'devon-live',
    name: 'DevonLive',
    province: 'devon',
    feed: 'https://www.devonlive.com/news/?service=rss'
  },
  { id: 'plymouth-herald', name: 'Plymouth Herald', province: 'devon', feed: reach('plymouthherald.co.uk') },
  {
    id: 'cornwall-live',
    name: 'CornwallLive',
    province: 'cornwall',
    feed: 'https://www.cornwalllive.com/news/?service=rss'
  },
  { id: 'somerset-live', name: 'SomersetLive', province: 'somerset', feed: reach('somersetlive.co.uk') },
  {
    id: 'gloucestershire-live',
    name: 'GloucestershireLive',
    province: 'gloucestershire',
    feed: reach('gloucestershirelive.co.uk')
  },
  {
    id: 'swindon-advertiser',
    name: 'Swindon Advertiser',
    province: 'wiltshire',
    feed: newsquest('swindonadvertiser.co.uk')
  },
  {
    id: 'bournemouth-echo',
    name: 'Bournemouth Echo',
    province: 'dorset',
    feed: newsquest('bournemouthecho.co.uk')
  },
  {
    id: 'eastern-daily-press',
    name: 'Eastern Daily Press',
    province: 'norfolk',
    feed: 'https://www.edp24.co.uk/news/rss/'
  },
  {
    id: 'east-anglian-daily-times',
    name: 'East Anglian Daily Times',
    province: 'suffolk',
    feed: newsquest('eadt.co.uk')
  },
  {
    id: 'cambridge-news',
    name: 'Cambridge News',
    province: 'cambridgeshire',
    feed: reach('cambridge-news.co.uk')
  },
  {
    id: 'essex-live',
    name: 'EssexLive',
    province: 'essex',
    feed: 'https://www.essexlive.news/news/?service=rss'
  },
  {
    id: 'watford-observer',
    name: 'Watford Observer',
    province: 'beds-herts-bucks',
    feed: newsquest('watfordobserver.co.uk')
  },
  {
    id: 'bucks-free-press',
    name: 'Bucks Free Press',
    province: 'beds-herts-bucks',
    feed: newsquest('bucksfreepress.co.uk')
  },
  {
    id: 'nottingham-post',
    name: 'Nottingham Post',
    province: 'nottingham',
    feed: 'https://www.nottinghampost.com/news/?service=rss'
  },
  { id: 'derby-telegraph', name: 'Derby Telegraph', province: 'derby', feed: reach('derbytelegraph.co.uk') },
  {
    id: 'leicester-mercury',
    name: 'Leicester Mercury',
    province: 'leicester',
    feed: reach('leicestermercury.co.uk')
  },
  {
    id: 'lincolnshire-live',
    name: 'LincolnshireLive',
    province: 'lincolnshire',
    feed: reach('lincolnshirelive.co.uk')
  },
  {
    id: 'northampton-chronicle',
    name: 'Northampton Chronicle & Echo',
    province: 'northampton',
    feed: nationalWorld('northamptonchron.co.uk')
  },
  {
    id: 'birmingham-mail',
    name: 'Birmingham Mail',
    province: 'birmingham',
    feed: reach('birminghammail.co.uk')
  },
  {
    id: 'coventry-telegraph',
    name: 'Coventry Telegraph',
    province: 'coventry',
    feed: reach('coventrytelegraph.net')
  },
  { id: 'stoke-sentinel', name: 'The Sentinel', province: 'stoke', feed: reach('stokesentinel.co.uk') },
  {
    id: 'shropshire-live',
    name: 'Shropshire Live',
    province: 'shropshire',
    feed: 'https://www.shropshirelive.com/feed/'
  },
  {
    id: 'worcester-news',
    name: 'Worcester News',
    province: 'hereford-worcester',
    feed: newsquest('worcesternews.co.uk')
  },
  {
    id: 'hereford-times',
    name: 'Hereford Times',
    province: 'hereford-worcester',
    feed: newsquest('herefordtimes.com')
  },
  {
    id: 'manchester-evening-news',
    name: 'Manchester Evening News',
    province: 'manchester',
    feed: reach('manchestereveningnews.co.uk')
  },
  {
    id: 'liverpool-echo',
    name: 'Liverpool Echo',
    province: 'merseyside',
    feed: reach('liverpoolecho.co.uk')
  },
  {
    id: 'lancashire-post',
    name: 'Lancashire Post',
    province: 'lancashire',
    feed: nationalWorld('lep.co.uk')
  },
  { id: 'news-and-star', name: 'News & Star', province: 'cumbria', feed: newsquest('newsandstar.co.uk') },
  { id: 'chronicle-live', name: 'Chronicle Live', province: 'tyne', feed: reach('chroniclelive.co.uk') },
  { id: 'teesside-live', name: 'TeessideLive', province: 'tees', feed: reach('gazettelive.co.uk') },
  {
    id: 'northern-echo',
    name: 'The Northern Echo',
    province: 'tees',
    feed: newsquest('thenorthernecho.co.uk')
  },
  {
    id: 'yorkshire-post',
    name: 'The Yorkshire Post',
    province: 'west-yorkshire',
    feed: nationalWorld('yorkshirepost.co.uk')
  },
  {
    id: 'yorkshire-evening-post',
    name: 'Yorkshire Evening Post',
    province: 'west-yorkshire',
    feed: nationalWorld('yorkshireeveningpost.co.uk')
  },
  {
    id: 'telegraph-and-argus',
    name: 'Telegraph & Argus',
    province: 'west-yorkshire',
    feed: newsquest('thetelegraphandargus.co.uk')
  },
  {
    id: 'sheffield-star',
    name: 'The Star',
    province: 'south-yorkshire',
    feed: nationalWorld('thestar.co.uk')
  },
  { id: 'york-press', name: 'The Press', province: 'north-yorkshire', feed: newsquest('yorkpress.co.uk') },
  { id: 'hull-daily-mail', name: 'Hull Daily Mail', province: 'hull', feed: reach('hulldailymail.co.uk') },
  // Scotland's and Wales' areas.
  {
    id: 'glasgow-times',
    name: 'Glasgow Times',
    province: 'glasgow-west',
    feed: newsquest('glasgowtimes.co.uk')
  },
  {
    id: 'edinburgh-evening-news',
    name: 'Edinburgh Evening News',
    province: 'edinburgh-east-fife',
    feed: 'https://www.edinburghnews.scotsman.com/rss'
  },
  {
    id: 'aberdeen-live',
    name: 'Aberdeen Live',
    province: 'north-east-scotland',
    feed: 'https://www.aberdeenlive.news/news/?service=rss'
  },
  {
    id: 'inverness-courier',
    name: 'Inverness Courier',
    province: 'highlands-islands',
    feed: 'https://www.inverness-courier.co.uk/_api/rss/inverness-news-feed.xml'
  },
  {
    id: 'southern-reporter',
    name: 'The Southern Reporter',
    province: 'south-scotland',
    feed: nationalWorld('thesouthernreporter.co.uk')
  },
  {
    id: 'falkirk-herald',
    name: 'Falkirk Herald',
    province: 'tayside-central',
    feed: nationalWorld('falkirkherald.co.uk')
  },
  {
    id: 'north-wales-live',
    name: 'North Wales Live',
    province: 'north-west-wales',
    feed: reach('dailypost.co.uk')
  },
  {
    id: 'leader-wrexham',
    name: 'The Leader',
    province: 'north-east-wales',
    feed: newsquest('leaderlive.co.uk')
  },
  {
    id: 'cambrian-news',
    name: 'Cambrian News',
    province: 'mid-wales',
    feed: 'https://www.cambrian-news.co.uk/news/rss'
  },
  {
    id: 'powys-county-times',
    name: 'County Times',
    province: 'mid-wales',
    feed: newsquest('countytimes.co.uk')
  },
  {
    id: 'western-telegraph',
    name: 'Western Telegraph',
    province: 'south-west-wales',
    feed: newsquest('westerntelegraph.co.uk')
  },
  {
    id: 'south-wales-argus',
    name: 'South Wales Argus',
    province: 'south-east-wales',
    feed: newsquest('southwalesargus.co.uk')
  },
  // Scotland, Wales and Northern Ireland: papers of the whole nation.
  { id: 'the-herald', name: 'The Herald', region: 'scotland', feed: newsquest('heraldscotland.com') },
  { id: 'the-scotsman', name: 'The Scotsman', region: 'scotland', feed: nationalWorld('scotsman.com') },
  {
    id: 'the-national-scotland',
    name: 'The National',
    region: 'scotland',
    feed: newsquest('thenational.scot')
  },
  { id: 'stv-news', name: 'STV News', region: 'scotland', feed: 'https://news.stv.tv/feed' },
  { id: 'daily-record', name: 'Daily Record', region: 'scotland', feed: reach('dailyrecord.co.uk') },
  { id: 'walesonline', name: 'WalesOnline', region: 'wales', feed: reach('walesonline.co.uk') },
  { id: 'nation-cymru', name: 'Nation.Cymru', region: 'wales', feed: 'https://nation.cymru/feed/' },
  {
    id: 'belfast-telegraph',
    name: 'Belfast Telegraph',
    province: 'northern-ireland',
    feed: 'https://www.belfasttelegraph.co.uk/rss/'
  },
  {
    id: 'news-letter',
    name: 'News Letter',
    province: 'northern-ireland',
    feed: nationalWorld('newsletter.co.uk')
  }
]

export const localSources: SourceDef[] = [bbcLocal, ...papers.map((paper) => localOutlet(paper, 'en'))]
