import type { SourceDef } from '../../types'
import { localSources } from './local.ts'

/*
 * National and international Turkish-language sources. Every feed was checked
 * on 2026-09-22 and again on 2026-09-23 (see docs/SOURCES.md; re-check with
 * `npm run verify:feeds`): one feed per category, stale (> 3 days), near-empty
 * and oversized feeds dropped.
 *
 * The default set (sources without `defaultEnabled: false`) is kept to about
 * 130 feeds and balanced across the spectrum: the public broadcaster and the
 * state agency, pro-government and centrist mainstream outlets, opposition and
 * independent media, the international Turkish services, plus one business,
 * two sports, two technology and one science source.
 */

/** CNN Türk stamps Istanbul time with "GMT" (checked against the ObjectId times in its guids). */
const CNN_TURK_TIME = 'Europe/Istanbul'

const nationalSources: SourceDef[] = [
  // Public broadcaster and agencies
  {
    id: 'trt-haber',
    name: 'TRT Haber',
    homepage: 'https://www.trthaber.com',
    icon: 'https://trthaberstatic.cdn.wp.trt.com.tr/static/images/trt-haber-kare-logo-180x180.png',
    color: '#DA291C',
    kind: 'public',
    language: 'tr',
    feeds: [
      { url: 'https://www.trthaber.com/sondakika_articles.rss', category: 'breaking', breaking: true },
      { url: 'https://www.trthaber.com/manset_articles.rss', category: 'top', headline: true },
      { url: 'https://www.trthaber.com/gundem_articles.rss', category: 'general' },
      { url: 'https://www.trthaber.com/turkiye_articles.rss', category: 'national' },
      { url: 'https://www.trthaber.com/dunya_articles.rss', category: 'world' },
      { url: 'https://www.trthaber.com/ekonomi_articles.rss', category: 'economy' },
      { url: 'https://www.trthaber.com/spor_articles.rss', category: 'sports' },
      { url: 'https://www.trthaber.com/bilim_teknoloji_articles.rss', category: 'technology' },
      { url: 'https://www.trthaber.com/saglik_articles.rss', category: 'health' },
      { url: 'https://www.trthaber.com/kultur_sanat_articles.rss', category: 'culture' },
      { url: 'https://www.trthaber.com/egitim_articles.rss', category: 'education' },
      { url: 'https://www.trthaber.com/yasam_articles.rss', category: 'lifestyle' }
    ]
  },
  {
    id: 'anadolu-ajansi',
    name: 'Anadolu Ajansı',
    homepage: 'https://www.aa.com.tr/tr',
    icon: 'https://www.aa.com.tr/images/blue-logo.png',
    color: '#0B3D91',
    kind: 'agency',
    language: 'tr',
    feeds: [
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', category: 'general' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=gundem', category: 'national' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=dunya', category: 'world' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=ekonomi', category: 'economy' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=spor', category: 'sports' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=bilim-teknoloji', category: 'technology' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=kultur', category: 'culture' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=analiz', category: 'opinion' }
    ]
  },

  // Mainstream
  {
    id: 'hurriyet',
    name: 'Hürriyet',
    homepage: 'https://www.hurriyet.com.tr',
    icon: 'https://www.hurriyet.com.tr/apple-touch-icon.png',
    color: '#E30613',
    kind: 'mainstream',
    language: 'tr',
    // Section feeds (gundem, dunya, ekonomi…) carry 100 full-text items each, 0.4–1 MB without
    // ETag support, so only the front page and the breaking stream are polled; together they
    // cover every section.
    feeds: [
      { url: 'https://www.hurriyet.com.tr/rss/anasayfa', category: 'top', headline: true },
      { url: 'https://www.hurriyet.com.tr/rss/son-dakika', category: 'breaking', breaking: true },
      // The only two city editions that are still current.
      { url: 'https://www.hurriyet.com.tr/rss/ankara', category: 'local', province: '06' },
      { url: 'https://www.hurriyet.com.tr/rss/yerel-haberler/izmir', category: 'local', province: '35' }
    ]
  },
  {
    id: 'sabah',
    name: 'Sabah',
    homepage: 'https://www.sabah.com.tr',
    icon: 'https://isbh.tmgrup.com.tr/sbh/site/v3/i/apple-touch-icon.png',
    color: '#D71A21',
    kind: 'mainstream',
    language: 'tr',
    feeds: [
      { url: 'https://www.sabah.com.tr/rss/anasayfa.xml', category: 'top', headline: true },
      { url: 'https://www.sabah.com.tr/rss/sondakika.xml', category: 'breaking', breaking: true },
      { url: 'https://www.sabah.com.tr/rss/gundem.xml', category: 'national' },
      { url: 'https://www.sabah.com.tr/rss/dunya.xml', category: 'world' },
      { url: 'https://www.sabah.com.tr/rss/ekonomi.xml', category: 'economy' },
      { url: 'https://www.sabah.com.tr/rss/spor.xml', category: 'sports' },
      { url: 'https://www.sabah.com.tr/rss/saglik.xml', category: 'health' },
      { url: 'https://www.sabah.com.tr/rss/kultur-sanat.xml', category: 'culture' },
      { url: 'https://www.sabah.com.tr/rss/magazin.xml', category: 'entertainment' },
      { url: 'https://www.sabah.com.tr/rss/yasam.xml', category: 'lifestyle' },
      { url: 'https://www.sabah.com.tr/rss/egitim.xml', category: 'education' },
      { url: 'https://www.sabah.com.tr/rss/yazarlar.xml', category: 'opinion' }
    ]
  },
  {
    id: 'haberturk',
    name: 'Habertürk',
    homepage: 'https://www.haberturk.com',
    icon: 'https://www.haberturk.com/images/common/manifest/180x180.png',
    color: '#E4032E',
    kind: 'mainstream',
    language: 'tr',
    feeds: [
      { url: 'https://www.haberturk.com/rss', category: 'general' },
      { url: 'https://www.haberturk.com/rss/manset.xml', category: 'top', headline: true },
      { url: 'https://www.haberturk.com/rss/kategori/gundem.xml', category: 'national' },
      { url: 'https://www.haberturk.com/rss/kategori/dunya.xml', category: 'world' },
      { url: 'https://www.haberturk.com/rss/kategori/ekonomi.xml', category: 'economy' },
      { url: 'https://www.haberturk.com/rss/kategori/spor.xml', category: 'sports' },
      { url: 'https://www.haberturk.com/rss/kategori/teknoloji.xml', category: 'technology' },
      { url: 'https://www.haberturk.com/rss/kategori/saglik.xml', category: 'health' },
      { url: 'https://www.haberturk.com/rss/kategori/kultur-sanat.xml', category: 'culture' },
      { url: 'https://www.haberturk.com/rss/kategori/magazin.xml', category: 'entertainment' },
      { url: 'https://www.haberturk.com/rss/kategori/yasam.xml', category: 'lifestyle' },
      { url: 'https://www.haberturk.com/rss/kategori/otomobil.xml', category: 'automotive' },
      { url: 'https://www.haberturk.com/rss/kategori/yerel-haberler.xml', category: 'local' },
      { url: 'https://www.haberturk.com/rss/yazarlar.xml', category: 'opinion' }
    ]
  },
  {
    id: 'cnn-turk',
    name: 'CNN Türk',
    homepage: 'https://www.cnnturk.com',
    icon: 'https://static.cnnturk.com/images/favicon/apple-cnn-favicon-180x180.png',
    color: '#CC0000',
    kind: 'mainstream',
    language: 'tr',
    feeds: [
      { url: 'https://www.cnnturk.com/feed/rss/all/news', category: 'general', timeZone: CNN_TURK_TIME },
      { url: 'https://www.cnnturk.com/feed/rss/turkiye/news', category: 'national', timeZone: CNN_TURK_TIME },
      { url: 'https://www.cnnturk.com/feed/rss/dunya/news', category: 'world', timeZone: CNN_TURK_TIME },
      { url: 'https://www.cnnturk.com/feed/rss/ekonomi/news', category: 'economy', timeZone: CNN_TURK_TIME },
      { url: 'https://www.cnnturk.com/feed/rss/spor/news', category: 'sports', timeZone: CNN_TURK_TIME },
      {
        url: 'https://www.cnnturk.com/feed/rss/teknoloji/news',
        category: 'technology',
        timeZone: CNN_TURK_TIME
      },
      { url: 'https://www.cnnturk.com/feed/rss/saglik/news', category: 'health', timeZone: CNN_TURK_TIME },
      {
        url: 'https://www.cnnturk.com/feed/rss/kultur-sanat/news',
        category: 'culture',
        timeZone: CNN_TURK_TIME
      },
      {
        url: 'https://www.cnnturk.com/feed/rss/magazin/news',
        category: 'entertainment',
        timeZone: CNN_TURK_TIME
      },
      { url: 'https://www.cnnturk.com/feed/rss/yasam/news', category: 'lifestyle', timeZone: CNN_TURK_TIME },
      { url: 'https://www.cnnturk.com/feed/rss/egitim/news', category: 'education', timeZone: CNN_TURK_TIME },
      {
        url: 'https://www.cnnturk.com/feed/rss/otomobil/news',
        category: 'automotive',
        timeZone: CNN_TURK_TIME
      },
      {
        url: 'https://www.cnnturk.com/feed/rss/yerel-haberler/news',
        category: 'local',
        timeZone: CNN_TURK_TIME
      },
      { url: 'https://www.cnnturk.com/feed/rss/yazarlar', category: 'opinion', timeZone: CNN_TURK_TIME }
    ]
  },
  {
    id: 'yeni-safak',
    name: 'Yeni Şafak',
    homepage: 'https://www.yenisafak.com',
    icon: 'https://www.yenisafak.com/apple-touch-icon.png',
    color: '#B5121B',
    kind: 'mainstream',
    language: 'tr',
    feeds: [
      { url: 'https://www.yenisafak.com/rss', category: 'general' },
      { url: 'https://www.yenisafak.com/rss?category=gundem', category: 'national' },
      { url: 'https://www.yenisafak.com/rss?category=dunya', category: 'world' },
      { url: 'https://www.yenisafak.com/rss?category=ekonomi', category: 'economy' },
      { url: 'https://www.yenisafak.com/rss?category=spor', category: 'sports' },
      { url: 'https://www.yenisafak.com/rss?category=teknoloji', category: 'technology' },
      { url: 'https://www.yenisafak.com/rss?category=hayat', category: 'lifestyle' }
    ]
  },
  {
    id: 'milliyet',
    name: 'Milliyet',
    homepage: 'https://www.milliyet.com.tr',
    icon: 'https://static.milliyet.com.tr/favicon/favicon-180x180.png',
    color: '#D2232A',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    // Section feeds carry full-text items (150–430 KB each); the lighter core is kept.
    feeds: [
      {
        url: 'https://www.milliyet.com.tr/rss/rssnew/sondakikarss.xml',
        category: 'breaking',
        breaking: true
      },
      { url: 'https://www.milliyet.com.tr/rss/rssnew/gundem.xml', category: 'national' },
      { url: 'https://www.milliyet.com.tr/rss/rssnew/ekonomi.xml', category: 'economy' },
      { url: 'https://www.milliyet.com.tr/rss/rssnew/saglik.xml', category: 'health' },
      { url: 'https://www.milliyet.com.tr/rss/rssnew/magazinrss.xml', category: 'entertainment' },
      { url: 'https://www.milliyet.com.tr/rss/rssnew/yazarlarrss.xml', category: 'opinion' }
    ]
  },
  {
    id: 'star',
    name: 'Star',
    homepage: 'https://www.star.com.tr',
    icon: 'https://assets.turkmedya.com.tr/star/assets/img/apple-touch-icon.png',
    color: '#E30A17',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.star.com.tr/rss/rss.asp', category: 'breaking', breaking: true },
      { url: 'https://www.star.com.tr/rss/rss.asp?cid=13', category: 'national' },
      { url: 'https://www.star.com.tr/rss/rss.asp?cid=14', category: 'politics' },
      { url: 'https://www.star.com.tr/rss/rss.asp?cid=17', category: 'world' },
      { url: 'https://www.star.com.tr/rss/rss.asp?cid=15', category: 'economy' },
      { url: 'https://www.star.com.tr/rss/rss.asp?cid=16', category: 'sports' },
      { url: 'https://www.star.com.tr/rss/rss.asp?cid=124', category: 'technology' },
      { url: 'https://www.star.com.tr/rss/rss.asp?cid=19', category: 'culture' }
    ]
  },
  {
    id: 'aksam',
    name: 'Akşam',
    homepage: 'https://www.aksam.com.tr',
    icon: 'https://www.aksam.com.tr/images/apple-touch-icon.png?v=tm1',
    color: '#D10A10',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.aksam.com.tr/rss/rss.asp', category: 'general' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=7', category: 'national' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=2', category: 'politics' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=14', category: 'world' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=3', category: 'economy' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=4', category: 'sports' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=8', category: 'technology' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=101', category: 'health' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=12', category: 'culture' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=6', category: 'entertainment' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=5', category: 'lifestyle' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=122', category: 'education' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=34', category: 'automotive' },
      { url: 'https://www.aksam.com.tr/rss/rss.asp?cid=167', category: 'travel' }
    ]
  },
  {
    id: 'turkiye-gazetesi',
    name: 'Türkiye Gazetesi',
    homepage: 'https://www.turkiyegazetesi.com.tr',
    icon: 'https://s.turkiyegazetesi.com.tr/s/i/apple-touch-icon-114x114.png',
    color: '#C8102E',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    // Every section feed carries ~500 items (about 0.5 MB); the all-sections stream alone covers them.
    feeds: [{ url: 'https://www.turkiyegazetesi.com.tr/rss', category: 'general' }]
  },
  {
    id: 'takvim',
    name: 'Takvim',
    homepage: 'https://www.takvim.com.tr',
    icon: 'https://itkv.tmgrup.com.tr/site/v5/i/takvim_152x152.png',
    color: '#E4032C',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.takvim.com.tr/rss/anasayfa', category: 'top', headline: true },
      { url: 'https://www.takvim.com.tr/rss/son24saat', category: 'general' },
      { url: 'https://www.takvim.com.tr/rss/guncel', category: 'national' },
      { url: 'https://www.takvim.com.tr/rss/dunya', category: 'world' },
      { url: 'https://www.takvim.com.tr/rss/spor', category: 'sports' },
      { url: 'https://www.takvim.com.tr/rss/saglik', category: 'health' },
      { url: 'https://www.takvim.com.tr/rss/saklambac', category: 'entertainment' }
    ]
  },
  {
    id: 'a-haber',
    name: 'A Haber',
    homepage: 'https://www.ahaber.com.tr',
    icon: 'https://iahbr.tmgrup.com.tr/site/v2/i/apple-touch-icon-152x152.png',
    color: '#D4001F',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.ahaber.com.tr/rss/anasayfa.xml', category: 'top', headline: true },
      { url: 'https://www.ahaber.com.tr/rss/son24saat.xml', category: 'general' },
      { url: 'https://www.ahaber.com.tr/rss/gundem.xml', category: 'national' },
      { url: 'https://www.ahaber.com.tr/rss/dunya.xml', category: 'world' },
      { url: 'https://www.ahaber.com.tr/rss/ekonomi.xml', category: 'economy' },
      { url: 'https://www.ahaber.com.tr/rss/spor.xml', category: 'sports' },
      { url: 'https://www.ahaber.com.tr/rss/teknoloji.xml', category: 'technology' },
      { url: 'https://www.ahaber.com.tr/rss/saglik.xml', category: 'health' },
      { url: 'https://www.ahaber.com.tr/rss/magazin.xml', category: 'entertainment' },
      { url: 'https://www.ahaber.com.tr/rss/yasam.xml', category: 'lifestyle' }
    ]
  },
  {
    id: 'haber7',
    name: 'Haber7',
    homepage: 'https://www.haber7.com',
    icon: 'https://i.haber7.net/assets/v3/common/images/favicons/apple-touch-icon-114x114.png',
    color: '#C62828',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://i12.haber7.net/sondakika/newsstand/latest.xml', category: 'general' },
      { url: 'https://i12.haber7.net/sondakika/newsstand/ekonomi.xml', category: 'economy' },
      { url: 'https://i12.haber7.net/sondakika/newsstand/spor.xml', category: 'sports' }
    ]
  },
  {
    id: 'mynet',
    name: 'Mynet',
    homepage: 'https://www.mynet.com',
    icon: 'https://s.mynet.com.tr/favicons/apple-touch-icon-180x180.png',
    color: '#FF6A00',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    // Left out: sports (pubDates carry the wrong year) and magazine (intermittent 404).
    feeds: [
      { url: 'https://www.mynet.com/rss/publisher-anasayfa.rss', category: 'top', headline: true },
      { url: 'https://www.mynet.com/haber/rss/sondakika', category: 'breaking', breaking: true },
      { url: 'https://www.mynet.com/haber/rss/kategori/guncel/', category: 'national' },
      { url: 'https://www.mynet.com/haber/rss/kategori/politika/', category: 'politics' },
      { url: 'https://www.mynet.com/haber/rss/kategori/dunya/', category: 'world' },
      { url: 'https://www.mynet.com/haber/rss/kategori/teknoloji/', category: 'technology' },
      { url: 'https://www.mynet.com/haber/rss/kategori/saglik/', category: 'health' },
      { url: 'https://www.mynet.com/haber/rss/kategori/yasam/', category: 'lifestyle' },
      { url: 'https://www.mynet.com/yerel-haberler/rss/kategori/ana', category: 'local' }
    ]
  },
  {
    id: 'posta',
    name: 'Posta',
    homepage: 'https://www.posta.com.tr',
    icon: 'https://static.posta.com.tr/favicon/favicon-192x192.png',
    color: '#E30613',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.posta.com.tr/rss/anasayfa.xml', category: 'top', headline: true },
      { url: 'https://www.posta.com.tr/rss/gundem.xml', category: 'national' },
      { url: 'https://www.posta.com.tr/rss/ekonomi.xml', category: 'economy' },
      { url: 'https://www.posta.com.tr/rss/spor.xml', category: 'sports' },
      { url: 'https://www.posta.com.tr/rss/teknoloji.xml', category: 'technology' },
      { url: 'https://www.posta.com.tr/rss/saglik.xml', category: 'health' },
      { url: 'https://www.posta.com.tr/rss/magazin.xml', category: 'entertainment' },
      { url: 'https://www.posta.com.tr/rss/yasam.xml', category: 'lifestyle' },
      { url: 'https://www.posta.com.tr/rss/egitim-kariyer.xml', category: 'education' },
      { url: 'https://www.posta.com.tr/rss/yerel-haberler.xml', category: 'local' }
    ]
  },
  {
    id: 'tgrt-haber',
    name: 'TGRT Haber',
    homepage: 'https://www.tgrthaber.com',
    icon: 'https://s.tgrthaber.com/s/assets/apple-touch-icon.png',
    color: '#C8102E',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    // Left out: the front-page, politics, culture and automotive feeds (435–500 items each).
    feeds: [
      { url: 'https://www.tgrthaber.com/rss/gundem', category: 'national' },
      { url: 'https://www.tgrthaber.com/rss/dunya', category: 'world' },
      { url: 'https://www.tgrthaber.com/rss/ekonomi', category: 'economy' },
      { url: 'https://www.tgrthaber.com/rss/spor', category: 'sports' },
      { url: 'https://www.tgrthaber.com/rss/teknoloji', category: 'technology' },
      { url: 'https://www.tgrthaber.com/rss/saglik', category: 'health' },
      { url: 'https://www.tgrthaber.com/rss/magazin', category: 'entertainment' },
      { url: 'https://www.tgrthaber.com/rss/yasam', category: 'lifestyle' },
      { url: 'https://www.tgrthaber.com/rss/egitim', category: 'education' }
    ]
  },
  {
    id: 'haber-global',
    name: 'Haber Global',
    homepage: 'https://haberglobal.com',
    icon: 'https://s.haberglobal.com/assets/web/favicons/apple-icon-180x180.png',
    color: '#E4032E',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://haberglobal.com/rss', category: 'general' },
      { url: 'https://haberglobal.com/rss/gundem', category: 'national' },
      { url: 'https://haberglobal.com/rss/dunya', category: 'world' },
      { url: 'https://haberglobal.com/rss/ekonomi', category: 'economy' },
      { url: 'https://haberglobal.com/rss/spor', category: 'sports' },
      { url: 'https://haberglobal.com/rss/bilim-teknoloji', category: 'technology' },
      { url: 'https://haberglobal.com/rss/saglik', category: 'health' },
      { url: 'https://haberglobal.com/rss/kultur-sanat', category: 'culture' },
      { url: 'https://haberglobal.com/rss/magazin', category: 'entertainment' },
      { url: 'https://haberglobal.com/rss/yasam', category: 'lifestyle' },
      { url: 'https://haberglobal.com/rss/egitim', category: 'education' },
      { url: 'https://haberglobal.com/rss/yazarlar', category: 'opinion' }
    ]
  },
  {
    id: 'yirmidort-tv',
    name: '24 TV',
    homepage: 'https://www.yirmidort.tv',
    icon: 'https://www.yirmidort.tv/assets/img/favicon24.png',
    color: '#E30613',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.yirmidort.tv/haberxml/sondakika', category: 'breaking', breaking: true },
      { url: 'https://www.yirmidort.tv/haberxml/gundem', category: 'national' },
      { url: 'https://www.yirmidort.tv/haberxml/dunya', category: 'world' },
      { url: 'https://www.yirmidort.tv/haberxml/ekonomi', category: 'economy' },
      { url: 'https://www.yirmidort.tv/haberxml/spor', category: 'sports' },
      { url: 'https://www.yirmidort.tv/haberxml/teknoloji', category: 'technology' },
      { url: 'https://www.yirmidort.tv/haberxml/saglik', category: 'health' },
      { url: 'https://www.yirmidort.tv/haberxml/kultur', category: 'culture' },
      { url: 'https://www.yirmidort.tv/haberxml/magazin', category: 'entertainment' },
      { url: 'https://www.yirmidort.tv/haberxml/yasam', category: 'lifestyle' },
      { url: 'https://www.yirmidort.tv/haberxml/egitim', category: 'education' }
    ]
  },
  {
    id: 'yeni-akit',
    name: 'Yeni Akit',
    homepage: 'https://www.yeniakit.com.tr',
    icon: 'https://cdn.yeniakit.com.tr/assets/meta/favicon.png',
    color: '#0A7D3B',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.yeniakit.com.tr/rss/haber/gundem', category: 'national' },
      { url: 'https://www.yeniakit.com.tr/rss/haber/siyaset', category: 'politics' },
      { url: 'https://www.yeniakit.com.tr/rss/haber/dunya', category: 'world' },
      { url: 'https://www.yeniakit.com.tr/rss/haber/ekonomi', category: 'economy' },
      { url: 'https://www.yeniakit.com.tr/rss/haber/spor', category: 'sports' },
      { url: 'https://www.yeniakit.com.tr/rss/haber/teknoloji', category: 'technology' },
      { url: 'https://www.yeniakit.com.tr/rss/haber/saglik', category: 'health' },
      { url: 'https://www.yeniakit.com.tr/rss/haber/kultur-sanat', category: 'culture' },
      { url: 'https://www.yeniakit.com.tr/rss/haber/egitim', category: 'education' },
      { url: 'https://www.yeniakit.com.tr/rss/haber/yasam', category: 'lifestyle' }
    ]
  },
  {
    id: 'dirilis-postasi',
    name: 'Diriliş Postası',
    homepage: 'https://www.dirilispostasi.com',
    icon: 'https://dpcdn.tebilisim.com/uploads/2023/11/dirilis-postasi-favicon.png',
    color: '#B71C1C',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.dirilispostasi.com/rss', category: 'general' }]
  },
  {
    id: 'internethaber',
    name: 'İnternet Haber',
    homepage: 'https://www.internethaber.com',
    icon: 'https://s.internethaber.com/assets/web/images/favicons/apple-icon-180x180.png',
    color: '#D0021B',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.internethaber.com/rss', category: 'general' }]
  },
  {
    id: 'aydinlik',
    name: 'Aydınlık',
    homepage: 'https://www.aydinlik.com.tr',
    icon: 'https://s.aydinlik.com.tr/assets/web/favicons/apple-icon-180x180.png',
    color: '#D7141A',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.aydinlik.com.tr/rss', category: 'general' },
      { url: 'https://www.aydinlik.com.tr/yazarlar.rss', category: 'opinion' }
    ]
  },
  {
    id: 'elele',
    name: 'Elele',
    homepage: 'https://www.elele.com.tr',
    icon: 'https://www.elele.com.tr/favicon.ico',
    color: '#E6007E',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.elele.com.tr/export/rss', category: 'lifestyle' }]
  },

  // Opposition and independent
  {
    id: 'sozcu',
    name: 'Sözcü',
    homepage: 'https://www.sozcu.com.tr',
    icon: 'https://www.sozcu.com.tr/static/web/assets/favicon.png',
    color: '#E2001A',
    kind: 'mainstream',
    language: 'tr',
    feeds: [
      { url: 'https://www.sozcu.com.tr/feeds-son-dakika', category: 'breaking', breaking: true },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-gundem', category: 'national' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-dunya', category: 'world' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-ekonomi', category: 'economy' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-spor', category: 'sports' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-bilim-teknoloji', category: 'technology' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-saglik', category: 'health' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-kultur-sanat', category: 'culture' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-magazin', category: 'entertainment' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-yasam', category: 'lifestyle' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-egitim', category: 'education' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-otomotiv', category: 'automotive' },
      { url: 'https://www.sozcu.com.tr/feeds-rss-category-yazar', category: 'opinion' }
    ]
  },
  {
    id: 'cumhuriyet',
    name: 'Cumhuriyet',
    homepage: 'https://www.cumhuriyet.com.tr',
    icon: 'https://media.cumhuriyet.com.tr/assets/images/icons/cumhuriyet-152px.png',
    color: '#C8102E',
    kind: 'mainstream',
    language: 'tr',
    feeds: [
      // The site's son-dakika feed redirects here.
      { url: 'https://www.cumhuriyet.com.tr/rss', category: 'breaking', breaking: true },
      { url: 'https://www.cumhuriyet.com.tr/rss/turkiye', category: 'national' },
      { url: 'https://www.cumhuriyet.com.tr/rss/siyaset', category: 'politics' },
      { url: 'https://www.cumhuriyet.com.tr/rss/dunya', category: 'world' },
      { url: 'https://www.cumhuriyet.com.tr/rss/ekonomi', category: 'economy' },
      { url: 'https://www.cumhuriyet.com.tr/rss/spor', category: 'sports' },
      { url: 'https://www.cumhuriyet.com.tr/rss/bilim-teknoloji', category: 'technology' },
      { url: 'https://www.cumhuriyet.com.tr/rss/saglik', category: 'health' },
      { url: 'https://www.cumhuriyet.com.tr/rss/kultur-sanat', category: 'culture' },
      { url: 'https://www.cumhuriyet.com.tr/rss/magazin', category: 'entertainment' },
      { url: 'https://www.cumhuriyet.com.tr/rss/yasam', category: 'lifestyle' },
      { url: 'https://www.cumhuriyet.com.tr/rss/egitim', category: 'education' },
      { url: 'https://www.cumhuriyet.com.tr/rss/otomotiv', category: 'automotive' },
      { url: 'https://www.cumhuriyet.com.tr/rss/yazarlar', category: 'opinion' }
    ]
  },
  {
    id: 'halk-tv',
    name: 'Halk TV',
    homepage: 'https://halktv.com.tr',
    icon: 'https://s.halktv.com.tr/assets/web/favicons/apple-icon-180x180.png',
    color: '#E30613',
    kind: 'mainstream',
    language: 'tr',
    feeds: [{ url: 'https://halktv.com.tr/export/rss', category: 'general' }]
  },
  {
    id: 'karar',
    name: 'Karar',
    homepage: 'https://www.karar.com',
    icon: 'https://cdn.karar.com/assets/favicon/apple-touch-icon.png',
    color: '#1F3A93',
    kind: 'mainstream',
    language: 'tr',
    feeds: [{ url: 'https://www.karar.com/service/rss.php', category: 'general' }]
  },
  {
    id: 'yenicag',
    name: 'Yeniçağ',
    homepage: 'https://www.yenicaggazetesi.com',
    icon: 'https://s.yenicaggazetesi.com/assets/web/favicons/apple-icon-180x180.png',
    color: '#D7141A',
    kind: 'mainstream',
    language: 'tr',
    feeds: [{ url: 'https://www.yenicaggazetesi.com/export/rss', category: 'general' }]
  },
  {
    id: 'korkusuz',
    name: 'Korkusuz',
    homepage: 'https://www.korkusuz.com.tr',
    icon: 'https://www.korkusuz.com.tr/lib/img/favicon.png',
    color: '#E30613',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.korkusuz.com.tr/rss', category: 'general' }]
  },
  {
    id: 'birgun',
    name: 'BirGün',
    homepage: 'https://www.birgun.net',
    icon: 'https://www.birgun.net/assets/images/apple-touch-icon.png',
    color: '#E3000F',
    kind: 'independent',
    language: 'tr',
    defaultEnabled: false,
    // Every feed carries ~150 full-text items (0.45–0.85 MB): the front page, the environment
    // desk and the columnists are kept.
    feeds: [
      { url: 'https://www.birgun.net/rss/home', category: 'general' },
      { url: 'https://www.birgun.net/rss/kategori/cevre-15', category: 'environment' },
      { url: 'https://www.birgun.net/rss/yazarlar', category: 'opinion' }
    ]
  },
  {
    id: 'diken',
    name: 'Diken',
    homepage: 'https://www.diken.com.tr',
    icon: 'https://www.diken.com.tr/wp-content/uploads/2025/10/apple-touch-icon-152x152-1.png',
    color: '#D6202A',
    kind: 'independent',
    language: 'tr',
    feeds: [
      { url: 'https://www.diken.com.tr/feed/', category: 'general' },
      { url: 'https://www.diken.com.tr/kategori/aktuel/feed/', category: 'national' },
      { url: 'https://www.diken.com.tr/kategori/dunya/feed/', category: 'world' },
      { url: 'https://www.diken.com.tr/kategori/ekonomi/feed/', category: 'economy' },
      { url: 'https://www.diken.com.tr/kategori/spor/feed/', category: 'sports' },
      { url: 'https://www.diken.com.tr/kategori/saglik/feed/', category: 'health' }
    ]
  },
  {
    id: 'medyascope',
    name: 'Medyascope',
    homepage: 'https://medyascope.tv',
    icon: 'https://medyascope.tv/wp-content/uploads/2019/08/cropped-MiniRedSq-180x180.png',
    color: '#E30B17',
    kind: 'independent',
    language: 'tr',
    feeds: [
      { url: 'https://medyascope.tv/manset/feed/', category: 'top', headline: true },
      { url: 'https://medyascope.tv/feed/', category: 'general' },
      { url: 'https://medyascope.tv/toplum-haberleri/feed/', category: 'national' },
      { url: 'https://medyascope.tv/siyaset/feed/', category: 'politics' },
      { url: 'https://medyascope.tv/dunya-haberleri/feed/', category: 'world' },
      { url: 'https://medyascope.tv/ekonomi-haberleri/feed/', category: 'economy' },
      { url: 'https://medyascope.tv/spor/feed/', category: 'sports' },
      { url: 'https://medyascope.tv/kultur-sanat/feed/', category: 'culture' }
    ]
  },
  {
    id: 'bianet',
    name: 'Bianet',
    homepage: 'https://bianet.org',
    icon: 'https://bianet.org/favicon.ico',
    color: '#D0112B',
    kind: 'independent',
    language: 'tr',
    feeds: [{ url: 'https://bianet.org/rss/bianet', category: 'general' }]
  },
  {
    id: 'kisa-dalga',
    name: 'Kısa Dalga',
    homepage: 'https://kisadalga.net',
    icon: 'https://kisadalga.net/assets/favicon/apple-touch-icon.png',
    color: '#1D3557',
    kind: 'independent',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://kisadalga.net/service/rss.php', category: 'general' }]
  },
  {
    id: 'gazete-oksijen',
    name: 'Gazete Oksijen',
    homepage: 'https://gazeteoksijen.com',
    icon: 'https://s.gazeteoksijen.com/assets/web/favicons/apple-icon-180x180.png',
    color: '#00A3E0',
    kind: 'independent',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://gazeteoksijen.com/export/rss', category: 'general' },
      { url: 'https://gazeteoksijen.com/export/rss/turkiye', category: 'national' },
      { url: 'https://gazeteoksijen.com/export/rss/dunya', category: 'world' },
      { url: 'https://gazeteoksijen.com/export/rss/ekonomi', category: 'economy' },
      { url: 'https://gazeteoksijen.com/export/rss/spor', category: 'sports' },
      { url: 'https://gazeteoksijen.com/export/rss/bilim-ve-teknoloji', category: 'science' },
      { url: 'https://gazeteoksijen.com/export/rss/saglik', category: 'health' },
      { url: 'https://gazeteoksijen.com/export/rss/sanat', category: 'culture' },
      { url: 'https://gazeteoksijen.com/export/rss/ekran', category: 'entertainment' },
      { url: 'https://gazeteoksijen.com/export/rss/gastronomi', category: 'lifestyle' }
    ]
  },
  {
    id: 'nefes',
    name: 'Nefes',
    homepage: 'https://www.nefes.com.tr',
    icon: 'https://s.nefes.com.tr/assets/web/favicons/apple-icon-180x180.png',
    color: '#0091D5',
    kind: 'mainstream',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.nefes.com.tr/export/rss', category: 'general' },
      { url: 'https://www.nefes.com.tr/export/rss/gundem', category: 'national' },
      { url: 'https://www.nefes.com.tr/export/rss/dunya', category: 'world' },
      { url: 'https://www.nefes.com.tr/export/rss/ekonomi', category: 'economy' },
      { url: 'https://www.nefes.com.tr/export/rss/spor', category: 'sports' },
      { url: 'https://www.nefes.com.tr/export/rss/bilim-teknoloji', category: 'technology' },
      { url: 'https://www.nefes.com.tr/export/rss/saglik', category: 'health' },
      { url: 'https://www.nefes.com.tr/export/rss/hayat', category: 'lifestyle' },
      { url: 'https://www.nefes.com.tr/export/rss/egitim', category: 'education' }
    ]
  },
  {
    id: 'tele1',
    name: 'Tele1',
    homepage: 'https://www.tele1.com.tr',
    icon: 'https://tele1comtr.teimg.com/tele1-com-tr/uploads/2025/02/favicon-1.webp',
    color: '#E30613',
    kind: 'independent',
    language: 'tr',
    defaultEnabled: false,
    // Updates slowly; the world, sports, culture, technology and lifestyle feeds are stale.
    feeds: [
      { url: 'https://www.tele1.com.tr/rss/tum-mansetler', category: 'top', headline: true },
      { url: 'https://www.tele1.com.tr/rss', category: 'general' },
      { url: 'https://www.tele1.com.tr/rss/ekonomi', category: 'economy' },
      { url: 'https://www.tele1.com.tr/rss/saglik', category: 'health' },
      { url: 'https://www.tele1.com.tr/rss/egitim', category: 'education' }
    ]
  },
  {
    id: 'evrensel',
    name: 'Evrensel',
    homepage: 'https://www.evrensel.net',
    icon: 'https://www.evrensel.net/apple-icon-180x180.png',
    color: '#D7141A',
    kind: 'independent',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.evrensel.net/rss/haber.xml', category: 'general' }]
  },
  {
    id: 'arti-gercek',
    name: 'Artı Gerçek',
    homepage: 'https://artigercek.com',
    icon: 'https://s.artigercek.com/assets/web/favicons/apple-icon-180x180.png',
    color: '#E30613',
    kind: 'independent',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://artigercek.com/export/rss', category: 'general' }]
  },
  {
    id: 'serbestiyet',
    name: 'Serbestiyet',
    homepage: 'https://serbestiyet.com',
    icon: 'https://serbestiyet.com/wp-content/uploads/2023/06/cropped-serbestiyet_logo_light-01-180x180.jpg',
    color: '#1E73BE',
    kind: 'independent',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://serbestiyet.com/feed/', category: 'general' }]
  },
  {
    id: 'sol-haber',
    name: 'soL Haber',
    homepage: 'https://haber.sol.org.tr',
    icon: 'https://haber.sol.org.tr/themes/custom/sol/favicon.ico',
    color: '#D40000',
    kind: 'independent',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://haber.sol.org.tr/rss.xml', category: 'general' }]
  },
  {
    id: 'bant-mag',
    name: 'Bant Mag',
    homepage: 'https://bantmag.com',
    icon: 'https://bantmag.com/css/favicon-256.png',
    color: '#1A1A1A',
    kind: 'independent',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.bantmag.com/feed/', category: 'culture' }]
  },

  // International Turkish-language services
  {
    id: 'bbc-turkce',
    name: 'BBC News Türkçe',
    homepage: 'https://www.bbc.com/turkce',
    icon: 'https://static.files.bbci.co.uk/ws/simorgh-assets/public/turkce/images/icons/icon-192x192.png',
    color: '#B80000',
    kind: 'international',
    language: 'tr',
    feeds: [{ url: 'https://feeds.bbci.co.uk/turkce/rss.xml', category: 'top', headline: true }]
  },
  {
    id: 'dw-turkce',
    name: 'DW Türkçe',
    homepage: 'https://www.dw.com/tr/',
    icon: 'https://www.dw.com/images/icons/favicon-180x180.png',
    color: '#0A3A7A',
    kind: 'international',
    language: 'tr',
    feeds: [
      { url: 'https://rss.dw.com/xml/rss-tur-all', category: 'general' },
      { url: 'https://rss.dw.com/xml/rss-tur-eco', category: 'economy' }
    ]
  },
  {
    id: 'independent-turkce',
    name: 'Independent Türkçe',
    homepage: 'https://www.indyturk.com',
    icon: 'https://www.indyturk.com/sites/default/files/favicon_0_0.ico',
    color: '#E0162B',
    kind: 'international',
    language: 'tr',
    feeds: [{ url: 'https://www.indyturk.com/rss.xml', category: 'general' }]
  },
  {
    id: 'sputnik-turkiye',
    name: 'Sputnik Türkiye',
    homepage: 'https://anlatilaninotesi.com.tr',
    icon: 'https://cdn.img.anlatilaninotesi.com.tr/i/favicon/favicon-180x180.png',
    color: '#F36F21',
    kind: 'international',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://anlatilaninotesi.com.tr/export/rss2/archive/index.xml', category: 'general' }]
  },

  // Business
  {
    id: 'dunya',
    name: 'Dünya Gazetesi',
    homepage: 'https://www.dunya.com',
    icon: 'https://img.dunya.com/assets/web/icons/apple-icon-180x180.png',
    color: '#005DAA',
    kind: 'business',
    language: 'tr',
    feeds: [
      { url: 'https://www.dunya.com/export/rss', category: 'general' },
      { url: 'https://www.dunya.com/rss/ekonomi.xml', category: 'economy' },
      { url: 'https://www.dunya.com/rss/gundem.xml', category: 'national' },
      { url: 'https://www.dunya.com/rss/dunya.xml', category: 'world' }
    ]
  },
  {
    id: 'ekonomim',
    name: 'Ekonomim',
    homepage: 'https://www.ekonomim.com',
    icon: 'https://s.ekonomim.com/assets/web/icons/apple-icon-180x180.png',
    color: '#0B6E4F',
    kind: 'business',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.ekonomim.com/export/rss', category: 'general' },
      { url: 'https://www.ekonomim.com/rss/ekonomi.xml', category: 'economy' },
      { url: 'https://www.ekonomim.com/rss/gundem.xml', category: 'national' },
      { url: 'https://www.ekonomim.com/rss/dunya.xml', category: 'world' }
    ]
  },
  {
    id: 'investing-tr',
    name: 'Investing.com Türkiye',
    homepage: 'https://tr.investing.com',
    icon: 'https://tr.investing.com/apple-touch-icon.png',
    color: '#F5A623',
    kind: 'business',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://tr.investing.com/rss/news.rss', category: 'economy', timeZone: 'UTC' },
      { url: 'https://tr.investing.com/rss/news_289.rss', category: 'politics', timeZone: 'UTC' },
      { url: 'https://tr.investing.com/rss/news_287.rss', category: 'world', timeZone: 'UTC' }
    ]
  },
  {
    id: 'cnbc-e',
    name: 'CNBC-e',
    homepage: 'https://www.cnbce.com',
    icon: 'https://s.cnbce.com/dist/favicons/apple-touch-icon.png',
    color: '#005594',
    kind: 'business',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.cnbce.com/rss', category: 'economy' }]
  },
  {
    id: 'borsagundem',
    name: 'Borsagündem',
    homepage: 'https://www.borsagundem.com.tr',
    icon: 'https://borsagundemcomtr.teimg.com/borsagundem-com-tr/uploads/2024/10/borsa-gundem-favicon-1.webp',
    color: '#0B4EA2',
    kind: 'business',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.borsagundem.com.tr/rss', category: 'economy' }]
  },

  // Sports
  {
    id: 'fotomac',
    name: 'Fotomaç',
    homepage: 'https://www.fotomac.com.tr',
    icon: 'https://iftm.tmgrup.com.tr/site/v2/i/apple-icon-152x152.png',
    color: '#E30613',
    kind: 'sports',
    language: 'tr',
    feeds: [{ url: 'https://www.fotomac.com.tr/rss/son24saat.xml', category: 'sports' }]
  },
  {
    id: 'ajansspor',
    name: 'Ajansspor',
    homepage: 'https://ajansspor.com',
    icon: 'https://ajansspor.com/favicon/apple-touch-icon.png',
    color: '#E30613',
    kind: 'sports',
    language: 'tr',
    feeds: [{ url: 'https://ajansspor.com/feed', category: 'sports' }]
  },
  {
    id: 'a-spor',
    name: 'A Spor',
    homepage: 'https://www.aspor.com.tr',
    icon: 'https://iaspr.tmgrup.com.tr/site/v3/i/apple-touch-icon-152x152.png',
    color: '#E4032E',
    kind: 'sports',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.aspor.com.tr/rss/anasayfa.xml', category: 'sports' }]
  },

  // Technology and science
  {
    id: 'webtekno',
    name: 'Webtekno',
    homepage: 'https://www.webtekno.com',
    icon: 'https://imgrosetta.webtekno.com/static/img/icons/apple-icon-180x180.png',
    color: '#E53935',
    kind: 'technology',
    language: 'tr',
    feeds: [{ url: 'https://www.webtekno.com/rss.xml', category: 'technology' }]
  },
  {
    id: 'donanimhaber',
    name: 'DonanımHaber',
    homepage: 'https://www.donanimhaber.com',
    icon: 'https://www.donanimhaber.com/favicon.ico',
    color: '#0E5AA7',
    kind: 'technology',
    language: 'tr',
    feeds: [{ url: 'https://www.donanimhaber.com/rss/tum/', category: 'technology' }]
  },
  {
    id: 'evrim-agaci',
    name: 'Evrim Ağacı',
    homepage: 'https://evrimagaci.org',
    icon: 'https://evrimagaci.org/apple-touch-icon.png',
    color: '#2E7D32',
    kind: 'technology',
    language: 'tr',
    feeds: [{ url: 'https://evrimagaci.org/rss.xml', category: 'science' }]
  },
  {
    id: 'shiftdelete',
    name: 'ShiftDelete.Net',
    homepage: 'https://shiftdelete.net',
    icon: 'https://ares.shiftdelete.net/2024/11/sdn-logo-59x59-1.png',
    color: '#D71920',
    kind: 'technology',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://shiftdelete.net/feed', category: 'technology' },
      { url: 'https://shiftdelete.net/otomobil/feed', category: 'automotive' }
    ]
  },
  {
    id: 'chip',
    name: 'CHIP Online',
    homepage: 'https://www.chip.com.tr',
    icon: 'https://s.chip.com.tr/icons/apple-icon-180x180.png',
    color: '#E2001A',
    kind: 'technology',
    language: 'tr',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.chip.com.tr/rss', category: 'technology' },
      { url: 'https://www.chip.com.tr/rss/bilim-teknik', category: 'science' }
    ]
  },
  {
    id: 'webrazzi',
    name: 'Webrazzi',
    homepage: 'https://webrazzi.com',
    icon: 'https://webrazzi.com/v8/apple-touch-icon.png',
    color: '#1E88E5',
    kind: 'technology',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://webrazzi.com/feed', category: 'technology' }]
  },
  {
    id: 'log',
    name: 'LOG',
    homepage: 'https://www.log.com.tr',
    icon: 'https://www.log.com.tr/wp-content/uploads/2018/02/cropped-log-1-192x192.png',
    color: '#E4002B',
    kind: 'technology',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.log.com.tr/feed/', category: 'technology' }]
  },
  {
    id: 'motor1',
    name: 'Motor1 Türkiye',
    homepage: 'https://tr.motor1.com',
    icon: 'https://cdn.motor1.com/images/static/motor1/favicon-228.png',
    color: '#E10A1D',
    kind: 'technology',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://tr.motor1.com/rss/news/all/', category: 'automotive' }]
  },
  {
    id: 'sarkac',
    name: 'Sarkaç',
    homepage: 'https://sarkac.org',
    icon: 'https://sarkac.org/wp-content/uploads/2020/09/site-icon-sarkac.png',
    color: '#F28C28',
    kind: 'technology',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://sarkac.org/feed/', category: 'science' }]
  },
  {
    id: 'arkeofili',
    name: 'Arkeofili',
    homepage: 'https://arkeofili.com',
    icon: 'https://www.google.com/s2/favicons?domain=arkeofili.com&sz=128',
    color: '#1ABC9C',
    kind: 'technology',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://arkeofili.com/feed/', category: 'science' }]
  },
  {
    id: 'bilim-genc',
    name: 'TÜBİTAK Bilim Genç',
    homepage: 'https://bilimgenc.tubitak.gov.tr',
    icon: 'https://bilimgenc.tubitak.gov.tr/sites/default/files/favicon_0.ico',
    color: '#0072BC',
    kind: 'technology',
    language: 'tr',
    defaultEnabled: false,
    feeds: [{ url: 'https://bilimgenc.tubitak.gov.tr/rss.xml', category: 'science' }]
  },

  // Aggregators
  {
    id: 'haberler-com',
    name: 'Haberler.com',
    homepage: 'https://www.haberler.com',
    icon: 'https://www.haberler.com/mstatic/favicons/apple-icon-180x180.png',
    color: '#C4161C',
    kind: 'aggregator',
    language: 'tr',
    // Very high volume. The politics, world, economy, sports, lifestyle and education feeds
    // (300–500 items, 0.5–0.8 MB each) are left out; the breaking stream already carries them.
    defaultEnabled: false,
    feeds: [
      {
        url: 'https://rss.haberler.com/rssnew.aspx?kategori=sondakika',
        category: 'breaking',
        breaking: true
      },
      { url: 'https://rss.haberler.com/rssnew.aspx?kategori=gundem', category: 'general' },
      { url: 'https://rss.haberler.com/rssnew.aspx?kategori=teknoloji', category: 'technology' },
      { url: 'https://rss.haberler.com/rssnew.aspx?kategori=saglik', category: 'health' },
      { url: 'https://rss.haberler.com/rssnew.aspx?kategori=kultur-sanat', category: 'culture' },
      { url: 'https://rss.haberler.com/rssnew.aspx?kategori=magazin', category: 'entertainment' },
      { url: 'https://rss.haberler.com/rssnew.aspx?kategori=otomobil', category: 'automotive' },
      { url: 'https://rss.haberler.com/rssnew.aspx?kategori=yerel', category: 'local' }
    ]
  }
]

/** Every source of the Turkey pack: national and international first, then local. */
export const sources: SourceDef[] = [...nationalSources, ...localSources]
