# Masthead — İlerleme Günlüğü (Handoff)

> **Bu dosya projenin "kaldığımız yer" kaydıdır.** Başka bir bilgisayardan / yeni bir oturumdan devam ederken
> önce burayı oku. Her iş parçası bittiğinde ilgili satır `[x]` yapılır ve tarih yazılır; oturum sonunda
> "Son durum" ve "Sıradaki adım" güncellenir.
>
> Ürün ve mimari planı: [`PLAN.md`](PLAN.md) · Kaynak listesi: [`SOURCES.md`](SOURCES.md)

---

## Son durum

- **Tarih:** 2026-09-23
- **Aktif faz:** Faz 1 + Faz 4'ün ilk adımı tamamlandı; **v0.2.0 yayında** (depo public, site yayında)
- **Durum:** Uygulama masaüstünde (Electron) ve tarayıcıda (`npm run dev:web`) uçtan uca çalışıyor.
  206 kaynak (6 ülke), 317 birim testi, `npm run selftest` 11/11 (v0.1.0'da), tasarım ve kod
  incelemeleri yapıldı, Windows paketleri (Windows PC'de) `release/0.1.0/` altında. Kod GitHub'da
  (https://github.com/ahmetcaglayan/masthead). Kalan: v0.1.0 Release'i yayınlamak (sahibinin onayıyla).
  Geliştirme artık macOS'ta da sürüyor: `npm install` + testler + typecheck + lint yeşil, tarayıcı modu
  (`npm run dev:web`) çalışıyor. **Bu Mac'e uygulama kurulmaz** — doğrulama yalnızca tarayıcı modundan.
  **2026-09-23 akşamı:** Faz 4'ün ilk adımı yapıldı — uygulama artık 6 ülke (Türkiye, ABD, Hindistan,
  Birleşik Krallık, Almanya, Brezilya) ve 4 arayüz dili (en, tr, de, pt) ile geliyor.

## Devralma notu (2026-09-23, oturum sonu)

**Yapılan son iş:** Hindistan paketine Hintçe kaynaklar + arayüze Hintçe dili.

- `src/shared/countries/in/sources.ts` — 6 Hintçe kaynak eklendi (अमर उजाला, दैनिक भास्कर, NDTV इंडिया,
  News18 हिंदी, आज तक, BBC News हिंदी; 23 akış) + mevcut 10 İngilizce kaynak. **59/59 akış doğrulandı.**
- `in/index.ts`: `language: 'hi'`, `languages: ['hi','en']`, `locale: 'hi-IN'`; `CountryPack.languages` alanı
  eklendi (`countries/types.ts`), paket testi buna göre güncellendi + yeni test: her ülkenin kendi ana
  dilinde en az 3 varsayılan açık kaynağı olmalı (hepsi geçiyor — Hindistan dışında sorun yoktu).
- `src/core/news/categories.ts`: Hintçe bölüm kelimeleri (desh, duniya, khel, manoranjan, vyapar…).
- Arayüz: `UI_LANGUAGES`'e `hi`, `LOCALES`'e `hi-IN`, ayarlar/onboarding dil listelerine हिन्दी,
  `notifications.ts` LABEL'a `ब्रेकिंग`.
- `src/renderer/src/i18n/locales/hi/` — 5 namespace yazıldı; **iki denetçi (anahtar eşliği + ana dil
  akıcılığı) çalışıyordu**, oturum bitmeden sonuçları gelmemiş olabilir.

**Sıradaki somut adımlar:**
1. `npm test && npm run typecheck && npm run lint` (hi locale anahtar eşliği için
   `tests/renderer/...` yok; parity'yi denetçi betiği yaptı — gerekirse elle karşılaştır).
2. Tarayıcıda doğrula: Ayarlar → ülke **Hindistan**, dil **हिन्दी** → Hintçe haberler + Hintçe arayüz.
3. Commit + push; ardından `v0.3.0` etiketi (Release iş akışı paketleri üretir, taslağı yayına al).
   **Dikkat:** electron-builder taslağı GitHub'da "untagged-..." URL'siyle görünür; `/releases/edit/<tag>`
   adresine gidersen **ikinci, boş bir sürüm** oluşturursun (v0.2.0'da bu oldu). Taslağı Releases
   listesindeki kalem simgesinden aç.
4. `README.hi.md` (dört README'nin dil satırına `· [हिन्दी](README.hi.md)` eklenecek; şimdilik çıkarıldı).
5. İstenirse açılış sayfasının (site/index.html) diğer dillere çevrilmesi.

**Sayılar (güncel):** 212 kaynak, 762 akış, 6 ülke, 5 arayüz dili (en, tr, de, pt, hi).

**Ortam:** Kurumsal TLS proxy yüzünden Node sertifikayı tanımıyor →
`NODE_EXTRA_CA_CERTS=~/.masthead/corporate-ca.pem` ile çalıştır (dev sunucusu, verify:feeds, her şey).
`npm run verify:feeds` Node 22+ ister; bu Mac'te Node 20 olduğu için `npx vite-node scripts/verify-feeds.ts -- in`
şeklinde çalıştır. Bu bilgisayara uygulama kurulmaz; doğrulama yalnızca `npm run dev:web` üzerinden.

## Sıradaki adım

1. ~~GitHub deposu + push~~ ✅ · ~~depo public + v0.2.0 Release~~ ✅ · ~~açılış sayfası (GitHub Pages)~~ ✅
2. Faz 2'ye başla (bkz. PLAN.md): komut paleti, kısayollar, hikâye sayfası, kelime susturma, erişilebilirlik turu.
3. Alan adı alınınca Settings → Pages → Custom domain (site `site/` klasöründen otomatik yayımlanıyor).
4. Otomatik güncelleme (electron-updater) ve kod imzalama; sonraki ülke paketleri (Fransa, İspanya/Meksika).

---

## Nasıl devam edilir (yeni bilgisayarda)

```bash
git clone https://github.com/ahmetcaglayan/masthead.git
cd masthead
npm install              # Electron binary'si de iner
npm run dev:web          # tarayıcı modu → http://localhost:5173  (exe gerekmez)
npm run dev              # masaüstü uygulaması (Electron)
npm test                 # birim testleri
npm run typecheck        # tip kontrolü
```

Gereksinimler: Node.js 22.12+ (geliştirmede 24 kullanıldı), npm 10+. Windows'ta exe kurulumu yasaksa yalnızca
`npm run dev:web` yeterli — uygulamanın tamamı tarayıcıda çalışır (haber okuma iframe/Okuma modu ile).

---

## Faz 0 — Planlama ✅

- [x] 2026-09-23 · Hexnest incelendi, teknoloji seçimi yapıldı (Electron 44 + React 19 + TS + Tailwind 4)
- [x] 2026-09-23 · İsim: **Masthead**, logo (`assets/logo.svg`) ve ikon üretim betiği (`npm run icons`)
- [x] 2026-09-23 · `docs/PLAN.md` — ürün, UX, mimari, veri modeli, haber hattı, yol haritası
- [x] 2026-09-23 · Türk haber sitelerinin RSS akışları paralel ajanlarla curl ile doğrulandı
- [x] 2026-09-23 · Google News RSS (ülke/konu/şehir), gömülü görünüm, Readability, reklam engelleme araştırması
- [x] 2026-09-23 · Kullanıcı istekleri plana eklendi: kaynak aç/kapat (kalıcı), tarayıcı (web) modu,
      tam başlık + tam özet + görseller ("tıklamadan gündemi takip"), bu ilerleme günlüğü

## Faz 1 — Temel (MVP)

### İskelet ve sözleşmeler
- [x] 2026-09-23 · `package.json`, electron-vite, TypeScript (node/web), ESLint, Prettier, electron-builder yapılandırması
- [x] 2026-09-23 · Bağımlılıklar kuruldu (Electron 44.4, Vite 7, React 19.3, Tailwind 4.3, i18next, fontlar…)
- [x] 2026-09-23 · Ortak tipler: `src/shared/types.ts`, `categories.ts`, `settings.ts` (varsayılanlar + doğrulayan birleştirme)
- [x] 2026-09-23 · API sözleşmesi: `src/shared/ipc.ts` (`MastheadApi` — Electron ve web modu aynı arayüz)
- [x] 2026-09-23 · Core sözleşmesi: `src/core/backend.ts`, `src/core/news/types.ts`, HTTP/charset yardımcısı `src/core/net.ts`
- [x] 2026-09-23 · Tasarım token'ları: `src/renderer/src/styles/globals.css` (açık/koyu, 5 vurgu rengi, fontlar)
- [x] 2026-09-23 · Renderer çekirdeği: `lib/api.ts`, `lib/appearance.ts`, `i18n/index.ts`, `stores/*`, `main.tsx`

### Modüller
- [x] 2026-09-23 · Türkiye paketi: kaynaklar, 81 il, 7 bölge, ilçeler, `docs/SOURCES.md`, `npm run verify:feeds`
- [x] 2026-09-23 · Core / haber hattı: fetch, parse (RSS/Atom/RDF), normalize, il etiketleme, kümeleme, servis, önbellek, testler
- [x] 2026-09-23 · Core / depolar + okuma modu + `createBackend()`
- [x] 2026-09-23 · Electron host: pencere, IPC, WebContentsView okuyucu, reklam engelleme, bildirimler, preload
- [x] 2026-09-23 · Web host: Vite eklentisi (HTTP API + SSE), tarayıcı API istemcisi
- [x] 2026-09-23 · Arayüz temeli: bileşen kütüphanesi, kabuk (başlık çubuğu, kenar çubuğu), yönlendirme, `common` çevirileri
- [x] 2026-09-23 · Sayfalar: Ana sayfa (manşet, son dakika bandı, son haberler), Gündem Özeti, kategori, yerel, arama, kaydedilenler…
- [x] 2026-09-23 · Haber dialogu: gömülü web / iframe / Okuma modu, Esc ile kapanma
- [x] 2026-09-23 · Onboarding, Ayarlar, Kaynaklar sayfası (aç/kapat)
- [x] 2026-09-23 · Entegrasyon (ilk tur): typecheck + lint + 228 test + build yeşil; web modunda 6000 gerçek haberle çalışıyor
- [x] 2026-09-23 · QA düzeltmeleri (elle): bozuk RSS görsellerinde og:image yedeği, Posta'nın birleşik görsel adresleri,
      gizli sekmede takılan sayfa geçişleri (CSS animasyonuna geçildi)
- [x] 2026-09-23 · QA düzeltmeleri (iş akışı `masthead-fix-polish-release`):
      - kaynak aç/kapat tek model (`isSourceEnabled`/`setSourceEnabled`): yeni kurulumda 93/136 kaynak açık
      - resmi ilan / mahkeme duyuruları ayıklanıyor (13.083 haberde 100 ilan, hatalı eleme yok)
      - sıkı "son dakika": başlık işareti **veya** son dakika akışı + 1 saat içinde ≥2 kaynak (2 saatte 47 → 15)
      - büyük harfli başlıklar küme manşeti olmuyor; akış sağlığı: 536 akış, 507 sağlam, 0 bozuk
      - sayfa geçişleri 21–56 ms (önce ana sayfa 276 ms); erişilebilirlik; `window.__mastheadAutomation` kancası
      - testler 228 → 249
- [x] 2026-09-23 · Electron `--screenshots` (`npm run screenshots`) ve `--selftest` (`npm run selftest`) modları —
      self-test 11/11: 127/127 akış, geçişler 15–51 ms, gömülü sayfa 2–3 sn, Esc 220 ms, okuma modu 0,3 sn
- [x] 2026-09-23 · Entegrasyon (ikinci tur): typecheck + lint + 249 test + build yeşil; web modu uçtan uca
      (2937 haber, 127/127 akış, ilan başlığı 0, isteğe bağlı kaynak açılınca akışları çekiliyor);
      `--screenshots` tam set (EN/TR × açık/koyu, 56 PNG) — ekran görüntüsü modu seçili ilin akışlarını bir kez
      çekiyor ve okunan haberleri temizliyor; hiç çekilmemiş akış artık "bozuk" sayılmıyor
- [x] 2026-09-23 · Önbellek klasörü `userData/cache` Windows'ta Chromium'un `Cache` klasörüyle çakışıyordu →
      `userData/news-cache` (`src/main/paths.ts`)
- [x] 2026-09-23 · Tasarım incelemesinden çıkan core düzeltmeleri: rutin günlük içerik (Resmi Gazete özeti, namaz
      vakitleri, hava durumu, altın/döviz, kesintiler, nöbetçi eczane…) asla "son dakika" olmuyor ve manşet puanı
      ×0,3; kaynağın "…" ile kestiği başlıklar küme manşeti olmuyor (testler 249 → 254)

- [x] 2026-09-23 · Rutin haber listesi tek yerde: `src/shared/headlines.ts` (core + arayüz ortak); koyu tema
      pencere/okuyucu arka planları yeni sıcak tonlarla eşlendi

### Faz 4 — Çoklu ülke (ilk adım)
- [x] 2026-09-23 · Ülke seçimi verilerle yapıldı (internet kullanıcısı + çevrimiçi haber tüketimi):
      **ABD, Hindistan, Birleşik Krallık, Almanya, Brezilya** — 3'ü mevcut İngilizce arayüzle çalışıyor,
      Almanca ve Portekizce arayüz eklendi
- [x] 2026-09-23 · 5 ülke paketi: 67 kaynak / 195 akış. Adaylar önce toplu doğrulandı (152 + 77 aday),
      çalışmayan/eski olanlar (AP, USA Today, CNN, Telegraph, ITV, Scroll.in, The Wire, Deccan Herald,
      eski Estadão yolları) elendi; ikonlar da HTTP ile doğrulandı
- [x] 2026-09-23 · `npm run verify:feeds` tüm paketleri tarıyor (ülke kodu ile süzülebiliyor);
      yeni paketlerde **186 akış → 185 ok, 0 hata** (tek eskimiş akış CBS health çıkarıldı)
- [x] 2026-09-23 · Arayüz: 4 dil (en, tr, de, pt) — 5 namespace × 2 yeni dil tam çevrildi, anahtar eşliği
      betikle doğrulandı; ülke bayrakları (US, GB, IN, DE, BR) SVG olarak çizildi; dil seçimi açılır menüye
      dönüştü; ili olmayan ülkelerde Yerel sayfası, şehir sorusu ve şehir satırı gizleniyor
- [x] 2026-09-23 · Çekirdek: son dakika işaretlerine "BREAKING/Eilmeldung/URGENTE/Plantão" eklendi, başlık
      büyük harfe çevirme artık paketin diline göre (`cleanTitle(raw, locale)`)
- [x] 2026-09-23 · `tests/shared/countries.test.ts` (32 test): benzersiz kimlik/URL, geçerli kategori,
      https, manşet akışı, dil eşliği, il tutarlılığı
- [x] 2026-09-23 · Tarayıcıda doğrulandı: Almanya 1.123 haber (14 kaynak) + tam Almanca arayüz,
      Brezilya 1.012 haber (13 kaynak) + tam Portekizce arayüz

### Doğrulama
- [x] 2026-09-23 · Ekran görüntüleriyle (EN/TR × açık/koyu, 56 PNG) 3 açılı tasarım incelemesi (görsel, haber UX,
      Türkçe/İngilizce metin) → 45 bulgu, hepsi uygulandı: ana sayfada manşet + canlı "Son Haberler" yan yana,
      özetler kırpılmıyor, Son Haberler/Son Dakika zaman çizelgesi düzeni, ayrı son dakika rengi, sıcak koyu tema,
      AA kontrast, büyük harf başlıkları yumuşatma, "diğer kaynaklar" sıralaması, sayfa bazlı filtreler, okuyucuda
      "Diğer kaynaklarda", onboarding'in canlı ön sayfa önizlemesiyle bitmesi, Türkçe'de tutarlı "siz" (testler → 270)
- [x] 2026-09-23 · Electron self-test: gömülü okuyucu, Esc, okuma modu, reklam engelleme, sayfa geçiş süreleri
      (`npm run selftest` 11/11, ~25 sn)
- [x] 2026-09-23 · Kod incelemesi bulgularının düzeltmeleri: Okuma modunda `srcset` yalnızca mutlak http(s)
      (paketli uygulamada `//host` → `file://host` UNC isteği), çekirdek çıkarıcı HTML yorumlarını siliyor;
      okuyucuda jestsiz `window.open` yok sayılıyor, `window.close()` görünümü düşürüyor (yeniden yükle ile
      dönüyor), `beforeunload` kapanışı/geçişi engellemiyor, gizli sayfa sessiz; doğru etiketli UTF-8 birkaç bozuk
      baytla 1254'e dönmüyor; CNN Türk (İstanbul) ve Investing (UTC) saat dilimi; kapatılan kaynağa uçuştaki
      yenilemeden ETag yazılmıyor; aynı başlık 6 saatten uzak aralıkla ayrı haber; boş akış hata değil;
      çevrimdışıyken geri çekilme yok ve "güncellendi" zamanı ilerlemiyor; son dakika turunda aralık değişikliği
      uygulanıyor; "Güneydoğu Asya"/yabancı ülkeli deniz adları bölge değil; yeniden okunan haber Geçmiş'te üste;
      bağlantı ve "Aa" durumları sızmıyor; macOS'ta pencere kapalıyken bildirim tıklaması pencere açıyor; web
      modunda açılış hatası boş sayfa bırakmıyor (testler 270 → 285, self-test 11/11)
- [x] 2026-09-23 · Kod incelemesi (güvenlik + core + uygulama; 3 bulucu, her bulguya 2 bağımsız doğrulayıcı):
      29 bulgu → 18 doğrulandı ve düzeltildi (yukarıdaki madde), 11 reddedildi
- [x] 2026-09-23 · Arayüz düzeltmeleri (tarayıcı modunda ölçülerek): daraltılmış kenar çubuğunda ikonların
      arka planı/hover kutusu 5,5 px sola kaymıştı (sağda ayrılan kayan çubuk payı + `px-[15px]`), ikon da
      kutusunun sağına yaslanıyordu → daraltılmışken kayan çubuk payı kalktı, düğmeler `justify-center px-0`,
      alt liste simetrik `px-3`, etiket `w-0` (kutu 12–59, ikon merkezi 35,5 = ray merkezi); ayrıcı çizgi
      ortalandı. Kart odak halkası içeriğe değiyordu (kartların iç boşluğu yok) → `outline-offset` 4 → 7 px
- [x] 2026-09-23 · macOS geliştirme ortamı: bağımlılıklar kuruldu, `npm test` 285/285, `npm run typecheck`
      ve `npm run lint` temiz, `npm run dev:web` → http://localhost:5173 (Electron/exe bu bilgisayarda çalıştırılmaz;
      masaüstü doğrulaması Windows PC'de ya da CI'da)
- [x] 2026-09-23 · Manşet başlığı artık fotoğrafın altında (Türk sitelerinin görsellerine gömülü yazılarla
      çakışmasın); liste/zaman çizelgesinde görseli olmayan haberde boş logo kutusu yerine görsel alanı kalkıyor

### İlk sürüm (v0.1.0)
- [x] 2026-09-23 · LICENSE, README (EN/TR), CHANGELOG, CONTRIBUTING, SECURITY, CI + Release iş akışları
- [x] 2026-09-23 · Windows paketleri (`release/0.1.0/`): `Masthead-0.1.0-win-x64.exe` (109 MB),
      `Masthead-0.1.0-win-arm64.exe` (103 MB), `Masthead-0.1.0-portable.exe` (109 MB); paketlenmiş uygulama
      içeriğinin self-test'i 11/11 (bu PC'de Akıllı Uygulama Denetimi imzasız `Masthead.exe`'yi bazen engelliyor —
      aynı paket resmi Electron exe'siyle test edildi)
- [x] 2026-09-23 · README ekran görüntüleri (`docs/images/`, 7 görsel) ve README'de arm64 + Akıllı Uygulama Denetimi notu
- [x] 2026-09-23 · Git deposu (`main`), ilk commit, `origin` = `https://github.com/ahmetcaglayan/masthead.git`
- [x] 2026-09-23 · GitHub'a push: https://github.com/ahmetcaglayan/masthead (`main`); tüm bağlantılar küçük harfli
      depo adına çevrildi
- [x] 2026-09-23 · v0.1.0 yerine **v0.2.0 yayınlandı**: depo public, açıklama + 17 konu etiketi, GitHub Pages
      sitesi (https://ahmetcaglayan.github.io/masthead/), `v0.2.0` etiketi ve 16 dosyalık Release
      (Windows x64/arm64/portable, macOS arm64/x64 dmg, Linux AppImage/deb) — indirme linkleri doğrulandı
- [ ] (İsteğe bağlı) Kod imzalama: SignPath Foundation (açık kaynak için ücretsiz) veya Azure Trusted Signing —
      Akıllı Uygulama Denetimi engelini kaldırır

## Faz 2+ 

Bkz. [`PLAN.md` → Yol Haritası](PLAN.md#11-yol-haritası).

---

## Kararlar günlüğü

| Tarih | Karar | Neden |
| --- | --- | --- |
| 2026-09-23 | Electron (Hexnest'teki .NET yerine) | Harici haber sayfalarını uygulama içinde göstermek (`WebContentsView`) ve web tabanlı modern arayüz |
| 2026-09-23 | Arka uç `src/core` saf Node, iki host (Electron + web) | Şirket bilgisayarında exe olmadan tarayıcıdan test/geliştirme |
| 2026-09-23 | TypeScript 5.9, Vite 7 | electron-vite 5 henüz Vite 8'i desteklemiyor; TS 7 araç uyumu belirsiz |
| 2026-09-23 | Varsayılan fontlar Inter / Newsreader / Literata | Ekran okunabilirliği, haber için tasarlanmış serif, uzun okuma konforu |
| 2026-09-23 | İl akışları yalnızca seçili il için çekilir | 81 il akışını her döngüde çekmemek için |
| 2026-09-23 | Özet ≈1500 karaktere kadar tam, tam metin `news.detail()` ile isteğe bağlı | Tıklamadan okuma + küçük anlık görüntü |
| 2026-09-23 | Okuyucuda `window.open` yalnızca kullanıcı girdisinden (tık/tuş) sonraki 1 sn içinde izlenir | Electron'da açılır pencere engelleyici yok; reklamlar haberi değiştirmesin |
| 2026-09-23 | UTF-8 → windows-1254 yedeği yalnızca ASCII dışı karakterlerin çoğu bozuksa | Birkaç kesik bayt (CMS kırpması) tüm akışı bozmasın |

## Bilinen sorunlar / notlar

- **Kurumsal HTTPS denetimi (Mac):** Ağdaki vekil sunucu TLS'i kendi kök sertifikasıyla yeniden imzalıyor;
  Node bu sertifikayı tanımadığı için tüm akışlar `SELF_SIGNED_CERT_IN_CHAIN` ile düşüyor ve uygulama boş kalıyor.
  Çözüm: kök sertifika `~/.masthead/corporate-ca.pem` dosyasına çıkarıldı, sunucu
  `NODE_EXTRA_CA_CERTS=~/.masthead/corporate-ca.pem npm run dev:web` ile açılıyor (2.901 haber geldi).
  Kalıcı hale getirmek için bu değişken kabuk profiline ya da `.claude/settings.local.json` içine eklenmeli
  (README'ye iki dilde not düşüldü).
- Sahibinin Mac'inde **uygulama/exe kurulmaz ve Electron çalıştırılmaz**; geliştirme yalnızca tarayıcı modundan
  (`npm run dev:web`) takip edilir. `npm run dev`, `selftest`, `screenshots`, `dist:*` bu makinede kullanılmaz.
- Windows PowerShell 5.1'in `Get-Content`/`Set-Content` komutları UTF-8 dosyalardaki Türkçe karakterleri bozar;
  dosya düzenlemede kullanılmamalı.
- Sürümler imzasız: SmartScreen "Yine de çalıştır" ile geçilir; **Akıllı Uygulama Denetimi** açık PC'lerde
  (bu geliştirme PC'si dahil) imzasız exe engellenebilir. `npm run dist:win` bu yüzden ara sıra "spawn UNKNOWN"
  ile düşebilir — yeniden çalıştırmak genelde yeter. GitHub Actions runner'larında bu sorun yok.
- `npm run screenshots` → `assets/screenshots/` (git'e girmez); README görselleri `docs/images/`'a elle kopyalanır.
- Web modunun verileri `.masthead-web/` altında (git'e girmez); sıfırlamak için klasörü silmek yeterli.
- Reddedilen inceleme bulguları (bilinçli olarak ertelendi): web modunda DNS rebinding'e karşı tam SSRF koruması,
  Electron fuses, ana pencere oturumu için izin işleyicileri, büyük sayfalarda okuma modunun ana süreçte çalışması.
