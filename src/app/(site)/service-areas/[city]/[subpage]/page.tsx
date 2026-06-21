import type { Metadata } from "next";
import { ServiceAreaSubPageView } from "@/components/site/ServiceAreaSubPageView";
import { business } from "@/lib/site/config";
import { findServiceAreaByPublicPath } from "@/lib/site/serviceAreaUrls";
import { buildPageMetadata } from "@/lib/site/seo";

export const dynamic = "force-dynamic";

type ServiceAreaSubPageProps = PageProps<"/service-areas/[city]/[subpage]">;

export async function generateMetadata(props: ServiceAreaSubPageProps): Promise<Metadata> {
  const { city, subpage } = await props.params;
  const record = findServiceAreaByPublicPath(city, subpage);

  if (!record) {
    return buildPageMetadata({
      title: "Page Not Found",
      description: "The requested service area page could not be found.",
      path: `/service-areas/${city}/${subpage}`,
      noIndex: true,
    });
  }

  const title = record.seoTitle?.trim() || record.title;
  const description =
    record.metaDescription?.trim() ||
    `${record.title} — framing and construction services from Elite Builders in Northern California. Licensed ${business.license}.`;

  return buildPageMetadata({
    title,
    description,
    path: `/service-areas/${city}/${subpage}`,
  });
}

export default async function ServiceAreaSubPage(props: ServiceAreaSubPageProps) {
  const { city, subpage } = await props.params;

  return <ServiceAreaSubPageView parentSlug={city} subPageSlug={subpage} />;
}
