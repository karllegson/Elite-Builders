"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import PageHero from "@/components/site/PageHero";
import ProjectCard from "@/components/site/ProjectCard";
import SectionIntro from "@/components/site/SectionIntro";
import { ServiceAreaContentPanel } from "@/components/site/ServiceAreaContentPanel";
import { ServiceAreaFeaturedImage } from "@/components/site/ServiceAreaFeaturedImage";
import { ServiceAreaMapEmbed } from "@/components/site/ServiceAreaMapEmbed";
import { ServiceAreaSidebar } from "@/components/site/ServiceAreaSidebar";
import { usePublicServiceArea } from "@/hooks/usePublicServiceAreas";
import { business } from "@/lib/site/config";
import { projectsForCity } from "@/lib/site/projects";

type ServiceAreaCityViewProps = {
  citySlug: string;
};

export function ServiceAreaCityView({ citySlug }: ServiceAreaCityViewProps) {
  const { area, ready } = usePublicServiceArea(citySlug);

  if (!ready) {
    return <p className="site-container py-24 text-sm text-site-text-muted">Loading service area…</p>;
  }

  if (!area) {
    notFound();
  }

  const isServicePage = area.isServicePage;
  const isRegional = area.city === "Bay Area";
  const cityLabel = isRegional || isServicePage ? area.city : `${area.city}, CA`;
  // On-page heading drops the " | Elite Builders IX" brand suffix used in the browser title.
  const pageTitle = (area.seoTitle || cityLabel).replace(/\s+\|\s+[^|]+$/, "");
  const hasCustomContent = area.content.trim().length > 0;
  const localProjects = projectsForCity(area.projectSlug);

  return (
    <>
      <PageHero
        size="compact"
        eyebrow={isServicePage ? "Our Services" : "Service Area"}
        title={pageTitle}
        breadcrumbs={[
          { label: "Home", href: "/" },
          isServicePage
            ? { label: "Services", href: "/services" }
            : { label: "Service Areas", href: "/service-areas" },
          { label: cityLabel },
        ]}
      />

      <section className="section-sm bg-white">
        <div className="site-container">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="min-w-0">
              <div className="service-area-featured-intro">
                {area.featuredImage ? (
                  <>
                    <ServiceAreaFeaturedImage
                      src={area.featuredImage.src}
                      alt={area.featuredImage.alt || `${pageTitle} featured image`}
                    />
                    <hr className="service-area-featured-divider" />
                  </>
                ) : null}

                {hasCustomContent ? (
                  <ServiceAreaContentPanel content={area.content} mapEmbed={area.mapEmbed} />
                ) : (
                  <div className="service-area-html-content service-area-default-intro">
                    <p>{area.blurb}</p>
                    <p>
                      From custom homes to production communities, Elite Builders IX brings framing-first
                      precision and dependable scheduling to every {area.city} project.
                    </p>
                  </div>
                )}

                {!hasCustomContent ? <ServiceAreaMapEmbed html={area.mapEmbed} /> : null}

                {!hasCustomContent ? (
                  <div className="mt-10 flex flex-col gap-3 sm:flex-row lg:hidden">
                    <EstimateCtaLink href="/#estimate" className="btn btn-primary">
                      Request a Free Estimate
                    </EstimateCtaLink>
                    <a href={business.phoneHref} className="btn btn-outline">
                      <Phone size={16} aria-hidden />
                      {business.phone}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>

            <ServiceAreaSidebar city={isServicePage ? undefined : area.city} />
          </div>
        </div>
      </section>

      {!hasCustomContent && !isServicePage && localProjects.length > 0 ? (
        <section className="section bg-site-surface">
          <div className="site-container">
            <SectionIntro eyebrow="Recent Work" title={`Projects in ${area.city}`} align="left" />

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {localProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="site-container pt-4 text-center">
        <Link href={isServicePage ? "/services" : "/service-areas"} className="link-arrow">
          {isServicePage ? "View All Services" : "View All Service Areas"}
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>

      <CtaBand />
    </>
  );
}
