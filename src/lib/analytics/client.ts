import type { SiteAnalyticsEventPayload } from "@/lib/analytics/types";

export async function sendSiteAnalyticsEvent(
  payload: SiteAnalyticsEventPayload,
): Promise<void> {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Non-blocking — analytics should never break the site.
  }
}
