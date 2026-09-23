import type { Province } from '../../types'
import type { TrRegionId } from './regions.ts'

interface TrProvince extends Province {
  region: TrRegionId
}

/**
 * The 81 provinces of Turkey keyed by plate code. `slug` is the ASCII form used
 * by the Sabah and Haberler.com city feeds. Aliases carry historical/short names
 * seen in news copy plus ASCII spellings; ASCII forms are left out where they
 * would collide with other words (Muş → "mus").
 */
export const provinces: TrProvince[] = [
  { code: '01', name: 'Adana', slug: 'adana', region: 'mediterranean', aliases: [] },
  { code: '02', name: 'Adıyaman', slug: 'adiyaman', region: 'southeastern-anatolia', aliases: ['Adiyaman'] },
  { code: '03', name: 'Afyonkarahisar', slug: 'afyonkarahisar', region: 'aegean', aliases: ['Afyon'] },
  // "ağrı" means pain (baş ağrısı, ağrı kesici).
  { code: '04', name: 'Ağrı', slug: 'agri', region: 'eastern-anatolia', aliases: [], ambiguous: true },
  { code: '05', name: 'Amasya', slug: 'amasya', region: 'black-sea', aliases: [] },
  { code: '06', name: 'Ankara', slug: 'ankara', region: 'central-anatolia', aliases: [] },
  { code: '07', name: 'Antalya', slug: 'antalya', region: 'mediterranean', aliases: [] },
  { code: '08', name: 'Artvin', slug: 'artvin', region: 'black-sea', aliases: [] },
  // Frequent first name and surname; also an adjective ("bright, enlightened").
  { code: '09', name: 'Aydın', slug: 'aydin', region: 'aegean', aliases: [], ambiguous: true },
  { code: '10', name: 'Balıkesir', slug: 'balikesir', region: 'marmara', aliases: ['Balikesir'] },
  { code: '11', name: 'Bilecik', slug: 'bilecik', region: 'marmara', aliases: [] },
  { code: '12', name: 'Bingöl', slug: 'bingol', region: 'eastern-anatolia', aliases: ['Bingol'] },
  { code: '13', name: 'Bitlis', slug: 'bitlis', region: 'eastern-anatolia', aliases: [] },
  { code: '14', name: 'Bolu', slug: 'bolu', region: 'black-sea', aliases: [] },
  { code: '15', name: 'Burdur', slug: 'burdur', region: 'mediterranean', aliases: [] },
  { code: '16', name: 'Bursa', slug: 'bursa', region: 'marmara', aliases: [] },
  { code: '17', name: 'Çanakkale', slug: 'canakkale', region: 'marmara', aliases: ['Canakkale'] },
  { code: '18', name: 'Çankırı', slug: 'cankiri', region: 'central-anatolia', aliases: ['Cankiri'] },
  { code: '19', name: 'Çorum', slug: 'corum', region: 'black-sea', aliases: ['Corum'] },
  { code: '20', name: 'Denizli', slug: 'denizli', region: 'aegean', aliases: [] },
  {
    code: '21',
    name: 'Diyarbakır',
    slug: 'diyarbakir',
    region: 'southeastern-anatolia',
    aliases: ['Diyarbakir', 'Amed']
  },
  { code: '22', name: 'Edirne', slug: 'edirne', region: 'marmara', aliases: [] },
  { code: '23', name: 'Elazığ', slug: 'elazig', region: 'eastern-anatolia', aliases: ['Elazig'] },
  { code: '24', name: 'Erzincan', slug: 'erzincan', region: 'eastern-anatolia', aliases: [] },
  { code: '25', name: 'Erzurum', slug: 'erzurum', region: 'eastern-anatolia', aliases: [] },
  { code: '26', name: 'Eskişehir', slug: 'eskisehir', region: 'central-anatolia', aliases: ['Eskisehir'] },
  { code: '27', name: 'Gaziantep', slug: 'gaziantep', region: 'southeastern-anatolia', aliases: ['Antep'] },
  { code: '28', name: 'Giresun', slug: 'giresun', region: 'black-sea', aliases: [] },
  { code: '29', name: 'Gümüşhane', slug: 'gumushane', region: 'black-sea', aliases: ['Gumushane'] },
  { code: '30', name: 'Hakkari', slug: 'hakkari', region: 'eastern-anatolia', aliases: ['Hakkâri'] },
  { code: '31', name: 'Hatay', slug: 'hatay', region: 'mediterranean', aliases: ['Antakya'] },
  { code: '32', name: 'Isparta', slug: 'isparta', region: 'mediterranean', aliases: [] },
  { code: '33', name: 'Mersin', slug: 'mersin', region: 'mediterranean', aliases: ['İçel', 'Icel'] },
  { code: '34', name: 'İstanbul', slug: 'istanbul', region: 'marmara', aliases: ['Istanbul'] },
  { code: '35', name: 'İzmir', slug: 'izmir', region: 'aegean', aliases: ['Izmir'] },
  { code: '36', name: 'Kars', slug: 'kars', region: 'eastern-anatolia', aliases: [] },
  { code: '37', name: 'Kastamonu', slug: 'kastamonu', region: 'black-sea', aliases: [] },
  { code: '38', name: 'Kayseri', slug: 'kayseri', region: 'central-anatolia', aliases: [] },
  { code: '39', name: 'Kırklareli', slug: 'kirklareli', region: 'marmara', aliases: ['Kirklareli'] },
  { code: '40', name: 'Kırşehir', slug: 'kirsehir', region: 'central-anatolia', aliases: ['Kirsehir'] },
  { code: '41', name: 'Kocaeli', slug: 'kocaeli', region: 'marmara', aliases: ['İzmit', 'Izmit'] },
  { code: '42', name: 'Konya', slug: 'konya', region: 'central-anatolia', aliases: [] },
  { code: '43', name: 'Kütahya', slug: 'kutahya', region: 'aegean', aliases: ['Kutahya'] },
  { code: '44', name: 'Malatya', slug: 'malatya', region: 'eastern-anatolia', aliases: [] },
  { code: '45', name: 'Manisa', slug: 'manisa', region: 'aegean', aliases: [] },
  {
    code: '46',
    name: 'Kahramanmaraş',
    slug: 'kahramanmaras',
    region: 'mediterranean',
    aliases: ['Maraş', 'K.Maraş', 'Kahramanmaras']
  },
  { code: '47', name: 'Mardin', slug: 'mardin', region: 'southeastern-anatolia', aliases: [] },
  { code: '48', name: 'Muğla', slug: 'mugla', region: 'aegean', aliases: ['Mugla'] },
  // Collides with the "-muş" suffix (yapılmış, gelmiş).
  { code: '49', name: 'Muş', slug: 'mus', region: 'eastern-anatolia', aliases: [], ambiguous: true },
  { code: '50', name: 'Nevşehir', slug: 'nevsehir', region: 'central-anatolia', aliases: ['Nevsehir'] },
  { code: '51', name: 'Niğde', slug: 'nigde', region: 'central-anatolia', aliases: ['Nigde'] },
  // "ordu" means army (3. Ordu, İsrail ordusu).
  { code: '52', name: 'Ordu', slug: 'ordu', region: 'black-sea', aliases: [], ambiguous: true },
  { code: '53', name: 'Rize', slug: 'rize', region: 'black-sea', aliases: [] },
  // Also a river, a battle and a street/neighbourhood name in many other cities.
  {
    code: '54',
    name: 'Sakarya',
    slug: 'sakarya',
    region: 'marmara',
    aliases: ['Adapazarı', 'Adapazari'],
    ambiguous: true
  },
  { code: '55', name: 'Samsun', slug: 'samsun', region: 'black-sea', aliases: [] },
  { code: '56', name: 'Siirt', slug: 'siirt', region: 'southeastern-anatolia', aliases: [] },
  { code: '57', name: 'Sinop', slug: 'sinop', region: 'black-sea', aliases: [] },
  { code: '58', name: 'Sivas', slug: 'sivas', region: 'central-anatolia', aliases: [] },
  { code: '59', name: 'Tekirdağ', slug: 'tekirdag', region: 'marmara', aliases: ['Tekirdag'] },
  // "tokat" means slap.
  { code: '60', name: 'Tokat', slug: 'tokat', region: 'black-sea', aliases: [], ambiguous: true },
  { code: '61', name: 'Trabzon', slug: 'trabzon', region: 'black-sea', aliases: [] },
  { code: '62', name: 'Tunceli', slug: 'tunceli', region: 'eastern-anatolia', aliases: ['Dersim'] },
  {
    code: '63',
    name: 'Şanlıurfa',
    slug: 'sanliurfa',
    region: 'southeastern-anatolia',
    aliases: ['Urfa', 'Sanliurfa']
  },
  // "uşak" means servant.
  { code: '64', name: 'Uşak', slug: 'usak', region: 'aegean', aliases: [], ambiguous: true },
  // English "van"; Dutch surnames (van Gogh, Van Dijk).
  { code: '65', name: 'Van', slug: 'van', region: 'eastern-anatolia', aliases: [], ambiguous: true },
  { code: '66', name: 'Yozgat', slug: 'yozgat', region: 'central-anatolia', aliases: [] },
  { code: '67', name: 'Zonguldak', slug: 'zonguldak', region: 'black-sea', aliases: [] },
  // Also a busy neighbourhood in İstanbul's Fatih district.
  { code: '68', name: 'Aksaray', slug: 'aksaray', region: 'central-anatolia', aliases: [], ambiguous: true },
  { code: '69', name: 'Bayburt', slug: 'bayburt', region: 'black-sea', aliases: [] },
  // Common surname.
  { code: '70', name: 'Karaman', slug: 'karaman', region: 'central-anatolia', aliases: [], ambiguous: true },
  { code: '71', name: 'Kırıkkale', slug: 'kirikkale', region: 'central-anatolia', aliases: ['Kirikkale'] },
  // The superhero, and the Batman river.
  {
    code: '72',
    name: 'Batman',
    slug: 'batman',
    region: 'southeastern-anatolia',
    aliases: [],
    ambiguous: true
  },
  { code: '73', name: 'Şırnak', slug: 'sirnak', region: 'southeastern-anatolia', aliases: ['Sirnak'] },
  { code: '74', name: 'Bartın', slug: 'bartin', region: 'black-sea', aliases: ['Bartin'] },
  { code: '75', name: 'Ardahan', slug: 'ardahan', region: 'eastern-anatolia', aliases: [] },
  { code: '76', name: 'Iğdır', slug: 'igdir', region: 'eastern-anatolia', aliases: ['Igdir'] },
  { code: '77', name: 'Yalova', slug: 'yalova', region: 'marmara', aliases: [] },
  { code: '78', name: 'Karabük', slug: 'karabuk', region: 'black-sea', aliases: ['Karabuk'] },
  { code: '79', name: 'Kilis', slug: 'kilis', region: 'southeastern-anatolia', aliases: [] },
  { code: '80', name: 'Osmaniye', slug: 'osmaniye', region: 'mediterranean', aliases: [] },
  { code: '81', name: 'Düzce', slug: 'duzce', region: 'black-sea', aliases: ['Duzce'] }
]
