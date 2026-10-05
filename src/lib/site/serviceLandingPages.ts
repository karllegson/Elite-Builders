/**
 * Service landing pages built in the dashboard as service-area records.
 *
 * Keyed by the record's slug. When a published record with one of these slugs
 * exists, the matching built-in /services route permanently redirects to it, and
 * the record is treated as a service page (not a city) on the public site.
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

export function isServiceLandingSlug(slug: string): boolean {
  return slug in SERVICE_LANDING_ROUTES;
}

/** Dashboard slug that replaces a built-in /services route, if any. */
export function serviceLandingSlugForRoute(route: string): string | null {
  const match = Object.entries(SERVICE_LANDING_ROUTES).find(([, path]) => path === route);
  return match ? match[0] : null;
}
