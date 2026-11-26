import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceLandingPage, {
  buildServiceLandingMetadata,
  loadServiceLandingArea,
} from "@/components/site/ServiceLandingPage";
import ServicePageTemplate from "@/components/site/ServicePageTemplate";
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
  const path = serviceSubPageHref(category, subslug);

  if (findServiceSubPage(category, subslug)) {
    const landing = await loadServiceLandingArea(path);
    if (landing) {
      return buildServiceLandingMetadata(landing, path);
    }
  }

  const detail = buildServiceSubPageDetail(category, subslug);

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

export default async function ServiceSubPage({ params }: ServiceSubPageProps) {
  const { category, subslug } = await params;

  if (!findServiceSubPage(category, subslug)) {
    notFound();
  }

  const path = serviceSubPageHref(category, subslug);

  // A published dashboard-built page for this service is shown here in place of the template.
  const landing = await loadServiceLandingArea(path);
  if (landing) {
    return <ServiceLandingPage area={landing} path={path} />;
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
      path={path}
    />
  );
}
