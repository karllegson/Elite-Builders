import {
  readAnalyticsSettings,
  type AnalyticsSettings,
} from "@/lib/admin/analyticsSettings";
import { sendSiteAnalyticsEvent } from "@/lib/analytics/client";
import type { SiteAnalyticsEventType } from "@/lib/analytics/types";

type GtagCommand = "config" | "event" | "js";

type Gtag = {
  (command: "js", date: Date): void;
  (command: "config", measurementId: string, params?: Record<string, unknown>): void;
  (command: "event", eventName: string, params?: Record<string, unknown>): void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function getAnalyticsSettings(): AnalyticsSettings {
  return readAnalyticsSettings();
}

export function trackAnalyticsEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const pagePath =
    typeof params?.page_path === "string" ? params.page_path : window.location.pathname;

  const metadata: Record<string, string> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (key !== "page_path") {
        metadata[key] = String(value);
      }
    }
  }

  const firstPartyType = eventName as SiteAnalyticsEventType;
  if (
    firstPartyType === "phone_click" ||
    firstPartyType === "estimate_form_submit" ||
    firstPartyType === "outbound_link"
  ) {
    void sendSiteAnalyticsEvent({
      eventType: firstPartyType,
      pagePath,
      metadata,
      referrer: document.referrer || undefined,
    });
  }

  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}

export function trackPageView(pagePath: string): void {
  if (typeof window === "undefined") {
    return;
  }

  void sendSiteAnalyticsEvent({
    eventType: "page_view",
    pagePath,
    referrer: document.referrer || undefined,
  });

  const settings = readAnalyticsSettings();
  const measurementId = resolveGaMeasurementIdFromSettings(settings);

  if (measurementId && typeof window.gtag === "function") {
    window.gtag("config", measurementId, {
      page_path: pagePath,
    });
  }
}

function resolveGaMeasurementIdFromSettings(settings: AnalyticsSettings): string | null {
  if (!settings.ga4Enabled) {
    return null;
  }

  const fromSettings = settings.ga4MeasurementId.trim();
  if (fromSettings) {
    return fromSettings;
  }

  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;
}

export function initGoogleAnalytics(measurementId: string): void {
  if (typeof window === "undefined" || !measurementId) {
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("config", measurementId, { send_page_view: true });
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = ((...args: unknown[]) => {
    window.dataLayer?.push(args);
  }) as Gtag;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: true });
}

export function initMicrosoftClarity(projectId: string): void {
  if (typeof window === "undefined" || !projectId) {
    return;
  }

  if (document.querySelector(`script[data-clarity-id="${projectId}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  script.setAttribute("data-clarity-id", projectId);
  document.head.appendChild(script);
}
