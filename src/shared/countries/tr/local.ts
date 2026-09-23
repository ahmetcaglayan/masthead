import type { FeedDef, SourceDef } from '../../types'
import { provinces } from './provinces.ts'

/*
 * Local sources. Every feed here carries a `province`, so the pipeline only
 * fetches it for the user's selected province (or a handful across a selected
 * region): these sources stay enabled by default without adding to the regular
 * refresh load.
 */

const favicon = (host: string): string => `https://www.google.com/s2/favicons?domain=${host}&sz=128`

/** One `local` feed per province, built from the province slug. */
function provinceFeeds(url: (slug: string) => string): FeedDef[] {
  return provinces.map((p) => ({ url: url(p.slug), category: 'local', province: p.code }))
}

/** City pages of two national outlets; both patterns cover all 81 provinces. */
const cityFeeds: SourceDef[] = [
  {
    id: 'sabah-yerel',
    name: 'Sabah Yerel',
    homepage: 'https://www.sabah.com.tr',
    icon: 'https://isbh.tmgrup.com.tr/sbh/site/v3/i/apple-touch-icon.png',
    color: '#D71A21',
    kind: 'local',
    language: 'tr',
    // 25 items per city, nearly all local; small provinces can go weeks without an update.
    feeds: provinceFeeds((slug) => `https://www.sabah.com.tr/rss/${slug}.xml`)
  },
  {
    id: 'haberler-yerel',
    name: 'Haberler.com Yerel',
    homepage: 'https://www.haberler.com',
    icon: 'https://www.haberler.com/mstatic/favicons/apple-icon-180x180.png',
    color: '#C4161C',
    kind: 'local',
    language: 'tr',
    // Tag-based city pages (about 48 hours of items); fresher than Sabah for small provinces.
    feeds: provinceFeeds((slug) => `https://rss.haberler.com/rssnew.aspx?kategori=${slug}`)
  }
]

interface LocalPaper {
  id: string
  name: string
  province: string
  feed: string
}

/**
 * Local newspapers verified on 2026-09-22/23: fresh, with roughly a third or more
 * of their items about their own province (the rest is agency copy), at most
 * three per province.
 */
const papers: LocalPaper[] = [
  // Marmara
  {
    id: 'istanbul-gazetesi',
    name: 'İstanbul Gazetesi',
    province: '34',
    feed: 'https://www.istanbulgazetesi.com.tr/rss'
  },
  { id: 'bursa-basin', name: 'Bursa Basın', province: '16', feed: 'https://www.bursabasin.com/rss' },
  { id: 'gazete-bursa', name: 'Gazete Bursa', province: '16', feed: 'https://www.gazetebursa.com.tr/rss' },
  { id: 'kocaeli-fikir', name: 'Kocaeli Fikir', province: '41', feed: 'https://www.kocaelifikir.com/rss' },
  { id: 'ozgur-kocaeli', name: 'Özgür Kocaeli', province: '41', feed: 'https://www.ozgurkocaeli.com.tr/rss' },
  { id: 'bizim-yaka', name: 'Bizim Yaka', province: '41', feed: 'https://www.bizimyaka.com/rss' },
  { id: 'medyabar', name: 'Medyabar', province: '54', feed: 'https://medyabar.com/rss' },
  {
    id: 'cerkezkoy-haber',
    name: 'Çerkezköy Haber',
    province: '59',
    feed: 'https://cerkezkoyhaber.com.tr/rss'
  },
  {
    id: 'trakya-gazetesi',
    name: 'Trakya Gazetesi',
    province: '59',
    feed: 'https://www.trakyagazetesi.com.tr/rss'
  },
  { id: 'tekirdag-bakis', name: 'Tekirdağ Bakış', province: '59', feed: 'https://www.tekirdagbakis.com/rss' },
  { id: 'canakkale-olay', name: 'Çanakkale Olay', province: '17', feed: 'https://www.canakkaleolay.com/rss' },
  {
    id: 'balikesir-posta',
    name: 'Balıkesir Posta',
    province: '10',
    feed: 'https://www.balikesirposta.com.tr/rss'
  },
  // Aegean
  { id: 'yeni-asir', name: 'Yeni Asır', province: '35', feed: 'https://www.yeniasir.com.tr/rss/izmir.xml' },
  {
    id: 'ege-telgraf',
    name: 'Ege Telgraf',
    province: '35',
    // The local-government section; the main feed is mostly national news.
    feed: 'https://www.egetelgraf.com/rss/yerel-yonetim-haberleri'
  },
  {
    id: 'haber-ekspres-izmir',
    name: 'Haber Ekspres',
    province: '35',
    feed: 'https://www.haberekspres.com.tr/rss'
  },
  { id: 'manisa-denge', name: 'Manisa Denge', province: '45', feed: 'https://www.manisadenge.com/rss.xml' },
  { id: 'gazete-sehir', name: 'Gazete Şehir', province: '20', feed: 'https://gazetesehir.com/rss' },
  {
    id: 'hizmet-gazetesi',
    name: 'Hizmet Gazetesi',
    province: '20',
    feed: 'https://www.hizmetgazetesi.com.tr/rss'
  },
  { id: 'manset-aydin', name: 'Manşet Aydın', province: '09', feed: 'https://www.mansetaydin.com/rss' },
  {
    id: 'mugla-gazetesi',
    name: 'Muğla Gazetesi',
    province: '48',
    feed: 'https://www.muglagazetesi.com.tr/service/rss.php'
  },
  { id: 'bodrum-kapak', name: 'Bodrum Kapak', province: '48', feed: 'https://www.bodrumkapak.com/feed/' },
  // Mediterranean
  { id: 'haber-antalya', name: 'Haber Antalya', province: '07', feed: 'https://www.haberantalya.com/rss' },
  {
    id: 'antalya-ekspres',
    name: 'Antalya Ekspres',
    province: '07',
    feed: 'https://www.antalyaekspres.com.tr/rss'
  },
  { id: 'yeni-alanya', name: 'Yeni Alanya', province: '07', feed: 'https://www.yenialanya.com/rss' },
  {
    id: 'cukurova-press',
    name: 'Çukurova Press',
    province: '01',
    feed: 'https://www.cukurovapress.com/rss.xml'
  },
  {
    id: 'bolge-gazetesi',
    name: 'Bölge Gazetesi',
    province: '01',
    feed: 'https://bolgegazetesi.com.tr/feed/'
  },
  {
    id: 'adananin-sesi',
    name: "Adana'nın Sesi",
    province: '01',
    feed: 'https://www.adananinsesi.com/rss.xml'
  },
  { id: 'imece-gazetesi', name: 'İmece Gazetesi', province: '33', feed: 'https://www.imecegazetesi.com/rss' },
  {
    id: 'mersin-haber-merkezi',
    name: 'Mersin Haber Merkezi',
    province: '33',
    feed: 'https://www.mersinhabermerkezi.com/rss'
  },
  { id: 'hatay-ekspres', name: 'Hatay Ekspres', province: '31', feed: 'https://www.hatayekspres.com/rss' },
  {
    id: 'istiklal-gazetesi',
    name: 'İstiklal Gazetesi',
    province: '46',
    feed: 'https://www.istiklalgazetesi.com.tr/rss.xml'
  },
  // Central Anatolia
  {
    id: 'baskent-gazete',
    name: 'Başkent Gazete',
    province: '06',
    // The Ankara section; the main feed is mostly national news.
    feed: 'https://www.baskentgazete.com.tr/rss/ankara'
  },
  { id: 'konya-yenigun', name: 'Konya Yenigün', province: '42', feed: 'https://www.konyayenigun.com/rss' },
  {
    id: 'merhaba-haber',
    name: 'Merhaba Haber',
    province: '42',
    feed: 'https://www.merhabahaber.com/service/rss.php'
  },
  { id: 'memleket', name: 'Memleket', province: '42', feed: 'https://www.memleket.com.tr/service/rss.php' },
  { id: 'kayserim', name: 'Kayserim.net', province: '38', feed: 'https://www.kayserim.net/rss' },
  { id: 'kayseri-haber', name: 'Kayseri Haber', province: '38', feed: 'https://kayserihaber.com.tr/rss.xml' },
  {
    id: 'kayseri-yerel-haber',
    name: 'Kayseri Yerel Haber',
    province: '38',
    feed: 'https://www.kayseriyerelhaber.com/rss'
  },
  { id: 'eskisehir-net', name: 'Eskisehir.net', province: '26', feed: 'https://www.eskisehir.net/rss' },
  {
    id: 'eskisehir-ekspres',
    name: 'Eskişehir Ekspres',
    province: '26',
    feed: 'https://www.eskisehirekspres.net/rss'
  },
  {
    id: 'anadolu-gazetesi',
    name: 'Anadolu Gazetesi',
    province: '26',
    feed: 'https://www.anadolugazetesi.com/rss'
  },
  // Black Sea
  {
    id: 'samsun-kent-haber',
    name: 'Samsun Kent Haber',
    province: '55',
    feed: 'https://www.samsunkenthaber.com.tr/rss'
  },
  {
    id: 'samsun-gazetesi',
    name: 'Samsun Gazetesi',
    province: '55',
    feed: 'https://www.samsungazetesi.com/rss'
  },
  {
    id: 'haber-expres-samsun',
    name: 'Haber Expres',
    province: '55',
    feed: 'https://www.haberexpres.com.tr/rss'
  },
  { id: 'kuzey-ekspres', name: 'Kuzey Ekspres', province: '61', feed: 'https://www.kuzeyekspres.com.tr/rss' },
  { id: 'gunebakis', name: 'Günebakış', province: '61', feed: 'https://www.gunebakis.com.tr/rss' },
  { id: 'haberts', name: 'HaberTS', province: '61', feed: 'https://www.haberts.com/rss' },
  { id: 'ordu-olay', name: 'Ordu Olay', province: '52', feed: 'https://www.orduolay.com/rss' },
  {
    id: 'zonguldak-pusula',
    name: 'Zonguldak Pusula',
    province: '67',
    feed: 'https://www.pusulagazetesi.com.tr/rss'
  },
  // Eastern Anatolia
  { id: 'yeni-malatya', name: 'Yeni Malatya', province: '44', feed: 'https://www.yenimalatya.com.tr/rss' },
  { id: 'malatya-soz', name: 'Malatya Söz', province: '44', feed: 'https://www.malatyasoz.com/rss' },
  { id: 'malatya-cagdas', name: 'Malatya Çağdaş', province: '44', feed: 'https://www.malatyacagdas.com/rss' },
  { id: 'van-havadis', name: 'Van Havadis', province: '65', feed: 'https://www.vanhavadis.com/rss' },
  { id: 'vansesi', name: 'Vansesi', province: '65', feed: 'https://www.vansesigazetesi.com/rss' },
  {
    id: 'bolge-gazetesi-van',
    name: 'Bölge Gazetesi Van',
    province: '65',
    feed: 'https://www.bolgegazetesivan.com/rss'
  },
  {
    id: 'erzurum-haber-25',
    name: 'Erzurum Haber 25',
    province: '25',
    feed: 'https://erzurumhaber25.com/rss.xml'
  },
  // Southeastern Anatolia
  {
    id: 'gaziantep-haber',
    name: 'Gaziantep Haber',
    province: '27',
    feed: 'https://www.gaziantephaber.com/rss'
  },
  {
    id: 'gaziantep-olusum',
    name: 'Gaziantep Oluşum',
    province: '27',
    feed: 'https://www.gaziantepolusum.com/rss'
  },
  {
    id: 'gaziantep-pusula',
    name: 'Gaziantep Pusula',
    province: '27',
    feed: 'https://www.gazianteppusula.com/rss'
  },
  { id: 'gazete-ipekyol', name: 'Gazete İpekyol', province: '63', feed: 'https://www.gazeteipekyol.com/rss' },
  { id: 'urfa-news', name: 'Urfa News', province: '63', feed: 'https://www.urfanews.com/rss' },
  { id: 'urfa-degisim', name: 'Urfa Değişim', province: '63', feed: 'https://www.urfadegisim.com.tr/rss' },
  { id: 'amida-haber', name: 'Amida Haber', province: '21', feed: 'https://amidahaber.com/service/rss.php' },
  {
    id: 'diyarbakir-soz',
    name: 'Diyarbakır Söz',
    province: '21',
    feed: 'https://diyarbakirsoz.com/rss/rss.xml'
  },
  {
    id: 'guneydogu-ekspres',
    name: 'Güneydoğu Ekspres',
    province: '21',
    feed: 'https://www.guneydoguekspres.com/rss'
  },
  { id: 'batman-cagdas', name: 'Batman Çağdaş', province: '72', feed: 'https://www.batmancagdas.com/rss' },
  { id: 'mardin-haber', name: 'Mardin Haber', province: '47', feed: 'https://mardinhaber.com.tr/rss' }
]

function toSource({ id, name, province, feed }: LocalPaper): SourceDef {
  const { origin, hostname } = new URL(feed)
  return {
    id,
    name,
    homepage: origin,
    icon: favicon(hostname),
    kind: 'local',
    language: 'tr',
    provinces: [province],
    feeds: [{ url: feed, category: 'local', province }]
  }
}

/** Province-bound sources: the two city-page patterns first, then local newspapers. */
export const localSources: SourceDef[] = [...cityFeeds, ...papers.map(toSource)]
