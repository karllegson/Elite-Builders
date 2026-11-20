import Link from "next/link";
import {
  ArrowRight,
  Hammer,
  HardHat,
  House,
  Layers,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import type { CityAudience, CityService, CityServiceIcon } from "@/lib/site/cityPages";

const icons: Record<CityServiceIcon, LucideIcon> = {
  residential: House,
  "new-construction": Hammer,
  custom: Ruler,
  rough: Layers,
  structural: HardHat,
};

const audienceLabels: Record<CityAudience, string> = {
  homeowner: "Homeowners",
  builder: "Builders & GCs",
};

type CityServicesProps = {
  city: string;
  services: CityService[];
  showDrafts: boolean;
};

function ServiceCard({ service, showDrafts }: { service: CityService; showDrafts: boolean }) {
  const Icon = icons[service.icon];
  const body = (
    <>
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-ink text-brand-lumber">
        <Icon size={22} aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-xl font-semibold leading-snug text-brand-ink">{service.title}</h3>
      <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-site-text">{service.description}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Best for">
        {service.audiences.map((audience) => (
          <li
            key={audience}
            className="rounded-full bg-site-surface px-2.5 py-1 text-xs font-semibold text-brand-navy"
          >
            {audienceLabels[audience]}
          </li>
        ))}
      </ul>
      {service.href ? (
        <span className="link-arrow mt-5 text-sm">
          Learn more
          <ArrowRight size={14} aria-hidden />
        </span>
      ) : null}
      {service.pending ? <ClientTodoNote todo={service.pending} show={showDrafts} className="mt-4" /> : null}
    </>
  );

  const className =
    "group flex h-full flex-col rounded-2xl border border-solid border-site-line bg-white p-6 transition-all duration-300 sm:p-7";

  return service.href ? (
    <Link
      href={service.href}
      className={`${className} hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-[0_24px_48px_-32px_rgba(7,21,48,0.45)]`}
    >
      {body}
    </Link>
  ) : (
    <div className={`${className} border-dashed`}>{body}</div>
  );
}

/** Framing services offered in the city, tagged by who they're mainly for. */
export function CityServices({ city, services, showDrafts }: CityServicesProps) {
  const visible = services.filter((service) => !service.pending || showDrafts);

  return (
    <section className="section bg-white" aria-labelledby="city-services-heading">
      <div className="site-container">
        <div className="max-w-2xl">
          <h2 id="city-services-heading" className="section-title">
            {`Framing services in ${city}`}
          </h2>
          <p className="section-lede mt-5">
            From a single custom home to a full production build — framed to plan by our crews.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {visible.map((service) => (
            <li key={service.title}>
              <ServiceCard service={service} showDrafts={showDrafts} />
            </li>
          ))}
          <li>
            <div className="bg-ink bg-blueprint flex h-full flex-col rounded-2xl p-6 sm:p-7">
              <p className="spec-label">Not sure what you need?</p>
              <p className="mt-4 flex-1 font-display text-xl font-semibold leading-snug text-white">
                Send us your plans and we&apos;ll tell you what the framing scope looks like.
              </p>
              <EstimateCtaLink href="/#estimate" trackingLocation="services_card" className="btn btn-primary mt-6 self-start">
                Get a Free Estimate
                <ArrowRight size={16} aria-hidden className="btn-arrow" />
              </EstimateCtaLink>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
