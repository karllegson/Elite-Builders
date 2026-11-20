"use client";

import type { ReactNode } from "react";
import { trackAnalyticsEvent } from "@/lib/site/analytics";
import { scrollToEstimateSection } from "@/lib/site/estimateAnchor";
import type { CityAudience } from "@/lib/site/cityPages";

export const CITY_AUDIENCE_EVENT = "city-audience-change";

export function announceCityAudience(audience: CityAudience) {
  window.dispatchEvent(new CustomEvent<CityAudience>(CITY_AUDIENCE_EVENT, { detail: audience }));
}

type CityAudienceLinkProps = {
  audience: CityAudience;
  trackingLocation: string;
  className?: string;
  children: ReactNode;
};

/** Estimate CTA that also pre-selects the audience in the on-page form (e.g. "Send plans for a bid"). */
export function CityAudienceLink({ audience, trackingLocation, className, children }: CityAudienceLinkProps) {
  return (
    <a
      href="#estimate"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        announceCityAudience(audience);
        trackAnalyticsEvent("estimate_cta_click", {
          cta_location: trackingLocation,
          audience,
          page_path: window.location.pathname,
        });
        if (scrollToEstimateSection(true)) {
          window.history.pushState(null, "", "#estimate");
        }
      }}
    >
      {children}
    </a>
  );
}
