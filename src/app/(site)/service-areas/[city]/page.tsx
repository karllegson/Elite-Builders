import type { Metadata } from "next";
import { ServiceAreaCityView } from "@/components/site/ServiceAreaCityView";
import { getPublishedPublicServiceAreaBySlug } from "@/lib/admin/serviceAreas.server";
import { business } from "@/lib/site/config";
import { buildPageMetadata } from "@/lib/site/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/service-areas/[city]">,
): Promise<Metadata> {
  const { city } = await props.params;
  const area = await getPublishedPublicServiceAreaBySlug(city).catch(() => null);
  const label =
    area?.city ??
    city
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  // Prefer the SEO title / meta description entered in the dashboard.
  const fallbackTitle = area?.isServicePage
    ? `${label} Contractor`
    : `Framing Contractor ${label} CA`;
  const fallbackDescription = area?.isServicePage
    ? `${label} across the Bay Area, Central Valley, and Southern California. Licensed contractor ${business.license}. Request a free estimate from Elite Builders.`
    : `Residential, new construction, rough, and structural framing plus custom home building in ${label}, California. Licensed contractor ${business.license}. Request a free estimate from Elite Builders.`;
  const dashboardTitle = area?.seoTitle?.trim();
  const isDefaultTitle = !dashboardTitle || /,\s*[A-Z]{2}$/.test(dashboardTitle);

  return buildPageMetadata({
    title: isDefaultTitle ? fallbackTitle : dashboardTitle,
    description: area?.blurb?.trim() || fallbackDescription,
    path: `/service-areas/${city}`,
  });
}

export default async function ServiceAreaCityPage(
  props: PageProps<"/service-areas/[city]">,
) {
  const { city } = await props.params;

  return <ServiceAreaCityView citySlug={city} />;
}
