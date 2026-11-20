import { Check, Mail, MapPin, Phone } from "lucide-react";
import { CityEstimateForm } from "@/components/site/city/CityEstimateForm";
import { business } from "@/lib/site/config";
import type { CityPageConfig } from "@/lib/site/cityPages";
import { ESTIMATE_SECTION_ID } from "@/lib/site/estimateAnchor";

type CityEstimateSectionProps = {
  city: string;
  estimate: CityPageConfig["estimate"];
  showDrafts: boolean;
};

const assurances = [
  "Response within one business day",
  "Honest scope and pricing",
  `Licensed & insured — ${business.license}`,
];

export function CityEstimateSection({ city, estimate, showDrafts }: CityEstimateSectionProps) {
  const projectTypes = estimate.projectTypes
    .filter((type) => !type.pending || showDrafts)
    .map((type) => ({ ...type, adminPreview: Boolean(type.pending) }));

  return (
    <section
      id={ESTIMATE_SECTION_ID}
      className="section bg-ink bg-blueprint scroll-mt-24"
      aria-labelledby="city-estimate-heading"
    >
      <div className="site-container grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="spec-label">Free estimate</p>
          <h2 id="city-estimate-heading" className="section-title mt-4">
            {estimate.heading}
          </h2>
          <p className="section-lede mt-5">{estimate.lede}</p>

          <ul className="mt-8 grid gap-3">
            {assurances.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[0.9375rem] text-white/85">
                <Check size={18} aria-hidden className="shrink-0 text-brand-lumber" />
                {item}
              </li>
            ))}
          </ul>

          <div className="dim-rule mt-10" aria-hidden>
            Or reach us directly
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <li>
              <a
                href={business.phoneHref}
                data-cta-location="estimate_section"
                className="flex items-center gap-3 rounded-2xl border border-solid border-white/10 bg-white/5 p-4 transition-colors hover:border-white/30"
              >
                <Phone size={20} aria-hidden className="shrink-0 text-brand-lumber" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-white/55">Call</span>
                  <span className="font-display text-lg font-semibold text-white">{business.phone}</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 rounded-2xl border border-solid border-white/10 bg-white/5 p-4 transition-colors hover:border-white/30"
              >
                <Mail size={20} aria-hidden className="shrink-0 text-brand-lumber" />
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wider text-white/55">Email</span>
                  <span className="block break-all font-display font-semibold text-white">{business.email}</span>
                </span>
              </a>
            </li>
            <li className="flex items-center gap-3 p-4 sm:col-span-2 lg:col-span-1">
              <MapPin size={20} aria-hidden className="shrink-0 text-brand-lumber" />
              <span className="text-[0.9375rem] text-white/75">{business.address.full}</span>
            </li>
          </ul>
        </div>

        <CityEstimateForm city={city} defaultCity={estimate.defaultCity} projectTypes={projectTypes} />
      </div>
    </section>
  );
}
