# AI Now

A multilingual news platform showcasing Chinese AI entrepreneurs and their startup stories to a global audience. Available in Chinese, English, and German.

**UI inspired by [Rest of World](https://restofworld.org)** — professional news media design with clean typography, responsive layout, and modern aesthetics.

## Features

### Frontend (Reader-facing)
- **Homepage** — News ticker, featured article hero, Editor's Picks, category sections, newsletter signup
- **Article Detail** — Long-form reading with serif typography, reading progress bar, social sharing, related articles
- **Category Pages** — Filtered article listings with pagination
- **Search** — Real-time full-text search across articles
- **Multi-language** — Chinese (zh), English (en), German (de) with URL-based locale routing
- **Responsive** — Mobile-first design with 3 breakpoints (320px, 768px, 1024px)

### Admin Dashboard (`/admin`)
- **Authentication** — JWT-based admin login with scrypt password hashing and CSRF-protected admin actions
- **Article Management** — List, edit, publish, reject, delete articles with live preview
- **WeChat RSS** — Embedded wechat-rss-lite admin (login, subscriptions, polling) via authenticated proxy
- **RSS Source Management** — Import feeds from wechat-rss-lite subscriptions or add manually; manual fetch trigger
- **Content Converter** — Automatically transforms WeChat HTML into clean, website-adapted content

### Backend
- **wechat-rss-lite Integration** — Fetches and parses RSS feeds from WeChat public accounts
- **SQLite Database** — Lightweight storage for articles, sources, categories, and admin users
- **Content Pipeline** — Strips WeChat styling, preserves semantic structure, extracts cover images and summaries

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| i18n | next-intl |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (jose) |
| Icons | Lucide React |
| Fonts | Inter (headings/UI) + Georgia (body) |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

Create a local environment file before starting the app:

```bash
JWT_SECRET="replace-with-at-least-32-random-characters"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-with-a-strong-password"
ALLOW_PRIVATE_FEED_URLS="true"
WECHAT_RSS_BASE_URL="http://127.0.0.1:8081"
WECHAT_RSS_ADMIN_TOKEN=""
```

`ALLOW_PRIVATE_FEED_URLS` is useful when developing against a local wechat-rss-lite service. Do not enable it in production.

Set `WECHAT_RSS_ADMIN_TOKEN` to the same value as `ADMIN_API_TOKEN` in `services/wechat-rss-lite/.env` so the embedded admin panel and article fetch work without pasting a token manually.

### wechat-rss-lite (WeChat article crawler)

The crawler lives in `services/wechat-rss-lite` (git submodule). One-time setup:

```bash
git submodule update --init
npm run wechat-rss:setup
npm run wechat-rss:sync-env   # generates ADMIN_API_TOKEN + syncs .env.local (also runs via wechat-rss:dev)
```

Start the API (default `http://127.0.0.1:8081`):

```bash
npm run wechat-rss:dev
```

In another terminal, start the site:

```bash
npm run dev
```

Open **Admin → WeChat RSS** for login, subscriptions, and RSS settings. Use **RSS Sources → Import from WeChat RSS** to add feeds, then **Fetch** to ingest articles.

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Admin Panel

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin dashboard.

The first admin user is created from `ADMIN_USERNAME` and `ADMIN_PASSWORD` when the database is initialized. Passwords must be at least 12 characters.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
services/
└── wechat-rss-lite/       # Git submodule — WeChat RSS API + admin UI
src/
├── app/
│   ├── [locale]/          # Locale-routed pages (homepage, article, category, etc.)
│   ├── admin/             # Admin dashboard (login, management)
│   ├── api/admin/         # Admin API routes (login, articles, sources, fetch)
│   ├── globals.css        # Global styles + Tailwind
│   └── layout.tsx         # Root layout
├── components/
│   ├── admin/             # Admin UI (Dashboard, ArticlesPanel, SourcesPanel, Editor)
│   ├── article/           # Article components (Content, ReadingProgress, Share, Related)
│   ├── home/              # Homepage sections (Ticker, Featured, Categories, Newsletter)
│   ├── layout/            # Header, Footer
│   └── pages/             # Page-level content components
├── i18n/                  # Internationalization config and routing
├── lib/
│   ├── auth.ts            # JWT authentication utilities
│   ├── content-converter.ts # WeChat HTML → clean article converter
│   ├── db.ts              # SQLite database initialization and access
│   └── mock-data.ts       # Development mock data
└── messages/              # Translation files (en.json, zh.json, de.json)
```

## Content Pipeline

1. **Configure Source** — Add a wechat-rss-lite feed URL in the admin panel
2. **Fetch Articles** — Click "Fetch" to pull new articles from the RSS feed
3. **Auto-Convert** — WeChat HTML is automatically cleaned and adapted to the site's typography
4. **Review & Edit** — Edit title, summary, author, category, cover image in the admin editor
5. **Publish** — Approve articles to make them visible on the public site

## Deployment

The project is designed for deployment on:
- **Vercel** — Frontend (Next.js SSR/ISR)
- **Railway / Fly.io** — Backend services (if separating crawler/translation)

For a simple deployment, the entire app runs as a single Next.js instance with SQLite.

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).
