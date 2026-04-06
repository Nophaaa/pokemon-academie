# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Community hub for the **Pokemon Academie 2** Minecraft/Cobblemon event. Displays Twitch streamers (live status, clips, stats) and a Cobblemon wiki (Pokedex, type calculator, crafting, quiz). Built with **Next.js 16 (App Router)** and **React 19**, plain JavaScript (no TypeScript). Hosted on Vercel.

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build
npm run lint         # ESLint (next/core-web-vitals)
npm run format       # Prettier
```

No test framework is configured.

## Architecture

- **`app/page.js`** — Home page (client component): streamer grid, live banner, clips, stats
- **`app/wiki/`** — Wiki SPA: `page.js` (server, metadata) + `WikiClient.js` (client, tab routing) + `components/`
- **`app/api/`** — API routes proxying external services:
  - `twitch/route.js` — Twitch Helix proxy (rate-limited, endpoint-whitelisted)
  - `pokedex/route.js`, `habitats/route.js`, `wiki/route.js` — PokeAPI aggregators
- **`lib/constants.js`** — `STREAMERS` list, `EVENT_START`, `MAX_CLIPS`, `MINECRAFT_GAME_ID`
- **`lib/twitch.js`** — Server-only Twitch OAuth + authenticated fetch (never import from client)
- **`lib/api.js`** — Client-side `apiFetch()` wrapper
- **`lib/rate-limit.js`** — In-memory IP rate limiter for API routes
- **`lib/data/`** — Static data (types, natures, crafting recipes, commands)
- **`app/globals.css`** — Single CSS file (~5000 lines), CSS custom properties, BEM naming

## Key Conventions

- **UI text is French.** All user-facing strings, labels, error messages in French. Use `'fr-FR'` for locale formatting.
- **Code identifiers in English.** Variable/function names are English, `camelCase`. Constants are `UPPER_SNAKE_CASE`.
- **Imports**: Always use `@/` path alias, never relative `../../`. Order: React/Next builtins > `@/lib/*` > `@/app/components/*` > local.
- **Components**: `PascalCase.js`, one default export per file. Add `'use client'` when using hooks/browser APIs.
- **Styling**: BEM classes in `globals.css`. Dark/light theme via `[data-theme='light']` overrides on `:root`. No CSS modules or CSS-in-JS.
- **Data flow**: Client fetches go through `/api/twitch` proxy (tokens stay server-side). Use `apiFetch()` client-side, `twitchFetch()` server-side.
- **Error handling**: Client uses `showToast(msg, 'error')`. API routes return `{ error: string }` JSON.
- **Prettier**: `semi: true`, `singleQuote: true`, `trailingComma: 'all'`, `tabWidth: 2`, `printWidth: 120`.
- **ESLint**: `no-unused-vars: warn` (ignore `_` prefix), `react/no-unescaped-entities: off` (French apostrophes).

## Environment Variables

Required in `.env` (see `.env.example`):
```
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
```
