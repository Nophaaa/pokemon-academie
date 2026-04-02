# AGENTS.md — Pokémon Académie 2 Hub

## Project Overview

Community hub for the Pokémon Académie 2 Minecraft modpack event. Displays Twitch streamers (live status, clips, stats) and a Cobblemon wiki (Pokédex, type calculator, crafting, quiz).

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: JavaScript (no TypeScript) — uses `jsconfig.json` with `@/*` path alias
- **Styling**: Single `app/globals.css` file (~5000 lines), CSS custom properties, BEM naming
- **External APIs**: Twitch Helix (server-side, OAuth Client Credentials), PokeAPI (mixed client/server)
- **Hosting target**: Vercel

## Build / Dev / Lint Commands

```bash
npm run dev          # next dev — local development server
npm run build        # next build — production build
npm run start        # next start — serve production build
npm run lint         # next lint — ESLint with next/core-web-vitals
npm run format       # prettier --write .
```

No test framework is configured. No CI pipeline exists.

## Project Structure

```
app/
├── api/                    # Next.js API routes (server-only)
│   ├── twitch/route.js     # Proxy to Twitch Helix (rate-limited, whitelist-validated)
│   ├── pokedex/route.js    # Aggregates PokeAPI data
│   ├── pokemon-names-fr/route.js
│   ├── habitats/route.js
│   └── wiki/route.js
├── components/             # Shared UI components (home page)
├── hooks/                  # Custom React hooks
├── wiki/
│   ├── page.js             # Server component (metadata + tab config)
│   ├── WikiClient.js       # Client component (wiki SPA logic)
│   └── components/         # Wiki-specific components
├── politique-de-confidentialite/
├── layout.js               # Root layout (metadata, theme init script)
├── page.js                 # Home page (client component, main app)
└── globals.css             # All styles (single file, BEM)
lib/
├── api.js                  # Client-side fetch wrapper (apiFetch)
├── constants.js            # STREAMERS list, event config, game IDs
├── twitch.js               # Server-only: Twitch OAuth + authenticated fetch
├── rate-limit.js           # In-memory IP rate limiter for API routes
├── pokemon-api.js          # PokeAPI fetch helpers + evolution chain parsing
├── spawn.js                # Cobblemon spawn data loader + parser
├── utils.js                # Formatting helpers (views, duration, date, initials)
└── data/                   # Static data modules (types, natures, crafting, etc.)
public/
├── cobblemon/              # Cobblemon sprites/assets
├── icons/                  # App icons
├── spawn-data.json         # Prebuilt Cobblemon spawn data
├── robots.txt
└── sitemap.xml
```

## Code Style & Conventions

### Language & Locale

- **UI text**: French. All user-facing strings, error messages, labels are in French.
- **Code comments**: French for domain explanations, English for generic technical notes.
- **Variable/function names**: English.
- **Locale-sensitive formatting**: Use `'fr-FR'` (e.g. `toLocaleString('fr-FR')`).

### File Naming

- **Components**: `PascalCase.js` — one default-exported component per file.
- **Hooks**: `camelCase.js` with `use` prefix (e.g. `useScrollReveal.js`).
- **Lib modules**: `kebab-case.js` or `camelCase.js` (follow existing: `rate-limit.js`, `pokemon-api.js`, `utils.js`).
- **Data files**: `camelCase.js` in `lib/data/`.
- **API routes**: `app/api/<resource>/route.js` — Next.js App Router convention.

### Imports

- **Path alias**: Always use `@/` for project imports. Never use relative `../../` paths.
  ```js
  import { STREAMERS } from '@/lib/constants';       // ✓
  import Navbar from '@/app/components/Navbar';       // ✓
  ```
- **Order**: React/Next.js built-ins → `@/lib/*` → `@/app/components/*` → local.
- **Named exports** for lib/utility modules. **Default exports** for components and hooks.

### Components

- Add `'use client'` directive at top of any component using hooks, browser APIs, or event handlers.
- Server components (no directive) for pages that only render data/metadata.
- Destructure props in function signature: `function Card({ login, user, stream })`.
- Wrap handlers with `useCallback` when passed as props to children.
- Use `useRef` for mutable values that shouldn't trigger re-renders.
- Only one class-based component exists: `ErrorBoundary` (required by React API). All others are functions.

### Naming

- **Functions/variables**: `camelCase` — descriptive names (`handleLoadClips`, `formatViews`).
- **Constants**: `UPPER_SNAKE_CASE` (`STREAMERS`, `MAX_CLIPS`, `EVENT_START`).
- **CSS classes**: BEM — `block__element--modifier` (`streamer-card__avatar-wrap`, `status-dot--live`).
- **Booleans**: Prefix with `is`/`has`/`show` (`isLive`, `hasError`, `showScrollTop`).
- **Handlers**: Prefix with `handle` in parent, `on` in props (`handleRefresh` → `onRefresh`).

### Styling

- All styles live in `app/globals.css`. No CSS modules, no CSS-in-JS.
- Use CSS custom properties (`var(--bg)`, `var(--accent)`) for theming.
- Dark/light theme via `[data-theme='light']` overrides on `:root`.
- BEM naming: `.section__inner`, `.btn--purple`, `.streamer-card__actions`.
- Inline styles only in `ErrorBoundary` fallback (intentional — must work without CSS).

### Error Handling

- **Client**: `try/catch` → `console.error(...)` + toast notification via `showToast(msg, 'error')`.
- **API routes**: `try/catch` → `NextResponse.json({ error: message }, { status })`.
  - Always return structured `{ error: string }` JSON on failure.
  - Extract HTTP status from upstream error messages when possible.
- **ErrorBoundary** wraps the entire home page at the top level.
- **Unused variables**: Prefix with `_` to suppress lint warnings (ESLint rule configured).

### API Routes

- Import `NextResponse` from `'next/server'`.
- Apply rate limiting via `rateLimit(request, { limit, windowMs })` from `@/lib/rate-limit`.
- Validate/whitelist endpoints before proxying (see `ALLOWED_ENDPOINTS` pattern).
- Use `{ next: { revalidate: N } }` for ISR caching on external API fetches.
- Server-only modules (`lib/twitch.js`) must never be imported from client components.

### Data Fetching

- **Client → Server**: All Twitch data goes through `/api/twitch` proxy (never expose tokens).
- **Client-side**: `apiFetch(endpoint)` from `@/lib/api` — wraps fetch with error handling.
- **Server-side**: `twitchFetch(endpoint)` from `@/lib/twitch` — adds OAuth bearer token.
- **Parallel fetching**: Use `Promise.all([...])` for independent requests.
- **Auto-refresh**: Home page polls every 5 minutes with `setInterval`.

### Formatting (Prettier)

```json
{ "semi": true, "singleQuote": true, "trailingComma": "all", "tabWidth": 2, "printWidth": 120 }
```

### Linting (ESLint)

- Extends `next/core-web-vitals`.
- `no-unused-vars`: warn (ignore `_` prefixed args/vars).
- `no-empty`: warn (empty catch blocks not allowed).
- `react/no-unescaped-entities`: off (French text uses apostrophes freely).
- `react-hooks/exhaustive-deps`: warn.

## Environment Variables

Required in `.env` (see `.env.example`):

```
TWITCH_CLIENT_ID=       # Twitch Developer Console app client ID
TWITCH_CLIENT_SECRET=   # Twitch app secret (server-side only)
```

Never commit `.env`. The `.gitignore` blocks `.env`, `.env.local`, `.env*.local`, and `config.js`.

## Security Notes

- CSP headers configured in `next.config.mjs` (strict in prod, relaxed in dev for HMR).
- Twitch API proxy whitelists allowed endpoints to prevent path traversal.
- Rate limiting: 60 req/min per IP on API routes.
- X-Frame-Options: DENY, X-Content-Type-Options: nosniff.
