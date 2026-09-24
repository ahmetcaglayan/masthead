import type { SourceDef } from '../../types'
import { localOutlet, type LocalOutlet } from '../build.ts'

/*
 * Local newsrooms, two or three per state: a local TV newsroom and, where one has a
 * working feed, a newspaper, public radio station or nonprofit statehouse desk. Every feed
 * carries its state's code, so the pipeline only fetches it for the user's selected state
 * (or a handful across a region). Checked on 2026-09-23.
 *
 * Gray Television stations serve their local desk at `/category/news/`, Hearst stations at
 * `/local-news-rss`; their front-page feeds mix in network stories from other states.
 * Not included: the States Newsroom sites (Florida Phoenix, Georgia Recorder…), whose feeds
 * sit behind a Cloudflare challenge, Gannett papers, which no longer publish feeds, the Lee
 * Enterprises papers (Omaha World-Herald, St. Louis Post-Dispatch), which rate-limit feed
 * readers, the Texas Tribune's feed, days behind the site, and KING 5 (its feeds went empty,
 * 2026-09-24).
 */

const gray = (host: string): string =>
  `https://www.${host}/arc/outboundfeeds/rss/category/news/?outputType=xml`
const hearst = (host: string): string => `https://www.${host}/local-news-rss`
const arc = (host: string): string => `https://www.${host}/arc/outboundfeeds/rss/?outputType=xml`

const outlets: LocalOutlet[] = [
  // Northeast
  { id: 'ct-mirror', name: 'CT Mirror', province: 'CT', feed: 'https://ctmirror.org/feed/' },
  { id: 'wtnh', name: 'WTNH News 8', province: 'CT', feed: 'https://www.wtnh.com/news/feed/' },
  {
    id: 'press-herald',
    name: 'Portland Press Herald',
    province: 'ME',
    feed: 'https://www.pressherald.com/feed/'
  },
  {
    id: 'bangor-daily-news',
    name: 'Bangor Daily News',
    province: 'ME',
    feed: 'https://www.bangordailynews.com/feed/'
  },
  { id: 'wcvb', name: 'WCVB 5', province: 'MA', feed: hearst('wcvb.com') },
  { id: 'masslive', name: 'MassLive', province: 'MA', feed: arc('masslive.com') },
  {
    id: 'commonwealth-beacon',
    name: 'CommonWealth Beacon',
    province: 'MA',
    feed: 'https://commonwealthbeacon.org/feed/'
  },
  { id: 'wmur', name: 'WMUR', province: 'NH', feed: hearst('wmur.com') },
  { id: 'wpri', name: 'WPRI 12', province: 'RI', feed: 'https://www.wpri.com/feed/' },
  { id: 'vtdigger', name: 'VTDigger', province: 'VT', feed: 'https://vtdigger.org/feed/' },
  { id: 'wcax', name: 'WCAX', province: 'VT', feed: gray('wcax.com') },
  { id: 'nj-com', name: 'NJ.com', province: 'NJ', feed: arc('nj.com') },
  {
    id: 'nj-spotlight',
    name: 'NJ Spotlight News',
    province: 'NJ',
    feed: 'https://www.njspotlightnews.org/feed/'
  },
  { id: 'gothamist', name: 'Gothamist', province: 'NY', feed: 'https://gothamist.com/feed' },
  { id: 'pix11', name: 'PIX11', province: 'NY', feed: 'https://pix11.com/news/local-news/feed/' },
  { id: 'ny-focus', name: 'New York Focus', province: 'NY', feed: 'https://nysfocus.com/feed' },
  { id: 'inquirer', name: 'The Philadelphia Inquirer', province: 'PA', feed: arc('inquirer.com') },
  { id: 'pennlive', name: 'PennLive', province: 'PA', feed: arc('pennlive.com') },
  {
    id: 'spotlight-pa',
    name: 'Spotlight PA',
    province: 'PA',
    feed: 'https://www.spotlightpa.org/feeds/full.xml'
  },
  { id: 'wtae', name: 'WTAE 4', province: 'PA', feed: hearst('wtae.com') },

  // Midwest
  {
    id: 'chicago-sun-times',
    name: 'Chicago Sun-Times',
    province: 'IL',
    feed: 'https://chicago.suntimes.com/rss/index.xml'
  },
  { id: 'wgn', name: 'WGN 9', province: 'IL', feed: 'https://wgntv.com/news/feed/' },
  {
    id: 'capitol-news-illinois',
    name: 'Capitol News Illinois',
    province: 'IL',
    feed: 'https://capitolnewsillinois.com/feed/'
  },
  { id: 'mirror-indy', name: 'Mirror Indy', province: 'IN', feed: 'https://mirrorindy.org/feed/' },
  { id: 'fox59', name: 'FOX59', province: 'IN', feed: 'https://fox59.com/news/feed/' },
  { id: 'wndu', name: 'WNDU 16', province: 'IN', feed: gray('wndu.com') },
  {
    id: 'bridge-michigan',
    name: 'Bridge Michigan',
    province: 'MI',
    feed: 'https://bridgemi.com/feed/?partner-feed=latest-articles'
  },
  { id: 'mlive', name: 'MLive', province: 'MI', feed: arc('mlive.com') },
  { id: 'cleveland-com', name: 'Cleveland.com', province: 'OH', feed: arc('cleveland.com') },
  {
    id: 'nbc4-columbus',
    name: 'NBC4 Columbus',
    province: 'OH',
    feed: 'https://www.nbc4i.com/news/local-news/feed/'
  },
  { id: 'wlwt', name: 'WLWT 5', province: 'OH', feed: hearst('wlwt.com') },
  { id: 'wisn', name: 'WISN 12', province: 'WI', feed: hearst('wisn.com') },
  { id: 'wmtv', name: 'WMTV 15', province: 'WI', feed: gray('wmtv15news.com') },
  { id: 'wpr', name: 'Wisconsin Public Radio', province: 'WI', feed: 'https://www.wpr.org/feed' },
  { id: 'kcci', name: 'KCCI 8', province: 'IA', feed: hearst('kcci.com') },
  {
    id: 'iowa-public-radio',
    name: 'Iowa Public Radio',
    province: 'IA',
    feed: 'https://www.iowapublicradio.org/news.rss'
  },
  { id: 'ksn', name: 'KSN', province: 'KS', feed: 'https://www.ksn.com/news/local/feed/' },
  { id: 'kwch', name: 'KWCH 12', province: 'KS', feed: gray('kwch.com') },
  { id: 'kstp', name: 'KSTP 5', province: 'MN', feed: 'https://kstp.com/feed/' },
  {
    id: 'star-tribune',
    name: 'Star Tribune',
    province: 'MN',
    feed: 'https://www.startribune.com/local/index.rss2'
  },
  { id: 'fox2-st-louis', name: 'FOX 2 St. Louis', province: 'MO', feed: 'https://fox2now.com/news/feed/' },
  { id: 'kcur', name: 'KCUR', province: 'MO', feed: 'https://www.kcur.org/news.rss' },
  { id: 'ky3', name: 'KY3', province: 'MO', feed: gray('ky3.com') },
  { id: 'ketv', name: 'KETV 7', province: 'NE', feed: hearst('ketv.com') },
  {
    id: 'flatwater-free-press',
    name: 'Flatwater Free Press',
    province: 'NE',
    feed: 'https://flatwaterfreepress.org/feed/'
  },
  { id: 'kfyr', name: 'KFYR', province: 'ND', feed: gray('kfyrtv.com') },
  { id: 'kx-news', name: 'KX News', province: 'ND', feed: 'https://www.kxnet.com/news/local-news/feed/' },
  { id: 'kota', name: 'KOTA', province: 'SD', feed: gray('kotatv.com') },
  {
    id: 'sd-news-watch',
    name: 'South Dakota News Watch',
    province: 'SD',
    feed: 'https://www.sdnewswatch.org/rss/'
  },

  // South
  {
    id: 'spotlight-delaware',
    name: 'Spotlight Delaware',
    province: 'DE',
    feed: 'https://spotlightdelaware.org/feed/'
  },
  { id: 'wtop', name: 'WTOP', province: 'DC', feed: 'https://wtop.com/feed/' },
  {
    id: 'dc-news-now',
    name: 'DC News Now',
    province: 'DC',
    feed: 'https://www.dcnewsnow.com/news/local-news/feed/'
  },
  {
    id: 'washington-city-paper',
    name: 'Washington City Paper',
    province: 'DC',
    feed: 'https://washingtoncitypaper.com/feed/?partner-feed=public'
  },
  { id: 'tampa-bay-times', name: 'Tampa Bay Times', province: 'FL', feed: arc('tampabay.com') },
  { id: 'wfla', name: 'WFLA 8', province: 'FL', feed: 'https://www.wfla.com/news/local-news/feed/' },
  { id: 'wpbf', name: 'WPBF 25', province: 'FL', feed: hearst('wpbf.com') },
  { id: 'wsb-tv', name: 'WSB-TV', province: 'GA', feed: arc('wsbtv.com') },
  { id: 'wtoc', name: 'WTOC 11', province: 'GA', feed: gray('wtoc.com') },
  { id: 'wbal', name: 'WBAL-TV 11', province: 'MD', feed: hearst('wbaltv.com') },
  { id: 'wbtv', name: 'WBTV 3', province: 'NC', feed: gray('wbtv.com') },
  { id: 'wxii', name: 'WXII 12', province: 'NC', feed: hearst('wxii12.com') },
  { id: 'wunc', name: 'WUNC', province: 'NC', feed: 'https://www.wunc.org/news.rss' },
  { id: 'wyff', name: 'WYFF 4', province: 'SC', feed: hearst('wyff4.com') },
  { id: 'wis', name: 'WIS 10', province: 'SC', feed: gray('wistv.com') },
  { id: 'wspa', name: 'WSPA 7', province: 'SC', feed: 'https://www.wspa.com/news/feed/' },
  { id: 'cardinal-news', name: 'Cardinal News', province: 'VA', feed: 'https://cardinalnews.org/feed/' },
  { id: 'wdbj', name: 'WDBJ 7', province: 'VA', feed: gray('wdbj7.com') },
  { id: 'wv-metronews', name: 'WV MetroNews', province: 'WV', feed: 'https://wvmetronews.com/feed/' },
  { id: 'wsaz', name: 'WSAZ', province: 'WV', feed: gray('wsaz.com') },
  {
    id: 'mountain-state-spotlight',
    name: 'Mountain State Spotlight',
    province: 'WV',
    feed: 'https://mountainstatespotlight.org/feed/'
  },
  { id: 'al-com', name: 'AL.com', province: 'AL', feed: arc('al.com') },
  { id: 'wbrc', name: 'WBRC FOX6', province: 'AL', feed: gray('wbrc.com') },
  { id: 'wkyt', name: 'WKYT', province: 'KY', feed: gray('wkyt.com') },
  { id: 'wlky', name: 'WLKY', province: 'KY', feed: hearst('wlky.com') },
  {
    id: 'mississippi-today',
    name: 'Mississippi Today',
    province: 'MS',
    feed: 'https://mississippitoday.org/feed/'
  },
  { id: 'wlbt', name: 'WLBT 3', province: 'MS', feed: gray('wlbt.com') },
  { id: 'wsmv', name: 'WSMV 4', province: 'TN', feed: gray('wsmv.com') },
  { id: 'wkrn', name: 'WKRN News 2', province: 'TN', feed: 'https://www.wkrn.com/news/local-news/feed/' },
  {
    id: 'nashville-banner',
    name: 'Nashville Banner',
    province: 'TN',
    feed: 'https://nashvillebanner.com/feed/'
  },
  { id: 'arkansas-times', name: 'Arkansas Times', province: 'AR', feed: 'https://arktimes.com/feed' },
  { id: 'kark', name: 'KARK 4', province: 'AR', feed: 'https://www.kark.com/news/local-news/feed/' },
  { id: 'wdsu', name: 'WDSU 6', province: 'LA', feed: hearst('wdsu.com') },
  { id: 'the-lens', name: 'The Lens', province: 'LA', feed: 'https://thelensnola.org/feed/' },
  { id: 'wafb', name: 'WAFB 9', province: 'LA', feed: gray('wafb.com') },
  { id: 'koco', name: 'KOCO 5', province: 'OK', feed: hearst('koco.com') },
  { id: 'kfor', name: 'KFOR 4', province: 'OK', feed: 'https://kfor.com/news/local/feed/' },
  { id: 'oklahoma-watch', name: 'Oklahoma Watch', province: 'OK', feed: 'https://oklahomawatch.org/feed/' },
  { id: 'kxan', name: 'KXAN', province: 'TX', feed: 'https://www.kxan.com/news/local/feed/' },
  {
    id: 'houston-public-media',
    name: 'Houston Public Media',
    province: 'TX',
    feed: 'https://www.houstonpublicmedia.org/feed/'
  },
  { id: 'kwtx', name: 'KWTX 10', province: 'TX', feed: gray('kwtx.com') },

  // West
  { id: 'azfamily', name: 'azfamily', province: 'AZ', feed: gray('azfamily.com') },
  { id: 'abc15', name: 'ABC15 Arizona', province: 'AZ', feed: 'https://www.abc15.com/news/local-news.rss' },
  {
    id: 'colorado-public-radio',
    name: 'Colorado Public Radio',
    province: 'CO',
    feed: 'https://www.cpr.org/feed/'
  },
  { id: 'fox31', name: 'FOX31 Denver', province: 'CO', feed: 'https://kdvr.com/news/local/feed/' },
  { id: 'idaho-news', name: 'Idaho News 6', province: 'ID', feed: 'https://idahonews.com/news/local.rss' },
  { id: 'kmvt', name: 'KMVT', province: 'ID', feed: gray('kmvt.com') },
  {
    id: 'montana-free-press',
    name: 'Montana Free Press',
    province: 'MT',
    feed: 'https://montanafreepress.org/feed/'
  },
  { id: 'ktvq', name: 'KTVQ', province: 'MT', feed: 'https://www.ktvq.com/news/local-news.rss' },
  { id: 'krtv', name: 'KRTV', province: 'MT', feed: 'https://www.krtv.com/news/local-news.rss' },
  {
    id: 'review-journal',
    name: 'Las Vegas Review-Journal',
    province: 'NV',
    feed: 'https://www.reviewjournal.com/feed/'
  },
  {
    id: 'nevada-independent',
    name: 'The Nevada Independent',
    province: 'NV',
    feed: 'https://thenevadaindependent.com/feed'
  },
  {
    id: '8-news-now',
    name: '8 News Now',
    province: 'NV',
    feed: 'https://www.8newsnow.com/news/local-news/feed/'
  },
  { id: 'koat', name: 'KOAT 7', province: 'NM', feed: hearst('koat.com') },
  { id: 'krqe', name: 'KRQE', province: 'NM', feed: 'https://www.krqe.com/news/feed/' },
  { id: 'kob', name: 'KOB 4', province: 'NM', feed: 'https://www.kob.com/feed/' },
  { id: 'ksl', name: 'KSL', province: 'UT', feed: 'https://www.ksl.com/rss/news' },
  { id: 'deseret-news', name: 'Deseret News', province: 'UT', feed: arc('deseret.com') },
  { id: 'salt-lake-tribune', name: 'The Salt Lake Tribune', province: 'UT', feed: arc('sltrib.com') },
  { id: 'wyofile', name: 'WyoFile', province: 'WY', feed: 'https://wyofile.com/feed/' },
  { id: 'county-17', name: 'County 17', province: 'WY', feed: 'https://county17.com/feed/' },
  { id: 'anchorage-daily-news', name: 'Anchorage Daily News', province: 'AK', feed: arc('adn.com') },
  {
    id: 'alaskas-news-source',
    name: "Alaska's News Source",
    province: 'AK',
    feed: gray('alaskasnewssource.com')
  },
  { id: 'calmatters', name: 'CalMatters', province: 'CA', feed: 'https://calmatters.org/feed/' },
  { id: 'kcra', name: 'KCRA 3', province: 'CA', feed: hearst('kcra.com') },
  { id: 'ktla', name: 'KTLA 5', province: 'CA', feed: 'https://ktla.com/news/local-news/feed/' },
  { id: 'civil-beat', name: 'Honolulu Civil Beat', province: 'HI', feed: 'https://www.civilbeat.org/feed/' },
  { id: 'hawaii-news-now', name: 'Hawaii News Now', province: 'HI', feed: gray('hawaiinewsnow.com') },
  { id: 'khon2', name: 'KHON2', province: 'HI', feed: 'https://www.khon2.com/local-news/feed/' },
  { id: 'oregonlive', name: 'OregonLive', province: 'OR', feed: arc('oregonlive.com') },
  { id: 'opb', name: 'OPB', province: 'OR', feed: arc('opb.org') },
  { id: 'koin', name: 'KOIN 6', province: 'OR', feed: 'https://www.koin.com/news/feed/' },
  {
    id: 'seattle-times-local',
    name: 'The Seattle Times',
    province: 'WA',
    feed: 'https://www.seattletimes.com/seattle-news/feed/'
  },
  { id: 'kiro7', name: 'KIRO 7', province: 'WA', feed: arc('kiro7.com') }
]

export const localSources: SourceDef[] = outlets.map((outlet) => localOutlet(outlet, 'en'))
