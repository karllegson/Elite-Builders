import type { Metadata } from "next";
import { ServiceAreaCityView } from "@/components/site/ServiceAreaCityView";
import { business } from "@/lib/site/config";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/service-areas/[city]">,
): Promise<Metadata> {
  const { city } = await props.params;
  const label = city
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `Framing Contractor ${label} CA | Elite Builders IX`,
    description: `Rough framing, remodeling, siding, and decks in ${label}, California. Licensed contractor ${business.license}.`,
  };
}

export default async function ServiceAreaCityPage(
  props: PageProps<"/service-areas/[city]">,
) {
  const { city } = await props.params;

  return <ServiceAreaCityView citySlug={city} />;
}
