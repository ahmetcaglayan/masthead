# Masthead — notes for Claude

Desktop news aggregator (Electron 44 + React 19 + TypeScript + Tailwind 4, electron-vite 5 / Vite 7).
Owner communicates in Turkish; UI default language is English, Turkish is the second language.

## Always

- **Start of a session:** read `docs/PROGRESS.md` (where we left off, next step) and skim `docs/PLAN.md`.
- **After finishing any piece of work:** tick it in `docs/PROGRESS.md` (`[x]` + date), update "Son durum" and
  "Sıradaki adım", and add notable decisions to the decisions table. Keep `docs/PLAN.md` roadmap checkboxes in sync.
- Progress/plan docs are written in Turkish; code, comments and commit messages in English.

## Architecture in one breath

- `src/shared` — types and contracts used everywhere (`types.ts`, `ipc.ts` = `MastheadApi`, `settings.ts`, country packs).
- `src/core` — host-independent backend (news pipeline, stores, reader extraction). Plain Node: **never import
  `electron`**, use relative imports (it also runs inside the Vite web host and vitest).
- `src/main` + `src/preload` — Electron host (window, IPC ↔ core, `WebContentsView` article reader, adblock).
- `src/web` — web host: Vite plugin exposing the same API over HTTP + SSE for `npm run dev:web` (browser on localhost).
- `src/renderer` — React UI; talks only to `api` from `lib/api.ts` (IPC in Electron, HTTP in web mode).

## Commands

`npm run dev` (Electron) · `npm run dev:web` (browser, http://localhost:5173) · `npm test` · `npm run typecheck` ·
`npm run lint` · `npm run build` · `npm run dist:win` · `npm run icons`

## Gotchas

- Windows PowerShell 5.1 `Get-Content`/`Set-Content` corrupt UTF-8 (Turkish characters) — edit files with the editor tools.
- Styling uses semantic tokens from `src/renderer/src/styles/globals.css` (`bg-canvas`, `text-fg-muted`, `border-line`,
  `bg-accent`…); no hard-coded colours. All strings go through i18next namespaces in `src/renderer/src/i18n/locales/{en,tr}`.
