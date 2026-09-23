<div align="center">

<img src="assets/logo-256.png" width="112" alt="Masthead logo" />

# Masthead

**All your news. One calm place.**

A beautiful desktop news reader that brings together the headlines of every major Turkish news outlet —
and lets you read them without ever leaving the app.

[![Release](https://img.shields.io/github/v/release/ahmetcaglayan/masthead?style=flat-square&color=f4502f)](https://github.com/ahmetcaglayan/masthead/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/ahmetcaglayan/masthead/total?style=flat-square&color=f4502f)](https://github.com/ahmetcaglayan/masthead/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/ahmetcaglayan/masthead/ci.yml?style=flat-square&label=CI)](https://github.com/ahmetcaglayan/masthead/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-2f2a24?style=flat-square)](LICENSE)
![Platforms](https://img.shields.io/badge/platforms-Windows%20·%20macOS%20·%20Linux%20·%20Web-2f2a24?style=flat-square)

**English** · [Türkçe](README.tr.md)

</div>

<p align="center">
  <img src="docs/images/home.png" alt="Masthead front page: the top story, a breaking-news bar and a live timeline of the latest headlines" width="100%" />
</p>

## Why Masthead?

Following the news in Turkey usually means a dozen browser tabs, cookie banners, autoplaying videos and pop-ups.
Masthead gathers the stories of 67 national outlets (24 on by default) and local papers in all 81 provinces into one calm, magazine-like front page:

- **Follow the agenda without clicking.** Full headlines, full summaries and photos on every card. The **Digest**
  groups the same story from different outlets, so you see who reported what at a glance.
- **Read in place.** Click a story and the publisher's own page opens in a large dialog inside the app. Press
  <kbd>Esc</kbd> and you're back. Prefer something quieter? Switch to **Reader mode**.
- **Breaking news, front page and a live timeline.** A breaking-news ticker, a manşet (front-page) hero built from
  the stories most outlets are covering, and a minute-by-minute "latest" column.
- **Your sources, your rules.** Turn any outlet on or off. Filter by time, source, region and all 81 provinces.
- **Private by design.** No account, no telemetry. Settings, saved stories and history stay on your computer.

## Screenshots

| | |
| --- | --- |
| ![Digest: one story, every outlet's headline](docs/images/digest.png) | ![A publisher's page opened inside the app](docs/images/in-app.png) |
| **Digest** — each story once, with every outlet's headline | **Read in place** — the publisher's page in a dialog, <kbd>Esc</kbd> to close |
| ![Reader mode](docs/images/reader.png) | ![Latest, in Turkish, dark theme](docs/images/latest-tr.png) |
| **Reader mode** — clean text in your chosen font | **Latest** — a minute-by-minute timeline (Turkish UI, dark theme) |
| ![First-run setup](docs/images/onboarding.png) | ![Settings](docs/images/settings.png) |
| **First run** — a few quick questions and you're in | **Settings** — themes, accent colours, fonts, sources |

## Download

Grab the latest version from the [Releases page](https://github.com/ahmetcaglayan/masthead/releases/latest):

| Platform | File |
| --- | --- |
| Windows (installer, Intel/AMD) | `Masthead-x.y.z-win-x64.exe` |
| Windows (installer, ARM) | `Masthead-x.y.z-win-arm64.exe` |
| Windows (portable, no install) | `Masthead-x.y.z-portable.exe` |
| macOS (Apple Silicon / Intel) | `Masthead-x.y.z-arm64.dmg` / `Masthead-x.y.z-x64.dmg` |
| Linux | `Masthead-x.y.z-linux-x86_64.AppImage` / `.deb` |

> **Builds are not code-signed yet.**
> - Windows SmartScreen may warn on first launch: choose **More info → Run anyway**.
> - If **Smart App Control** is on (Windows 11 → Windows Security → App & browser control), Windows may block
>   unsigned apps outright, without a "Run anyway" option. Use the browser version below, or build from source.
> - macOS: right-click the app and choose **Open** the first time.

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
| 📰 **Front page** | Manşet hero, secondary headlines, sections for your interests, live "latest" timeline |
| ⚡ **Breaking news** | Scrolling ticker, dedicated page, optional desktop notifications |
| 🧭 **Digest** | Stories grouped across outlets with every outlet's headline — the day's agenda in one scroll |
| 🔎 **Filters & search** | Time range, sources, 7 regions / 81 provinces, most-covered sort, images only, hide read; Turkish-aware search |
| 📖 **In-app reading** | Publisher's page in a dialog (<kbd>Esc</kbd> to close), Reader mode, ad & tracker blocking |
| 📍 **Local news** | Pick your city for local outlets and province-tagged stories |
| 🗂️ **Sources** | Switch each outlet on or off; feed health at a glance |
| 🔖 **Library** | Saved stories and reading history, stored locally |
| 🎨 **Make it yours** | Light / dark / system, five accent colours, twelve reading fonts, text size, compact mode |
| 🌍 **Languages** | English and Turkish interface (more to come); country selection is on the roadmap |

## Sources

Masthead ships with a curated, politically balanced set of Turkish outlets — public broadcaster, news agencies,
mainstream papers, independent and opposition media, international Turkish-language services, plus business,
sports and technology titles — and local newspapers for many provinces. See [docs/SOURCES.md](docs/SOURCES.md)
for the full list and how to add one.

Masthead only shows headlines, summaries and images that publishers provide in their public RSS feeds. Full
articles are always read on the publisher's own page.

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

## Privacy

No accounts, no analytics, no tracking. The app only connects to the news sites you enable and, if ad blocking is
on, to download public filter lists. See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Ahmet Çağlayan. News content belongs to its respective publishers.
