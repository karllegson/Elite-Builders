import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import JsonLd from "@/components/site/JsonLd";
import { ServiceAreaCityView } from "@/components/site/ServiceAreaCityView";
import { getPublishedPublicServiceAreaBySlug } from "@/lib/admin/serviceAreas.server";
import { business } from "@/lib/site/config";
import { loadFaqsForContent } from "@/lib/site/serviceAreaFaqs.server";
import { buildPageMetadata } from "@/lib/site/seo";
import type { PublicServiceArea } from "@/lib/site/serviceAreasPublic";
import {
  breadcrumbSchema,
  cityServiceAreaSchema,
  serviceSchema,
} from "@/lib/site/structuredData";

export const dynamic = "force-dynamic";

/** Shorter than this, a dashboard blurb is too thin to use as the meta description. */
const MIN_DESCRIPTION_LENGTH = 110;

/**
 * Loads the page once per request (shared by metadata and the page).
 * `undefined` means the store couldn't be read, so the browser loads it instead.
 */
const loadArea = cache(async (slug: string): Promise<PublicServiceArea | null | undefined> => {
  try {
    return await getPublishedPublicServiceAreaBySlug(slug);
  } catch {
    return undefined;
  }
});

function labelFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function describeArea(area: PublicServiceArea | null | undefined, label: string) {
  const blurb = area?.blurb?.trim() ?? "";
  if (blurb.length >= MIN_DESCRIPTION_LENGTH) {
    return blurb;
  }

  return area?.isServicePage
    ? `${label} across the Bay Area, Central Valley and Southern California. Licensed ${business.license}, family-owned since ${business.foundedYear}. Free estimates.`
    : `Framing contractor in ${label}, CA: residential, new construction, custom home, rough and structural framing. Licensed ${business.license}. Free estimates.`;
}

export async function generateMetadata(
  props: PageProps<"/service-areas/[city]">,
): Promise<Metadata> {
  const { city } = await props.params;
  const area = await loadArea(city);
  const label = area?.city ?? labelFromSlug(city);

  // Prefer the SEO title entered in the dashboard.
  const fallbackTitle = area?.isServicePage
    ? `${label} Contractor`
    : `Framing Contractor ${label} CA`;
  const dashboardTitle = area?.seoTitle?.trim();
  const isDefaultTitle = !dashboardTitle || /,\s*[A-Z]{2}$/.test(dashboardTitle);

  return buildPageMetadata({
    title: isDefaultTitle ? fallbackTitle : dashboardTitle,
    description: describeArea(area, label),
    path: `/service-areas/${city}`,
  });
}

export default async function ServiceAreaCityPage(
  props: PageProps<"/service-areas/[city]">,
) {
  const { city } = await props.params;
  const area = await loadArea(city);

  if (area === null) {
    // City pages were renamed to "-ca" slugs (stockton -> stockton-ca); send old links there.
    if (!city.endsWith("-ca") && (await loadArea(`${city}-ca`))) {
      permanentRedirect(`/service-areas/${city}-ca`);
    }
    notFound();
  }

  const path = `/service-areas/${city}`;
  const initialFaqItems = area?.content ? await loadFaqsForContent(area.content) : undefined;
  const schema = area
    ? [
        breadcrumbSchema(
          area.isServicePage
            ? [
                { name: "Home", path: "/" },
                { name: "Services", path: "/services" },
                { name: area.city, path },
              ]
            : [
                { name: "Home", path: "/" },
                { name: "Service Areas", path: "/service-areas" },
                { name: `${area.city}, CA`, path },
              ],
        ),
        area.isServicePage
          ? serviceSchema({ name: area.city, path, description: describeArea(area, area.city) })
          : cityServiceAreaSchema({
              city: area.city,
              path,
              description: describeArea(area, area.city),
            }),
      ]
    : [];

  return (
    <>
      {schema.length > 0 ? <JsonLd data={schema} /> : null}
      <ServiceAreaCityView
        citySlug={city}
        initialArea={area}
        initialFaqItems={initialFaqItems}
      />
    </>
  );
}
