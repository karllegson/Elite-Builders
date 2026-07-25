import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { listPublishedPublicServicePages } from "@/lib/admin/services.server";
import { getPublicServicePagesFallback } from "@/lib/site/servicesPublic";
import { getServiceSubPagesForCategory } from "@/lib/site/serviceSubPages";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Construction Services — Framing Contractor, Home Builder & More",
  description:
    "Framing contractor, home building, deck building, and siding across the Bay Area, Central Valley, and Southern California. Custom, production, and addition framing is our core specialty. CSLB #970551.",
  path: "/services",
});

export default async function ServicesPage() {
  const published = await listPublishedPublicServicePages();
  const services = published.length > 0 ? published : getPublicServicePagesFallback();

  return (
    <>
      <section className="bg-brand-navy py-20 text-white">
        <div className="site-container">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
            Our Services
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Framing Contractor & Construction Specialists
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            Elite Builders is a framing-first contractor — custom, production, and addition framing
            plus home building, deck construction, and siding across the Bay Area, Central Valley, and
            Southern California.
          </p>
          <p className="mt-4 text-sm font-semibold text-brand-sky">{business.license}</p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="site-container">
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((detail) => {
              const img = homeImages[detail.heroImage];
              const subPages = getServiceSubPagesForCategory(detail.slug);

              return (
                <article
                  key={detail.slug}
                  className="overflow-hidden rounded-xl border border-solid border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-brand-sky/60 hover:shadow-lg"
                >
                  <Link href={detail.href} className="group block">
                    <ContentImage src={img.src} alt={img.alt} className="h-52" />
                    <div className="p-7 pb-4">
                      <h2 className="text-lg font-bold text-brand-navy group-hover:text-brand-blue">
                        {detail.name}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        {detail.shortDescription ?? detail.intro[0]}
                      </p>
                    </div>
                  </Link>

                  {subPages.length > 0 && (
                    <ul className="space-y-1.5 px-7 pb-4">
                      {subPages.map((subPage) => (
                        <li key={subPage.href}>
                          <Link
                            href={subPage.href}
                            className="group/sub flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-brand-blue"
                          >
                            <Check
                              size={16}
                              aria-hidden
                              className="shrink-0 text-brand-sky"
                            />
                            <span>{subPage.label}</span>
                            <ArrowRight
                              size={14}
                              aria-hidden
                              className="opacity-0 transition-all group-hover/sub:translate-x-0.5 group-hover/sub:opacity-100"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="border-t border-solid border-gray-100 px-7 py-4">
                    <Link
                      href={detail.href}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue transition-colors hover:text-brand-red"
                    >
                      View {detail.name}
                      <ArrowRight size={15} aria-hidden />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/#estimate"
              className="inline-flex items-center gap-2 rounded-full bg-brand-red px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark"
            >
              Request a Free Estimate
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
