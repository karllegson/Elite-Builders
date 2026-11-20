"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { trackAnalyticsEvent } from "@/lib/site/analytics";
import { isEstimateAnchorHref, scrollToEstimateSection } from "@/lib/site/estimateAnchor";

type EstimateCtaLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: ComponentProps<typeof Link>["href"];
  /** Optional analytics location label (city pages, etc.). */
  trackingLocation?: string;
};

export default function EstimateCtaLink({
  href,
  onClick,
  trackingLocation,
  ...props
}: EstimateCtaLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hrefString = typeof href === "string" ? href : "";

  const handleTracking = () => {
    if (!trackingLocation) {
      return;
    }

    trackAnalyticsEvent("estimate_cta_click", {
      cta_location: trackingLocation,
      page_path: window.location.pathname,
    });
  };

  if (!hrefString || !isEstimateAnchorHref(hrefString)) {
    return (
      <Link
        href={href}
        onClick={(event) => {
          handleTracking();
          onClick?.(event);
        }}
        {...(trackingLocation ? { "data-cta-location": trackingLocation } : {})}
        {...props}
      />
    );
  }

  return (
    <Link
      href="/#estimate"
      onClick={(event) => {
        handleTracking();
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }

        event.preventDefault();

        if (pathname === "/") {
          if (scrollToEstimateSection(true)) {
            window.history.pushState(null, "", "#estimate");
          }
          return;
        }

        router.push("/#estimate");
      }}
      {...(trackingLocation ? { "data-cta-location": trackingLocation } : {})}
      {...props}
    />
  );
}
