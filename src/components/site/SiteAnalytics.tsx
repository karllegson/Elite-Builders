"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ANALYTICS_SETTINGS_CHANGED_EVENT,
  readAnalyticsSettings,
  resolveClarityProjectId,
  resolveGaMeasurementId,
} from "@/lib/admin/analyticsSettings";
import {
  initGoogleAnalytics,
  initMicrosoftClarity,
  trackAnalyticsEvent,
  trackPageView,
} from "@/lib/site/analytics";

function applyAnalyticsScripts(): () => void {
  const settings = readAnalyticsSettings();
  const measurementId = resolveGaMeasurementId(settings);
  const clarityId = resolveClarityProjectId(settings);

  if (measurementId) {
    initGoogleAnalytics(measurementId);
  }

  if (clarityId) {
    initMicrosoftClarity(clarityId);
  }

  const onPhoneClick = (event: MouseEvent) => {
    if (!settings.trackPhoneClicks) {
      return;
    }

    const link = (event.target as HTMLElement | null)?.closest('a[href^="tel:"]');
    if (!link) {
      return;
    }

    trackAnalyticsEvent("phone_click", {
      link_url: link.getAttribute("href") ?? "",
      page_path: window.location.pathname,
    });
  };

  const onFormSubmit = (event: Event) => {
    if (!settings.trackEstimateForms) {
      return;
    }

    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    if (form.getAttribute("aria-label") !== "Request a free estimate") {
      return;
    }

    const formData = new FormData(form);
    trackAnalyticsEvent("estimate_form_submit", {
      page_path: window.location.pathname,
      service: String(formData.get("service") ?? ""),
      city: String(formData.get("city") ?? ""),
    });
  };

  const onOutboundClick = (event: MouseEvent) => {
    if (!settings.trackOutboundLinks) {
      return;
    }

    const link = (event.target as HTMLElement | null)?.closest('a[href^="http"]');
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    if (link.hostname === window.location.hostname) {
      return;
    }

    trackAnalyticsEvent("outbound_link", {
      link_url: link.href,
      page_path: window.location.pathname,
    });
  };

  document.addEventListener("click", onPhoneClick);
  document.addEventListener("click", onOutboundClick);
  document.addEventListener("submit", onFormSubmit, true);

  return () => {
    document.removeEventListener("click", onPhoneClick);
    document.removeEventListener("click", onOutboundClick);
    document.removeEventListener("submit", onFormSubmit, true);
  };
}

export default function SiteAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    let cleanup = applyAnalyticsScripts();

    const refresh = () => {
      cleanup();
      cleanup = applyAnalyticsScripts();
    };

    window.addEventListener(ANALYTICS_SETTINGS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      cleanup();
      window.removeEventListener(ANALYTICS_SETTINGS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (lastTrackedPath.current === pagePath) {
      return;
    }

    lastTrackedPath.current = pagePath;
    trackPageView(pagePath);
  }, [pathname, searchParams]);

  return null;
}
