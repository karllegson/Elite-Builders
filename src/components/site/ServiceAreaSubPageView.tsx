"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import PageHero from "@/components/site/PageHero";
import { EbContentPanel } from "@/components/site/EbContentPanel";
import { ServiceAreaContentPanel } from "@/components/site/ServiceAreaContentPanel";
import { ServiceAreaFeaturedImage } from "@/components/site/ServiceAreaFeaturedImage";
import { ServiceAreaSidebar } from "@/components/site/ServiceAreaSidebar";
import { usePublicServiceAreaSubPage } from "@/hooks/usePublicServiceAreas";
import { buildEbJumpLinks, isEbContent } from "@/lib/site/ebContent";
import type { PublicFaqItem } from "@/lib/site/faqsPublic";
import type { PublicServiceAreaSubPage } from "@/lib/site/serviceAreasPublic";

type ServiceAreaSubPageViewProps = {
  parentSlug: string;
  subPageSlug: string;
  /** Server-loaded page; leave undefined to load it in the browser. */
  initialPage?: PublicServiceAreaSubPage | null;
  /** FAQs for the page's [faqs] block, loaded on the server. */
  initialFaqItems?: PublicFaqItem[];
};

export function ServiceAreaSubPageView({
  parentSlug,
  subPageSlug,
  initialPage,
  initialFaqItems,
}: ServiceAreaSubPageViewProps) {
  const { page, ready } = usePublicServiceAreaSubPage(parentSlug, subPageSlug, initialPage);

  if (!ready) {
    return <p className="site-container py-24 text-sm text-site-text-muted">Loading page…</p>;
  }

  if (!page) {
    notFound();
  }

  // On-page heading drops the " | Elite Builders IX" brand suffix used in the browser title.
  const pageTitle = (page.seoTitle || page.title).replace(/\s+\|\s+[^|]+$/, "");
  const parentLabel = page.parent.title;
  // Elite-format pages keep their H1 in the content; the header band shows the page name.
  const isEb = page.content.trim().length > 0 && isEbContent(page.content);
  const heroTitle = isEb ? page.title : pageTitle;

  return (
    <>
      <PageHero
        size="compact"
        eyebrow={parentLabel}
        title={heroTitle}
        titleAs={isEb ? "p" : "h1"}
        className={isEb ? "page-hero--eb" : undefined}
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
              <div className={`service-area-featured-intro${isEb ? " eb-page" : ""}`}>
                {page.featuredImage ? (
                  <>
                    <ServiceAreaFeaturedImage
                      src={page.featuredImage.src}
                      alt={page.featuredImage.alt || `${pageTitle} featured image`}
                    />
                    {isEb ? null : <hr className="service-area-featured-divider" />}
                  </>
                ) : null}

                {isEb ? (
                  <EbContentPanel
                    content={page.content}
                    mapEmbed={page.mapEmbed}
                    initialFaqItems={initialFaqItems}
                  />
                ) : page.content.trim() ? (
                  <ServiceAreaContentPanel
                    content={page.content}
                    mapEmbed={page.mapEmbed}
                    faqItems={initialFaqItems}
                  />
                ) : (
                  <div className="service-area-html-content service-area-default-intro">
                    <p>Content for this landing page is coming soon.</p>
                  </div>
                )}
              </div>
            </div>

            <ServiceAreaSidebar
              city={page.parent.city}
              jumpLinks={isEb ? buildEbJumpLinks(page.content) : undefined}
            />
          </div>
        </div>
      </section>

      <div className="site-container pt-4 text-center">
        <Link href={page.parent.href} className="link-arrow">
          <ArrowLeft size={16} aria-hidden />
          Back to {parentLabel}
        </Link>
      </div>

      {/* Elite pages end with their own Book An Estimate section, so skip the static band. */}
      {isEb ? null : <CtaBand />}
    </>
  );
}
