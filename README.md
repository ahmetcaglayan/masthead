<div align="center">

<img src="assets/logo-256.png" width="112" alt="Masthead logo" />

# Masthead

**All your news. One calm place.**

A beautiful desktop news reader that brings the headlines of a country's major newsrooms together —
and lets you read them, ad-free, without ever leaving the app.
**Türkiye · United States · India · United Kingdom · Germany · Brazil · France.**

[![Release](https://img.shields.io/github/v/release/ahmetcaglayan/masthead?style=flat-square&color=f4502f)](https://github.com/ahmetcaglayan/masthead/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/ahmetcaglayan/masthead/total?style=flat-square&color=f4502f)](https://github.com/ahmetcaglayan/masthead/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/ahmetcaglayan/masthead/ci.yml?style=flat-square&label=CI)](https://github.com/ahmetcaglayan/masthead/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-2f2a24?style=flat-square)](LICENSE)
![Platforms](https://img.shields.io/badge/platforms-Windows%20·%20macOS%20·%20Linux%20·%20Web-2f2a24?style=flat-square)

[**Website**](https://ahmetcaglayan.github.io/masthead/) ·
[**Download 0.5.0**](https://github.com/ahmetcaglayan/masthead/releases/latest) ·
[Changelog](CHANGELOG.md)

**English** · [Türkçe](README.tr.md) · [Deutsch](README.de.md) · [Português](README.pt.md)

</div>

<p align="center">
  <img src="docs/images/home.png" alt="Masthead front page: the top story, a breaking-news bar and a live timeline of the latest headlines" width="100%" />
</p>

## Why Masthead?

Following the news usually means a dozen browser tabs, cookie banners, autoplaying videos and pop-ups.
Masthead gathers **955 newsrooms across seven countries** — each country's own press, in its own language — into one
calm, magazine-like front page:

- **Follow the agenda without clicking.** Full headlines, a summary and a photo on every card — the lead story
  carries its summary in full, the rest end with “Full summary”. The **Digest**
  groups the same story from different outlets, so you see who reported what at a glance.
- **Read in place, without the ads.** Click a story and it opens in a large dialog inside the app — in
  **Reader mode** by default: the article as text, in your own reading font. The publisher's page is one
  click away in the same dialog, with ads and trackers blocked. Press <kbd>Esc</kbd> and you're back.
- **Breaking news, front page and a live timeline.** A breaking-news ticker, a front-page hero built from
  the stories most outlets are covering, and a minute-by-minute "latest" column.
- **Your sources, your rules.** Turn any outlet on or off. Filter by time range, source, sort order and
  pictures — and by region and city, state or area.
- **Local news everywhere.** Pick your city in Türkiye, your state in the US, Brazil or India, your Bundesland
  in Germany, your area in the UK or your département in France: its local papers and broadcasters join in, with
  every national story that names it.
- **Private by design.** No account, no telemetry. Settings, saved stories and history stay on your computer.

### Read the news, not the ads

Every story opens inside Masthead, and the embedded browser runs with **ad and tracker blocking** switched on
(EasyList-based, toggleable in Settings → Reading). No consent banners fighting for your attention, no
autoplaying video, no newsletter pop-up over the second paragraph — the article, the way the newsroom wrote it.
Ad blocking belongs to the desktop app: in the browser version an article is shown in a frame or in Reader mode,
and only the publisher's own page can block anything.

**Reader mode is what a story opens in**: headline, byline and body in your own reading font and size, on the
app's warm paper or deep-ink background. Same story, no layout, no scripts. Switch to **Web** in the toolbar
whenever you want the publisher's own page — or make Web the default again in Settings → Reading. Downloads, pop-ups and permission requests from news pages are refused,
and the embedded browser runs in its own sandboxed session, separate from everything else.

### One story, every outlet

The same event is rarely told the same way twice. Masthead clusters the stories that different newsrooms publish
about one event, so you can read around a story instead of through a single outlet:

- On the **front page**, the top story shows how many outlets are covering it ("8 sources") with the other
  newsrooms' own headlines underneath.
- The **Digest** page is that idea end to end: one card per event, the fullest summary at the top, and every
  other outlet's headline below it with its logo and the time it published — the whole day's agenda, no clicking.
- Inside an open article, **"Also covered by"** lists the same event elsewhere, so you can jump from one
  newsroom's version to another's in a click, or step through the day's stories with
  <kbd>Alt</kbd> + <kbd>←</kbd> / <kbd>→</kbd>.
- Sort any feed by **Most covered** to put the stories many outlets are running first.

## Screenshots

| | |
| --- | --- |
| ![Digest: one story, every outlet's headline](docs/images/digest.png) | ![A publisher's page opened inside the app](docs/images/in-app.png) |
| **Digest** — each story once, with every outlet's headline | **Read in place** — the publisher's page in a dialog, <kbd>Esc</kbd> to close |
| ![Reader mode](docs/images/reader.png) | ![Latest, in Turkish, dark theme](docs/images/latest-tr.png) |
| **Reader mode** — clean text in your chosen font | **Latest** — a minute-by-minute timeline (Turkish UI, dark theme) |
| ![First-run setup](docs/images/onboarding.png) | ![Settings](docs/images/settings.png) |
| **First run** — a few quick questions and you're in | **Settings** — themes, accent colours, fonts, sources |

## Seven countries, six languages

Each country is read through its own newsrooms, in its own language, down to local news: a city in Türkiye, a
state in the US, Brazil or India, a Bundesland in Germany, an area in the UK, a département in France. The
interface language is independent of it: read Brazilian newspapers with a German interface if that is what you want.

| | |
| --- | --- |
| ![Masthead's front page with United States sources](docs/images/us-home.png) | ![Masthead's front page with United Kingdom sources](docs/images/gb-home.png) |
| 🇺🇸 **United States** — 104 national newsrooms, from NPR and the NYT to Fox News and the WSJ, and local news for every state | 🇬🇧 **United Kingdom** — BBC, Guardian, Telegraph, Sky News, the FT… and BBC local news for 51 areas |
| ![Masthead in German with German sources](docs/images/de-home.png) | ![The Digest page in Portuguese with Brazilian sources](docs/images/br-digest.png) |
| 🇩🇪 **Germany** — tagesschau, Spiegel, Zeit, FAZ, SZ… with the interface in German | 🇧🇷 **Brazil** — the Digest in Portuguese: one card, every outlet's headline |
| ![The Local page for Rajasthan, in Hindi, with Hindi state news](docs/images/in-local.png) | ![Reader mode on a German article](docs/images/de-reader.png) |
| 🇮🇳 **India** — the Hindi press (अमर उजाला, दैनिक भास्कर, नवभारत टाइम्स, हिन्दुस्तान, आज तक…) and the Local page for your state | 📖 **Reader mode** — the article and nothing else, in your own reading font |

🇫🇷 **France** — franceinfo, Le Monde, Le Figaro, Le Parisien, Libération, Les Echos, L'Équipe… with the interface in
French, and local news for all 101 departments: France 3, the local ici station and the regional dailies.


## Download

Grab the latest version from the [Releases page](https://github.com/ahmetcaglayan/masthead/releases/latest):

| Platform | File |
| --- | --- |
| Windows (installer, Intel/AMD) | `Masthead-x.y.z-win-x64.exe` |
| Windows (installer, ARM) | `Masthead-x.y.z-win-arm64.exe` |
| Windows (portable, no install) | `Masthead-x.y.z-portable.exe` |
| macOS (Apple Silicon / Intel) | `Masthead-x.y.z-arm64.dmg` / `Masthead-x.y.z-x64.dmg` |
| Linux | `Masthead-linux-x86_64.AppImage` / `.deb` |

**Install once, then it keeps itself up to date.** The Windows installer and the Linux AppImage check for a new
version every hour, download it in the background and ask you to restart; the portable exe, the macOS app and
the .deb tell you when one is out. Switch automatic installs off in Settings → Data & About.

> **Builds are not code-signed yet.**
> - Windows SmartScreen may warn on first launch: choose **More info → Run anyway**.
> - If **Smart App Control** is on (Windows 11 → Windows Security → App & browser control), Windows may block
>   unsigned apps outright, without a "Run anyway" option. Use the browser version below, or build from source.
> - macOS: the first time, macOS won't open it. Go to System Settings → Privacy & Security and choose
>   **Open Anyway**. (0.4.0 and older may be called "damaged": run `xattr -cr /Applications/Masthead.app` once.)

### Can't install apps? Run it in your browser

The whole app also runs in a normal browser on your own machine — handy on a work computer where installing
software isn't allowed:

```bash
git clone https://github.com/ahmetcaglayan/masthead.git
cd masthead
npm install
npm run dev:web      # open http://localhost:5173
```

In the browser, stories open in an embedded frame when the site allows it and in Reader mode otherwise (browsers
block most news sites from being embedded; the desktop app has no such limit).

## Features

| | |
| --- | --- |
| 📰 **Front page** | A front-page hero, secondary headlines, sections for your interests, a live "latest" timeline |
| ⚡ **Breaking news** | Scrolling ticker, dedicated page, optional desktop notifications |
| 🧭 **Digest** | Stories grouped across outlets with every outlet's headline — the day's agenda in one scroll |
| 🔎 **Filters & search** | Time range, sources, most-covered sort, images only, hide read — plus regions and cities, states or areas in every country; accent-insensitive search |
| 📖 **In-app reading** | Publisher's page in a dialog (<kbd>Esc</kbd> to close), Reader mode, ad & tracker blocking |
| 📍 **Local news** | 81 Turkish cities, 50 US states and D.C., 36 Indian states, 16 German Länder, 27 Brazilian states, 51 UK areas, 101 French departments — local papers, broadcasters and the stories that name your place |
| 📈 **Markets** | Your watchlist of currencies, metals, crypto and companies — prices every minute, each one's news, and the markets wire filling in live |
| ✨ **For You** | Your interests, your city and what you have been reading (learned on your computer); every card says why it is there |
| 🧵 **Story pages** | Every outlet's report of a story side by side: who was first, what each headlined |
| ⌨️ **Command palette** | <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> to go anywhere; <kbd>J</kbd>/<kbd>K</kbd> to move through stories, <kbd>S</kbd> to save |
| 🔇 **Muted words** | Stories that mention them disappear everywhere, notifications included |
| ⛅ **Weather** | Your city's forecast beside the date on the front page (optional) |
| 🗂️ **Sources** | Switch each outlet on or off; feed health at a glance |
| 🔖 **Library** | Saved stories and reading history, stored locally |
| 🎨 **Make it yours** | Light / dark / system, five accent colours, twelve reading fonts, text size, compact mode |
| 🌍 **Countries** | Türkiye, the United States, India, the United Kingdom, Germany, Brazil and France — switch in Settings |
| 💬 **Languages** | English, Türkçe, Deutsch, Português, हिन्दी and Français interface; the news stays in its own language |
| 🔄 **Automatic updates** | New versions download in the background; one click restarts into them |

## Sources

Masthead ships a **country pack** per country: a curated, politically balanced set of outlets — public
broadcasters, news agencies, mainstream papers, independent media, plus business, sports, technology, health,
travel and culture titles — and the country's local press. Every outlet writes in the country's own language:
India reads its Hindi press, Germany its German newsrooms, France its French ones.

| Country | Sources | Feeds |
| --- | --- | --- |
| 🇹🇷 Türkiye | 136 (67 national + local: city feeds for all 81 provinces, papers in 33 of them) | 536 |
| 🇺🇸 United States | 227 (104 national + 123 local newsrooms, two or three in every state and D.C.) | 299 |
| 🇮🇳 India | 48, all in Hindi (40 national + the state pages of eight dailies, 23 states) | 263 |
| 🇬🇧 United Kingdom | 139 (71 national + BBC local news for 51 areas and 67 regional papers) | 251 |
| 🇩🇪 Germany | 154 (99 national + regional news for all 16 Länder from 55 newsrooms) | 249 |
| 🇧🇷 Brazil | 130 (95 national + g1 for all 27 states and 34 regional papers) | 221 |
| 🇫🇷 France | 121 (78 national + France 3, ici and regional papers for all 101 departments) | 423 |

Every feed is checked against the live sites before it ships (`npm run verify:feeds`). See
[docs/SOURCES.md](docs/SOURCES.md) for the full list, the country-pack layout and how to add a source or a
country of your own.

Masthead shows the headlines, summaries and images publishers provide in their public RSS feeds, with the
outlet's name on every card and a link to its page. Reader mode lays out the article from the publisher's own
page, fetched on the reader's computer — never for articles the publisher keeps for subscribers.

### For publishers

Masthead is a free, open-source reader that runs on people's own computers. There is no Masthead server: nothing
is republished, stored for others or sold. It reads the RSS feeds you publish, credits and links your outlet on
every story, and leaves subscriber-only articles on your site (Reader mode honours `isAccessibleForFree` and
`article:content_tier`). If you would rather your outlet were not included, or want a feed changed,
[open an issue](https://github.com/ahmetcaglayan/masthead/issues/new?labels=publisher&title=Publisher%20request%3A%20) and it will be out of the next release.

## Development

```bash
npm install
npm run dev          # desktop app with hot reload
npm run dev:web      # browser version at http://localhost:5173
npm test             # unit tests
npm run typecheck && npm run lint
npm run dist:win     # build the Windows installer and portable exe into release/
```

Built with Electron, React, TypeScript, Tailwind CSS and Vite. The backend (`src/core`) is plain Node.js and
runs both inside the desktop app and behind the web mode. Read [docs/PLAN.md](docs/PLAN.md) for the architecture
and roadmap and [CONTRIBUTING.md](CONTRIBUTING.md) to get involved.

### On a network that inspects HTTPS

On some company networks a proxy re-signs every HTTPS connection with the organisation's own root certificate.
Browsers accept it through the system trust store, but Node.js keeps its own — so every feed fails with
`SELF_SIGNED_CERT_IN_CHAIN` and the app stays empty. Save that root certificate as a PEM file and point Node at
it:

```bash
NODE_EXTRA_CA_CERTS=/path/to/root-ca.pem npm run dev:web
```

The same variable applies to `npm run dev`: articles render in an embedded browser view that uses the system
store, but the feeds are fetched by Node.

## Privacy

No accounts, no analytics, no tracking. The app only connects to the news sites you enable, to GitHub once an hour
to see whether a new version of Masthead is out, and, if ad blocking is on, to download public filter lists. While
the Markets page is open it asks for prices from the European Central Bank's reference rates (via Frankfurter),
gold-api.com and Binance's public market data; if you switch the weather card on, Open-Meteo gets your city's name
and position. For You learns from your reading history on your computer. See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Ahmet Çağlayan. News content belongs to its respective publishers.
