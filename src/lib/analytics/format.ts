import type { SiteAnalyticsEventType } from "@/lib/analytics/types";

export function formatAnalyticsNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatAnalyticsDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAnalyticsEventLabel(eventType: SiteAnalyticsEventType): string {
  switch (eventType) {
    case "page_view":
      return "Page view";
    case "phone_click":
      return "Phone click";
    case "estimate_form_submit":
      return "Estimate submit";
    case "outbound_link":
      return "Outbound link";
    default:
      return eventType;
  }
}

export function summarizeAnalyticsMetadata(metadata: Record<string, string>): string {
  const parts: string[] = [];

  if (metadata.link_url) {
    parts.push(metadata.link_url);
  }

  if (metadata.service) {
    parts.push(`Service: ${metadata.service}`);
  }

  if (metadata.city) {
    parts.push(`City: ${metadata.city}`);
  }

  return parts.join(" · ");
}
