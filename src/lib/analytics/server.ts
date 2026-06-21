import {
  EMPTY_ANALYTICS_SUMMARY,
  SITE_ANALYTICS_EVENT_TYPES,
  type SiteAnalyticsEventPayload,
  type SiteAnalyticsRecentEvent,
  type SiteAnalyticsSummary,
  type SiteAnalyticsTopPage,
} from "@/lib/analytics/types";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function normalizePagePath(path: string): string {
  const trimmed = path.trim() || "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function shouldSkipPath(path: string): boolean {
  return path.startsWith("/admin") || path.startsWith("/api/");
}

export function isValidAnalyticsEvent(
  payload: Partial<SiteAnalyticsEventPayload>,
): payload is SiteAnalyticsEventPayload {
  if (!payload.eventType || !SITE_ANALYTICS_EVENT_TYPES.includes(payload.eventType)) {
    return false;
  }

  if (!payload.pagePath || typeof payload.pagePath !== "string") {
    return false;
  }

  const pagePath = normalizePagePath(payload.pagePath);
  if (shouldSkipPath(pagePath)) {
    return false;
  }

  return true;
}

export async function recordSiteAnalyticsEvent(
  payload: SiteAnalyticsEventPayload,
): Promise<boolean> {
  if (!hasAdminClient()) {
    return false;
  }

  const pagePath = normalizePagePath(payload.pagePath);
  if (shouldSkipPath(pagePath)) {
    return false;
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("site_analytics_events").insert({
      event_type: payload.eventType,
      page_path: pagePath,
      metadata: payload.metadata ?? {},
      referrer: payload.referrer?.slice(0, 500) ?? null,
    });

    return !error;
  } catch {
    return false;
  }
}

type SummaryRow = {
  periodDays?: number;
  pageViews?: number;
  phoneClicks?: number;
  estimateSubmits?: number;
  outboundClicks?: number;
  todayPageViews?: number;
  todayPhoneClicks?: number;
  topPages?: SiteAnalyticsTopPage[];
  recentEvents?: SiteAnalyticsRecentEvent[];
};

export async function getSiteAnalyticsSummary(
  periodDays = 30,
): Promise<SiteAnalyticsSummary> {
  if (!isSupabaseConfigured() || !hasAdminClient()) {
    return {
      ...EMPTY_ANALYTICS_SUMMARY,
      periodDays,
      message:
        "Connect Supabase and run migration 006_site_analytics.sql to collect page views and clicks.",
    };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("get_site_analytics_summary", {
      p_days: periodDays,
    });

    if (error || !data) {
      return {
        ...EMPTY_ANALYTICS_SUMMARY,
        periodDays,
        message:
          error?.message ??
          "Analytics table not found. Apply supabase/migrations/006_site_analytics.sql.",
      };
    }

    const row = data as SummaryRow;

    return {
      available: true,
      periodDays: row.periodDays ?? periodDays,
      pageViews: row.pageViews ?? 0,
      phoneClicks: row.phoneClicks ?? 0,
      estimateSubmits: row.estimateSubmits ?? 0,
      outboundClicks: row.outboundClicks ?? 0,
      todayPageViews: row.todayPageViews ?? 0,
      todayPhoneClicks: row.todayPhoneClicks ?? 0,
      topPages: row.topPages ?? [],
      recentEvents: (row.recentEvents ?? []).map((event) => ({
        eventType: event.eventType,
        pagePath: event.pagePath,
        metadata: event.metadata ?? {},
        createdAt: event.createdAt,
      })),
    };
  } catch (error) {
    return {
      ...EMPTY_ANALYTICS_SUMMARY,
      periodDays,
      message: error instanceof Error ? error.message : "Unable to load analytics.",
    };
  }
}
