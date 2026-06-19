import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import { ServiceAreasGrid } from "@/components/site/ServiceAreasGrid";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";

export const metadata: Metadata = {
  title: "Service Areas | Framing Contractor Northern California | Elite Builders IX",
  description:
    "Elite Builders IX serves the Bay Area, Central Valley, Southern California, and the Eastern Sierra — rough framing, remodeling, siding, and decks. CSLB #970551.",
};

export default function ServiceAreasPage() {
  return (
    <>
      <section className="bg-brand-navy py-20 text-white">
        <div className="site-container">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
            Where We Work
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Framing Contractor Serving Northern California
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            Elite Builders IX serves the Bay Area, the Central Valley, and Southern California — plus
            the Eastern Sierra — with the manpower and resources to support multiple projects across
            the region. {business.license}.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="site-container">
          <ContentImage
            src={homeImages.bayAreaNorthBayService.src}
            alt={homeImages.bayAreaNorthBayService.alt}
            className="h-56 rounded-xl sm:h-72"
            sizes="(max-width: 1152px) 100vw, 1152px"
            quality={90}
            priority
          />

          <ServiceAreasGrid />

          <div className="mt-14 text-center">
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
