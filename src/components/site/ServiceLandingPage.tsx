import type { Metadata } from "next";
import { cache } from "react";
import JsonLd from "@/components/site/JsonLd";
import { ServiceAreaCityView } from "@/components/site/ServiceAreaCityView";
import { getPublishedServiceLandingArea } from "@/lib/admin/serviceAreas.server";
import { business } from "@/lib/site/config";
import { loadFaqsForContent } from "@/lib/site/serviceAreaFaqs.server";
import { buildPageMetadata } from "@/lib/site/seo";
import type { PublicServiceArea } from "@/lib/site/serviceAreasPublic";
import { breadcrumbSchema, serviceSchema } from "@/lib/site/structuredData";

/** Shorter than this, a dashboard blurb is too thin to use as the meta description. */
const MIN_DESCRIPTION_LENGTH = 110;

/**
 * Dashboard-built page for a /services route, loaded once per request
 * (shared by metadata and the page). Null means the built-in template is used.
 */
export const loadServiceLandingArea = cache(
  (route: string): Promise<PublicServiceArea | null> => getPublishedServiceLandingArea(route),
);

function describeServiceLanding(area: PublicServiceArea) {
  const blurb = area.blurb.trim();
  if (blurb.length >= MIN_DESCRIPTION_LENGTH) {
    return blurb;
  }

  return `${area.city} across the Bay Area, Central Valley and Southern California. Licensed ${business.license}, family-owned since ${business.foundedYear}. Free estimates.`;
}

export function buildServiceLandingMetadata(area: PublicServiceArea, path: string): Metadata {
  // Prefer the SEO title entered in the dashboard.
  const dashboardTitle = area.seoTitle.trim();
  const isDefaultTitle = !dashboardTitle || /,\s*[A-Z]{2}$/.test(dashboardTitle);

  return buildPageMetadata({
    title: isDefaultTitle ? `${area.city} Contractor` : dashboardTitle,
    description: describeServiceLanding(area),
    path,
  });
}

type ServiceLandingPageProps = {
  area: PublicServiceArea;
  /** The /services URL the page is served at. */
  path: string;
};

/** A dashboard-built service page, rendered at its /services URL. */
export default async function ServiceLandingPage({ area, path }: ServiceLandingPageProps) {
  const initialFaqItems = area.content ? await loadFaqsForContent(area.content) : undefined;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: area.city, path },
          ]),
          serviceSchema({ name: area.city, path, description: describeServiceLanding(area) }),
        ]}
      />
      <ServiceAreaCityView
        citySlug={area.slug}
        initialArea={area}
        initialFaqItems={initialFaqItems}
      />
    </>
  );
}
