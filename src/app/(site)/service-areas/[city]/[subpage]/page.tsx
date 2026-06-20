import type { Metadata } from "next";
import { ServiceAreaSubPageView } from "@/components/site/ServiceAreaSubPageView";
import { business } from "@/lib/site/config";
import { findServiceAreaByPublicPath } from "@/lib/site/serviceAreaUrls";

export const dynamic = "force-dynamic";

type ServiceAreaSubPageProps = PageProps<"/service-areas/[city]/[subpage]">;

export async function generateMetadata(props: ServiceAreaSubPageProps): Promise<Metadata> {
  const { city, subpage } = await props.params;
  const record = findServiceAreaByPublicPath(city, subpage);

  if (!record) {
    return {
      title: "Service Area Page Not Found | Elite Builders IX",
    };
  }

  return {
    title: `${record.seoTitle || record.title} | Elite Builders IX`,
    description:
      record.metaDescription ||
      `Learn more about ${record.title} from Elite Builders IX. Licensed contractor ${business.license}.`,
  };
}

export default async function ServiceAreaSubPage(props: ServiceAreaSubPageProps) {
  const { city, subpage } = await props.params;

  return <ServiceAreaSubPageView parentSlug={city} subPageSlug={subpage} />;
}
