"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ServiceAreaContentPanel } from "@/components/site/ServiceAreaContentPanel";
import { ServiceAreaFeaturedImage } from "@/components/site/ServiceAreaFeaturedImage";
import { ServiceAreaSidebar } from "@/components/site/ServiceAreaSidebar";
import { usePublicServiceAreaSubPage } from "@/hooks/usePublicServiceAreas";

type ServiceAreaSubPageViewProps = {
  parentSlug: string;
  subPageSlug: string;
};

export function ServiceAreaSubPageView({
  parentSlug,
  subPageSlug,
}: ServiceAreaSubPageViewProps) {
  const { page, ready } = usePublicServiceAreaSubPage(parentSlug, subPageSlug);

  if (!ready) {
    return <p className="site-container py-20 text-sm text-gray-500">Loading page…</p>;
  }

  if (!page) {
    notFound();
  }

  const pageTitle = page.seoTitle || page.title;
  const parentLabel = page.parent.title;

  return (
    <>
      <section className="bg-white pb-16 pt-10">
        <div className="site-container">
          <div className="mt-0 grid grid-cols-1 items-start gap-8 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <div className="min-w-0">
              <div className="service-area-page-header">
                <h1 className="service-area-page-title">{pageTitle}</h1>
                <nav className="service-area-breadcrumbs" aria-label="Breadcrumb">
                  <Link href="/">Home</Link>
                  <span aria-hidden>/</span>
                  <Link href="/service-areas">Service Areas</Link>
                  <span aria-hidden>/</span>
                  <Link href={page.parent.href}>{parentLabel}</Link>
                  <span aria-hidden>/</span>
                  <span aria-current="page">{page.title}</span>
                </nav>
              </div>

              <div className="service-area-featured-intro">
                {page.featuredImage ? (
                  <>
                    <ServiceAreaFeaturedImage
                      src={page.featuredImage.src}
                      alt={page.featuredImage.alt || `${pageTitle} featured image`}
                    />
                    <hr className="service-area-featured-divider" />
                  </>
                ) : null}

                {page.content.trim() ? (
                  <ServiceAreaContentPanel content={page.content} mapEmbed={page.mapEmbed} />
                ) : (
                  <div className="service-area-html-content service-area-default-intro">
                    <p>Content for this landing page is coming soon.</p>
                  </div>
                )}
              </div>
            </div>

            <ServiceAreaSidebar city={page.parent.city} />
          </div>
        </div>
      </section>

      <section className="border-t border-solid border-gray-100 bg-gray-50/40 py-12">
        <div className="site-container text-center">
          <Link
            href={page.parent.href}
            className="inline-flex items-center gap-2 rounded-full border border-solid border-brand-navy px-7 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
          >
            Back to {parentLabel}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
