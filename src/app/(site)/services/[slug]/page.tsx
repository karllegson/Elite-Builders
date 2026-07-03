import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { listPublishedPublicServicePages } from "@/lib/admin/services.server";
import { getPublicServicePagesFallback } from "@/lib/site/servicesPublic";
import { buildPageMetadata } from "@/lib/site/seo";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const pages = await listPublishedPublicServicePages();
  const slugs = pages.length > 0 ? pages.map((page) => ({ slug: page.slug })) : getPublicServicePagesFallback().map((page) => ({ slug: page.slug }));

  return slugs;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pages = await listPublishedPublicServicePages();
  const detail =
    pages.find((page) => page.slug === slug) ??
    getPublicServicePagesFallback().find((page) => page.slug === slug);

  if (!detail) {
    return buildPageMetadata({
      title: "Service",
      description: "Elite Builders construction services.",
      path: `/services/${slug}`,
    });
  }

  return buildPageMetadata({
    title: detail.metaTitle,
    description: detail.metaDescription,
    path: `/services/${slug}`,
  });
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const pages = await listPublishedPublicServicePages();
  const detail =
    pages.find((page) => page.slug === slug) ??
    getPublicServicePagesFallback().find((page) => page.slug === slug);

  if (!detail) {
    notFound();
  }

  return <ServicePageTemplate detail={detail} />;
}
