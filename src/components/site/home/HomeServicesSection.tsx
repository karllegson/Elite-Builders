import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import SectionIntro from "@/components/site/SectionIntro";
import DimensionLine from "@/components/site/home/DimensionLine";
import { homeImages, type HomeImageKey } from "@/lib/site/images";
import type { PublicServicePage } from "@/lib/site/servicesPublic";

export type HomeService = PublicServicePage & {
  /** This service's own pages (Rough Framing, Custom Home Building...), linked to their final URLs. */
  subServices: { label: string; href: string }[];
};

/**
 * Home page photo per service: real job-site photos. The dashboard's service image is
 * still used on the service pages, and here for any service not listed.
 */
const homeServicePhotos: Record<string, HomeImageKey> = {
  "framing-contractor": "mammothCrewWallFraming",
  "home-builder": "stHelenaHomeFramingTrusses",
};

function SubServiceIndex({
  items,
  twoColumns,
}: {
  items: HomeService["subServices"];
  twoColumns: boolean;
}) {
  return (
    <>
      {/* The count reads like a callout on a framing plan; the list itself carries the meaning. */}
      <DimensionLine label={`${items.length} services`} className="mt-8" />
      <ul
        className={`mt-4 border-t border-solid border-site-line ${
          twoColumns ? "sm:grid sm:grid-cols-2 sm:gap-x-8" : ""
        }`}
      >
        {items.map((item) => (
          <li key={item.href} className="border-b border-solid border-site-line">
            <Link
              href={item.href}
              className="group/row flex min-h-14 items-center justify-between gap-4 py-3 font-display text-base font-semibold text-brand-ink transition-colors hover:text-brand-blue active:text-brand-ink-2"
            >
              {item.label}
              <ArrowUpRight
                size={18}
                aria-hidden
                className="shrink-0 text-site-text-muted transition-transform duration-300 group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-brand-red motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * One service: photo beside its copy and an index of its own pages. The lead service (framing,
 * the core business) gets the larger photo; the rest flip sides at a smaller scale, so the
 * order of importance reads at a glance.
 */
function ServiceRow({ service, lead }: { service: HomeService; lead: boolean }) {
  const img = homeImages[homeServicePhotos[service.slug] ?? service.image];

  return (
    <article className="grid items-start gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-16">
      <ContentImage
        src={img.src}
        alt={img.alt}
        className={`reveal-rise rounded-3xl ${
          lead
            ? "aspect-[4/3] lg:col-span-7 lg:aspect-[5/4]"
            : "aspect-[16/10] lg:order-2 lg:col-span-5 lg:aspect-[4/3]"
        }`}
        sizes={lead ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 1024px) 100vw, 42vw"}
        quality={85}
      />

      <div className={`reveal-up ${lead ? "lg:col-span-5 lg:pt-6" : "lg:order-1 lg:col-span-7 lg:pt-2"}`}>
        <h3
          className={`font-display font-bold text-brand-ink ${
            lead ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
          }`}
        >
          {service.name}
        </h3>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-site-text sm:text-base">
          {service.shortDescription}
        </p>

        {service.subServices.length > 0 ? (
          <SubServiceIndex items={service.subServices} twoColumns={!lead} />
        ) : null}

        <Link href={service.href} className="btn btn-dark mt-8">
          {service.name} services
          <ArrowRight size={16} aria-hidden className="btn-arrow" />
        </Link>
      </div>
    </article>
  );
}

export default function HomeServicesSection({ services }: { services: HomeService[] }) {
  if (services.length === 0) {
    return null;
  }

  const [lead, ...others] = services;

  return (
    <section className="section bg-white">
      <div className="site-container">
        <SectionIntro
          eyebrow="Our Services"
          title="Framing Contractor & Construction Specialists"
          lede="Residential, new construction, and custom home framing are our core, plus custom and luxury home building across the Bay Area, Central Valley, and Southern California. Need kitchen or room re-framing? We handle the structural work."
          align="left"
          className="reveal-up"
          action={
            <Link href="/services" className="btn btn-outline">
              All Services
              <ArrowRight size={16} aria-hidden className="btn-arrow" />
            </Link>
          }
        />

        <div className="mt-12 space-y-16 sm:mt-16 lg:space-y-24">
          <ServiceRow service={lead} lead />
          {others.map((service) => (
            <ServiceRow key={service.slug} service={service} lead={false} />
          ))}
        </div>

        <div className="mt-16 sm:mt-20 lg:mt-24">
          <DimensionLine label="Not sure?" />
          <div className="reveal-up mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <h3 className="font-display text-2xl font-bold text-brand-ink">
                Not Sure What You Need?
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-site-text sm:text-base">
                Tell us about your project and we&apos;ll point you in the right direction, even if
                that means we&apos;re not the right fit.
              </p>
            </div>
            <EstimateCtaLink href="/#estimate" className="btn btn-outline self-start lg:self-center">
              Ask Us Anything
            </EstimateCtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
