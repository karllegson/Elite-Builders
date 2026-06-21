"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import { ServiceAreaContentPanel } from "@/components/site/ServiceAreaContentPanel";
import { ServiceAreaFeaturedImage } from "@/components/site/ServiceAreaFeaturedImage";
import { ServiceAreaMapEmbed } from "@/components/site/ServiceAreaMapEmbed";
import { ServiceAreaSidebar } from "@/components/site/ServiceAreaSidebar";
import { usePublicServiceArea } from "@/hooks/usePublicServiceAreas";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { projectsForCity } from "@/lib/site/projects";

type ServiceAreaCityViewProps = {
  citySlug: string;
};

export function ServiceAreaCityView({ citySlug }: ServiceAreaCityViewProps) {
  const { area, ready } = usePublicServiceArea(citySlug);

  if (!ready) {
    return <p className="site-container py-20 text-sm text-gray-500">Loading service area…</p>;
  }

  if (!area) {
    notFound();
  }

  const isRegional = area.city === "Bay Area";
  const cityLabel = isRegional ? area.city : `${area.city}, CA`;
  const pageTitle = area.seoTitle || cityLabel;
  const hasCustomContent = area.content.trim().length > 0;
  const localProjects = projectsForCity(area.projectSlug);

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
                  <span aria-current="page">{cityLabel}</span>
                </nav>
              </div>

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
                  <div className="mt-10 flex flex-wrap items-center gap-3 lg:hidden">
                    <Link
                      href="/#estimate"
                      className="rounded-full bg-brand-red px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark"
                    >
                      Request a Free Estimate
                    </Link>
                    <a
                      href={business.phoneHref}
                      className="flex items-center gap-2 rounded-full border border-solid border-brand-navy px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
                    >
                      <Phone size={18} aria-hidden />
                      {business.phone}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>

            <ServiceAreaSidebar city={area.city} />
          </div>
        </div>
      </section>

      {!hasCustomContent && localProjects.length > 0 ? (
        <section className="border-y border-solid border-gray-100 bg-gray-50/60 py-20">
          <div className="site-container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
                Recent Work
              </p>
              <h2 className="mt-3 text-3xl font-bold text-site-text-dark sm:text-4xl">
                Projects in {area.city}
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {localProjects.map((project) => {
                const img = homeImages[project.image];
                return (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-xl border border-solid border-gray-200 bg-white"
                  >
                    <ContentImage src={img.src} alt={img.alt} className="h-48" />
                    <div className="p-6">
                      <span className="text-xs font-bold uppercase tracking-wide text-brand-sky">
                        {project.type}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-brand-navy">{project.name}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-500">{project.blurb}</p>
                      <p className="mt-3 text-xs font-semibold text-brand-blue">
                        Built for {project.builder}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-solid border-gray-100 bg-gray-50/40 py-12">
        <div className="site-container text-center">
          <Link
            href="/service-areas"
            className="inline-flex items-center gap-2 rounded-full border border-solid border-brand-navy px-7 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
          >
            View All Service Areas
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
