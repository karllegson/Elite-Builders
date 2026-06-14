import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import { business, serviceAreas, type ServiceArea } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";

export const metadata: Metadata = {
  title: "Service Areas | Framing Contractor Northern California | Elite Builders IX",
  description:
    "Elite Builders IX serves the Bay Area, Central Valley, Southern California, and the Eastern Sierra — rough framing, remodeling, siding, and decks. CSLB #970551.",
};

const regionOrder = [
  "Bay Area",
  "Central Valley",
  "Southern California",
  "Eastern Sierra",
] as const;

export default function ServiceAreasPage() {
  const grouped = regionOrder
    .map((region) => ({
      region,
      areas: serviceAreas.filter(
        (area) => area.region === region && area.slug !== "bay-area",
      ),
    }))
    .filter((group) => group.areas.length > 0);

  return (
    <>
      <section className="bg-brand-navy py-20 text-white">
        <div className="site-container">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
            Where We Work
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
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

          {grouped.map((group) => (
            <div key={group.region} className="mt-14">
              <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">{group.region}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.areas.map((area: ServiceArea) => (
                  <Link
                    key={area.slug}
                    href={area.href}
                    className="group flex items-start gap-4 rounded-xl border border-solid border-gray-200 bg-white p-6 transition-all hover:border-brand-sky/60 hover:shadow-md"
                  >
                    <span className="rounded-full bg-brand-blue/5 p-2.5 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                      <MapPin size={19} aria-hidden />
                    </span>
                    <span>
                      <span className="flex items-center gap-1.5 font-bold text-brand-navy">
                        {area.city}, CA
                        <ArrowRight
                          size={14}
                          aria-hidden
                          className="text-brand-blue opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">{area.blurb}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

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
