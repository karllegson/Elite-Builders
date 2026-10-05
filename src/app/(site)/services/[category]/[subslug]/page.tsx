import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { findServiceLandingHrefForRoute } from "@/lib/admin/serviceAreas.server";
import { buildPageMetadata } from "@/lib/site/seo";
import {
  buildServiceSubPageDetail,
  findServiceSubPage,
  getAllServiceSubPages,
  getServiceSubPagesForCategory,
  serviceSubPageHref,
} from "@/lib/site/serviceSubPages";

type ServiceSubPageProps = {
  params: Promise<{ category: string; subslug: string }>;
};

export async function generateStaticParams() {
  return getAllServiceSubPages().map((page) => ({
    category: page.categorySlug,
    subslug: page.slug,
  }));
}

export async function generateMetadata({ params }: ServiceSubPageProps): Promise<Metadata> {
  const { category, subslug } = await params;
  const detail = buildServiceSubPageDetail(category, subslug);

  if (!detail) {
    return buildPageMetadata({
      title: "Service",
      description: "Elite Builders construction services.",
      path: serviceSubPageHref(category, subslug),
    });
  }

  return buildPageMetadata({
    title: detail.metaTitle,
    description: detail.metaDescription,
    path: serviceSubPageHref(category, subslug),
  });
}

export default async function ServiceSubPage({ params }: ServiceSubPageProps) {
  const { category, subslug } = await params;

  if (!findServiceSubPage(category, subslug)) {
    notFound();
  }

  // A dashboard-built page for this service takes over the URL.
  const landingHref = await findServiceLandingHrefForRoute(serviceSubPageHref(category, subslug));
  if (landingHref) {
    permanentRedirect(landingHref);
  }

  const detail = buildServiceSubPageDetail(category, subslug);
  if (!detail) {
    notFound();
  }

  return (
    <ServicePageTemplate
      detail={detail}
      subPages={getServiceSubPagesForCategory(category)}
      activeSubPage={subslug}
    />
  );
}
