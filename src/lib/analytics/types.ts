export const SITE_ANALYTICS_EVENT_TYPES = [
  "page_view",
  "phone_click",
  "estimate_form_submit",
  "outbound_link",
] as const;

export type SiteAnalyticsEventType = (typeof SITE_ANALYTICS_EVENT_TYPES)[number];

export type SiteAnalyticsEventPayload = {
  eventType: SiteAnalyticsEventType;
  pagePath: string;
  metadata?: Record<string, string>;
  referrer?: string;
};

export type SiteAnalyticsTopPage = {
  path: string;
  views: number;
};

export type SiteAnalyticsRecentEvent = {
  eventType: SiteAnalyticsEventType;
  pagePath: string;
  metadata: Record<string, string>;
  createdAt: string;
};

export type SiteAnalyticsSummary = {
  available: boolean;
  message?: string;
  periodDays: number;
  pageViews: number;
  phoneClicks: number;
  estimateSubmits: number;
  outboundClicks: number;
  todayPageViews: number;
  todayPhoneClicks: number;
  topPages: SiteAnalyticsTopPage[];
  recentEvents: SiteAnalyticsRecentEvent[];
};

export const EMPTY_ANALYTICS_SUMMARY: SiteAnalyticsSummary = {
  available: false,
  message: "Analytics storage is not connected yet.",
  periodDays: 30,
  pageViews: 0,
  phoneClicks: 0,
  estimateSubmits: 0,
  outboundClicks: 0,
  todayPageViews: 0,
  todayPhoneClicks: 0,
  topPages: [],
  recentEvents: [],
};
