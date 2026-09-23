# Contributing to Masthead

Thanks for helping! Bug reports, new news sources, translations and code are all welcome.

## Getting started

```bash
git clone https://github.com/ahmetcaglayan/Masthead.git
cd Masthead
npm install
npm run dev        # desktop app (Electron) with hot reload
npm run dev:web    # the same app in your browser at http://localhost:5173
```

Requirements: Node.js 22.12 or newer (24 recommended).

Before opening a pull request:

```bash
npm run typecheck
npm run lint
npm test
```

## Project layout

| Folder | What lives there |
| --- | --- |
| `src/shared` | Types and contracts shared by every part of the app, plus the country packs (news sources, provinces) |
| `src/core` | The backend: news fetching and parsing, story clustering, settings and library storage, Reader mode. Plain Node.js — it never imports Electron |
| `src/main`, `src/preload` | The Electron desktop host |
| `src/web` | The web-mode host (a Vite plugin that serves the same API over HTTP) |
| `src/renderer` | The React interface |
| `tests` | Vitest unit tests and feed fixtures |
| `docs` | Plan, progress log and source list |

See [`docs/PLAN.md`](docs/PLAN.md) for the architecture and roadmap.

## Adding a news source

1. Add a `SourceDef` to `src/shared/countries/tr/sources.ts` (see [`docs/SOURCES.md`](docs/SOURCES.md) for an example).
2. Run `npm run verify:feeds` to check that every feed responds and parses.
3. Open a pull request with the outlet's name and why it's a good addition.

## Translations

Interface strings live in `src/renderer/src/i18n/locales/<language>/<namespace>.json`. English (`en`) is the
reference. To add a language, copy the `en` folder, translate the values (keep the keys), and add the language
code to `UI_LANGUAGES` in `src/shared/settings.ts`.

## Code style

TypeScript (strict), Prettier formatting (`npm run format`), and the design tokens in
`src/renderer/src/styles/globals.css` instead of hard-coded colours. Keep pull requests focused.
