import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { serviceDetails, serviceOrder } from "@/lib/site/scope";

export const metadata: Metadata = {
  title: "Framing-First Construction Services | Elite Builders IX",
  description:
    "Framing-first specialists — rough framing, remodeling, siding, and deck construction across the Bay Area, Central Valley, and Southern California. CSLB #970551.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-brand-navy py-20 text-white">
        <div className="site-container">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
            Our Services
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Framing-First Construction Services
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            Elite Builders IX is a framing-first contractor — rough framing is our core, and every
            remodeling, siding, and deck project is built on the same structural precision and code
            compliance.
          </p>
          <p className="mt-4 text-sm font-semibold text-brand-sky">{business.license}</p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="site-container">
          <div className="grid gap-6 sm:grid-cols-2">
            {serviceOrder.map((slug) => {
              const detail = serviceDetails[slug];
              const img = homeImages[detail.heroImage];
              return (
                <Link
                  key={slug}
                  href={`/services/${slug}`}
                  className="group overflow-hidden rounded-xl border border-solid border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-brand-sky/60 hover:shadow-lg"
                >
                  <ContentImage src={img.src} alt={img.alt} className="h-52" />
                  <div className="p-7">
                    <h2 className="text-lg font-bold text-brand-navy">{detail.name}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      {detail.intro[0]}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue group-hover:text-brand-red">
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
