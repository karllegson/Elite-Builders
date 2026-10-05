"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import PageHero from "@/components/site/PageHero";
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
    return <p className="site-container py-24 text-sm text-site-text-muted">Loading page…</p>;
  }

  if (!page) {
    notFound();
  }

  const pageTitle = page.seoTitle || page.title;
  const parentLabel = page.parent.title;

  return (
    <>
      <PageHero
        size="compact"
        eyebrow={parentLabel}
        title={pageTitle}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Service Areas", href: "/service-areas" },
          { label: parentLabel, href: page.parent.href },
          { label: page.title },
        ]}
      />

      <section className="section-sm bg-white">
        <div className="site-container">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="min-w-0">
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

      <div className="site-container pt-4 text-center">
        <Link href={page.parent.href} className="link-arrow">
          <ArrowLeft size={16} aria-hidden />
          Back to {parentLabel}
        </Link>
      </div>

      <CtaBand />
    </>
  );
}
