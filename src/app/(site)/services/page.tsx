import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { listPublishedPublicServicePages } from "@/lib/admin/services.server";
import { getPublicServicePagesFallback } from "@/lib/site/servicesPublic";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Construction Services — Home Builder, General Contractor & Framing",
  description:
    "Home building, general contracting, framing, remodeling, deck building, siding, and construction across the Bay Area, Central Valley, and Southern California. Framing is our signature specialty. CSLB #970551.",
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
            Home Builder, General Contractor & Framing Specialists
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            Elite Builders offers home building, general contracting, remodeling, deck building,
            siding, and construction — all built with framing-first precision across the Bay Area,
            Central Valley, and Southern California. Framing is our signature specialty.
          </p>
          <p className="mt-4 text-sm font-semibold text-brand-sky">{business.license}</p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="site-container">
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((detail) => {
              const img = homeImages[detail.heroImage];
              return (
                <Link
                  key={detail.slug}
                  href={detail.href}
                  className="group overflow-hidden rounded-xl border border-solid border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-brand-sky/60 hover:shadow-lg"
                >
                  <ContentImage src={img.src} alt={img.alt} className="h-52" />
                  <div className="p-7">
                    <h2 className="text-lg font-bold text-brand-navy">{detail.name}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      {detail.shortDescription ?? detail.intro[0]}
                    </p>
                    {detail.scope.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {detail.scope.slice(0, 3).map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check size={16} aria-hidden className="mt-0.5 shrink-0 text-brand-sky" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue group-hover:text-brand-red">
                      Learn More
                      <ArrowRight
                        size={15}
                        aria-hidden
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
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
