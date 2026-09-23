# Sources

Every country Masthead covers is one **country pack** under `src/shared/countries/<code>/`, registered in
`countries/index.ts`. Six packs ship today:

| Pack | Language | Sources | Feeds | On by default | Provinces |
| --- | --- | --- | --- | --- | --- |
| `tr` Türkiye | Turkish | 136 | 536 | 93 | 81 |
| `us` United States | English | 18 | 49 | 17 | — |
| `in` India | English | 10 | 37 | 9 | — |
| `gb` United Kingdom | English | 10 | 37 | 7 | — |
| `de` Germany | German | 15 | 46 | 14 | — |
| `br` Brazil | Portuguese | 17 | 34 | 13 | — |

Most of this document describes the Turkey pack, which is the deepest one (and the only one with local news so
far); [the other packs](#the-other-country-packs) are listed at the end. The rules below — one feed per
category, no stale or empty feeds, a balanced default set — apply to every pack.

- **Verified:** research passes with curl on **2026-09-22**, re-checked with `npm run verify:feeds -- --all`
  on **2026-09-23**, and twice more later that day during QA (536 feeds: no failures; the only stale feeds are
  29 of Sabah's city pages for small provinces, see below). The QA pass removed Denizli Yeni Olay (its feed
  had gone empty) and pointed Artı Gerçek and Bant Mag at the URLs their old ones redirected to.
- **Language:** every source is Turkish-language (`language: 'tr'`); Kurdish and English editions (e.g. bianet
  English/Kurdî) are left out.

## What the pack contains

| File                 | Contents                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `tr/sources.ts`      | 67 national and international sources (307 feeds)                                                                               |
| `tr/local.ts`        | 69 local sources: Sabah and Haberler.com city pages (81 feeds each, generated from the province slugs) and 67 local newspapers  |
| `tr/provinces.ts`    | All 81 provinces: plate code, Turkish name, ASCII slug, region, aliases, `ambiguous` flag                                       |
| `tr/regions.ts`      | The 7 geographic regions, derived from the province table                                                                       |
| `tr/districts.ts`    | 122 districts that national outlets name without their province (Bodrum, Çorlu, İskenderun…)                                    |
| `tr/index.ts`        | The `CountryPack` (`tr-TR`, `Europe/Istanbul`, Google News edition `hl=tr&gl=TR&ceid=TR:tr`)                                    |
| `countries/index.ts` | Registry: `COUNTRY_OPTIONS`, `getCountryPack`, `listSources`, `getSource`, `getProvince`, `isSourceEnabled`, `setSourceEnabled` |

In total, the Turkey pack: **136 sources, 536 feeds** (all six packs together: 206 sources, 739 feeds). Region ids: `marmara`, `aegean`, `mediterranean`, `central-anatolia`,
`black-sea`, `eastern-anatolia`, `southeastern-anatolia`.

### Categories

Every feed maps onto one unified category (`src/shared/categories.ts`). The research labels were mapped as
`turkey → national`, `finance → economy`, `food → lifestyle`, `other → general` (or dropped when redundant).
Each source has **at most one feed per category**; front-page feeds are `top` + `headline: true`, a site's
"son dakika" stream is `breaking` + `breaking: true`. "Son 24 saat" / "all news" streams are `general`.

Most "son dakika" streams are really just the site's latest items, so a breaking feed only files its items
under the `breaking` category. An article is **breaking news** (`isBreaking`: badge, ticker, notifications,
counts) when its headline carries an explicit marker (`SON DAKİKA:`, `Son dakika |`, `SONDAKİKA…`, `FLAŞ!`,
`ACİL:`, `BREAKING:` — stripped from the displayed title), or when it came from a breaking feed in the last
hour and at least two sources have reported its story in the last hour. The core decides this after
clustering (`clusterStories` → `breaking`), so every screen agrees; on 2026-09-23 it gave 15 breaking items in
two busy evening hours with the default sources (34 with every source on), down from 47 (161).

### The default set

Sources are on unless they say `defaultEnabled: false`; users switch sources on and off in the Sources list.
`settings.sources.disabled` holds the sources a user switched off and `settings.sources.enabled` the
default-off sources they switched on; `isSourceEnabled` and `setSourceEnabled` in `countries/index.ts`
implement the rule, so the pipeline and the UI agree. The default set is **24 sources / 127 feeds** (about
7 MB per full refresh) and deliberately pluralistic:

- **Public broadcaster and agency:** TRT Haber, Anadolu Ajansı
- **Mainstream:** Hürriyet, Sabah, Habertürk, CNN Türk, Yeni Şafak
- **Opposition:** Sözcü, Cumhuriyet, Halk TV, Karar, Yeniçağ
- **Independent:** Diken, Medyascope, Bianet
- **International Turkish services:** BBC News Türkçe, DW Türkçe, Independent Türkçe
- **Business · sports · technology · science:** Dünya Gazetesi · Fotomaç, Ajansspor · Webtekno, DonanımHaber ·
  Evrim Ağacı

Everything else (43 national sources, from A Haber and Yeni Akit to BirGün, Evrensel and Gazete Oksijen) is
one switch away in the Sources list. Local sources are also on by default, but their feeds carry a `province`
and are only fetched when the user's selected province matches (see [Local news](#local-news)).

Heavy outlets were trimmed to a light core: Hürriyet's section feeds are 0.4–1 MB each (100 full-text items,
no ETag), so only its front page and breaking stream are polled; the same applies to BirGün, Türkiye Gazetesi,
Milliyet, TGRT Haber and Haberler.com.

## National and international sources

Default-enabled sources first.

| Source                | id                   | Kind          | Default | Feeds | Categories                                                                                                                                  | Notes                                                                                                   |
| --------------------- | -------------------- | ------------- | ------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| TRT Haber             | `trt-haber`          | public        | **on**  | 12    | breaking, top, general, national, world, economy, sports, technology, health, culture, education, lifestyle                                 | `*_articles.rss` variants carry enclosure images                                                        |
| Anadolu Ajansı        | `anadolu-ajansi`     | agency        | **on**  | 8     | general, national, world, economy, sports, technology, culture, opinion                                                                     | Politics/health/education feeds are stale; `cat=turkiye` is 404                                         |
| Hürriyet              | `hurriyet`           | mainstream    | **on**  | 4     | top, breaking, local 06, local 35                                                                                                           | Section feeds too heavy (see above); only the Ankara and İzmir city editions are current; dates use `Z` |
| Sabah                 | `sabah`              | mainstream    | **on**  | 12    | top, breaking, national, world, economy, sports, health, culture, entertainment, lifestyle, education, opinion                              | Technology feed near-empty, travel stale, `manset.xml` 404                                              |
| Habertürk             | `haberturk`          | mainstream    | **on**  | 14    | general, top, national, world, economy, sports, technology, health, culture, entertainment, lifestyle, automotive, local, opinion           | Politics and education feeds are empty                                                                  |
| CNN Türk              | `cnn-turk`           | mainstream    | **on**  | 14    | general, national, world, economy, sports, technology, health, culture, entertainment, lifestyle, education, automotive, local, opinion     | `all/news` is the all-sections stream                                                                   |
| Yeni Şafak            | `yeni-safak`         | mainstream    | **on**  | 7     | general, national, world, economy, sports, technology, lifestyle                                                                            | webp images in `media:content`                                                                          |
| Sözcü                 | `sozcu`              | mainstream    | **on**  | 13    | breaking, national, world, economy, sports, technology, health, culture, entertainment, lifestyle, education, automotive, opinion           | No XML prolog; served as UTF-8                                                                          |
| Cumhuriyet            | `cumhuriyet`         | mainstream    | **on**  | 14    | breaking, national, politics, world, economy, sports, technology, health, culture, entertainment, lifestyle, education, automotive, opinion | `son_dakika.xml` redirects to `/rss`; environment feed stale                                            |
| Halk TV               | `halk-tv`            | mainstream    | **on**  | 1     | general                                                                                                                                     |                                                                                                         |
| Karar                 | `karar`              | mainstream    | **on**  | 1     | general                                                                                                                                     |                                                                                                         |
| Yeniçağ               | `yenicag`            | mainstream    | **on**  | 1     | general                                                                                                                                     |                                                                                                         |
| Diken                 | `diken`              | independent   | **on**  | 6     | general, national, world, economy, sports, health                                                                                           | WordPress, no images (needs og:image)                                                                   |
| Medyascope            | `medyascope`         | independent   | **on**  | 8     | top, general, national, politics, world, economy, sports, culture                                                                           | 12 items per feed, few images                                                                           |
| Bianet                | `bianet`             | independent   | **on**  | 1     | general                                                                                                                                     | BiaMag feed stale                                                                                       |
| BBC News Türkçe       | `bbc-turkce`         | international | **on**  | 1     | top                                                                                                                                         | 240 px thumbnails; `/ace/ws/240/` → `/ace/ws/800/` gives larger ones                                    |
| DW Türkçe             | `dw-turkce`          | international | **on**  | 2     | general, economy                                                                                                                            | No images; politics and Europe feeds stale                                                              |
| Independent Türkçe    | `independent-turkce` | international | **on**  | 1     | general                                                                                                                                     | Full HTML body in the description                                                                       |
| Dünya Gazetesi        | `dunya`              | business      | **on**  | 4     | general, economy, national, world                                                                                                           |                                                                                                         |
| Fotomaç               | `fotomac`            | sports        | **on**  | 1     | sports                                                                                                                                      | `anasayfa.xml` stale; `son24saat.xml` used                                                              |
| Ajansspor             | `ajansspor`          | sports        | **on**  | 1     | sports                                                                                                                                      |                                                                                                         |
| Webtekno              | `webtekno`           | technology    | **on**  | 1     | technology                                                                                                                                  |                                                                                                         |
| DonanımHaber          | `donanimhaber`       | technology    | **on**  | 1     | technology                                                                                                                                  |                                                                                                         |
| Evrim Ağacı           | `evrim-agaci`        | technology    | **on**  | 1     | science                                                                                                                                     | Science outreach                                                                                        |
| Milliyet              | `milliyet`           | mainstream    | off     | 6     | breaking, national, economy, health, entertainment, opinion                                                                                 | Full-text feeds (150–430 KB); no sports feed exists                                                     |
| Star                  | `star`               | mainstream    | off     | 8     | breaking, national, politics, world, economy, sports, technology, culture                                                                   | Front-page and magazine feeds stale                                                                     |
| Akşam                 | `aksam`              | mainstream    | off     | 14    | general, national, politics, world, economy, sports, technology, health, culture, entertainment, lifestyle, education, automotive, travel   |                                                                                                         |
| Türkiye Gazetesi      | `turkiye-gazetesi`   | mainstream    | off     | 1     | general                                                                                                                                     | Section feeds carry ~500 items each; the all-sections stream is enough                                  |
| Takvim                | `takvim`             | mainstream    | off     | 7     | top, general, national, world, sports, health, entertainment                                                                                | Economy and lifestyle channels empty                                                                    |
| A Haber               | `a-haber`            | mainstream    | off     | 10    | top, general, national, world, economy, sports, technology, health, entertainment, lifestyle                                                |                                                                                                         |
| Haber7                | `haber7`             | mainstream    | off     | 3     | general, economy, sports                                                                                                                    |                                                                                                         |
| Mynet                 | `mynet`              | mainstream    | off     | 9     | top, breaking, national, politics, world, technology, health, lifestyle, local                                                              | Sports feed has wrong-year dates; magazine feed 404s intermittently                                     |
| Posta                 | `posta`              | mainstream    | off     | 10    | top, national, economy, sports, technology, health, entertainment, lifestyle, education, local                                              | Images only inside the description                                                                      |
| TGRT Haber            | `tgrt-haber`         | mainstream    | off     | 9     | national, world, economy, sports, technology, health, entertainment, lifestyle, education                                                   | Front-page, politics, culture and automotive feeds (435–500 items) left out                             |
| Haber Global          | `haber-global`       | mainstream    | off     | 12    | general, national, world, economy, sports, technology, health, culture, entertainment, lifestyle, education, opinion                        | Section feeds are loosely filtered                                                                      |
| 24 TV                 | `yirmidort-tv`       | mainstream    | off     | 11    | breaking, national, world, economy, sports, technology, health, culture, entertainment, lifestyle, education                                |                                                                                                         |
| Yeni Akit             | `yeni-akit`          | mainstream    | off     | 10    | national, politics, world, economy, sports, technology, health, culture, education, lifestyle                                               | `politika` feed is stale; `siyaset` used                                                                |
| Diriliş Postası       | `dirilis-postasi`    | mainstream    | off     | 1     | general                                                                                                                                     |                                                                                                         |
| İnternet Haber        | `internethaber`      | mainstream    | off     | 1     | general                                                                                                                                     |                                                                                                         |
| Aydınlık              | `aydinlik`           | mainstream    | off     | 2     | general, opinion                                                                                                                            |                                                                                                         |
| Elele                 | `elele`              | mainstream    | off     | 1     | lifestyle                                                                                                                                   | Women's lifestyle magazine                                                                              |
| Korkusuz              | `korkusuz`           | mainstream    | off     | 1     | general                                                                                                                                     |                                                                                                         |
| BirGün                | `birgun`             | independent   | off     | 3     | general, environment, opinion                                                                                                               | Every feed ~150 full-text items (0.45–0.85 MB)                                                          |
| Kısa Dalga            | `kisa-dalga`         | independent   | off     | 1     | general                                                                                                                                     |                                                                                                         |
| Gazete Oksijen        | `gazete-oksijen`     | independent   | off     | 10    | general, national, world, economy, sports, science, health, culture, entertainment, lifestyle                                               | 80–95% of section items belong to the section                                                           |
| Nefes                 | `nefes`              | mainstream    | off     | 9     | general, national, world, economy, sports, technology, health, lifestyle, education                                                         |                                                                                                         |
| Tele1                 | `tele1`              | independent   | off     | 5     | top, general, economy, health, education                                                                                                    | Updates slowly; world, sports, culture, technology and lifestyle feeds stale                            |
| Evrensel              | `evrensel`           | independent   | off     | 1     | general                                                                                                                                     | Only the main feed has items; links carry `utm_*` parameters                                            |
| Artı Gerçek           | `arti-gercek`        | independent   | off     | 1     | general                                                                                                                                     | `/rss` redirects to `/export/rss`                                                                       |
| Serbestiyet           | `serbestiyet`        | independent   | off     | 1     | general                                                                                                                                     |                                                                                                         |
| soL Haber             | `sol-haber`          | independent   | off     | 1     | general                                                                                                                                     |                                                                                                         |
| Bant Mag              | `bant-mag`           | independent   | off     | 1     | culture                                                                                                                                     | Music, film and culture magazine; no images; `/feed` redirects to `/feed/`                              |
| Sputnik Türkiye       | `sputnik-turkiye`    | international | off     | 1     | general                                                                                                                                     | Only ~12% of items carry an image                                                                       |
| Ekonomim              | `ekonomim`           | business      | off     | 4     | general, economy, national, world                                                                                                           |                                                                                                         |
| Investing.com Türkiye | `investing-tr`       | business      | off     | 3     | economy, politics, world                                                                                                                    | Article pages sit behind a Cloudflare challenge                                                         |
| CNBC-e                | `cnbc-e`             | business      | off     | 1     | economy                                                                                                                                     | No item images                                                                                          |
| Borsagündem           | `borsagundem`        | business      | off     | 1     | economy                                                                                                                                     |                                                                                                         |
| A Spor                | `a-spor`             | sports        | off     | 1     | sports                                                                                                                                      |                                                                                                         |
| ShiftDelete.Net       | `shiftdelete`        | technology    | off     | 2     | technology, automotive                                                                                                                      | No images                                                                                               |
| CHIP Online           | `chip`               | technology    | off     | 2     | technology, science                                                                                                                         |                                                                                                         |
| Webrazzi              | `webrazzi`           | technology    | off     | 1     | technology                                                                                                                                  |                                                                                                         |
| LOG                   | `log`                | technology    | off     | 1     | technology                                                                                                                                  |                                                                                                         |
| Motor1 Türkiye        | `motor1`             | technology    | off     | 1     | automotive                                                                                                                                  | Automotive                                                                                              |
| Sarkaç                | `sarkac`             | technology    | off     | 1     | science                                                                                                                                     |                                                                                                         |
| Arkeofili             | `arkeofili`          | technology    | off     | 1     | science                                                                                                                                     | Archaeology and history                                                                                 |
| TÜBİTAK Bilim Genç    | `bilim-genc`         | technology    | off     | 1     | science                                                                                                                                     | TÜBİTAK's science outreach site                                                                         |
| Haberler.com          | `haberler-com`       | aggregator    | off     | 8     | breaking, general, technology, health, culture, entertainment, automotive, local                                                            | Very high volume; the 300–500-item section feeds are left out                                           |

### Left out

| Outlet                                                  | Why                                                                                                                                                                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NTV, NTV Spor, En Son Haber, Milli Gazete               | Cloudflare bot wall (403 / challenge page) for non-browser clients; the second research pass found no working NTV feed either                                                                                         |
| İHA, DHA                                                | No public RSS (İHA's feeds are subscriber-only)                                                                                                                                                                       |
| T24                                                     | `/rss/*` redirects to a 404 page                                                                                                                                                                                      |
| Euronews Türkçe                                         | Worked on 2026-09-22; on 2026-09-23 its CDN answered 406 to every uncached request from the test machine (after a burst of requests). Re-check later: `https://tr.euronews.com/rss?format=mrss&level=theme&name=news` |
| VOA Türkçe                                              | Feeds frozen since 2025-03                                                                                                                                                                                            |
| Bloomberg HT                                            | `/rss` is a stale cache; only a Google News sitemap is fresh (not RSS)                                                                                                                                                |
| Sözcü TV                                                | Channel date is current but the newest item was 6 days old on 2026-09-23                                                                                                                                              |
| TimeTürk                                                | pubDates labelled GMT are Turkey time, so items appear up to 3 hours in the future                                                                                                                                    |
| Sondakika.com                                           | Same backend as Haberler.com                                                                                                                                                                                          |
| Onedio                                                  | Viral and pop-culture lists rather than news                                                                                                                                                                          |
| Gerçek Bilim, Herkese Bilim Teknoloji, Bilim ve Gelecek | 6–10 items, newest 4 days old                                                                                                                                                                                         |
| Fanatik, Para Analiz, Oda TV                            | No feed / unreachable                                                                                                                                                                                                 |
| France 24                                               | No Turkish-language service                                                                                                                                                                                           |

## Local news

Local stories reach the app three ways:

1. **City pages covering all 81 provinces**, generated in `tr/local.ts` from the province slug, so there are
   no hand-typed URLs:
   - `sabah-yerel` — `https://www.sabah.com.tr/rss/{slug}.xml`: 25 items per city, nearly all local. Titles
     end with a ` #cityslug` hashtag (strip with `/\s+#[\p{L}\d-]+$/u`). Small provinces update slowly: on
     2026-09-23, 29 of 81 had no item newer than 3 days (Bayburt 38 days, Kilis, Uşak and Çanakkale about 12).
   - `haberler-yerel` — `https://rss.haberler.com/rssnew.aspx?kategori={slug}`: tag-based, about 48 hours of
     items, fresher for small provinces but noisier (the Ordu page also catches "3. Ordu", the army). Encoded
     entities inside CDATA need a second decode pass.
2. **Local newspapers** (67 sources, at most three per province, 33 provinces across all 7 regions), e.g. Yeni
   Asır (İzmir), Başkent Gazete (Ankara), Özgür Kocaeli, Konya Yenigün, Gazete İpekyol (Şanlıurfa). Each is
   `kind: 'local'` with `provinces: [code]`. They typically mix 30–60% agency copy with their own stories.
3. **National "yerel" pools** without a province (Habertürk, CNN Türk, Mynet, Posta, Haberler.com) and every
   other feed, geo-tagged by text.

Every feed of a local source carries `province: '<plate code>'`, and so do Hürriyet's Ankara and İzmir
editions. The pipeline only fetches a province feed when it matches the user's selected province (with only a
region selected, it spreads a handful of city feeds across that region), which is why these sources can all be
enabled by default: picking İzmir adds 6 requests per refresh, picking Bayburt adds 2.

| Region                | Province           | Local newspapers                                    |
| --------------------- | ------------------ | --------------------------------------------------- |
| Marmara               | Balıkesir (10)     | Balıkesir Posta                                     |
| Marmara               | Bursa (16)         | Bursa Basın, Gazete Bursa                           |
| Marmara               | Çanakkale (17)     | Çanakkale Olay                                      |
| Marmara               | İstanbul (34)      | İstanbul Gazetesi                                   |
| Marmara               | Kocaeli (41)       | Kocaeli Fikir, Özgür Kocaeli, Bizim Yaka            |
| Marmara               | Sakarya (54)       | Medyabar                                            |
| Marmara               | Tekirdağ (59)      | Çerkezköy Haber, Trakya Gazetesi, Tekirdağ Bakış    |
| Aegean                | Aydın (09)         | Manşet Aydın                                        |
| Aegean                | Denizli (20)       | Gazete Şehir, Hizmet Gazetesi                       |
| Aegean                | İzmir (35)         | Yeni Asır, Ege Telgraf, Haber Ekspres               |
| Aegean                | Manisa (45)        | Manisa Denge                                        |
| Aegean                | Muğla (48)         | Muğla Gazetesi, Bodrum Kapak                        |
| Mediterranean         | Adana (01)         | Çukurova Press, Bölge Gazetesi, Adana'nın Sesi      |
| Mediterranean         | Antalya (07)       | Haber Antalya, Antalya Ekspres, Yeni Alanya         |
| Mediterranean         | Hatay (31)         | Hatay Ekspres                                       |
| Mediterranean         | Kahramanmaraş (46) | İstiklal Gazetesi                                   |
| Mediterranean         | Mersin (33)        | İmece Gazetesi, Mersin Haber Merkezi                |
| Central Anatolia      | Ankara (06)        | Başkent Gazete                                      |
| Central Anatolia      | Eskişehir (26)     | Eskisehir.net, Eskişehir Ekspres, Anadolu Gazetesi  |
| Central Anatolia      | Kayseri (38)       | Kayserim.net, Kayseri Haber, Kayseri Yerel Haber    |
| Central Anatolia      | Konya (42)         | Konya Yenigün, Merhaba Haber, Memleket              |
| Black Sea             | Ordu (52)          | Ordu Olay                                           |
| Black Sea             | Samsun (55)        | Samsun Kent Haber, Samsun Gazetesi, Haber Expres    |
| Black Sea             | Trabzon (61)       | Kuzey Ekspres, Günebakış, HaberTS                   |
| Black Sea             | Zonguldak (67)     | Zonguldak Pusula                                    |
| Eastern Anatolia      | Erzurum (25)       | Erzurum Haber 25                                    |
| Eastern Anatolia      | Malatya (44)       | Yeni Malatya, Malatya Söz, Malatya Çağdaş           |
| Eastern Anatolia      | Van (65)           | Van Havadis, Vansesi, Bölge Gazetesi Van            |
| Southeastern Anatolia | Batman (72)        | Batman Çağdaş                                       |
| Southeastern Anatolia | Diyarbakır (21)    | Amida Haber, Diyarbakır Söz, Güneydoğu Ekspres      |
| Southeastern Anatolia | Gaziantep (27)     | Gaziantep Haber, Gaziantep Oluşum, Gaziantep Pusula |
| Southeastern Anatolia | Mardin (47)        | Mardin Haber                                        |
| Southeastern Anatolia | Şanlıurfa (63)     | Gazete İpekyol, Urfa News, Urfa Değişim             |

**Tag stories by their text, not by their source.** Province names, `aliases` (Antep, Urfa, Maraş, Afyon,
İzmit, Adapazarı, Antakya, İçel, Dersim, plus ASCII spellings) and districts map to plate codes. Names flagged
`ambiguous` (Ağrı, Aydın, Muş, Ordu, Sakarya, Tokat, Uşak, Van, Aksaray, Karaman, Batman) are also common
words, names or places and need stricter matching (an apostrophe suffix such as `Van'da`, or
"ili/ilçesi/merkezli" context). Districts that are common words, names or clubs (Beşiktaş, Fatih, Kartal,
Kemer, Of, Pazar) or exist in several provinces (Ereğli, Edremit, Gölbaşı) are not in the district list.

Checked and rejected: Hürriyet's other city feeds (years old), Milliyet's local feed (404), Sabah's region
feeds (empty or 404), papers that are mostly national agency copy (Bursa Hakimiyet, Karadeniz Gazetesi,
Hürses, Antalya Manşet: 8% local or less) and about 30 local sites behind Cloudflare or offline. Removed on
2026-09-23: Denizli Yeni Olay, whose `/rss` became an empty channel in two consecutive checks (its `/feed`
answers 500).

## Feed quirks the pipeline should handle

- **Dates:** mostly RFC 822 with `+0300`; Hürriyet uses `Z`; Türkiye Gazetesi uses Turkish day/month names;
  Diyarbakır Söz is Atom with a junk `<updated>0001-01-01`. Clamp future or unparseable dates to fetch time,
  and read item dates only (several channels carry a fresh `<pubDate>` over old items).
- **Official notices:** Hürriyet, Sabah, CNN Türk, Cumhuriyet, Takvim, A Haber, Haber7, Posta and Nefes put
  court, enforcement and tender notices ("T.C. … ASLİYE HUKUK MAHKEMESİNDEN", "… İCRA DAİRESİ", "ESAS NO",
  "İHALE İLANI") in their feeds, mostly under `/resmi-ilan(lar)/`; Akşam and 24 TV add "icradan satılık"
  listings. They cluster with each other into fake multi-source stories, so `isJunkItem` (normalize) drops
  them by section URL and wording, together with items titled only with the site's name or "Haberler". About
  100 of 13,000 items on 2026-09-23; stories that merely mention a court are kept.
- **Images:** enclosure, `media:content`, `media:thumbnail` or the first `<img>` in the description. WordPress
  feeds (Diken, ShiftDelete.Net, Bölge Gazetesi, Bodrum Kapak, Çanakkale Olay) and CNBC-e have none, so use
  og:image. Repaired or rejected in `images.ts`: Posta glues a stock filename onto the real one
  (`…/627e…f5.jpg6ab2…49.jpg`); Habertürk's local-news feed points at truncated city placeholders
  (`…/local-news/sakarya-`, 404); Yeniçağ and Dünya fall back to `…/images/default.png` /
  `default-45-yil.png`. The CMS behind Halk TV, Yeniçağ, Oksijen, Nefes, Elele, Artı Gerçek, Aydınlık, Dünya,
  Ekonomim and İnternethaber ships 150×84 thumbnails (`/2/150/84/storage/…`, `/rcman/Cw150h84q95gc/storage/…`);
  `/2/800/450/` and `Cw1280h720q95gc` serve the same picture large. Investing.com's `content-media` images
  answer 403 to non-browser clients.
- **Charsets:** every feed in the pack decoded cleanly as UTF-8 on 2026-09-23, so no `encoding` override is
  set. `verify:feeds` flags UTF-8 that does not decode cleanly as `utf-8!`.
- **Politeness:** send a browser User-Agent (several sites return 403 to other clients), keep per-host
  concurrency low (Euronews started answering 406 after a burst) and back off on errors. Hürriyet's
  `/rss/gundem` sometimes redirects to an HTML page for a few minutes; treat a non-feed body as a transient
  failure.

## Adding a source

1. Add a `SourceDef` to `nationalSources` in `src/shared/countries/tr/sources.ts`, or one line to `papers` in
   `tr/local.ts` for a local newspaper:

   ```ts
   {
     id: 'example-gazete', // kebab-case, unique within the pack
     name: 'Example Gazete', // official name, with Turkish characters
     homepage: 'https://www.example.com.tr',
     // A verified touch icon, else https://www.google.com/s2/favicons?domain=<host>&sz=128
     icon: 'https://www.example.com.tr/apple-touch-icon.png',
     color: '#C8102E', // brand colour for placeholders and source chips
     kind: 'mainstream',
     language: 'tr',
     defaultEnabled: false, // omit to enable by default
     feeds: [
       { url: 'https://www.example.com.tr/rss/anasayfa', category: 'top', headline: true },
       { url: 'https://www.example.com.tr/rss/son-dakika', category: 'breaking', breaking: true },
       { url: 'https://www.example.com.tr/rss/ekonomi', category: 'economy' }
     ]
   }
   ```

   ```ts
   // tr/local.ts → papers
   { id: 'example-yerel', name: 'Example Yerel', province: '35', feed: 'https://www.example-yerel.com/rss' },
   ```

2. Rules of thumb: one feed per category; skip feeds whose newest item is older than 3 days, that carry only a
   couple of items, or that weigh more than ~300 KB; set `encoding: 'windows-1254'` only when the server's
   declared charset is wrong. Keep the default set balanced and around 130 feeds.
3. Check it: `npm run verify:feeds -- example-gazete`, then `npm run typecheck`.

## Verifying feeds

```sh
npm run verify:feeds            # default-enabled sources of every pack + 3 city feeds per local source
npm run verify:feeds -- de br   # only those countries
npm run verify:feeds -- --all   # every feed of every pack, Turkey's 536 included
npm run verify:feeds -- sozcu   # every feed of the named sources
```

The script (`scripts/verify-feeds.ts`, plain Node 24) fetches with 8 requests in flight (2 per host) and a
15-second timeout, retries a failure once, and prints status, item count, age of the newest item, charset and
size per feed. A feed **fails** on a network error, a non-2xx status, a body that is not RSS/Atom, or no
items; it is **stale** when its newest item is older than 3 days. The exit code is 1 when more than 10% fail.

## The other country packs

The five packs added on 2026-09-23 follow the Turkey pack's rules but carry national sources only: no local
outlets, no province or district tables (`provinces: []`), so the app hides the Local page, the location
filter and the city question for them. Every feed below was checked against the live site on 2026-09-23 and
answered with fresh items; the ones that came back stale, empty or bot-blocked were dropped before shipping
(among them CBS News health and the Times of India technology feed).

**Why these five:** the countries with the largest online-news audiences that Masthead can serve well today —
the United States (322M internet users), India (806M, with a large English-language press), the United
Kingdom, Germany (66% weekly online news use) and Brazil (183M, among the highest news engagement anywhere).
Three of them need no new interface language; German and Brazilian Portuguese were added for the other two.

| Pack | Sources |
| --- | --- |
| `us` | NPR, PBS NewsHour, The New York Times, The Washington Post, NBC News, CBS News, ABC News, Fox News, Washington Examiner, National Review, New York Post*, Politico, The Hill, Axios, CNBC, The Verge, Ars Technica, ESPN |
| `in` | The Times of India, The Hindu, Hindustan Times, The Indian Express, NDTV, India Today, News18, Firstpost*, The Economic Times, Mint |
| `gb` | BBC News, The Guardian, Sky News, The Independent, Evening Standard, Financial Times, The Economist, Daily Mail*, Daily Mirror*, Metro* |
| `de` | tagesschau, ZDFheute, Deutsche Welle, Der Spiegel, Zeit Online, FAZ, Süddeutsche Zeitung, Welt, n-tv, Stern, Focus Online*, taz, Handelsblatt, heise online, kicker |
| `br` | G1, Folha de S.Paulo, UOL, Estadão, CNN Brasil, Metrópoles*, Agência Brasil, BBC News Brasil, Poder360, CartaCapital*, Gazeta do Povo*, Veja, InfoMoney, Exame, Olhar Digital, Tecnoblog*, ge |

\* off by default (popular press, or a second voice from the same corner), like the tabloids in the Turkey pack.

Feeds that were checked and left out: the Associated Press and The Telegraph (403 for non-browser clients),
USA Today, ITV News, Scroll.in, The Wire, Deccan Herald and the old Estadão RSS paths (no XML any more), and
CNN, whose `rss.cnn.com` feeds stopped updating years ago.

### Adding a country

1. Create `src/shared/countries/<code>/sources.ts` with the `SourceDef` list and `<code>/index.ts` with the
   `CountryPack` (`language`, `locale`, `timeZone`, `googleNews`, empty `regions`/`provinces`/`districts`
   unless you have them).
2. Add the code to `CountryCode` (`src/shared/types.ts`), to `COUNTRIES` in `src/shared/settings.ts`, and to
   `PACKS` and `ORDER` in `countries/index.ts`.
3. Add `common:country.<code>` and `common:category.national_<code>` to every locale, and flag artwork to
   `src/renderer/src/features/settings/CountryFlag.tsx`.
4. Run `npm run verify:feeds <code>` and `npm test` (the pack tests in `tests/shared/countries.test.ts` check
   ids, urls, categories and languages).

If the interface should also speak the country's language, copy `src/renderer/src/i18n/locales/en` to a new
folder, translate it, and add the code to four lists: `UI_LANGUAGES` in `src/shared/settings.ts`, `LOCALES`
in `src/renderer/src/i18n/index.ts`, `LANGUAGE_OPTIONS` in `features/settings/LanguageRegionSection.tsx`,
`LANGUAGES` in `features/onboarding/Onboarding.tsx` — and the breaking-news `LABEL` in
`src/main/notifications.ts`.

## Future: Google News RSS

Google News RSS (`https://news.google.com/rss?hl=tr&gl=TR&ceid=TR:tr`, plus topic, geo and search feeds) is a
possible fallback for countries without a pack; every pack already carries its `googleNews` edition. Notes
from testing on 2026-09-22:

- Top and topic feeds are fresh and draw on 20–35 outlets; many items list related coverage from other
  outlets.
- Geo feeds are thin (2–5 sources, days old); `search?q="<City>"+when:1d` works far better for local news.
- Links point to `news.google.com/rss/articles/…` and have to be decoded to reach the publisher; titles end
  with ` - <Source>`, which must be stripped.
- No CORS headers: fetch from the host, not the renderer.
- **Licence:** the feed's `<copyright>` allows use only "for personal, non-commercial use" in a personal feed
  reader. Masthead is a personal reader, but this must be stated in the README before the fallback ships, and
  Google News must stay a fallback rather than the primary source.
