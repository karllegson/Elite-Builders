# Cut Vercel "Fluid Active CPU" (Nov 2026)

Before: every public page was server-rendered on every request (ƒ). The `(site)` layout read
cookies for the admin bar, and the proxy (middleware) ran on almost every request.
After: public pages are static/ISR and served from Vercel's cache. Only `/admin/*`,
`/dashboard/*`, `/blog/[slug]` and the API routes still run per request.

## What changed and how to undo it

### 1. www redirect moved from the proxy to `next.config.ts`
- `next.config.ts`: the first entry in `redirects()` sends host `elitebuildersco.com` → `https://www.elitebuildersco.com/:path*`.
  It returns a 308 (permanent) where the old proxy returned a 301. Google treats both the same.
- `src/lib/site/productionRedirects.ts`: no longer used. A comment now says why.
- **Undo:** delete that redirect entry, then call `applyProductionSeoRedirects(request)` first thing in `src/proxy.ts` again.

### 2. The proxy only runs on `/admin`
- `src/proxy.ts`: the matcher is now `["/admin/:path*"]` and it always calls `updateSession()`.
- **Undo:** restore the old catch-all matcher and the `pathname.startsWith("/admin")` check (`git show HEAD:src/proxy.ts`).

### 3. Public pages are cacheable
- `src/app/(site)/layout.tsx`: no `getSiteAdminSession()` / cookies. It renders `<SiteAdminBarGate />` and adds `data-site-root` to the wrapper div.
- New `src/components/site/SiteAdminBarGate.tsx` (client): it only calls the session route when
  `document.cookie` has an `sb-*` / `auth-token` cookie, or always in local dev for the auth bypass.
  When the user is an admin it renders `SiteAdminBar` and adds `site-has-admin-bar` and `--site-admin-bar-height: 32px` to the wrapper.
- New `src/app/api/admin/session/route.ts`: returns `{ isAdmin, displayName, email, authBypass }` with `Cache-Control: private, no-store`.
- `src/components/site/SiteHeader.tsx`: removed the `hasAdminBar` prop. Sticky offset is now `top-[var(--site-admin-bar-height,0px)]`, which is 0 for visitors and 32px with the bar.
- `revalidate = 3600` replaces `force-dynamic` on `service-areas`, `service-areas/[city]`, `service-areas/[city]/[subpage]` and `sitemap.ts`.
  The two `[city]` routes also have `generateStaticParams()` from the published store and `dynamicParams = true`.
  `generateStaticParams()` comes from the new `listPublishedServiceAreaPathSegments()` in `src/lib/admin/serviceAreas.server.ts`, which returns `[]` if the store can't be read.
- `revalidate = 3600` added to the other pages that read dashboard data. Without it they would be cached forever:
  `/`, `/services`, `/services/[category]`, `/services/[category]/[subslug]`, `/blog`.
- `/blog/[slug]` now explicitly has `force-dynamic`. Draft and private previews check the admin cookie, so the page has to stay per-request (same as before).
- **Undo:** restore the layout from git, delete the gate and the route, restore the `hasAdminBar` prop, and swap `revalidate` back to `force-dynamic`.

### 4. Dashboard/admin saves refresh the cache right away
- New `src/lib/site/revalidatePublicPages.ts` holds the `revalidatePath` helpers. Each one is called after a successful save:

| Action(s) | Revalidates |
|---|---|
| `syncServiceAreasStoreAction` | `/service-areas` (layout), `/services` (layout), `/sitemap.xml` |
| `syncServicePagesStoreAction` | `/`, `/services` (layout) |
| `createFaqCategoryAction`, `updateFaqCategoryAction`, `deleteFaqCategoriesAction`, `saveFaqAction`, `deleteFaqsAction` | `/service-areas`, `/services`, `/blog` (layouts) |
| `savePostAction`, `updatePostFeaturedImageAction`, `bulkPostsAction` | `/blog` (layout), `/sitemap.xml` |
| `saveMediaDetails`, `removeMedia` | `/blog` (layout) |
| `saveShowcaseProjectAction`, `deleteShowcaseProjectsAction`, `saveShowcaseSettingsAction` (admin) | `/showcase` |
| `addJobAction`, `updateJobAction`, `saveStagesAction`, `deleteJobAction` (dashboard) | `/showcase` |

- Site settings (`siteConfigSettings`) are saved only in the browser (localStorage), so there's no server save to hook.
- **Undo:** remove the `revalidate…()` calls and imports, and delete the helper file.

### 5. Showcase TV
- `src/app/showcase/page.tsx`: removed `force-dynamic` and no longer reads `searchParams`. `revalidate = 60` is unchanged.
  If the store can't be read *during the build*, it renders the default (empty) store instead of failing. At runtime an error keeps the last good cached page.
- `src/components/showcase/ShowcaseTvDisplay.tsx`: `?slide=N` is read in the browser by `useSearchParams` inside `<Suspense>`. The 5-minute `window.location.reload()` is unchanged.
- **Undo:** `git checkout` both files.

## Known small differences
- Sitemap `<lastmod>` for entries with no saved date is now the time the sitemap was regenerated, not the request time.
- Scheduled blog posts appear on `/blog` and in the sitemap within an hour of their publish time. Before, they appeared right away.
- With `?slide=N`, the TV paints slide 1, then jumps to slide N once JavaScript loads.
- Admins see the admin bar appear a moment after the page loads. Normal visitors see nothing different and make no extra request.
