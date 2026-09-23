# Masthead — Ürün ve Teknik Plan

> Durum: **Faz 1 tamamlandı — v0.2.0 yayında; Faz 4: 6 ülke tam paketle (ulusal + yerel), 5 arayüz dili**
> · Son güncelleme: 2026-09-23
> Bu doküman projenin yol haritasıdır: ne yapıyoruz, nasıl yapıyoruz, hangi sırayla yapıyoruz.
> Her faz bittiğinde ilgili kutucuklar işaretlenir.

---

## 1. Özet

**Masthead**, Türkiye'nin (ileride seçilen ülkenin) önde gelen haber sitelerinden haberleri toplayıp tek,
sakin ve modern bir masaüstü arayüzünde sunan açık kaynak bir haber uygulamasıdır.

- **Toplar:** 6 ülkeden 532 kaynağın (Türkiye 136, ABD 176, Hindistan 19, Birleşik Krallık 68, Almanya 75,
  Brezilya 58; her ülkede yalnızca o ülkenin dilinde) RSS/Atom akışlarını düzenli aralıklarla çeker, tekrarları birleştirir, aynı olayı veren
  haberleri kümeler ("5 kaynak bu haberi verdi").
- **Sunar:** Modern bir haber sitesi düzeni — manşet alanı, son dakika bandı, kategori bölümleri,
  son haberler akışı.
- **Uygulama dışına çıkarmaz:** Tıklanan haber, ortada açılan bir pencerede (dialog) sitenin kendi
  sayfasıyla açılır; `Esc` ile kapanır. İsteğe bağlı **Okuma modu** reklamsız, sade bir görünüm verir.
- **Üyelik yok:** Tüm tercihler (dil, tema, ülke, ilgi alanları, font, açık/kapalı kaynaklar…) yerelde saklanır.
- **Kaynak kontrolü sende:** Her haber sitesi listeden tek tıkla açılıp kapatılır; seçim kaydedilir.
- **Tarayıcıda da çalışır:** `npm run dev:web` ile uygulamanın tamamı `localhost` üzerinden tarayıcıda açılır —
  exe kurulamayan bilgisayarlarda test ve geliştirme için.
- **Çok dilli:** Arayüz dili İngilizce (varsayılan), Türkçe, Almanca, Portekizce ve Hintçe; içerik dili
  arayüz dilinden bağımsız. Her ülke paketi kendi ülkesinin dilinde yayın yapan kaynakları taşır.

### Neden "Masthead"?

*Masthead*, bir gazetenin ön sayfasının en üstündeki isim/künye bandıdır — haberin "vitrini".
Kısa, iki dilde de rahat okunan, ülkeden bağımsız bir isim; ileride çoklu ülke desteğine uygun.
Logo, katlanmış bir ön sayfayı andıran yuvarlatılmış bir **M** ve altındaki manşet çizgisinden oluşur
(`assets/logo.svg`). Uygulama adı tek bir yerde (`package.json` → `productName`) değiştirilebilir.

---

## 2. Hedefler ve Kapsam

| Hedef | Ölçüt |
| --- | --- |
| Hızlı açılış | Önbellekten ilk ekran < 1 sn, taze veri < 5 sn |
| Göz yormayan okuma | Kağıt tonlu açık tema, gerçek koyu tema, ayarlanabilir font ve boyut |
| Güvenilir akış | Bozuk/yavaş kaynak diğerlerini bekletmez; hatalı kaynaklar sessizce geri çekilir |
| Kolay genişleme | Yeni kaynak = 1 satır; yeni ülke = 1 "ülke paketi" dosyası; yeni dil = 1 klasör JSON |
| Paylaşılabilir | GitHub Releases üzerinden Windows (kurulum + portable), macOS (dmg), Linux (AppImage/deb) |

**Kapsam dışı (şimdilik):** üyelik/senkronizasyon, yorumlar, sunucu tarafı bileşen, ücretli içerik aşma.

---

## 3. Kullanıcı Deneyimi

### 3.1 İlk açılış (Onboarding)

Tek ekranda, **alt alta beliren kısa sorular** (her cevapta bir sonraki soru yumuşakça açılır):

1. **Dil** — English / Türkçe / Deutsch / Português / हिन्दी (seçince arayüz anında değişir)
2. **Tema** — Açık / Koyu / Sistem (mini önizlemeli kartlar, anında uygulanır)
3. **Ülke** — Türkiye, ABD, Hindistan, Birleşik Krallık, Almanya, Brezilya (paketi olmayanlar "yakında"
   rozetiyle, pasif)
4. **İlgi alanları** — kategori çipleri, çoklu seçim (Gündem, Dünya, Ekonomi, Spor, Teknoloji…)
5. **Şehir (opsiyonel)** — aranabilir il listesi; "Yerel" sayfasını besler. Bu soru yalnızca il paketi olan
   ülkelerde (şimdilik Türkiye) sorulur.

→ **"Başlayalım"** butonu. Seçimler `settings.json`'a yazılır ve haberler çekilmeye başlar
(önbellek yoksa arka planda ilk yenileme onboarding sırasında başlar, kullanıcı bekletilmez).

### 3.2 Ana ekran düzeni

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ▣ Masthead   [ 🔍 Haberlerde ara…  Ctrl+K ]      ⟳ 2 dk önce   ◐   ⚙  _ □ ✕ │  ← başlık çubuğu (sürüklenebilir)
├──────────┬─────────────────────────────────────────────────────────────────┤
│ Ana Sayfa│ ● SON DAKİKA  Deprem… · Merkez Bankası faiz… · Milli takım…  ▶ │  ← kayan son dakika bandı
│ Son Dak. │─────────────────────────────────────────────────────────────────│
│ Sana Özel│ ┌───────────────────────────────┐ ┌─────────────┐  SON HABERLER │
│ Yerel    │ │                               │ │ 2. manşet   │  14:32 NTV …  │
│──────────│ │     BÜYÜK MANŞET GÖRSELİ      │ ├─────────────┤  14:30 AA …   │
│ Türkiye  │ │  Başlık (serif, büyük)        │ │ 3. manşet   │  14:28 TRT …  │
│ Dünya    │ │  5 kaynak · 12 dk önce        │ ├─────────────┤  14:25 BBC …  │
│ Ekonomi  │ └───────────────────────────────┘ │ 4. manşet   │  …            │
│ Spor     │ Filtre: [Son 24 saat▾] [Kaynaklar▾] [Bölge/İl▾] [Görselli]     │
│ Teknoloji│ ── Ekonomi ───────────────────────────────────── Tümü → ──     │
│ …        │ [kart] [kart] [kart] [kart]                                    │
│──────────│ ── Spor ──────────────────────────────────────── Tümü → ──     │
│ Kaydedil.│ [kart] [kart] [kart] [kart]                                    │
│ Geçmiş   │                                                                │
│ Kaynaklar│                                                                │
└──────────┴─────────────────────────────────────────────────────────────────┘
```

- **Manşet (hero):** En çok kaynağın verdiği, görselli, taze hikâye kümesi büyük kartta; yanında 3–4 ikincil manşet.
- **Son dakika bandı:** Son dakika akışlarından son 2 saatin haberleri; üzerine gelince durur, tıklayınca açar.
- **Son haberler sütunu:** Tüm kaynaklardan zaman sıralı canlı akış (saat + kaynak ikonu + başlık).
- **Kategori bölümleri:** Kullanıcının ilgi alanlarına göre sıralanan yatay bölümler.
- **"N yeni haber" hapı:** Yenilemede içerik zıplamaz; üstte beliren hap tıklanınca yeni haberler gösterilir.

### 3.3 Tıklamadan gündemi takip

Hedef: kullanıcı hiçbir habere tıklamadan da günün gündemini eksiksiz öğrenebilsin.

- **Başlıklar asla kesilmez.** Kartlarda başlığın tamamı görünür (üç nokta ile kırpma yok).
- **Detay kartta.** RSS açıklamasının tamamı (≈1500 karaktere kadar, paragraflarıyla) saklanır. **Manşet**
  özeti tam gösterir; diğer kartlar kartın boyuna göre bir karakter bütçesiyle (240–400) cümle sonunda kırpılır
  ve "…" ile biter — "Özetin tamamı" kartı yerinde açar, sıkı ızgarada satır kırpması da aynı düğmeyle açılır.
- **Akıştaki tam metin.** Akış tam metin veriyorsa (`content:encoded`), kart içinde genişletilerek
  siteye gitmeden okunur (`news.detail()` ile isteğe bağlı yüklenir, anlık görüntüyü şişirmez).
- **Gündem Özeti görünümü.** Aynı olayı veren haberler tek hikâye kartında toplanır: öne çıkan görsel,
  ana başlık, en detaylı özet ve altında diğer kaynakların başlıkları (kaynak ikonu + saat) — tek bakışta
  "kim ne demiş".
- **Görseller her yerde.** RSS görseli (enclosure / media:content / media:thumbnail / açıklamadaki `<img>`);
  yoksa haber sayfasının `og:image`'ı otomatik çekilir. Manşet gibi büyük alanlarda küçük RSS küçük resmi yerine
  yüksek çözünürlüklü `og:image` tercih edilir. Görsel hiç yoksa kaynağın rengiyle zarif bir yer tutucu.
- **Zaman çizelgesi.** "Son haberler" sütunu/sayfası saat damgalı, özetli, kesintisiz bir akış sunar.

### 3.4 Filtreler (habere özgü)

| Filtre | Açıklama |
| --- | --- |
| Kategori | Kenar çubuğundan; 16 konu kategorisi |
| Zaman | Son 1 saat / 6 saat / 24 saat / 3 gün / tümü |
| Kaynak | Çoklu seçim, kaynak ikonlarıyla; ayrıca kaynak bazlı sayfa |
| Bölge / İl | Her ülkede bölge + il/eyalet/Land/yöre (TR 7+81, ABD 4+51, IN 6+36, UK 12+51, DE 4+16, BR 5+27; haber metninden otomatik etiketleme) |
| Sıralama | En yeni / En çok kaynak (popüler) |
| Görselli haberler | Yalnızca görseli olanlar |
| Okunanları gizle | Okunan haberleri akıştan çıkar |
| Arama | Başlık + özet üzerinde Türkçe'ye duyarlı (İ/ı, ş, ğ…) anlık arama |

### 3.5 Haber okuma (uygulama içi)

- Karta tıklanınca ekranın ortasında, arka planı bulanıklaştıran büyük bir **dialog** açılır.
- Dialog üst çubuğu: kaynak ikonu + adı, başlık, yükleme çubuğu, `Web | Okuma modu` anahtarı,
  geri/ileri/yenile, kaydet, bağlantıyı kopyala, tarayıcıda aç, kapat.
- İçerik alanında sitenin **kendi sayfası** gömülü bir tarayıcı görünümünde (Electron `WebContentsView`) açılır.
- **Esc** (odak sayfanın içindeyken bile) dialogu kapatır. `←/→` (Alt ile) önceki/sonraki habere geçer.
- **Okuma modu:** Mozilla Readability ile makale metni çıkarılır; seçili okuma fontuyla, reklamsız gösterilir.
- **Reklam/izleyici engelleme** (açılıp kapatılabilir) gömülü görünümün oturumunda çalışır.
- Açılan pencere/pop-up'lar dışarı taşmaz; aynı görünümde açılır. İndirmeler ve izin istekleri engellenir.

### 3.6 Ayarlar (yerelde saklanır)

- **Görünüm:** Tema (açık/koyu/sistem), vurgu rengi (5 seçenek), yoğunluk (rahat/sıkı), kart stili (dergi/ızgara/liste)
- **Tipografi:** Arayüz fontu, başlık fontu, okuma fontu, yazı boyutu — canlı önizlemeli
- **Dil:** English / Türkçe
- **Ülke ve bölge:** Ülke (şimdilik Türkiye), şehir/bölge
- **İlgi alanları:** Kategori seçimi ve sırası
- **Kaynaklar:** Her haber sitesini tek tek aç/kapat (anahtar listesi, aramalı, türe göre gruplu;
  "tümünü aç/kapat"), kaynak sağlık durumu (son çekim, hata). Aynı liste kenar çubuğundaki
  **Kaynaklar** sayfasında da var. Seçim `settings.sources.disabled` olarak kaydedilir; kapatılan
  kaynağın akışları hiç çekilmez.
- **Okuma:** Varsayılan açılış modu (Okuma modu varsayılan; Web'e geçilebilir), reklam engelleme
- **Bildirimler:** Son dakika masaüstü bildirimleri
- **Yenileme:** 5 / 10 / 15 / 30 / 60 dk
- **Hakkında:** Sürüm, lisans, GitHub bağlantısı, verileri sıfırla

### 3.7 Varsayılan fontlar

Göz yormayan, ekran için tasarlanmış ve Türkçe karakterleri tam destekleyen üçlü:

| Rol | Varsayılan | Neden |
| --- | --- | --- |
| Arayüz | **Inter** | Ekran okunabilirliği için tasarlandı; yüksek x-yüksekliği, net rakamlar |
| Başlıklar | **Newsreader** | Haber okuma için tasarlanmış, optik boyutlu editoryal serif |
| Okuma modu | **Literata** | Uzun metin (e-kitap) okuma için tasarlandı; düşük göz yorgunluğu |

Ayarlardan seçilebilir: Inter, Figtree, Nunito Sans, IBM Plex Sans, Lexend, Atkinson Hyperlegible,
Newsreader, Source Serif, Literata, Lora, Merriweather, Sistem fontu. Tüm fontlar uygulamaya gömülüdür
(ağ isteği/izleme yok).

---

## 4. Teknik Mimari

### 4.1 Teknoloji seçimi

| Katman | Seçim | Gerekçe |
| --- | --- | --- |
| Masaüstü kabuğu | **Electron 44** | Harici siteleri uygulama içinde güvenle açmak için `WebContentsView`; oturum bazlı reklam engelleme; Win/macOS/Linux |
| Derleme | **electron-vite 5 + Vite 7** | main / preload / renderer için tek yapılandırma, hızlı HMR |
| Arayüz | **React 19 + TypeScript 5.9** | Bileşen tabanlı, tip güvenli |
| Stil | **Tailwind CSS 4** + CSS değişkenli tasarım token'ları | Tema/vurgu/font değişimi tek noktadan |
| Animasyon | **Motion** | Dialog, manşet, onboarding geçişleri |
| Durum | **Zustand** | Küçük, basit global durum |
| Çok dil | **i18next + react-i18next** | Namespace'li JSON dosyaları |
| Erişilebilir bileşenler | **Radix UI** | Menü, popover, tooltip, switch… |
| İkonlar | **Lucide** | Tutarlı, hafif |
| RSS ayrıştırma | **fast-xml-parser** + **iconv-lite** | RSS 2.0 / Atom / RDF; windows-1254 / iso-8859-9 desteği |
| Okuma modu | **@mozilla/readability** + **linkedom** | Firefox'un okuma modu motoru |
| Reklam engelleme | **@ghostery/adblocker-electron** | EasyList tabanlı, oturuma takılır |
| Paketleme | **electron-builder** | NSIS + portable exe, dmg, AppImage/deb, GitHub Releases |
| Test | **Vitest** | Ayrıştırıcı, kümeleme, il etiketleme birim testleri |

> Hexnest .NET/WPF ile yazılmıştı. Bu uygulamanın kalbi "başka web sitelerini uygulama içinde göstermek"
> ve "modern bir haber sitesi arayüzü" olduğu için web teknolojili bir kabuk (Electron) doğru araç.

### 4.2 Süreçler ve iki "host"

Uygulamanın arka ucu (**core**) Electron'dan tamamen bağımsız, saf Node kodudur. Aynı core iki farklı
host'ta çalışır; arayüz her ikisinde de aynı `MastheadApi` sözleşmesiyle konuşur:

```
                    ┌──────────── src/core (saf Node, electron import YOK) ────────────┐
                    │ NewsService: fetch → parse → normalize → dedupe → tag → cluster │
                    │ SettingsStore / LibraryStore (JSON, atomik yazma)               │
                    │ Reader: Readability çıkarma, iframe uygunluk kontrolü           │
                    └───────────────▲───────────────────────────────▲─────────────────┘
                                    │                               │
      ┌──────── Electron host (src/main) ───────┐     ┌──── Web host (src/web) ─────────────┐
      │ pencere, özel başlık çubuğu              │     │ Vite dev sunucusu içinde HTTP API    │
      │ WebContentsView (gömülü haber sayfası)   │     │ /api/*  +  /api/events (SSE)         │
      │ reklam engelleme, bildirimler            │     │ veriler: .masthead-web/ klasörü      │
      └───────────────▲──────────────────────────┘     └───────────────▲──────────────────────┘
                      │ IPC (preload → window.masthead)                │ fetch + EventSource
      ┌───────────────┴────────────────────────────────────────────────┴──────────────────────┐
      │            Renderer (React) — aynı kod, `api` nesnesi host'a göre seçilir             │
      └────────────────────────────────────────────────────────────────────────────────────────┘
```

- Renderer hiçbir zaman haber sitelerine doğrudan istek atmaz (CORS yok, gizlilik); tüm ağ işi core'da.
- Electron: `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`; preload yalnızca tipli API sunar.

### 4.3 Tarayıcı (web) modu — exe kurmadan geliştirme

```bash
npm install
npm run dev:web      # → http://localhost:5173
```

- Uygulamanın tamamı tarayıcıda çalışır: haberler, filtreler, onboarding, ayarlar, kaynak aç/kapat,
  kaydedilenler. Ayarlar proje klasöründeki `.masthead-web/` altına kaydedilir (git'e girmez).
- Arayüz kodu değişince sayfa anında güncellenir (HMR) — tasarım iterasyonu için ideal.
- **Tek fark — haber okuma:** Tarayıcılar, çoğu haber sitesinin başka bir sayfanın içinde
  (iframe) gösterilmesini güvenlik başlıklarıyla engeller. Web modunda dialog önce sitenin iframe'e izin
  verip vermediğini kontrol eder: izin veriyorsa site iframe'de açılır, vermiyorsa haber otomatik olarak
  **Okuma modu**nda (core'un çıkardığı temiz metinle) gösterilir; "Orijinalini yeni sekmede aç" butonu da var.
  Masaüstü uygulamada bu kısıt yoktur (`WebContentsView` gerçek bir tarayıcı sekmesidir).

### 4.4 Klasör yapısı

```
masthead/
├─ src/
│  ├─ core/                 # host'tan bağımsız arka uç (saf Node)
│  │  ├─ backend.ts         # Backend sözleşmesi
│  │  ├─ index.ts           # createBackend()
│  │  ├─ stores/            # settings + library JSON depoları
│  │  ├─ news/              # haber hattı: http, parse, normalize, geo, cluster, service
│  │  └─ reader/            # Readability çıkarma, iframe kontrolü
│  ├─ main/                 # Electron host
│  │  ├─ index.ts           # yaşam döngüsü, tek örnek kilidi
│  │  ├─ window.ts          # ana pencere (özel başlık çubuğu)
│  │  ├─ ipc.ts             # IPC ↔ core köprüsü
│  │  └─ reader/            # WebContentsView, reklam engelleme
│  ├─ web/                  # Web host (Vite eklentisi: HTTP API + SSE)
│  ├─ preload/              # contextBridge
│  ├─ shared/               # main + renderer ortak tipler/sabitler
│  │  ├─ types.ts, ipc.ts, settings.ts, categories.ts
│  │  └─ countries/         # ülke paketleri (tr/…)
│  └─ renderer/             # React uygulaması
│     └─ src/
│        ├─ components/     # ui/ (temel), layout/, news/
│        ├─ features/       # onboarding/, reader/, settings/
│        ├─ pages/          # Home, Category, Breaking, Local, Saved…
│        ├─ stores/  lib/  i18n/locales/{en,tr}/*.json  styles/
├─ tests/                   # vitest + örnek RSS fixture'ları
├─ assets/                  # logo, ekran görüntüleri
├─ build/                   # uygulama ikonları (ico/png)
├─ docs/                    # PLAN.md, ARCHITECTURE.md, SOURCES.md
└─ .github/workflows/       # CI + release
```

---

## 5. Veri Modeli

```ts
Article {
  id            // kanonik URL'nin hash'i
  url, title (tam), summary (tam açıklama, düz metin ≤ 1500), hasDetail, image?
  publishedAt, fetchedAt       // epoch ms
  sourceId, categories[]       // birleşik kategori kimlikleri
  isBreaking, isHeadline       // son dakika / manşet akışından mı
  provinces[], regions[]       // otomatik il/bölge etiketleri
  clusterId?                   // aynı olayı veren haber kümesi
}
StoryCluster { id, articleIds[], leadId, sourceIds[], score, updatedAt }
SourceDef { id, name, homepage, icon, color, kind, language, feeds: FeedDef[] }
FeedDef { url, category, headline?, breaking?, encoding? }
CountryPack { code, language, locale, timeZone, available, sources, regions, provinces, districts, googleNews? }
```

**Birleşik kategoriler:** `top` (manşet), `breaking` (son dakika), `general` (gündem), `national` (Türkiye),
`world`, `politics`, `economy`, `sports`, `technology`, `science`, `health`, `culture`, `entertainment` (magazin),
`lifestyle`, `education`, `automotive`, `travel`, `environment`, `local`, `opinion` (yazarlar).

---

## 6. Haber Toplama Hattı

1. **Zamanlama:** Açılışta önbellek hemen gösterilir → tüm etkin akışlar yenilenir. Sonra ayardaki aralıkla
   (varsayılan 10 dk); son dakika akışları 2 dk'da bir.
2. **Çekme:** Eşzamanlılık sınırı (8), akış başına 15 sn zaman aşımı, `ETag`/`Last-Modified` ile koşullu istek,
   gerçekçi User-Agent. Hata veren akış için üstel geri çekilme (5 → 10 → 20 … dk).
3. **Karakter seti:** HTTP başlığı → XML bildirimi → `FeedDef.encoding`; `windows-1254` / `iso-8859-9` iconv-lite ile.
4. **Ayrıştırma:** RSS 2.0, Atom, RDF/RSS 1.0. Görsel: `enclosure` → `media:content` → `media:thumbnail` →
   `image` alanı → açıklamadaki ilk `<img>`. Tarih: RFC 822, ISO 8601, ofsetsiz tarihler `Europe/Istanbul`.
5. **Normalleştirme:** HTML temizleme (paragraf yapısı korunarak), entity çözme, `utm_*` vb. izleme
   parametrelerini atma, göreli URL'leri mutlaklaştırma, gelecekteki tarihleri düzeltme, özetten başlık
   tekrarını ve "Devamı için tıklayın" gibi kalıpları atma. Açıklama ≈1500 karaktere kadar tam tutulur;
   `content:encoded` tam metni ayrı saklanır (`ArticleDetail`).
6. **Tekilleştirme:** Aynı URL (aynı kaynağın farklı kategori akışları) → tek haber, kategoriler birleşir.
7. **İl/bölge etiketleme:** Başlık + özet üzerinde Türkçe eklere duyarlı eşleştirme
   (`İzmir'de`, `Ankara'nın`, `Trabzonspor` hariç). Belirsiz adlar (Ordu, Tokat, Ağrı, Aydın, Van, Batman)
   yalnızca kesme işaretli ek veya "ili/ilçesi/merkezli" bağlamıyla sayılır. İlçe adları iline eşlenir.
8. **Kümeleme:** 36 saatlik pencerede, Türkçe normalize edilmiş başlık token'ları üzerinde benzerlik
   (Jaccard + ortak özel isimler); farklı kaynaklardan gelenler aynı kümeye girer.
9. **Sıralama (manşet puanı):** `kaynak sayısı` × ağırlık + `manşet akışında olma` bonusu + görsel bonusu,
   zamanla üstel azalma (yarı ömür ~6 saat).
10. **Saklama:** Son 72 saat / en fazla 6000 haber; disk önbelleği her yenilemeden sonra yazılır.
11. **Görsel zenginleştirme:** Görseli olmayan ve ekranda görünen haberler için sayfanın `og:image`'ı
    tembel olarak çekilir (eşzamanlılık 4, önbellekli).

---

## 7. Kaynaklar — Türkiye paketi

> Tam ve doğrulanmış liste: [`docs/SOURCES.md`](SOURCES.md) · Kod: `src/shared/countries/tr/sources.ts`

<!-- SOURCES_TABLE -->

Kaynak eklemek için `sources.ts` içine yeni bir `SourceDef` eklemek yeterlidir. Kaynaklar farklı yayın
çizgilerinden dengeli seçilmiştir; kullanıcı dilediğini kapatabilir.

---

## 8. Çoklu Ülke

- Her ülke bir **ülke paketi**: kaynaklar, bölgeler, il/eyaletler, saat dilimi, içerik dili.
- Paketi olmayan ülkeler için **Google News RSS** yedeği (ülkenin `hl/gl/ceid` baskısıyla
  manşetler + konu bölümleri) — böylece seçilen her ülke ilk günden çalışır.
- Ülke değişince akışlar ve önbellek ülkeye göre ayrılır (`cache/news-<ülke>.json`).
- Arayüz dili ve içerik dili bağımsızdır (ör. İngilizce arayüz + Türkçe haberler).

---

## 9. Güvenlik ve Gizlilik

- Hesap, telemetri, analitik **yok**. Tek ağ trafiği: haber akışları, haber sayfaları, görseller,
  (açıksa) reklam engelleme listeleri.
- Gömülü görünüm ayrı bir oturumda (`persist:reader`): `sandbox`, `contextIsolation`, Node erişimi yok;
  indirmeler, bildirim/konum/kamera izinleri reddedilir; `http(s)` dışındaki şemalar engellenir.
- Renderer CSP ile kilitli; okuma modu HTML'i DOMPurify ile temizlenir.
- Ayarlar `%APPDATA%/Masthead/` (Windows), `~/Library/Application Support/Masthead/` (macOS) altında.

---

## 10. Kalite

- **Birim testleri:** RSS/Atom/RDF ayrıştırma (gerçek fixture'lar), karakter seti, tarih, il etiketleme,
  kümeleme, ayar birleştirme.
- **Tip kontrolü + lint** her commit'te (CI).
- **Görsel kontrol:** Web önizleme modunda açık/koyu tema ekran görüntüleri; uygulamanın kendi
  `--screenshots` modu README görselleri üretir.
- **Performans:** 6000 haberde filtreleme < 16 ms; sanal listeler; görseller tembel yüklenir.

---

## 11. Yol Haritası

### Faz 0 — Planlama ✅
- [x] Kaynak araştırması ve akış doğrulama
- [x] Teknoloji seçimi, mimari, veri modeli
- [x] İsim, logo, renk ve font kimliği
- [x] Bu plan

### Faz 1 — Temel (MVP) ✅ (2026-09-23)
- [x] Proje iskeleti: electron-vite, TypeScript, Tailwind, ESLint/Prettier, Vitest
- [x] Tasarım sistemi: token'lar, açık/koyu tema, 5 vurgu rengi, temel bileşenler
- [x] i18n altyapısı: `en` + `tr`, namespace'li JSON
- [x] Ayarlar deposu (yerel JSON) + tipli IPC köprüsü
- [x] Onboarding: dil, tema, ülke, ilgi alanları, şehir
- [x] Türkiye kaynak paketi (doğrulanmış akışlar) + 81 il / 7 bölge verisi
- [x] Haber hattı: çekme, karakter seti, ayrıştırma, normalleştirme, tekilleştirme, önbellek
- [x] İl/bölge etiketleme ve hikâye kümeleme (ilk sürüm)
- [x] Uygulama kabuğu: özel başlık çubuğu, kenar çubuğu, üst çubuk, sayfa yönlendirme
- [x] Ana sayfa: manşet, son dakika bandı, son haberler, kategori bölümleri
- [x] Tam başlık + tam özet gösterimi, kart içinde "devamını gör", Gündem Özeti (kümelenmiş hikâyeler)
- [x] Görseller: RSS görseli + `og:image` zenginleştirme, zarif yer tutucular
- [x] Kategori / Son dakika / Sana özel / Yerel / Kaynak sayfaları
- [x] Filtreler: zaman, kaynak, bölge/il, sıralama, görselli, arama
- [x] Haber dialogu: gömülü web görünümü, Esc ile kapanma, yükleme çubuğu, geri/ileri
- [x] Okuma modu (Readability) ve reklam engelleme
- [x] Kaydedilenler ve geçmiş
- [x] Ayarlar sayfası: görünüm, tipografi, dil, bölge, kaynaklar, okuma, bildirimler
- [x] Kaynaklar sayfası: her siteyi tek tek aç/kapat, kalıcı kayıt
- [x] Web modu (`npm run dev:web`): tarayıcıda tam çalışan uygulama, localhost üzerinden
- [x] Logo ve uygulama ikonları

### Faz 2 — Okuma deneyimi ve cila
- [ ] Komut paleti (Ctrl+K) ve klavye kısayolları (J/K gezinme, R yenile, S kaydet)
- [x] Son dakika masaüstü bildirimleri (Faz 1 içinde yapıldı)
- [x] `og:image` zenginleştirme iyileştirmeleri, görsel önbelleği (Faz 1 içinde yapıldı)
- [ ] Kümelenmiş hikâye sayfası ("Bu haberi veren kaynaklar")
- [ ] Anahtar kelime susturma
- [x] Kaynak sağlık ekranı (Kaynaklar sayfasında akış durumu)
- [ ] Erişilebilirlik turu (klavye, ekran okuyucu, kontrast)

### Faz 3 — Yerel ve kişisel
- [x] Yerel kaynaklar (33 ilde yerel gazete) ve 81 il için il bazlı akışlar (Faz 1 içinde yapıldı)
- [ ] "Sana özel" sıralaması (ilgi alanı + okuma geçmişi, tamamen yerel)
- [ ] Hava durumu ve döviz/altın mini kartları (opsiyonel)

### Faz 4 — Çoklu ülke ve dil
- [x] 2026-09-23 · Ülke paketi mimarisinin genelleştirilmesi (il paketi olmayan ülkeler, `hasLocalNews`,
      ülke bazlı akış doğrulama, paket testleri)
- [x] 2026-09-23 · İlk paketler: ABD, Hindistan, Birleşik Krallık, Almanya, Brezilya (67 kaynak, 195 akış)
- [x] 2026-09-23 · Yeni arayüz dilleri: Almanca ve Portekizce (Brezilya)
- [x] 2026-09-23 · Hintçe arayüz (5. dil); her ülkenin kaynakları yalnızca kendi dilinde
- [x] 2026-09-23 · Paketler genişletildi: 532 kaynak / 1.332 akış (ABD 52, UK 29, DE 39, BR 42, IN 15 ulusal)
- [ ] Google News yedeği (paketi olmayan ülkeler için)
- [ ] Sonraki paketler: Fransa, İspanya/Meksika, Azerbaycan…; yeni diller (fr, es, ar — RTL desteğiyle)
- [x] 2026-09-23 · Ülke bazlı eyalet/bölge etiketleme ve yerel haber: ABD, Hindistan, Birleşik Krallık,
      Almanya, Brezilya (`places.ts` + `local.ts`, `FeedDef.region`, `localUnit`, Hintçe geo etiketleme)

### Faz 5 — Yayın
- [x] electron-builder: Windows NSIS (x64 + arm64) + portable; macOS dmg ve Linux AppImage/deb yapılandırıldı (CI üretir)
- [x] GitHub Actions: CI (lint, typecheck, test, build) + etiketle yayın (`release.yml`)
- [ ] Otomatik güncelleme (electron-updater, GitHub Releases)
- [x] README (EN + TR), ekran görüntüleri, CONTRIBUTING, SECURITY, CHANGELOG, MIT lisansı
- [ ] Kod imzalama (SignPath Foundation / Azure Trusted Signing) — Akıllı Uygulama Denetimi için

---

## 12. Riskler ve Önlemler

| Risk | Önlem |
| --- | --- |
| RSS adresleri değişir / kapanır | Kaynak sağlık takibi, geri çekilme, tek dosyada kolay güncelleme, CI'da akış doğrulama betiği |
| Bazı siteler bot koruması / ağır reklam | Gerçekçi UA, gömülü görünümde reklam engelleme, Okuma modu |
| Karakter seti bozulmaları | Başlık/XML/manuel encoding zinciri + testler |
| Yanlış il etiketi (Ordu = ordu) | Belirsiz adlar için sıkı kural, ilçe eşlemesi, testler |
| Telif / yayıncı ilişkisi | Yalnızca başlık + kısa özet gösterilir, haber daima yayıncının kendi sayfasında okunur |
| Electron paket boyutu (~90 MB) | Kabul edilebilir; asar + sıkıştırma, gereksiz locale'leri atma |
