# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Masthead keeps itself up to date.** The installed Windows app and the Linux AppImage check GitHub for a new
  version when they start and every hour after, download it in the background and ask to restart: "Restart now"
  saves everything and opens the new version, "Later" installs it the next time you quit. The portable exe, the
  macOS app and the .deb, which can't replace themselves, say when a new version is out and link to the download.
  Settings → Data & About shows the running version and where the updater stands, checks on demand, and turns
  automatic installs off (then new versions are offered, not downloaded). Windows on ARM gets the ARM installer.
- **Muted words.** Settings → Muted words hides every story that mentions them, on every page, and keeps them out
  of breaking-news notifications. Case, Turkish characters and accents don't matter; words of four letters or more
  also hide their inflected forms ("deprem" hides "depremde"), shorter ones only whole words.
- **The story page.** Every story several outlets carry has a page of its own: the lead report in full, then how
  each outlet reported it — who was first, what each one headlined, with its summary — ordered by who reported
  first or by the latest, and which kinds of outlets covered it. The "N sources" badge on every card, the Digest's
  "covered by" line and the reader's "Also covered by" row ("Compare all") lead there.
- **Command palette and keyboard shortcuts.** Ctrl/⌘+K opens one box for everything: search the news, jump to a
  matching story, a page, a topic or a source, or refresh, switch the theme, fold the sidebar. On any list of
  stories, J and K move between them, O or Enter opens one, S saves it, R refreshes, / jumps to search, and ? shows
  every shortcut.
- **For You learns from your reading.** Besides your interests and your city, For You now brings in stories like
  the ones you have been reading: the names and subjects your reads keep returning to far more than the news at
  large does ("Galatasaray", "Mansur Yavaş", "yapay zeka"), and topics you read well beyond your interests. Every
  card says why it is there ("Like what you read: Galatasaray", "Local: Erzurum", "Your interest: Economy"), the
  page lists what it learned, one subject never fills the page, and one outlet never takes more than two slots in
  a row. Stories you already read, in any outlet's report, sink to the end. It is worked out on your device only;
  turn it off on the page or in Settings → Interests.
- **Markets page.** A page for investors next to the Economy section: a watchlist of currencies, metals, crypto,
  stock markets and companies, starting with what people in your country invest in most (for Türkiye: the dollar,
  euro and pound, gram gold and silver, Bitcoin and Ethereum, Borsa İstanbul, THY, Aselsan, Garanti BBVA, Koç
  Holding, Tüpraş and BİM). Metals and crypto are priced live and currencies at the European Central Bank's daily
  reference rate, refreshed every minute while the page is open; companies are followed through their news (stock
  prices are licensed, so Masthead shows none). The economy and business feeds are fetched every minute while the
  page is open and new stories slide in at the top. The watchlist is a slim panel beside the news, a line per item;
  a line narrows the news to that item. Add and remove
  items — any currency, metal, cryptocurrency, a suggested company or one of your own — and edit the words its news
  is found by, in Settings → Markets. Prices come only from free services that offer them openly (Frankfurter/ECB,
  gold-api.com, Binance public market data).
- **Weather on the front page.** Switch it on in Settings → Language & region: your city's temperature and today's
  high and low beside the date, the next days a click away (Open-Meteo; off by default).

## [0.3.0] - 2026-09-23

Every country in its own language, with local news everywhere.

### Added

- **Local news in every country.** Pick your state in the United States, Brazil or India, your Bundesland in
  Germany or your area in the United Kingdom, as you already could pick your city in Türkiye: the Local page
  fills with that place's papers and broadcasters and every national story that names it. 50 US states and
  D.C. with 124 local newsrooms; BBC local news for 51 UK areas plus 38 regional papers; tagesschau's regional
  pages, the ARD broadcasters and regional papers for all 16 Länder; g1 for all 27 Brazilian states plus 15
  regional papers; the state pages of four Hindi dailies for 17 Indian states.
- **Many more national newsrooms**, so every topic has several voices in the country's own language:
  52 national sources in the US (the Wall Street Journal, the LA Times, ProPublica, The Atlantic, The Dispatch,
  Reason, STAT, Variety…), 29 in the UK (the Telegraph, the i, GB News, Channel 4 News, New Statesman…),
  39 in Germany (Deutschlandfunk, Sportschau, Tagesspiegel, RND, t-online, WirtschaftsWoche, Golem…), 42 in
  Brazil (O Globo, Jovem Pan, Valor, Intercept Brasil, Agência Pública, Nexo…) and 15 Hindi newsrooms in India.
  Six countries now ship **532 sources and 1,332 feeds**, every one checked against the live site.
- **India reads Hindi.** अमर उजाला, दैनिक भास्कर, दैनिक जागरण, प्रभात खबर, आज तक, NDTV इंडिया, News18 हिंदी,
  TV9 भारतवर्ष, इंडिया टीवी, ABP न्यूज़, वेबदुनिया, द वायर हिंदी, सत्य हिंदी and BBC News हिंदी.
- **हिन्दी is the fifth interface language**, next to English, Türkçe, Deutsch and Português.
- Place names are recognised in Hindi (which has no capital letters), US state names that are also other things
  ("Washington", "Georgia") only count with a place word after them, and a UK nation, a German region or a
  Brazilian region named in a story tags it for that region.
- Hindi section words (desh, duniya, khel, manoranjan, vyapar…) are recognised in feed labels and URLs.
- German and Brazilian Portuguese READMEs, and a link to the website from every README.

### Changed

- **Every source writes in its country's language.** India's English-language papers (the Times of India, the
  Hindu, Hindustan Times…) are no longer part of the India pack; a country's front page is written by its own
  newsrooms, in its own language. The multi-language `CountryPack.languages` field is gone.
- The words for places follow the country: city in Türkiye, state in the US, Brazil and India, Bundesland in
  Germany, area in the UK — in all five interface languages.
- A saved city or region that does not belong to the selected country is dropped instead of showing an empty
  Local page.

## [0.2.0] - 2026-09-23

Six countries, four interface languages.

### Added

- **Five more countries.** Country packs for the United States, India, the United Kingdom, Germany and Brazil —
  70 national newsrooms and 203 feeds, all verified against the live sites — alongside the Turkey pack. Switch
  country in Settings → Language & region; each country keeps its own news cache and its own source switches,
  while saved stories and reading history stay shared.
- **German and Brazilian Portuguese interface**, next to English and Turkish. The interface language and the
  language of the news are independent.
- Breaking-news markers in the new languages ("BREAKING", "Eilmeldung", "URGENTE", "Plantão") are recognised in
  headlines, and a headline's first letter is re-capitalised for the pack's own language.

### Changed

- **Stories now open in Reader mode by default** — the article as text, in your own reading font, with the
  publisher's page one click away in the same dialog. Settings → Reading switches it back to Web.
- `npm run verify:feeds` now checks every country pack; pass country codes (`-- de br`) to narrow it.
- Countries without a province pack hide the Local page, the location filter, the city question in the
  first-run setup and the city row in Settings.
- Feeds are requested with the pack's own `Accept-Language`, and a body that claims `iso-8859-1` is read as
  windows-1252 outside Türkiye instead of windows-1254.
- Section keywords in feed labels and article URLs are matched per language (German and Portuguese section
  names were added), so a Brazilian `/para-…/` URL is no longer filed under Economy.
- A saved story or a history entry keeps its outlet's name and logo after a country switch.

### Fixed

- The collapsed sidebar centred its icons in the rail but not in their own hover and active backgrounds, which
  sat 5.5px to the left; the reserved scrollbar gutter is now dropped while collapsed.
- A card's focus ring sat close enough to touch the headline and, at the rounded corners, a photo.

## [0.1.0] - 2026-09-23

First public release.

### Added

- News from 136 Turkish sources — 67 national outlets across the political spectrum (24 on by default) and local
  papers covering all 81 provinces — refreshed automatically, with duplicates merged
  and stories covered by several outlets grouped together ("covered by 5 sources").
- Home page with a front-page (manşet) hero, a breaking-news ticker, a live "latest" timeline and sections for
  your interests.
- **Digest** view: the day's stories with every outlet's headline, so you can follow the news without clicking.
- Full headlines, full summaries and images on every card; inline "continue reading" when the feed carries the
  full text.
- Articles open inside the app in a centred dialog (close with <kbd>Esc</kbd>), with an optional distraction-free
  Reader mode and built-in ad and tracker blocking.
- Filters for time range, sources, region and province (all 81 provinces), sort order, images only and hide read.
- Per-source on/off switches, saved articles and reading history — all stored locally.
- First-run setup: language, theme, country, interests and city in a few quick questions.
- English and Turkish interface; light, dark and system themes; five accent colours; twelve bundled reading fonts
  with adjustable size.
- Web mode (`npm run dev:web`) to run the whole app in a browser on localhost, no installation needed.
- Windows installer and portable build, macOS disk images, Linux AppImage and .deb.
