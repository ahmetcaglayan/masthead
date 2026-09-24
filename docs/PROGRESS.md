# Masthead — İlerleme Günlüğü (Handoff)

> **Bu dosya projenin "kaldığımız yer" kaydıdır.** Başka bir bilgisayardan / yeni bir oturumdan devam ederken
> önce burayı oku. Her iş parçası bittiğinde ilgili satır `[x]` yapılır ve tarih yazılır; oturum sonunda
> "Son durum" ve "Sıradaki adım" güncellenir.
>
> Ürün ve mimari planı: [`PLAN.md`](PLAN.md) · Kaynak listesi: [`SOURCES.md`](SOURCES.md)

---

## Son durum

- **Tarih:** 2026-09-24
- **Aktif faz:** Faz 1–4 tamamlandı; **v0.4.0 yayında** (2026-09-23, otomatik güncellemeli ilk sürüm). Faz 2 ve 3
  (komut paleti, hikâye sayfası, kelime susturma, kişisel "Size Özel", Piyasalar sayfası, hava durumu ve
  erişilebilirlik turu — hepsi bitti). **v0.5.0 (2026-09-24):** Fransa + Fransızca arayüz, diğer beş ülkenin
  kaynakları iki katına yakın, macOS ad-hoc imza.
- **Durum:** Uygulama masaüstünde (Electron) ve tarayıcıda (`npm run dev:web`) uçtan uca çalışıyor.
  **955 kaynak, 2.242 akış, 7 ülke, 6 arayüz dili (en, tr, de, pt, hi, fr); 410 birim testi yeşil.** Her ülkenin
  kaynakları yalnızca o ülkenin dilinde; her ülkede yerel haber var (şehir / eyalet / Bundesland / yöre / département).
  Kod GitHub'da (https://github.com/ahmetcaglayan/masthead). Geliştirme macOS'ta sürüyor:
  **Bu Mac'e uygulama kurulmaz** — doğrulama yalnızca tarayıcı modundan.

## Devralma notu (2026-09-24)

- [x] 2026-09-24 · **v0.5.0 yayınlandı:** 4 commit (macOS ad-hoc imza, Fransa, beş ülkenin kaynak artışı, sürüm) →
  `v0.5.0` etiketi → Release iş akışı #6 başarılı (~3 dk) → taslak Releases listesindeki kalemden
  (`releases/edit/untagged-…`) Chrome ile açılıp notlarla yayınlandı (Latest). 14 derleme dosyası + 2 kaynak
  arşivi; `releases/latest/download/…` bağlantıları ve `latest*.yml` (0.5.0) doğrulandı. macOS iş günlüğünde iki
  mimari de `identityName=-` (ad-hoc) ile imzalandı; noter onayı (notarization) yok, beklendiği gibi.

**Yapılan son iş:** v0.5.0 = Fransa paketi + Fransızca arayüz + diğer beş ülkenin kaynak artışı (sahibinin isteği:
"fransızcayı bitirince 0.5 olarak yayınlama diğer bölgelerin rss yayınlarını da arttır öyle yayınla"). Sahibi
şimdilik başka yeni dil/ülke istemiyor (Arapça hiç yok).

- **Diğer ülkeler (her ülke için bir ajan, sahibinin izniyle; ülke başına 250–300 akış yeter denince durduruldu):**
  ABD 176/240 → 227/299 (ulusal 52 → 104), Hindistan 19/108 → 48/263 (ulusal 15 → 40; 8 gazetenin eyalet sayfaları,
  23 eyalet), İngiltere 68/179 → 139/251 (ulusal 29 → 71, 67 bölge gazetesi), Almanya 75/157 → 154/249 (ulusal
  39 → 99), Brezilya 58/130 → 130/221 (ulusal 42 → 95, 34 bölge gazetesi). `verify:feeds us in gb de br --all`:
  1.285 akış, ağ kopmasıyla düşen 16'sı tekrarda ok; ölü iki akış çıkarıldı (KING 5 boş, Deshbandhu 44 gün eski).
  Hindistan'a eklenen 29 kaynağın hepsinin başlıkları Devanagari (denetlendi). README/site/SOURCES.md'deki eski
  sayılar düzeltildi (İngiltere README'de 161 yazıyordu, pakette 179 vardı).

- **Fransa:** 121 kaynak / 423 akış (70 ulusal + 51 yerel). 101 département (Türkiye'nin plakası gibi numaralı:
  01–95, 2A/2B, 971–976), 13 bölge + Outre-mer. Yerel: France 3 Régions'ın 96 département akışı, ici'nin (eski
  France Bleu) 43 istasyonunun "infos" akışı + ici RCFM (Korsika), actu.fr'nin 11 bölge akışı, bölge gazetelerinin
  département sürümleri (Le Parisien, Le Télégramme, Sud Ouest, Midi Libre, L'Indépendant, Le Progrès, Le Dauphiné,
  L'Est Républicain, La Nouvelle République) + tek akışlı gazeteler + denizaşırı yayınlar. 403 veren siteler (Le Point,
  CNews, Europe 1, La Montagne grubu) ve akışı olmayanlar dışarıda (ayrıntı `fr/sources.ts`, `fr/local.ts` başı).
  `verify:feeds fr --all`: 423 akış, 418 ok, 5 seyrek (küçük département'ların France 3 akışı), 0 hata.
- **Arayüz:** 6. dil Fransızca (`locales/fr`, tipografik boşluklarla); `localUnit: 'department'` + tüm dillerde
  `_department` metinleri; 14 Fransız bölge adı 6 dilde; `national_fr`; "altı ülke" → "yedi ülke"; FR bayrağı.
- **Çekirdek:** Fransızca son dakika işaretleri (ALERTE INFO, Dernière minute, Flash info, URGENT); Fransızca rubrik
  kelimeleri + kategori eşleyicide aksan temizleme ("Économie", Portekizce "Saúde" artık eşleşiyor);
  `CountryPack.notPlaces` (Grande-Bretagne, mer du Nord, VAR… metinden silinip öyle etiketlenir, büyük/küçük harfe
  duyarlı); çok kelimeli yer adlarında kesme işareti (Côte-d'Or); `Province.isoCountry` (denizaşırı département'ların
  hava durumu); **kopan bağlantıda (ECONNRESET) akış bir kez daha denenir** (Libération istekleri %20 kesiyor);
  **tarihsiz akışlarda gün haber adresinden okunur** (Le Parisien: eski haberler "şimdi" görünmüyor).
- **Piyasalar:** Fransa = EUR + ons; CAC 40, LVMH, TotalEnergies, Airbus, L'Oréal, Schneider, BNP Paribas; Fransızca
  döviz/maden kelimeleri ("or" = "ama", "argent" = para olduğu için piyasa ifadeleri).
- **macOS:** `electron-builder.yml` → `identity: '-'` (ad-hoc imza). İmzasız DMG "hasar görmüş" diyordu; ad-hoc
  imzalı sürümde Gizlilik ve Güvenlik'ten "Yine de Aç" çıkar. Bu Mac'te derleme denetimi engellendi; doğrulama bir
  sonraki sürümün CI derlemesinde. Şimdilik çözüm: `xattr -cr /Applications/Masthead.app`.
- Tarayıcıda uçtan uca denendi: ilk kurulum (6 dil, 7 ülke, département seçici), ana sayfa (Bordeaux hava durumu),
  Gironde yerel sayfası, Piyasalar, Kaynaklar ("38 médias locaux attendent leur département"); 0 hatalı akış.
  Sahibinin tarayıcı ayarları test sonrası geri yüklendi (tr / Erzurum).
- Testler: 410 (yeni: `categories.test.ts`, Fransızca geo/son dakika/piyasa/URL tarihi/yeniden deneme).

## Devralma notu (2026-09-23, oturum sonu)

**Yapılan son iş:** Diğer 5 ülkenin paketleri Türkiye paketi derinliğine çıkarıldı — kendi dilinde çok daha
fazla ulusal kaynak + her ülkeye yerel haber; kendi dilinde yayın yapmayan kaynaklar kaldırıldı.

- **Hindistan:** İngilizce gazetelerin hepsi paketten çıktı (sahibinin isteği: "kendi dilinde haber yapmayan
  kaynakları o ülkeden kaldır"). 15 Hintçe ulusal kaynak (+ Dainik Jagran, Prabhat Khabar, TV9 Bharatvarsh,
  India TV, ABP, Webdunia, The Wire Hindi, Satya Hindi, OpIndia (kapalı)) + 36 eyalet/UT, 6 bölge; Amar Ujala,
  Bhaskar, News18 Hindi ve Prabhat Khabar'ın eyalet sayfaları (17 eyalet). `CountryPack.languages` alanı
  silindi; test artık her kaynağın paket dilinde olmasını şart koşuyor.
  Not: kullanıcının `.masthead-web/settings.json` içindeki 10 İngilizce kaynak kimliği (enabled listesi)
  artık hiçbir kaynağa karşılık gelmiyor; zararsız, bırakıldı.
- **ABD:** 52 ulusal (+ WSJ, LA Times, ProPublica, Atlantic, Dispatch, Free Press, Reason, STAT, Variety…) +
  50 eyalet ve D.C. (4 bölge) için 124 yerel kaynak (Gray/Hearst/Nexstar TV'leri, şehir gazeteleri, kamu
  radyoları). **İngiltere:** 29 ulusal (+ Telegraph, i, GB News, Channel 4…) + 51 BBC yerel bölgesi
  (12 bölge/ülke) + 38 bölge gazetesi. **Almanya:** 39 ulusal (+ Deutschlandfunk, Sportschau, Tagesspiegel…)
  + 16 Land için tagesschau regional, ARD yayıncıları, bölge gazeteleri. **Brezilya:** 42 ulusal (+ O Globo,
  Jovem Pan, Valor, Intercept, Pública, Nexo…) + 27 eyalet için g1 + 15 bölge gazetesi.
- Yeni altyapı: `countries/build.ts` (regionsOf, provinceFeeds, localOutlet), her ülkede `places.ts` +
  `local.ts`; `FeedDef.region` (İskoçya/Galler geneli gazeteler — o bölgeden bir yer seçilince çekilir);
  `RegionDef.names` (hikâyede "Scotland" geçerse bölgeye etiketlenir); `CountryPack.localUnit`
  (`state`/`land`/`area`) + `placeWords`; geo etiketleyici büyük harfi olmayan yazılarda (Hintçe) da
  çalışıyor; kesme işareti kuralı yalnızca Türkçe için.
- Arayüz: "şehir/il" metinlerinin `_state`, `_land`, `_area` varyantları 5 dilde (i18next `context`);
  yeni bölge adları 5 dilde; il/eyalet sıralaması ülkenin yerel ayarıyla; başka ülkeye ait kayıtlı konum
  ayarlarda otomatik temizleniyor (`placeIn`, `settings.ts`).
- Doğrulama: `verify:feeds -- us in gb de br --all` → 799 akış, 796 ok (3 sorunlu akış çıkarıldı / düzeltildi);
  tarayıcıda Hindistan (1.553 haber, 14 kaynak; Uttar Pradesh yerel 233 haber), UK/Manchester, Almanya/Bayern,
  ABD/Teksas, Brezilya/São Paulo denendi; Almanca "Bundesland wählen" metinleri doğrulandı.
- Dokümanlar: 4 README, site, SOURCES.md, CHANGELOG güncellendi; yeni ekran görüntüsü `docs/images/in-local.png`
  (eski `in-latest.png` silindi).

- [x] 2026-09-23 · **v0.3.0 yayınlandı:** sürüm 0.3.0'a çekildi (package.json + package-lock.json), CHANGELOG
  `[0.3.0]`, README/site indirme metinleri; `v0.3.0` etiketi → Release iş akışı (Windows/macOS/Linux) başarılı →
  taslak Releases listesindeki kalemden açılıp notlarla yayınlandı (Latest). 14 derleme dosyası + 2 kaynak arşivi;
  `releases/latest/download/...` bağlantıları doğrulandı.

- [x] 2026-09-23 · **Otomatik güncelleme** (henüz sürüm çıkmadı; v0.4.0 ile gelecek): `electron-updater`,
  `src/main/updates/` (Electron'suz `controller.ts` + bağlayan `index.ts`), IPC `updates:*`, preload, web modunda
  "git pull" notu. Açılıştan 10 sn sonra ve saatte bir kontrol; Windows kurulum sürümü ve AppImage arka planda
  indirir → "Masthead X hazır · Şimdi yeniden başlat / Sonra" diyaloğu (Sonra → kapatınca kurulur); yeniden
  başlatmadan önce arka uç kaydediliyor, kurucu 10 sn'de devralmazsa uygulama kendini yeniden açıyor.
  Taşınabilir exe, imzasız macOS (Squirrel.Mac yalnızca imzalıyı kurar, üstelik yalnızca dmg var) ve .deb
  kendini güncelleyemez → "yeni sürüm çıktı · İndir" diyaloğu. Ayarlar → Veriler ve uygulama: sürüm, durum,
  "Güncellemeleri denetle", "Güncellemeleri otomatik kur" (`settings.appUpdates.auto`, varsayılan açık).
  Windows ARM, `latest.yml`'deki arm64 kurucusunu alıyor (electron-updater dosya adında `process.arch` arar).
  **Tuzak:** electron-updater CommonJS; `import()` ile `autoUpdater` isimli dışa aktarım gelmiyor (tembel
  getter) → `(await import('electron-updater')).default` kullanılıyor. 10 yeni test (352 toplam).
  **Önemli:** v0.3.0 ve öncesinde güncelleyici yok; kullanıcılar v0.4.0'ı bir kez elle kurmalı, sonrası otomatik.

- [x] 2026-09-23 · **Son Haberler'de üst üste binme düzeltildi:** filtre çubuğu artık sayfa zemini renginde bir
  katmanla yapışıyor (üstündeki boşluktan haber görünmüyor, altı yumuşakça kayboluyor); "14:00" saat bandı yapışkan
  değil, haberlerle birlikte kayıyor; "N yeni haber" düğmesi çubuğun ekrandaki gerçek alt kenarının 24 px altında
  duruyor (`--sticky-bar-bottom`, FilterBar kaydırmada günceller; requestAnimationFrame yok — gizli pencerede durur).

- [x] 2026-09-23 · **Kelime susturma:** Ayarlar → Susturulan kelimeler; eşleşen haberler her sayfadan ve son
  dakika bildirimlerinden kalkar (`src/shared/mute.ts`, ana süreçte de kullanılır). Büyük/küçük harf, Türkçe
  karakter ve aksan fark etmez; 4+ harfli kelimeler çekimli hallerini de gizler ("deprem" → "depremde").
- [x] 2026-09-23 · **Hikâye sayfası:** birden çok kaynağın verdiği her haberin kendi sayfası (`StoryPage`,
  `lib/storyView.ts`): baş haber, her kaynağın başlığı/özeti ve ilk veriş saati ("İlk veren"), sıralama (ilk
  verene / en yeniye göre), kaynak türlerine göre dağılım. Kartlardaki "N kaynak" rozeti, Gündem Özeti ve
  okuyucudaki "Hepsini karşılaştır" buraya götürür.
- [x] 2026-09-23 · **Komut paleti ve kısayollar:** Ctrl/⌘+K (haber ara, habere/sayfaya/konuya/kaynağa atla,
  yenile, tema, kenar çubuğu); listelerde J/K gezinme, O/Enter aç, S kaydet, R yenile, / arama, ? kısayol listesi
  (`features/palette/`, `lib/feedNav.ts`).
- [x] 2026-09-23 · **"Size Özel" okuma geçmişinden öğreniyor** (Faz 3): `lib/forYou.ts` —
  `buildReadingProfile` son 60 günün okumalarından (14 gün yarı ömür, en çok 300) cihazda bir profil çıkarır:
  okumaları önce habere göre tekilleştirir (aynı küme ya da Jaccard ≥ 0.5), sonra başlık köklerinden
  okumalarda haberlere göre anlamlı derecede sık geçenleri seçer (Dunning log-likelihood G² ≥ 10.83, en az 2
  farklı haber) — dil başına durak kelime listesi gerekmez; hep birlikte geçen kelimeler tek terim olur
  ("Mansur Yavaş", çok kelimeli terim en az iki kelimesiyle eşleşir). İlgi alanı dışında çok okunan konular da
  profile girer. `rankForYou` artık gerekçe döndürür; her kartta "Okuduklarınıza benzer: Galatasaray",
  "Yerel: Erzurum", "İlgi alanınız: Ekonomi", "Sık okuduğunuz: Spor", "Çok kaynak veriyor" notu
  (`ArticleCard.notes` → `ArticleKicker.note`). Aynı terimin sonraki haberleri azalan artı puan alır (×0.7),
  bir kaynaktan art arda en çok 2 haber, herhangi bir raporu okunmuş hikâye sona iner. Sayfada "Okuduklarınızdan"
  paneli (öğrenilen kelimeler → tıklayınca arama) ve anahtar; Ayarlar → İlgi alanları'nda "Okuduklarımdan öğren"
  (`settings.personalization.useHistory`, varsayılan açık). 9 yeni test (371 toplam).

- [x] 2026-09-23 · **Piyasalar sayfası** (sahibinin isteği: yatırımcıya özel ayrı sayfa; Ekonomi kategorisi
  olduğu gibi kaldı). İzleme listesi (`src/shared/markets.ts`: döviz, maden, kripto, borsa/şirket; ülke başına en
  çok yatırım yapılanlar varsayılan, `settings.markets.watchlist` null = varsayılan). Fiyatlar yalnızca açıkça
  ücretsiz sunulan kaynaklardan (`src/core/markets.ts`): döviz ECB referans kuru (Frankfurter, günlük), madenler
  gold-api.com (anlık), kripto Binance `data-api.binance.vision` (anlık, 24 sa değişim); altının 24 sa değişimi
  PAXG'den. **Hisse fiyatı yok** (borsa verisi lisanslı; Yahoo/TradingView gibi resmî olmayan uçlar sahibinin
  isteğiyle kullanılmadı) — şirketler haberleriyle izleniyor. Sayfa açıkken fiyatlar dakikada bir, ekonomi/iş
  akışları dakikada bir (`news.refreshMarkets`, çekirdekte 50 sn kısma, koşullu GET); yeni haberler "Yeni"
  etiketiyle en üste kayarak eklenir. Sahibinin geri bildirimiyle sade tasarım: büyük kutucuklar yerine
  haberlerin yanında yapışkan, satır satır izleme listesi paneli (dar pencerede üstte iki sütun); satır → o varlığın haberleri. Haber eşleştirme `keywordMatcher`
  (tam kelime; sonu `*` olan çekimleri de bulur; "altın" ≠ "altında", "dolar kuru" ≠ "milyar dolarlık");
  döviz/maden/kripto yalnızca ekonomi/iş haberlerinde aranır. Ayarlar → Piyasalar: ekle/çıkar, öneriler, özel
  şirket, kelime düzenleme, varsayılana dön. Yeni renk token'ları `--up`/`--down`, `animate-arrive`.
- [x] 2026-09-23 · **Hava durumu kartı** (Faz 3, isteğe bağlı, varsayılan kapalı): Ana Sayfa tarih satırında
  seçili şehrin sıcaklığı, en yüksek/en düşük; tıklayınca 4 günlük tahmin (Open-Meteo, `src/core/widgets.ts`).
  Eyaletler için konum: eyalet adıyla ve ilk listelenen şehirle arama, eyalet içindeki en kalabalık yer (Texas →
  Houston, Bayern → München). Ayarlar → Dil ve bölge'de anahtar. Gizlilik metinleri (4 README, SECURITY, site)
  güncellendi.

- [x] 2026-09-23 · **Erişilebilirlik turu** (Faz 2 bitti): axe-core 4.10 tarayıcıda (geçici olarak
  `public/`'e konup silindi) 13 sayfa + okuyucu + komut paleti, açık ve koyu temada → **0 ihlal**. Kök neden
  vurgu renginin yazı olarak düşük kontrastıydı (ember 3,2–3,6:1): her vurguya `--accent-ink` (≥4,6:1 her yüzeyde)
  eklendi, `text-accent` → `text-accent-ink` (27 dosya); beyaz yazılı dolgular için ember/forest/gold biraz
  koyulaştırıldı (≥4,6:1); `--live` #15803d. "İçeriğe atla" bağlantısı (ilk Tab); Ana Sayfa'ya gizli h1; Gündem
  Özeti ve aramada gizli h2; iç içe `aside`'lar kaldırıldı; Kaynaklar'da başlık-içinde-düğme akordeon kalıbı
  (`headingLevel`); okuyucuda yayıncı başlıklarına `aria-level` (en üst 2); boş Kaydedilenler/Geçmiş'e düğme.
  Not: web geliştirme ayarlarında konum (il) boş görünüyordu — bu turda dokunulmadı.

- [x] 2026-09-23 · **Okuma modu ödeme duvarına saygı** (öneri): `src/shared/paywall.ts` — JSON-LD
  `isAccessibleForFree: false` ("False" dahil; `hasPart`, `@graph`…) ya da `article:content_tier` locked/metered
  → çekirdek çıkarıcı (`extract.ts`) ve Electron sayfa içi çıkarım (`readability.ts`) metin döndürmez
  (`ReaderContent.paywalled`, html boş); okuyucu başlık + akış özeti + "Bu haber abonelere özel" + yayıncı sayfası
  düğmesi gösterir. Folha de S.Paulo'nun gerçek bir haberiyle doğrulandı. 5 yeni test (393 toplam).
- [x] 2026-09-23 · **Yayıncılar için not** (öneri): 4 README'de "For publishers / Yayıncılar için" bölümü ve
  sitede kısa not — sunucu yok, akış kullanımı, abonelere özel haberler sitede kalır, çıkarılma talebi için
  GitHub issue bağlantısı (`labels=publisher`). README'deki "tam haber her zaman yayıncının sayfasında okunur"
  cümlesi okuma modunu doğru anlatacak şekilde düzeltildi.

- [x] 2026-09-23 · **v0.4.0 yayınlandı** (Latest): yayın öncesi çok ajanlı inceleme (güncelleyici, paketleme,
  ana süreç/IPC, çekirdek; her ciddi bulguya 3 şüpheci) → doğrulanmış ciddi sorun yok. Küçük bulgulardan
  düzeltilenler: AppImage adı artık sürümsüz (`Masthead-linux-x86_64.AppImage`, güncelleyici dosyayı yerinde
  değiştirir), ödeme duvarında `isPartOf`/açık "ücretsiz" yanlış pozitifi, piyasa/hava önbelleği hatada son iyi
  değeri korur, Open-Meteo bağlantısı Electron'da `openExternal` ile. Sürüm 0.4.0 (package.json + lock),
  CHANGELOG `[0.4.0]`, README/site indirme metinleri ve sitede 6 yeni özellik kartı. `v0.4.0` etiketi → Release
  iş akışı başarılı → taslak listedeki kalemden (`untagged-…`) açılıp notlarla yayınlandı; 14 derleme dosyası,
  `latest.yml` (x64 + arm64) ve `latest-linux.yml` doğrulandı. Ertelenen küçük bulgu: yazılamayan dizindeki
  AppImage yine "otomatik" sayılıyor (nadir).

**Sıradaki somut adımlar:**
1. v0.4.0 kullanıcılarından sonraki sürümle otomatik güncellemenin gerçekten çalıştığını doğrula (0.4.1 çıkınca
   Windows kurulum sürümü ve AppImage kendiliğinden güncellenmeli).
3. `README.hi.md` (dört README'nin dil satırına `· [हिन्दी](README.hi.md)` eklenecek).
4. İstenirse: açılış sayfasının diğer dillere çevrilmesi; ABD/İngiltere/Almanya/Brezilya yerel sayfaları için
   ekran görüntüleri; News18 Hindi / Bhaskar ikonları (şu an harf monogramı görünüyor).
5. Sonraki sürümde de: taslağı Releases listesindeki kalemden aç (`/releases/edit/<tag>` ikinci boş sürüm
   açar); listedeki "Assets" sayısı yayından hemen sonra yanlış (2) görünebilir —
   `releases/expanded_assets/<tag>` ile doğrula.

**Sayılar (güncel):** 955 kaynak, 2.242 akış, 7 ülke, 6 arayüz dili (en, tr, de, pt, hi, fr).

**Ortam:** `verify:feeds` bu Mac'te: `NODE_EXTRA_CA_CERTS=~/.masthead/corporate-ca.pem ~/.nvm/versions/node/v24.19.0/bin/node scripts/verify-feeds.ts fr --all`.
Kurumsal TLS proxy yüzünden Node sertifikayı tanımıyor →
`NODE_EXTRA_CA_CERTS=~/.masthead/corporate-ca.pem` ile çalıştır (dev sunucusu, verify:feeds, her şey).
`npm run verify:feeds` Node 22+ ister; bu Mac'te Node 20 olduğu için `npx vite-node scripts/verify-feeds.ts -- in`
şeklinde çalıştır. Bu bilgisayara uygulama kurulmaz; doğrulama yalnızca `npm run dev:web` üzerinden.
Dev sunucusunu yeniden başlatmak: `NODE_EXTRA_CA_CERTS=~/.masthead/corporate-ca.pem npx vite --config vite.web.config.ts --port 5173 --strictPort`.

## Sıradaki adım

1. ~~GitHub deposu + push~~ ✅ · ~~depo public + v0.2.0 Release~~ ✅ · ~~açılış sayfası (GitHub Pages)~~ ✅
2. Faz 2 ve 3'ü bitir (bkz. PLAN.md): ~~komut paleti, kısayollar, hikâye sayfası, kelime susturma~~ ✅,
   ~~Size Özel okuma geçmişi~~ ✅, ~~Piyasalar + hava durumu~~ ✅, ~~erişilebilirlik~~ ✅, ~~ödeme duvarı + yayıncı notu~~ ✅. Sıradaki: v0.4.0.
3. Alan adı alınınca Settings → Pages → Custom domain (site `site/` klasöründen otomatik yayımlanıyor).
4. ~~Otomatik güncelleme (electron-updater)~~ ✅ (v0.4.0 ile gelecek) · kod imzalama; ~~Fransa~~ ✅.
5. ~~Mevcut ülkelerin kaynaklarını artır + v0.5.0~~ ✅ (yayın adımı: etiket → taslak → Releases listesinden yayınla).
   İstenirse: README.fr.md, Fransa ekran görüntüsü (README/site galerisinde Fransa'nın görseli yok).
6. Sonra (sahibi izin verirse): İspanya+Meksika, İtalya, Hollanda, Endonezya, Azerbaycan, Japonya/Çin/Tayland
   (kelime bölme gerekir). Arapça yapılmayacak.

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
- [x] 2026-09-23 · Hindistan Hintçe: 6 Hintçe kaynak + arayüzde हिन्दी (5. dil), Hintçe akıcılık denetimi
- [x] 2026-09-23 · **Her ülke kendi dilinde:** Hindistan'ın İngilizce gazeteleri çıkarıldı, `CountryPack.languages`
      silindi, test her kaynağın paket dilinde olmasını şart koşuyor
- [x] 2026-09-23 · **Kaynaklar genişletildi:** ABD 52, İngiltere 29, Almanya 39, Brezilya 42, Hindistan 15
      ulusal kaynak; her pakette dünya/ekonomi/spor/teknoloji/sağlık/eğlence/yaşam için ≥2 açık kaynak (testli)
- [x] 2026-09-23 · **Her ülkeye yerel haber:** ABD 51 eyalet (124 yerel kaynak), İngiltere 51 BBC bölgesi +
      38 gazete, Almanya 16 Land, Brezilya 27 eyalet, Hindistan 36 eyalet/UT (17'sinde Hintçe eyalet akışı);
      `FeedDef.region`, `RegionDef.names`, `localUnit`, `placeWords`, Hintçe geo etiketleme; 799 akış doğrulandı

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
| 2026-09-23 | Her ülkenin kaynakları yalnızca o ülkenin dilinde (Hindistan'ın İngilizce basını çıkarıldı) | Sahibinin isteği: ülkeyi seçen, o ülkenin haberini kendi dilinde okur |
| 2026-09-23 | Yerel haber her ülkede aynı modelle: il/eyalet/Land/yöre = `Province`, bölge = `RegionDef` | Türkiye'nin şehir sayfaları, filtreleri ve akış planlaması olduğu gibi yeniden kullanılır |
| 2026-09-23 | ABD'de yerel akış olarak Gray `/category/news/` ve Hearst `/local-news-rss` | Ana akışları ağın diğer eyaletlerdeki haberlerini karıştırıyor |
| 2026-09-23 | Ulus geneli yerel gazeteler için `FeedDef.region` (İskoçya, Galler) | The Herald / STV gibi yayınlar tek bir bölgeye ait değil |
| 2026-09-23 | Geo etiketlemede kesme işareti kuralı yalnızca Türkçe | İngilizce iyelik ("Washington's allies") yer adı olduğunu göstermez |
| 2026-09-23 | "Size Özel" profili cihazda, okuma geçmişinden; kelimeler haber akışına karşı G² testiyle seçilir | Sunucu/hesap yok, gizlilik; oran eşiği az okumada "istedi", "yola" gibi genel kelimeleri alıyordu, anlamlılık testi dil bağımsız ayıklıyor |
| 2026-09-23 | Okuma profili için okumalar önce habere göre tekilleştirilir | Aynı haberin üç raporunu okumak "operasyon" kelimesine ilgi demek değil |
| 2026-09-23 | Piyasa fiyatları yalnızca açıkça ücretsiz sunulan kaynaklardan (ECB/Frankfurter, gold-api, Binance); hisse fiyatı yok | Sahibinin isteği: "sonradan başımız ağrımasın". Yahoo/TradingView resmî değil, BIST verisi lisanslı |
| 2026-09-23 | Piyasalar ayrı sayfa; Ekonomi kategorisi olduğu gibi | Sahibinin isteği: biri yatırımcıya özel, biri normal kategori |
| 2026-09-23 | Piyasa haberleri sayfa açıkken dakikada bir, yalnızca ekonomi/iş akışları | Canlı his + yayıncılara saygı (çekirdekte kısma, koşullu GET) |
| 2026-09-23 | Vurgu rengi yazıda `--accent-ink`, dolguda `--accent` | Marka rengi korunur, yazılar WCAG AA (4,5:1) geçer |
| 2026-09-23 | Ödeme duvarlı haberde okuma modu hiç metin çıkarmaz (metered dahil) | Hukuki risk: sunucu tarafında çekmek sayaçlı ödeme duvarını da aşar; abone yayıncının sayfasında okur |
| 2026-09-23 | Yayıncı iletişimi GitHub issue ile | Kişisel e-posta yayımlanmaz |
| 2026-09-24 | Fransa'da yerel birim département (101), bölge = 13 bölge + Outre-mer | Türkiye'deki il/plaka modeline en yakın yapı; France 3'ün her département'a akışı var |
| 2026-09-24 | `notPlaces` metinden silinir (büyük/küçük harfe duyarlı), dizine blok girdi olarak eklenmez | "mer du Nord" gibi küçük harfle başlayanlar da yakalanır; "VAR" (hakem) ile "Var" (département) ayrılır |
| 2026-09-24 | Kopan bağlantıya (ECONNRESET/EPIPE/UND_ERR_SOCKET) tek yeniden deneme; zaman aşımına değil | Bazı CDN'ler istekleri rastgele kesiyor; zaman aşımını tekrarlamak yenilemeyi uzatır |
| 2026-09-24 | Tarihsiz akış öğesinde gün URL'den (öğlen); bugün/gelecek ise ilk görülme zamanı | Le Parisien'in günler önceki haberleri "şimdi" görünüyordu |
| 2026-09-24 | macOS için ad-hoc imza (`identity: '-'`), Developer ID yok | İmzasız DMG "hasar görmüş" diye açılmıyor; ücretli sertifika sahibinin kararı |

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
