import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceLandingPage, {
  buildServiceLandingMetadata,
  loadServiceLandingArea,
} from "@/components/site/ServiceLandingPage";
import ServicePageTemplate from "@/components/site/ServicePageTemplate";
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
  const path = `/services/${category}`;

  const landing = await loadServiceLandingArea(path);
  if (landing) {
    return buildServiceLandingMetadata(landing, path);
  }

  const pages = await listPublishedPublicServicePages();
  const detail =
    pages.find((page) => page.slug === category) ??
    getPublicServicePagesFallback().find((page) => page.slug === category);

  if (!detail) {
    return buildPageMetadata({
      title: "Service",
      description: "Elite Builders construction services.",
      path,
    });
  }

  return buildPageMetadata({
    title: detail.metaTitle,
    description: detail.metaDescription,
    path,
  });
}

export default async function ServiceCategoryPage({ params }: ServiceCategoryPageProps) {
  const { category } = await params;
  const path = `/services/${category}`;

  // A published dashboard-built page for this service is shown here in place of the template.
  const landing = await loadServiceLandingArea(path);
  if (landing) {
    return <ServiceLandingPage area={landing} path={path} />;
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
      path={path}
    />
  );
}
