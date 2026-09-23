<div align="center">

<img src="assets/logo-256.png" width="112" alt="Masthead logosu" />

# Masthead

**Tüm haberler, tek sakin yerde.**

Bir ülkenin önde gelen haber kaynaklarının manşetlerini tek bir yerde toplayan, haberleri reklamsız ve
uygulamadan hiç çıkmadan okumanı sağlayan şık bir masaüstü haber uygulaması.
**Türkiye · ABD · Hindistan · Birleşik Krallık · Almanya · Brezilya.**

[![Sürüm](https://img.shields.io/github/v/release/ahmetcaglayan/masthead?style=flat-square&color=f4502f&label=s%C3%BCr%C3%BCm)](https://github.com/ahmetcaglayan/masthead/releases/latest)
[![İndirme](https://img.shields.io/github/downloads/ahmetcaglayan/masthead/total?style=flat-square&color=f4502f&label=indirme)](https://github.com/ahmetcaglayan/masthead/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/ahmetcaglayan/masthead/ci.yml?style=flat-square&label=CI)](https://github.com/ahmetcaglayan/masthead/actions/workflows/ci.yml)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-2f2a24?style=flat-square)](LICENSE)

[English](README.md) · **Türkçe**

</div>

<p align="center">
  <img src="docs/images/home.png" alt="Masthead ön sayfası: manşet, son dakika bandı ve canlı son haberler akışı" width="100%" />
</p>

## Neden Masthead?

Gündemi takip etmek genelde onlarca sekme, çerez uyarıları, kendiliğinden açılan videolar ve pop-up'lar demek.
Masthead **altı ülkeden 206 haber kaynağını** tek, sakin, dergi gibi bir ön sayfada toplar:

- **Tıklamadan gündemi takip et.** Her kartta tam başlık, tam özet ve fotoğraf. **Gündem Özeti** aynı olayı veren
  kaynakları bir araya getirir; kimin ne dediğini tek bakışta görürsün.
- **Olduğun yerde, reklamsız oku.** Habere tıkla, uygulamanın içinde büyük bir pencerede — varsayılan olarak
  **Okuma modunda**, yani sade metin hâliyle — açılsın. Yayıncının kendi sayfası aynı pencerede bir tık
  uzakta, reklamlar ve izleyiciler engellenmiş olarak. <kbd>Esc</kbd>'ye bas, geri dön.
- **Son dakika, manşet ve canlı akış.** Kayan son dakika bandı, en çok kaynağın verdiği haberlerden oluşan
  manşet ve dakika dakika "son haberler" sütunu.
- **Kaynaklar senin kontrolünde.** Her siteyi tek tıkla aç/kapat. Zamana, kaynağa, sıralamaya ve görsele —
  Türkiye'de ayrıca bölgeye ve 81 ile — göre filtrele.
- **Gizlilik öncelikli.** Üyelik yok, izleme yok. Ayarların, kaydettiklerin ve geçmişin bilgisayarında kalır.

### Reklamı değil, haberi oku

Her haber Masthead'in içinde açılır ve gömülü tarayıcı **reklam ve izleyici engelleme** açıkken çalışır
(EasyList tabanlı; Ayarlar → Okuma'dan kapatılabilir). Dikkatini dağıtan çerez bandı, kendiliğinden başlayan
video, ikinci paragrafın üstüne düşen bülten penceresi yok — haber, yazıldığı hâliyle. Reklam engelleme
masaüstü uygulamaya özgüdür; tarayıcı sürümünde haber çerçeve içinde ya da Okuma modunda açılır.

**Haberler varsayılan olarak Okuma modunda açılır**: başlık, imza ve gövde; senin seçtiğin okuma fontu ve
boyutuyla, uygulamanın sıcak kâğıt ya da koyu mürekkep zemininde. Aynı haber; düzen yok, betik yok. Yayıncının
kendi sayfasını görmek istediğinde araç çubuğundan **Web**'e geç — ya da Ayarlar → Okuma'dan Web'i yeniden
varsayılan yap. Haber sayfalarının indirme, açılır pencere ve izin istekleri reddedilir;
gömülü tarayıcı her şeyden ayrı, kendi yalıtılmış oturumunda çalışır.

### Bir haber, tüm kaynaklar

Aynı olay iki kaynakta nadiren aynı anlatılır. Masthead farklı kaynakların aynı olay için yayımladığı haberleri
kümeler; böylece haberi tek bir kaynaktan değil, etrafını dolaşarak okursun:

- **Ön sayfada** manşet, o haberi kaç kaynağın verdiğini ("8 kaynak") ve altında diğer kaynakların kendi
  başlıklarını gösterir.
- **Gündem Özeti** sayfası bu fikrin tamamı: olay başına tek kart, en doyurucu özet üstte, altında her kaynağın
  başlığı logosu ve yayımlama saatiyle — günün gündemi, hiç tıklamadan.
- Açık haberin içinde **"Diğer kaynaklarda"** aynı olayın başka yerlerdeki hâlini listeler; bir kaynağın
  versiyonundan diğerine tek tıkla geçer ya da <kbd>Alt</kbd> + <kbd>←</kbd> / <kbd>→</kbd> ile günün
  haberleri arasında sırayla gezersin.
- Herhangi bir akışı **En çok kaynak** sırasına alarak çok kaynağın verdiği haberleri öne çıkarabilirsin.

## Ekran görüntüleri

| | |
| --- | --- |
| ![Gündem Özeti](docs/images/digest.png) | ![Yayıncının sayfası uygulama içinde](docs/images/in-app.png) |
| **Gündem Özeti** — her olay bir kez, her kaynağın başlığıyla | **Olduğun yerde oku** — yayıncının sayfası pencerede, <kbd>Esc</kbd> ile kapat |
| ![Okuma modu](docs/images/reader.png) | ![Son Haberler, Türkçe arayüz, koyu tema](docs/images/latest-tr.png) |
| **Okuma modu** — seçtiğin fontla sade metin | **Son Haberler** — dakika dakika zaman çizelgesi (Türkçe, koyu tema) |
| ![İlk açılış](docs/images/onboarding.png) | ![Ayarlar](docs/images/settings.png) |
| **İlk açılış** — birkaç kısa soru ve hazırsın | **Ayarlar** — tema, vurgu rengi, fontlar, kaynaklar |

## Altı ülke, dört dil

Arayüz dili ile haberlerin dili birbirinden bağımsız: istersen Brezilya gazetelerini Almanca arayüzle okursun.

| | |
| --- | --- |
| ![ABD kaynaklarıyla Masthead ön sayfası](docs/images/us-home.png) | ![Birleşik Krallık kaynaklarıyla Masthead ön sayfası](docs/images/gb-home.png) |
| 🇺🇸 **ABD** — NPR ve NYT'den Fox News ve National Review'a 18 kaynak | 🇬🇧 **Birleşik Krallık** — BBC, Guardian, Sky News, Independent, FT |
| ![Almanca arayüz ve Alman kaynakları](docs/images/de-home.png) | ![Portekizce arayüzle Gündem Özeti](docs/images/br-digest.png) |
| 🇩🇪 **Almanya** — tagesschau, Spiegel, Zeit, FAZ, SZ… arayüz de Almanca | 🇧🇷 **Brezilya** — Portekizce Gündem Özeti: tek kart, her kaynağın başlığı |
| ![Hindistan kaynaklarıyla Son Haberler](docs/images/in-latest.png) | ![Almanca bir haberde Okuma modu](docs/images/de-reader.png) |
| 🇮🇳 **Hindistan** — TOI, The Hindu, HT, NDTV ve dahası, dakika dakika | 📖 **Okuma modu** — haber ve başka hiçbir şey, kendi okuma fontunla |


## İndir

Son sürümü [Releases sayfasından](https://github.com/ahmetcaglayan/masthead/releases/latest) indir:

| Platform | Dosya |
| --- | --- |
| Windows (kurulum, Intel/AMD) | `Masthead-x.y.z-win-x64.exe` |
| Windows (kurulum, ARM) | `Masthead-x.y.z-win-arm64.exe` |
| Windows (portable, kurulumsuz) | `Masthead-x.y.z-portable.exe` |
| macOS (Apple Silicon / Intel) | `Masthead-x.y.z-arm64.dmg` / `Masthead-x.y.z-x64.dmg` |
| Linux | `Masthead-x.y.z-linux-x86_64.AppImage` / `.deb` |

> **Sürümler henüz dijital olarak imzalı değil.**
> - Windows SmartScreen uyarısında **Ek bilgi → Yine de çalıştır**'ı seç.
> - **Akıllı Uygulama Denetimi** (Smart App Control) açıksa (Windows 11 → Windows Güvenliği → Uygulama ve tarayıcı
>   denetimi), Windows imzasız uygulamaları "Yine de çalıştır" seçeneği sunmadan engelleyebilir. Bu durumda aşağıdaki
>   tarayıcı sürümünü kullan ya da kaynaktan derle.
> - macOS'te ilk açılışta uygulamaya sağ tıklayıp **Aç**'ı seç.

### Program kuramıyor musun? Tarayıcıda çalıştır

Uygulamanın tamamı kendi bilgisayarında, normal bir tarayıcıda da çalışır — program kurmanın yasak olduğu iş
bilgisayarları için ideal:

```bash
git clone https://github.com/ahmetcaglayan/masthead.git
cd masthead
npm install
npm run dev:web      # http://localhost:5173 adresini aç
```

Tarayıcıda haberler, site izin veriyorsa sayfa içinde, vermiyorsa Okuma modunda açılır (tarayıcılar çoğu haber
sitesinin başka bir sayfaya gömülmesini engeller; masaüstü uygulamada bu sınır yoktur).

## Özellikler

| | |
| --- | --- |
| 📰 **Ön sayfa** | Manşet, ikincil manşetler, ilgi alanı bölümleri, canlı "son haberler" akışı |
| ⚡ **Son dakika** | Kayan bant, ayrı sayfa, isteğe bağlı masaüstü bildirimleri |
| 🧭 **Gündem Özeti** | Kaynaklar arası gruplanmış haberler ve her kaynağın başlığı — günün gündemi tek kaydırmada |
| 🔎 **Filtre ve arama** | Zaman, kaynak, en çok kaynak sıralaması, görselli, okunanları gizle — Türkiye'de ayrıca 7 bölge / 81 il; aksana duyarsız arama |
| 📖 **Uygulama içi okuma** | Yayıncının sayfası pencerede (<kbd>Esc</kbd> ile kapat), Okuma modu, reklam ve izleyici engelleme |
| 📍 **Yerel haberler** | Türkiye: şehrini seç; yerel gazeteler ve ilinle ilgili haberler |
| 🗂️ **Kaynaklar** | Her siteyi aç/kapat; akışların durumu bir bakışta |
| 🔖 **Kitaplık** | Kaydedilen haberler ve okuma geçmişi, yerelde |
| 🎨 **Kişiselleştir** | Açık / koyu / sistem tema, 5 vurgu rengi, 12 okuma fontu, yazı boyutu, sıkı görünüm |
| 🌍 **Ülkeler** | Türkiye, ABD, Hindistan, Birleşik Krallık, Almanya ve Brezilya — Ayarlar'dan değiştir |
| 💬 **Diller** | İngilizce, Türkçe, Almanca ve Portekizce arayüz; haberler kendi dilinde kalır |

## Kaynaklar

Masthead her ülke için bir **ülke paketi** ile gelir: kamu yayıncıları, haber ajansları, ana akım gazeteler,
bağımsız medya ile ekonomi, spor ve teknoloji siteleri arasından dengeli seçilmiş bir liste.

| Ülke | Kaynak | Akış |
| --- | --- | --- |
| 🇹🇷 Türkiye | 136 (67 ulusal + yerel: 81 ilin akışı, 33 ilde yerel gazete) | 536 |
| 🇺🇸 ABD | 18 | 49 |
| 🇮🇳 Hindistan | 10 | 37 |
| 🇬🇧 Birleşik Krallık | 10 | 37 |
| 🇩🇪 Almanya | 15 | 46 |
| 🇧🇷 Brezilya | 17 | 34 |

Her akış yayına girmeden önce canlı sitelere karşı doğrulanır (`npm run verify:feeds`). Tam liste, ülke paketi
yapısı ve yeni bir kaynak ya da ülke ekleme: [docs/SOURCES.md](docs/SOURCES.md).

Masthead yalnızca yayıncıların herkese açık RSS akışlarında verdiği başlık, özet ve görselleri gösterir. Haberin
tamamı her zaman yayıncının kendi sayfasında okunur.

## Geliştirme

```bash
npm install
npm run dev          # masaüstü uygulaması (anlık yenilemeli)
npm run dev:web      # tarayıcı sürümü → http://localhost:5173
npm test             # birim testleri
npm run typecheck && npm run lint
npm run dist:win     # Windows kurulum ve portable exe → release/
```

Electron, React, TypeScript, Tailwind CSS ve Vite ile yazıldı. Mimari ve yol haritası için
[docs/PLAN.md](docs/PLAN.md), kaldığımız yer için [docs/PROGRESS.md](docs/PROGRESS.md), katkı için
[CONTRIBUTING.md](CONTRIBUTING.md).

### HTTPS trafiğini inceleyen ağlarda

Bazı kurum ağlarında bir vekil sunucu her HTTPS bağlantısını kurumun kendi kök sertifikasıyla yeniden imzalar.
Tarayıcılar bu sertifikaya sistem deposu üzerinden güvenir, Node.js ise kendi deposunu kullanır — bu yüzden tüm
akışlar `SELF_SIGNED_CERT_IN_CHAIN` ile düşer ve uygulama boş kalır. Kök sertifikayı bir PEM dosyasına kaydedip
Node'a gösterin:

```bash
NODE_EXTRA_CA_CERTS=/yol/kok-ca.pem npm run dev:web
```

Aynı değişken `npm run dev` için de geçerlidir: haber sayfaları sistem deposunu kullanan gömülü tarayıcı
görünümünde açılır, ama akışları Node çeker.

## Gizlilik

Üyelik, analitik ve izleme yok. Uygulama yalnızca etkinleştirdiğin haber sitelerine ve reklam engelleme açıksa
herkese açık filtre listelerine bağlanır. Ayrıntılar: [SECURITY.md](SECURITY.md).

## Lisans

[MIT](LICENSE) © Ahmet Çağlayan. Haber içerikleri ilgili yayıncılara aittir.
