"use client";

import { ArrowRight, Phone } from "lucide-react";
import { EbJumpList } from "@/components/site/EbJumpList";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import { business } from "@/lib/site/config";
import { EB_ESTIMATE_LABEL, type EbJumpLink } from "@/lib/site/ebContent";

type ServiceAreaSidebarProps = {
  city?: string;
  estimateDescription?: string;
  /** Sections of the page for the "On This Page" list (shown when there are 2 or more). */
  jumpLinks?: EbJumpLink[];
};

/**
 * The site's one sidebar (Job-site look): "On This Page" on top, then the estimate
 * card. Kept short on purpose so it fits on screen while it sticks.
 */
export function ServiceAreaSidebar({
  city,
  estimateDescription,
  jumpLinks = [],
}: ServiceAreaSidebarProps) {
  const estimateCopy =
    estimateDescription ??
    (city
      ? `Planning a project in ${city}? Tell us about your framing or home building needs and our team will follow up within one business day.`
      : "Planning a project? Tell us about your framing or home building needs and our team will follow up within one business day.");

  return (
    <aside
      className="eb-sidebar flex w-full flex-col gap-5 lg:sticky lg:top-28 lg:self-start"
      aria-label="Sidebar"
    >
      <EbJumpList links={jumpLinks} />

      <div className="eb-sidebar__estimate bg-ink bg-blueprint overflow-hidden rounded-3xl p-6 sm:p-7">
        <p className="eyebrow eyebrow-light">Get Started</p>
        <h2 className="mt-3 font-display text-xl font-bold text-white">Book An Estimate</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/70">{estimateCopy}</p>
        <div className="mt-6 grid gap-2.5">
          <EstimateCtaLink href="/#estimate" className="btn btn-primary w-full">
            {EB_ESTIMATE_LABEL}
            <ArrowRight size={16} aria-hidden className="btn-arrow" />
          </EstimateCtaLink>
          <a href={business.phoneHref} className="btn btn-glass w-full">
            <Phone size={16} aria-hidden />
            {business.phone}
          </a>
        </div>
      </div>
    </aside>
  );
}
