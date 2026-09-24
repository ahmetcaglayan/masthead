import type { SourceDef } from '../../types'
import { favicon } from '../build.ts'
import { localSources } from './local.ts'

/*
 * United Kingdom — English-language national sources, plus BBC local news for every area
 * and the regional papers (see `local.ts`). Every feed was checked on 2026-09-24
 * (re-check with `npm run verify:feeds gb`). Only British newsrooms: the UK editions of
 * international titles are in when they have their own feed.
 *
 * The default set runs from the Guardian, the New Statesman and the Mirror's side to
 * the Telegraph, The Critic and GB News; the tabloids and celebrity weeklies are off by
 * default, like in the Turkey pack, and so are the campaigning and party-activist sites.
 *
 * Not included: The Times and Sunday Times, ITV News, LBC, Prospect, Top Gear, What Car?,
 * Time Out and Tes (no public feed), The Spectator (its feed answers 404), The Observer
 * (no feed since it left the Guardian; the Guardian's Observer feed is an archive),
 * Reuters (no public UK feed), The Week (its UK feed mixes in the US edition and
 * subscription adverts), Wired UK (folded into the US site), Pocket-lint (no longer a
 * British newsroom), MoneySavingExpert, Schools Week, FE Week, Kerrang!, the TLS, Retail
 * Gazette and BusinessGreen (403 or a bot check), Eurogamer, GamesRadar and Rock Paper
 * Shotgun (503 to feed readers), CAR magazine (empty feed), The Ecologist (no feed),
 * Private Eye and the London Review of Books (fortnightly, two weeks old at the check) and
 * the Telegraph's section feeds, stale for months (its main feed is live).
 */

const nationalSources: SourceDef[] = [
  {
    id: 'bbc-news',
    name: 'BBC News',
    homepage: 'https://www.bbc.co.uk/news',
    icon: 'https://www.bbc.co.uk/apple-touch-icon.png',
    color: '#BB1919',
    kind: 'public',
    language: 'en',
    feeds: [
      { url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'top', headline: true },
      { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', category: 'national' },
      { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', category: 'politics' },
      { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'economy' },
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'technology' },
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'science' },
      { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', category: 'health' },
      { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', category: 'culture' },
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
      { url: 'https://feeds.bbci.co.uk/news/education/rss.xml', category: 'education' }
    ]
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    homepage: 'https://www.theguardian.com/uk',
    icon: 'https://www.theguardian.com/favicon.ico',
    color: '#052962',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.theguardian.com/uk/rss', category: 'top', headline: true },
      { url: 'https://www.theguardian.com/politics/rss', category: 'politics' },
      { url: 'https://www.theguardian.com/world/rss', category: 'world' },
      { url: 'https://www.theguardian.com/uk/business/rss', category: 'economy' },
      { url: 'https://www.theguardian.com/uk/technology/rss', category: 'technology' },
      { url: 'https://www.theguardian.com/science/rss', category: 'science' },
      { url: 'https://www.theguardian.com/uk/environment/rss', category: 'environment' },
      { url: 'https://www.theguardian.com/uk/culture/rss', category: 'culture' },
      { url: 'https://www.theguardian.com/uk/sport/rss', category: 'sports' },
      { url: 'https://www.theguardian.com/society/rss', category: 'health' },
      { url: 'https://www.theguardian.com/education/rss', category: 'education' },
      { url: 'https://www.theguardian.com/uk/lifeandstyle/rss', category: 'lifestyle' },
      { url: 'https://www.theguardian.com/uk/travel/rss', category: 'travel' },
      { url: 'https://www.theguardian.com/uk/film/rss', category: 'entertainment' },
      { url: 'https://www.theguardian.com/uk/commentisfree/rss', category: 'opinion' }
    ]
  },
  {
    id: 'sky-news',
    name: 'Sky News',
    homepage: 'https://news.sky.com',
    icon: 'https://news.sky.com/apple-touch-icon.png',
    color: '#D5232F',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://feeds.skynews.com/feeds/rss/home.xml', category: 'top', headline: true },
      { url: 'https://feeds.skynews.com/feeds/rss/uk.xml', category: 'national' },
      { url: 'https://feeds.skynews.com/feeds/rss/politics.xml', category: 'politics' },
      { url: 'https://feeds.skynews.com/feeds/rss/world.xml', category: 'world' },
      { url: 'https://feeds.skynews.com/feeds/rss/business.xml', category: 'economy' },
      { url: 'https://feeds.skynews.com/feeds/rss/technology.xml', category: 'technology' },
      { url: 'https://feeds.skynews.com/feeds/rss/entertainment.xml', category: 'entertainment' }
    ]
  },
  {
    id: 'independent',
    name: 'The Independent',
    homepage: 'https://www.independent.co.uk',
    icon: 'https://www.independent.co.uk/favicon.ico',
    color: '#EE1B24',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.independent.co.uk/news/uk/rss', category: 'national', headline: true },
      { url: 'https://www.independent.co.uk/news/world/rss', category: 'world' },
      { url: 'https://www.independent.co.uk/news/business/rss', category: 'economy' },
      { url: 'https://www.independent.co.uk/sport/rss', category: 'sports' },
      { url: 'https://www.independent.co.uk/tech/rss', category: 'technology' },
      { url: 'https://www.independent.co.uk/climate-change/rss', category: 'environment' },
      { url: 'https://www.independent.co.uk/life-style/rss', category: 'lifestyle' },
      { url: 'https://www.independent.co.uk/travel/rss', category: 'travel' },
      { url: 'https://www.independent.co.uk/arts-entertainment/rss', category: 'entertainment' },
      { url: 'https://www.independent.co.uk/voices/rss', category: 'opinion' }
    ]
  },
  {
    id: 'evening-standard',
    name: 'Evening Standard',
    homepage: 'https://www.standard.co.uk',
    icon: 'https://www.standard.co.uk/img/shortcut-icons/favicon.ico',
    color: '#C8102E',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.standard.co.uk/rss', category: 'general' },
      { url: 'https://www.standard.co.uk/news/politics/rss', category: 'politics' },
      { url: 'https://www.standard.co.uk/business/rss', category: 'economy' },
      { url: 'https://www.standard.co.uk/sport/rss', category: 'sports' },
      { url: 'https://www.standard.co.uk/culture/rss', category: 'culture' }
    ]
  },
  {
    id: 'financial-times',
    name: 'Financial Times',
    homepage: 'https://www.ft.com',
    color: '#990F3D',
    kind: 'business',
    language: 'en',
    // Headlines only; the articles are for subscribers.
    feeds: [
      { url: 'https://www.ft.com/rss/home', category: 'economy' },
      { url: 'https://www.ft.com/world-uk?format=rss', category: 'national' },
      { url: 'https://www.ft.com/world?format=rss', category: 'world' },
      { url: 'https://www.ft.com/opinion?format=rss', category: 'opinion' }
    ]
  },
  {
    id: 'economist',
    name: 'The Economist',
    homepage: 'https://www.economist.com',
    icon: 'https://www.economist.com/favicon.ico',
    color: '#E3120B',
    kind: 'international',
    language: 'en',
    feeds: [
      { url: 'https://www.economist.com/latest/rss.xml', category: 'general' },
      { url: 'https://www.economist.com/britain/rss.xml', category: 'national' },
      { url: 'https://www.economist.com/finance-and-economics/rss.xml', category: 'economy' },
      { url: 'https://www.economist.com/science-and-technology/rss.xml', category: 'science' }
    ]
  },
  {
    id: 'telegraph',
    name: 'The Telegraph',
    homepage: 'https://www.telegraph.co.uk',
    icon: favicon('telegraph.co.uk'),
    color: '#1A1A1A',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.telegraph.co.uk/rss.xml', category: 'general' },
      { url: 'https://www.telegraph.co.uk/business/rss.xml', category: 'economy' }
    ]
  },
  {
    id: 'i-news',
    name: 'The i Paper',
    homepage: 'https://inews.co.uk',
    icon: favicon('inews.co.uk'),
    color: '#0F5B8D',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://inews.co.uk/feed', category: 'general' },
      { url: 'https://inews.co.uk/category/news/politics/feed', category: 'politics' },
      { url: 'https://inews.co.uk/category/news/world/feed', category: 'world' },
      { url: 'https://inews.co.uk/category/sport/feed', category: 'sports' },
      { url: 'https://inews.co.uk/category/culture/feed', category: 'culture' },
      { url: 'https://inews.co.uk/category/opinion/feed', category: 'opinion' }
    ]
  },
  {
    id: 'gb-news',
    name: 'GB News',
    homepage: 'https://www.gbnews.com',
    icon: favicon('gbnews.com'),
    color: '#002F6C',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.gbnews.com/feeds/news.rss', category: 'national' },
      { url: 'https://www.gbnews.com/feeds/politics.rss', category: 'politics' },
      { url: 'https://www.gbnews.com/feeds/sport.rss', category: 'sports' }
    ]
  },
  {
    id: 'channel-4-news',
    name: 'Channel 4 News',
    homepage: 'https://www.channel4.com/news',
    icon: favicon('channel4.com/news'),
    color: '#1A1A1A',
    kind: 'public',
    language: 'en',
    feeds: [
      { url: 'https://www.channel4.com/news/feed', category: 'general' },
      { url: 'https://www.channel4.com/news/politics/feed', category: 'politics' }
    ]
  },
  {
    id: 'new-statesman',
    name: 'New Statesman',
    homepage: 'https://www.newstatesman.com',
    icon: favicon('newstatesman.com'),
    color: '#C4122F',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.newstatesman.com/feed', category: 'politics' }]
  },
  {
    id: 'the-conversation-uk',
    name: 'The Conversation UK',
    homepage: 'https://theconversation.com/uk',
    icon: favicon('theconversation.com/uk'),
    color: '#D8352A',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://theconversation.com/uk/articles.atom', category: 'science' }]
  },
  {
    id: 'huffpost-uk',
    name: 'HuffPost UK',
    homepage: 'https://www.huffingtonpost.co.uk',
    icon: favicon('huffingtonpost.co.uk'),
    color: '#0DBE98',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.huffingtonpost.co.uk/feeds/index.xml', category: 'general' }]
  },
  {
    id: 'the-big-issue',
    name: 'The Big Issue',
    homepage: 'https://www.bigissue.com',
    icon: favicon('bigissue.com'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.bigissue.com/feed/', category: 'general' }]
  },

  // Politics and opinion
  {
    id: 'politicshome',
    name: 'PoliticsHome',
    homepage: 'https://www.politicshome.com',
    icon: favicon('politicshome.com'),
    color: '#00A3A6',
    kind: 'independent',
    language: 'en',
    feeds: [
      { url: 'https://www.politicshome.com/news/rss', category: 'politics' },
      { url: 'https://www.politicshome.com/opinion/rss', category: 'opinion' }
    ]
  },
  {
    id: 'politics-co-uk',
    name: 'Politics.co.uk',
    homepage: 'https://www.politics.co.uk',
    icon: favicon('politics.co.uk'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.politics.co.uk/feed/', category: 'politics' }]
  },
  {
    id: 'unherd',
    name: 'UnHerd',
    homepage: 'https://unherd.com',
    icon: favicon('unherd.com'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://unherd.com/feed/', category: 'opinion' }]
  },
  {
    id: 'the-critic',
    name: 'The Critic',
    homepage: 'https://thecritic.co.uk',
    icon: favicon('thecritic.co.uk'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://thecritic.co.uk/feed/', category: 'opinion' }]
  },
  {
    // Formerly The New European.
    id: 'the-new-world',
    name: 'The New World',
    homepage: 'https://www.thenewworld.co.uk',
    icon: favicon('thenewworld.co.uk'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.thenewworld.co.uk/feed/', category: 'opinion' }]
  },

  // Business, technology, science, health, education, environment
  {
    id: 'city-am',
    name: 'City A.M.',
    homepage: 'https://www.cityam.com',
    icon: favicon('cityam.com'),
    color: '#E4032E',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://www.cityam.com/feed/', category: 'economy' }]
  },
  {
    id: 'this-is-money',
    name: 'This is Money',
    homepage: 'https://www.thisismoney.co.uk',
    icon: favicon('thisismoney.co.uk'),
    color: '#004DB3',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://www.thisismoney.co.uk/money/index.rss', category: 'economy' }]
  },
  {
    id: 'moneyweek',
    name: 'MoneyWeek',
    homepage: 'https://moneyweek.com',
    icon: favicon('moneyweek.com'),
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://moneyweek.com/feeds.xml', category: 'economy' }]
  },
  {
    // Consumer rights, bills, scams and product safety.
    id: 'which',
    name: 'Which?',
    homepage: 'https://www.which.co.uk',
    icon: favicon('which.co.uk'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.which.co.uk/news/feed', category: 'economy' }]
  },
  {
    id: 'the-register',
    name: 'The Register',
    homepage: 'https://www.theregister.com',
    icon: favicon('theregister.com'),
    color: '#D12D2D',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.theregister.com/headlines.atom', category: 'technology' }]
  },
  {
    id: 'techradar',
    name: 'TechRadar',
    homepage: 'https://www.techradar.com',
    icon: favicon('techradar.com'),
    color: '#1D1D1B',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.techradar.com/feeds.xml', category: 'technology' }]
  },
  {
    id: 'computer-weekly',
    name: 'Computer Weekly',
    homepage: 'https://www.computerweekly.com',
    icon: favicon('computerweekly.com'),
    kind: 'technology',
    language: 'en',
    feeds: [
      { url: 'https://www.computerweekly.com/rss/All-Computer-Weekly-content.xml', category: 'technology' }
    ]
  },
  {
    id: 't3',
    name: 'T3',
    homepage: 'https://www.t3.com',
    icon: favicon('t3.com'),
    color: '#D21F25',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.t3.com/feeds.xml', category: 'technology' }]
  },
  {
    id: 'stuff-tv',
    name: 'Stuff',
    homepage: 'https://www.stuff.tv',
    icon: favicon('stuff.tv'),
    color: '#E03034',
    kind: 'technology',
    language: 'en',
    // The site-wide feed carries full articles (3 MB); the news feed is enough.
    feeds: [{ url: 'https://www.stuff.tv/news/feed/', category: 'technology' }]
  },
  {
    id: 'trusted-reviews',
    name: 'Trusted Reviews',
    homepage: 'https://www.trustedreviews.com',
    icon: favicon('trustedreviews.com'),
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.trustedreviews.com/feed', category: 'technology' }]
  },
  {
    id: 'new-scientist',
    name: 'New Scientist',
    homepage: 'https://www.newscientist.com',
    icon: favicon('newscientist.com'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.newscientist.com/feed/', category: 'science' }]
  },
  {
    id: 'science-focus',
    name: 'BBC Science Focus',
    homepage: 'https://www.sciencefocus.com',
    icon: favicon('sciencefocus.com'),
    kind: 'independent',
    language: 'en',
    // The feed the site links to, served by its publishing platform.
    feeds: [
      {
        url: 'https://feeds.purplemanager.com/193c804a-a673-47bd-b09b-11baf4822a17/complete-rss-feed-for-science-focus',
        category: 'science'
      }
    ]
  },
  {
    id: 'pulse',
    name: 'Pulse',
    homepage: 'https://www.pulsetoday.co.uk',
    icon: favicon('pulsetoday.co.uk'),
    color: '#00558C',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.pulsetoday.co.uk/feed/', category: 'health' }]
  },
  {
    id: 'nursing-times',
    name: 'Nursing Times',
    homepage: 'https://www.nursingtimes.net',
    icon: favicon('nursingtimes.net'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.nursingtimes.net/feed/', category: 'health' }]
  },
  {
    // Higher education.
    id: 'wonkhe',
    name: 'Wonkhe',
    homepage: 'https://wonkhe.com',
    icon: favicon('wonkhe.com'),
    color: '#141437',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://wonkhe.com/feed/', category: 'education' }]
  },
  {
    id: 'carbon-brief',
    name: 'Carbon Brief',
    homepage: 'https://www.carbonbrief.org',
    icon: favicon('carbonbrief.org'),
    color: '#1B4D5C',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.carbonbrief.org/feed', category: 'environment' }]
  },
  {
    id: 'climate-home-news',
    name: 'Climate Home News',
    homepage: 'https://www.climatechangenews.com',
    icon: favicon('climatechangenews.com'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.climatechangenews.com/feed/', category: 'environment' }]
  },
  {
    id: 'edie',
    name: 'edie',
    homepage: 'https://www.edie.net',
    icon: favicon('edie.net'),
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://www.edie.net/feed/', category: 'environment' }]
  },

  // Motoring and sport
  {
    id: 'autocar',
    name: 'Autocar',
    homepage: 'https://www.autocar.co.uk',
    icon: favicon('autocar.co.uk'),
    color: '#E30613',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.autocar.co.uk/rss', category: 'automotive' }]
  },
  {
    id: 'auto-express',
    name: 'Auto Express',
    homepage: 'https://www.autoexpress.co.uk',
    icon: favicon('autoexpress.co.uk'),
    color: '#E2001A',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.autoexpress.co.uk/feed/all', category: 'automotive' }]
  },
  {
    id: 'motoring-research',
    name: 'Motoring Research',
    homepage: 'https://www.motoringresearch.com',
    icon: favicon('motoringresearch.com'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.motoringresearch.com/feed/', category: 'automotive' }]
  },
  {
    id: 'sky-sports',
    name: 'Sky Sports',
    homepage: 'https://www.skysports.com',
    icon: favicon('skysports.com'),
    color: '#0B1F44',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.skysports.com/rss/12040', category: 'sports' }]
  },
  {
    id: 'talksport',
    name: 'talkSPORT',
    homepage: 'https://talksport.com',
    icon: favicon('talksport.com'),
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://talksport.com/feed/', category: 'sports' }]
  },
  {
    id: 'football365',
    name: 'Football365',
    homepage: 'https://www.football365.com',
    icon: favicon('football365.com'),
    color: '#161E26',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.football365.com/rss', category: 'sports' }]
  },
  {
    id: 'planet-rugby',
    name: 'Planet Rugby',
    homepage: 'https://www.planetrugby.com',
    icon: favicon('planetrugby.com'),
    color: '#143138',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.planetrugby.com/rss', category: 'sports' }]
  },
  {
    id: 'wisden',
    name: 'Wisden',
    homepage: 'https://www.wisden.com',
    icon: favicon('wisden.com'),
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.wisden.com/feed', category: 'sports' }]
  },
  {
    id: 'autosport',
    name: 'Autosport',
    homepage: 'https://www.autosport.com',
    icon: favicon('autosport.com'),
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.autosport.com/rss/all/news/', category: 'sports' }]
  },
  {
    id: 'cycling-weekly',
    name: 'Cycling Weekly',
    homepage: 'https://www.cyclingweekly.com',
    icon: favicon('cyclingweekly.com'),
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.cyclingweekly.com/feeds.xml', category: 'sports' }]
  },

  // Entertainment, lifestyle and travel
  {
    id: 'nme',
    name: 'NME',
    homepage: 'https://www.nme.com',
    icon: favicon('nme.com'),
    color: '#E41C24',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.nme.com/feed', category: 'entertainment' }]
  },
  {
    id: 'radio-times',
    name: 'Radio Times',
    homepage: 'https://www.radiotimes.com',
    icon: favicon('radiotimes.com'),
    color: '#E4032E',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.radiotimes.com/feed/', category: 'entertainment' }]
  },
  {
    id: 'digital-spy',
    name: 'Digital Spy',
    homepage: 'https://www.digitalspy.com',
    icon: favicon('digitalspy.com'),
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.digitalspy.com/rss/all.xml/', category: 'entertainment' }]
  },
  {
    id: 'empire',
    name: 'Empire',
    homepage: 'https://www.empireonline.com',
    icon: favicon('empireonline.com'),
    kind: 'mainstream',
    language: 'en',
    // The feed the site links to, served by its publisher, Bauer.
    feeds: [
      {
        url: 'https://rss.onebauer.media/api/feed-aggregator?hostname=https://www.empireonline.com',
        category: 'entertainment'
      }
    ]
  },
  {
    id: 'vogue-uk',
    name: 'British Vogue',
    homepage: 'https://www.vogue.co.uk',
    icon: favicon('vogue.co.uk'),
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.vogue.co.uk/feed/rss', category: 'lifestyle' }]
  },
  {
    id: 'gq-uk',
    name: 'British GQ',
    homepage: 'https://www.gq-magazine.co.uk',
    icon: favicon('gq-magazine.co.uk'),
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.gq-magazine.co.uk/feed/rss', category: 'lifestyle' }]
  },
  {
    id: 'good-housekeeping-uk',
    name: 'Good Housekeeping UK',
    homepage: 'https://www.goodhousekeeping.com/uk/',
    icon: favicon('goodhousekeeping.com'),
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.goodhousekeeping.com/uk/rss/all.xml/', category: 'lifestyle' }]
  },
  {
    id: 'bbc-good-food',
    name: 'BBC Good Food',
    homepage: 'https://www.bbcgoodfood.com',
    icon: favicon('bbcgoodfood.com'),
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.bbcgoodfood.com/feed', category: 'lifestyle' }]
  },
  {
    id: 'cn-traveller-uk',
    name: 'Condé Nast Traveller',
    homepage: 'https://www.cntraveller.com',
    icon: favicon('cntraveller.com'),
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.cntraveller.com/feed/rss', category: 'travel' }]
  },
  {
    id: 'wanderlust',
    name: 'Wanderlust',
    homepage: 'https://www.wanderlustmagazine.com',
    icon: favicon('wanderlustmagazine.com'),
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.wanderlustmagazine.com/feed/', category: 'travel' }]
  },

  // Popular press and celebrity weeklies — off by default, like the tabloids in the Turkey pack.
  {
    id: 'daily-mail',
    name: 'Daily Mail',
    homepage: 'https://www.dailymail.co.uk',
    icon: 'https://www.dailymail.com/apple-touch-icon.png',
    color: '#004DB3',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.dailymail.co.uk/articles.rss', category: 'general' },
      { url: 'https://www.dailymail.co.uk/news/index.rss', category: 'national' }
    ]
  },
  {
    id: 'mirror',
    name: 'Daily Mirror',
    homepage: 'https://www.mirror.co.uk',
    icon: 'https://www.mirror.co.uk/favicon.ico',
    color: '#E01E26',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.mirror.co.uk/news/?service=rss', category: 'general' }]
  },
  {
    id: 'metro',
    name: 'Metro',
    homepage: 'https://metro.co.uk',
    icon: 'https://metro.co.uk/apple-touch-icon.png',
    color: '#00A0DF',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://metro.co.uk/feed/', category: 'general' }]
  },
  {
    id: 'the-sun',
    name: 'The Sun',
    homepage: 'https://www.thesun.co.uk',
    icon: favicon('thesun.co.uk'),
    color: '#EB1C24',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.thesun.co.uk/feed/', category: 'general' }]
  },
  {
    id: 'daily-express',
    name: 'Daily Express',
    homepage: 'https://www.express.co.uk',
    icon: favicon('express.co.uk'),
    color: '#C00000',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.express.co.uk/posts/rss/1/uk', category: 'general' }]
  },
  {
    id: 'daily-star',
    name: 'Daily Star',
    homepage: 'https://www.dailystar.co.uk',
    icon: favicon('dailystar.co.uk'),
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.dailystar.co.uk/?service=rss', category: 'general' }]
  },
  {
    id: 'hello-magazine',
    name: 'HELLO!',
    homepage: 'https://www.hellomagazine.com',
    icon: favicon('hellomagazine.com'),
    color: '#CC0000',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.hellomagazine.com/feeds/rss/any/any/any/50.xml', category: 'entertainment' }]
  },
  {
    id: 'ok-magazine',
    name: 'OK!',
    homepage: 'https://www.ok.co.uk',
    icon: favicon('ok.co.uk'),
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.ok.co.uk/?service=rss', category: 'entertainment' }]
  },

  // Campaigning and party-activist sites — off by default.
  {
    id: 'opendemocracy',
    name: 'openDemocracy',
    homepage: 'https://www.opendemocracy.net',
    icon: favicon('opendemocracy.net'),
    color: '#1E61BE',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.opendemocracy.net/rss/', category: 'opinion' }]
  },
  {
    id: 'byline-times',
    name: 'Byline Times',
    homepage: 'https://bylinetimes.com',
    icon: favicon('bylinetimes.com'),
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://bylinetimes.com/feed/', category: 'politics' }]
  },
  {
    id: 'morning-star',
    name: 'Morning Star',
    homepage: 'https://morningstaronline.co.uk',
    icon: favicon('morningstaronline.co.uk'),
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://morningstaronline.co.uk/rss.xml', category: 'general' }]
  },
  {
    id: 'conservativehome',
    name: 'ConservativeHome',
    homepage: 'https://conservativehome.com',
    icon: favicon('conservativehome.com'),
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://conservativehome.com/feed/', category: 'politics' }]
  },
  {
    id: 'labourlist',
    name: 'LabourList',
    homepage: 'https://labourlist.org',
    icon: favicon('labourlist.org'),
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://labourlist.org/feed/', category: 'politics' }]
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
