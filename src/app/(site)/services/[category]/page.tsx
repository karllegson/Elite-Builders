import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { findServiceLandingHrefForRoute } from "@/lib/admin/serviceAreas.server";
import { listPublishedPublicServicePages } from "@/lib/admin/services.server";
import { getPublicServicePagesFallback } from "@/lib/site/servicesPublic";
import { buildPageMetadata } from "@/lib/site/seo";
import { getServiceSubPagesForCategory } from "@/lib/site/serviceSubPages";

type ServiceCategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  const pages = await listPublishedPublicServicePages();
  const slugs =
    pages.length > 0
      ? pages.map((page) => ({ category: page.slug }))
      : getPublicServicePagesFallback().map((page) => ({ category: page.slug }));

  return slugs;
}

export async function generateMetadata({ params }: ServiceCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const pages = await listPublishedPublicServicePages();
  const detail =
    pages.find((page) => page.slug === category) ??
    getPublicServicePagesFallback().find((page) => page.slug === category);

  if (!detail) {
    return buildPageMetadata({
      title: "Service",
      description: "Elite Builders construction services.",
      path: `/services/${category}`,
    });
  }

  return buildPageMetadata({
    title: detail.metaTitle,
    description: detail.metaDescription,
    path: `/services/${category}`,
  });
}

export default async function ServiceCategoryPage({ params }: ServiceCategoryPageProps) {
  const { category } = await params;

  // A dashboard-built page for this service takes over the URL.
  const landingHref = await findServiceLandingHrefForRoute(`/services/${category}`);
  if (landingHref) {
    permanentRedirect(landingHref);
  }

  const pages = await listPublishedPublicServicePages();
  const detail =
    pages.find((page) => page.slug === category) ??
    getPublicServicePagesFallback().find((page) => page.slug === category);

  if (!detail) {
    notFound();
  }

  return (
    <ServicePageTemplate
      detail={detail}
      subPages={getServiceSubPagesForCategory(category)}
    />
  );
}
