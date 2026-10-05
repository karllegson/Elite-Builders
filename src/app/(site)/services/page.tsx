import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import CtaBand from "@/components/site/CtaBand";
import PageHero from "@/components/site/PageHero";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { listPublishedPublicServicePages } from "@/lib/admin/services.server";
import { getPublicServicePagesFallback } from "@/lib/site/servicesPublic";
import { getServiceSubPagesForCategory } from "@/lib/site/serviceSubPages";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Construction Services — Framing Contractor, Home Builder & More",
  description:
    "Framing contractor and home builder across the Bay Area, Central Valley, and Southern California. Residential, new construction, and custom home framing is our core specialty. CSLB #970551.",
  path: "/services",
});

export default async function ServicesPage() {
  const published = await listPublishedPublicServicePages();
  const services = published.length > 0 ? published : getPublicServicePagesFallback();

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Framing Contractor & Construction Specialists"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        image={homeImages.residentialRoofFraming}
        lede={
          <>
            <p>
              Elite Builders is a framing-first contractor — residential, new construction, custom
              home, rough, and structural framing, plus custom and luxury home building across the
              Bay Area, Central Valley, and Southern California.
            </p>
            <p className="text-sm font-semibold text-brand-sky">{business.license}</p>
          </>
        }
      />

      <section className="section bg-white">
        <div className="site-container">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {services.map((detail) => {
              const img = homeImages[detail.heroImage];
              const subPages = getServiceSubPagesForCategory(detail.slug);

              return (
                <article
                  key={detail.slug}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-solid border-site-line bg-white transition-all duration-300 hover:shadow-[0_28px_56px_-32px_rgba(7,21,48,0.5)]"
                >
                  <Link href={detail.href} className="block">
                    <ContentImage
                      src={img.src}
                      alt={img.alt}
                      className="img-zoom aspect-[16/9]"
                      sizes="(max-width: 1024px) 100vw, 640px"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-7 sm:p-9">
                    <h2 className="font-display text-2xl font-bold">
                      <Link href={detail.href} className="transition-colors hover:text-brand-blue">
                        {detail.name}
                      </Link>
                    </h2>
                    <p className="mt-3 leading-relaxed text-site-text">
                      {detail.shortDescription ?? detail.intro[0]}
                    </p>

                    {subPages.length > 0 && (
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {subPages.map((subPage) => (
                          <li key={subPage.href}>
                            <Link
                              href={subPage.href}
                              className="inline-flex items-center gap-1.5 rounded-full border border-solid border-site-line bg-site-surface px-3.5 py-1.5 text-sm text-brand-ink transition-colors hover:border-brand-ink hover:bg-brand-ink hover:text-white"
                            >
                              <Check size={14} aria-hidden className="shrink-0 text-brand-red" />
                              {subPage.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-auto pt-8">
                      <Link href={detail.href} className="link-arrow">
                        View {detail.name}
                        <ArrowRight size={16} aria-hidden />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
