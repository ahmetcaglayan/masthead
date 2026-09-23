# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Use GitHub's
[private vulnerability reporting](https://github.com/ahmetcaglayan/masthead/security/advisories/new)
instead. You should get a response within a few days.

## How Masthead handles your data

- **No accounts, no telemetry, no analytics.** Nothing about you leaves your computer.
- The app only talks to the news sites you have enabled (RSS feeds, article pages and images) and, when ad
  blocking is on, to the filter-list hosts (GitHub, AdGuard) to download block lists.
- Settings, saved articles and reading history are plain JSON files in your user data folder
  (`%APPDATA%\Masthead` on Windows, `~/Library/Application Support/Masthead` on macOS,
  `~/.config/Masthead` on Linux). Web mode stores them in `.masthead-web/` in the project folder.
- Article pages open in an isolated, sandboxed browser view with its own session: no Node.js access,
  downloads blocked, permission prompts (camera, location, notifications…) denied, and links to external
  apps (`mailto:`, custom protocols) refused.

## Supported versions

Only the latest release receives security fixes.
