import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PagePlaceholder from "@/components/site/PagePlaceholder";
import { serviceAreas } from "@/lib/site/config";

export function generateStaticParams() {
  return serviceAreas.map((area) => ({ city: area.slug }));
}

export async function generateMetadata(
  props: PageProps<"/service-areas/[city]">
): Promise<Metadata> {
  const { city } = await props.params;
  const area = serviceAreas.find((a) => a.slug === city);
  if (!area) return {};
  return {
    title: `Framing Contractor ${area.city} CA | Elite Builders IX`,
    description: `Framing, siding, deck construction, and general contracting in ${area.city}, California.`,
  };
}

export default async function ServiceAreaCityPage(
  props: PageProps<"/service-areas/[city]">
) {
  const { city } = await props.params;
  const area = serviceAreas.find((a) => a.slug === city);
  if (!area) notFound();

  return (
    <PagePlaceholder
      title={`Framing Contractor in ${area.city}, CA`}
      description={`${area.blurb} A dedicated ${area.city} page with local projects, neighborhoods, and FAQs is coming soon.`}
    />
  );
}
