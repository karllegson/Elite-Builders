import type { Metadata } from "next";
import { ServiceAreaCityView } from "@/components/site/ServiceAreaCityView";
import { business } from "@/lib/site/config";
import { buildPageMetadata } from "@/lib/site/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/service-areas/[city]">,
): Promise<Metadata> {
  const { city } = await props.params;
  const label = city
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return buildPageMetadata({
    title: `Framing Contractor ${label} CA`,
    description: `Rough framing, remodeling, siding, and deck construction in ${label}, California. Licensed contractor ${business.license}. Request a free estimate from Elite Builders.`,
    path: `/service-areas/${city}`,
  });
}

export default async function ServiceAreaCityPage(
  props: PageProps<"/service-areas/[city]">,
) {
  const { city } = await props.params;

  return <ServiceAreaCityView citySlug={city} />;
}
