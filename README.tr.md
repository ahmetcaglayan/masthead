<div align="center">

<img src="assets/logo-256.png" width="112" alt="Masthead logosu" />

# Masthead

**Tüm haberler, tek sakin yerde.**

Türkiye'nin önde gelen haber sitelerinin manşetlerini tek bir yerde toplayan, haberleri uygulamadan hiç
çıkmadan okumanı sağlayan şık bir masaüstü haber uygulaması.

[![Sürüm](https://img.shields.io/github/v/release/ahmetcaglayan/Masthead?style=flat-square&color=f4502f&label=s%C3%BCr%C3%BCm)](https://github.com/ahmetcaglayan/Masthead/releases/latest)
[![İndirme](https://img.shields.io/github/downloads/ahmetcaglayan/Masthead/total?style=flat-square&color=f4502f&label=indirme)](https://github.com/ahmetcaglayan/Masthead/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/ahmetcaglayan/Masthead/ci.yml?style=flat-square&label=CI)](https://github.com/ahmetcaglayan/Masthead/actions/workflows/ci.yml)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-2f2a24?style=flat-square)](LICENSE)

[English](README.md) · **Türkçe**

</div>

<p align="center">
  <img src="docs/images/home.png" alt="Masthead ön sayfası: manşet, son dakika bandı ve canlı son haberler akışı" width="100%" />
</p>

## Neden Masthead?

Gündemi takip etmek genelde onlarca sekme, çerez uyarıları, kendiliğinden açılan videolar ve pop-up'lar demek.
Masthead 67 ulusal yayının (24'ü varsayılan olarak açık) ve 81 ilin tamamındaki yerel kaynakların haberlerini tek, sakin, dergi gibi bir ön sayfada toplar:

- **Tıklamadan gündemi takip et.** Her kartta tam başlık, tam özet ve fotoğraf. **Gündem Özeti** aynı olayı veren
  kaynakları bir araya getirir; kimin ne dediğini tek bakışta görürsün.
- **Olduğun yerde oku.** Habere tıkla, yayıncının kendi sayfası uygulamanın içinde büyük bir pencerede açılsın.
  <kbd>Esc</kbd>'ye bas, geri dön. Daha sade bir görünüm için **Okuma modu**.
- **Son dakika, manşet ve canlı akış.** Kayan son dakika bandı, en çok kaynağın verdiği haberlerden oluşan
  manşet ve dakika dakika "son haberler" sütunu.
- **Kaynaklar senin kontrolünde.** Her siteyi tek tıkla aç/kapat. Zamana, kaynağa, bölgeye ve 81 ile göre filtrele.
- **Gizlilik öncelikli.** Üyelik yok, izleme yok. Ayarların, kaydettiklerin ve geçmişin bilgisayarında kalır.

## Ekran görüntüleri

| | |
| --- | --- |
| ![Gündem Özeti](docs/images/digest.png) | ![Yayıncının sayfası uygulama içinde](docs/images/in-app.png) |
| **Gündem Özeti** — her olay bir kez, her kaynağın başlığıyla | **Olduğun yerde oku** — yayıncının sayfası pencerede, <kbd>Esc</kbd> ile kapat |
| ![Okuma modu](docs/images/reader.png) | ![Son Haberler, Türkçe arayüz, koyu tema](docs/images/latest-tr.png) |
| **Okuma modu** — seçtiğin fontla sade metin | **Son Haberler** — dakika dakika zaman çizelgesi (Türkçe, koyu tema) |
| ![İlk açılış](docs/images/onboarding.png) | ![Ayarlar](docs/images/settings.png) |
| **İlk açılış** — birkaç kısa soru ve hazırsın | **Ayarlar** — tema, vurgu rengi, fontlar, kaynaklar |

## İndir

Son sürümü [Releases sayfasından](https://github.com/ahmetcaglayan/Masthead/releases/latest) indir:

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
git clone https://github.com/ahmetcaglayan/Masthead.git
cd Masthead
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
| 🔎 **Filtre ve arama** | Zaman, kaynak, 7 bölge / 81 il, en çok kaynak sıralaması, görselli, okunanları gizle; Türkçe'ye duyarlı arama |
| 📖 **Uygulama içi okuma** | Yayıncının sayfası pencerede (<kbd>Esc</kbd> ile kapat), Okuma modu, reklam ve izleyici engelleme |
| 📍 **Yerel haberler** | Şehrini seç; yerel gazeteler ve ilinle ilgili haberler |
| 🗂️ **Kaynaklar** | Her siteyi aç/kapat; akışların durumu bir bakışta |
| 🔖 **Kitaplık** | Kaydedilen haberler ve okuma geçmişi, yerelde |
| 🎨 **Kişiselleştir** | Açık / koyu / sistem tema, 5 vurgu rengi, 12 okuma fontu, yazı boyutu, sıkı görünüm |
| 🌍 **Diller** | İngilizce ve Türkçe arayüz (yenileri geliyor); ülke seçimi yol haritasında |

## Kaynaklar

Masthead; kamu yayıncısı, haber ajansları, ana akım gazeteler, bağımsız ve muhalif medya, uluslararası Türkçe
yayınlar ile ekonomi, spor ve teknoloji sitelerinden dengeli seçilmiş bir kaynak listesi ve birçok il için yerel
gazetelerle gelir. Tam liste ve kaynak ekleme için: [docs/SOURCES.md](docs/SOURCES.md).

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

## Gizlilik

Üyelik, analitik ve izleme yok. Uygulama yalnızca etkinleştirdiğin haber sitelerine ve reklam engelleme açıksa
herkese açık filtre listelerine bağlanır. Ayrıntılar: [SECURITY.md](SECURITY.md).

## Lisans

[MIT](LICENSE) © Ahmet Çağlayan. Haber içerikleri ilgili yayıncılara aittir.
