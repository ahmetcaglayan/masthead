# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
