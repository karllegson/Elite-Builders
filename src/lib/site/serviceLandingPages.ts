/**
 * Service landing pages built in the dashboard as service-area records.
 *
 * Keyed by the record's slug. A published record with one of these slugs is shown at
 * its /services URL (replacing the built-in template there) and is treated as a service
 * page, not a city. Its old /service-areas/{slug} URL redirects (see next.config.ts).
 */
export const SERVICE_LANDING_ROUTES: Record<string, string> = {
  // Framing
  "framing-contractor": "/services/framing-contractor",
  "residential-framing": "/services/framing-contractor/residential-framing",
  "new-construction-framing": "/services/framing-contractor/new-construction-framing",
  "custom-home-framing": "/services/framing-contractor/custom-framing",
  "rough-framing": "/services/framing-contractor/rough-framing",
  "structural-framing": "/services/framing-contractor/structural-framing",
  // Home builder
  "home-builder": "/services/home-builder",
  "home-addition-construction": "/services/home-builder/home-addition-construction",
  "luxury-home-building": "/services/home-builder/luxury-home-building",
  "new-home-construction": "/services/home-builder/new-home-construction",
  "custom-home-building": "/services/home-builder/custom-home-building",
};

/**
 * Old /service-areas URLs and where they permanently redirect (next.config.ts).
 * Exact paths only: city sub-pages like /service-areas/modesto-ca/residential-framing stay put.
 */
export const MOVED_SERVICE_AREA_PATHS: Record<string, string> = {
  "/service-areas/framing-contractor": "/services/framing-contractor",
  "/service-areas/residential-framing": "/services/framing-contractor/residential-framing",
  "/service-areas/new-construction-framing": "/services/framing-contractor/new-construction-framing",
  "/service-areas/custom-home-framing": "/services/framing-contractor/custom-framing",
  "/service-areas/rough-framing": "/services/framing-contractor/rough-framing",
  "/service-areas/structural-framing": "/services/framing-contractor/structural-framing",
  "/service-areas/home-addition-construction": "/services/home-builder/home-addition-construction",
  "/service-areas/bay-area": "/service-areas",
};

export function isServiceLandingSlug(slug: string): boolean {
  return slug in SERVICE_LANDING_ROUTES;
}

/** Public /services URL for a top-level dashboard record with this slug, if it is a service page. */
export function serviceLandingRouteForSlug(slug: string): string | null {
  return SERVICE_LANDING_ROUTES[slug] ?? null;
}

/** Dashboard slug whose page is shown at this /services route, if any. */
export function serviceLandingSlugForRoute(route: string): string | null {
  const match = Object.entries(SERVICE_LANDING_ROUTES).find(([, path]) => path === route);
  return match ? match[0] : null;
}
