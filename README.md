# Elite Builders IX

Contractor admin dashboard and website for [elitebuildersco.com](https://elitebuildersco.com).

**Stack:** Next.js (Vercel) + Supabase (Auth, Postgres, Storage)

## Phase 1 — Admin shell (current)

- `/admin` — custom contractor admin dashboard (login, sidebar, welcome notice)
- Content sections show “Coming soon” until wired to Supabase in later phases

## Quick start

### 1. Install

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. **Authentication → Providers** — enable Email
3. **SQL Editor** — run [`supabase/migrations/001_auth_profiles.sql`](supabase/migrations/001_auth_profiles.sql)
4. **Authentication → Users** — add your admin user
5. Copy `.env.local.example` → `.env.local` and add your URL + anon key

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin)

**Dev bypass (no Supabase yet):** `.env.local` includes `BYPASS_ADMIN_AUTH=true` — go straight to `/admin` with no login. Works in `npm run dev` only; disabled in production builds.

### 4. Deploy to Vercel

1. Push repo to GitHub
2. Import project in Vercel
3. Add the same env vars from `.env.local`
4. Point `elitebuildersco.com` at Vercel

## Revert / rollback

If you don’t like this setup, reset to the pre-app state:

```bash
git checkout HEAD -- .
git clean -fd
```

(Only run if you haven’t committed work you want to keep.)

## Roadmap

| Phase | Feature |
|-------|---------|
| 1 | Dashboard shell ✅ |
| 2 | Posts + Pages (Supabase CRUD) |
| 3 | Service Areas, Gallery, FAQs, Reviews, Media |

## Config

- Site name & support email: [`src/lib/admin/config.ts`](src/lib/admin/config.ts)
- Logo: [`public/logo.png`](public/logo.png)
