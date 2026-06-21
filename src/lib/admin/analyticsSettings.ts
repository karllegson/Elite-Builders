export type AnalyticsSettings = {
  ga4MeasurementId: string;
  ga4Enabled: boolean;
  searchConsoleProperty: string;
  clarityProjectId: string;
  clarityEnabled: boolean;
  trackPhoneClicks: boolean;
  trackEstimateForms: boolean;
  trackOutboundLinks: boolean;
};

export const ANALYTICS_SETTINGS_STORAGE_KEY = "elite-builders-analytics-v1";
export const ANALYTICS_SETTINGS_CHANGED_EVENT = "elite-builders-analytics-changed";

export const TRACKED_ANALYTICS_EVENTS = [
  {
    id: "phone_click",
    label: "Phone click",
    description: "User taps a tel: link (header, footer, mobile bar, service pages).",
  },
  {
    id: "estimate_form_submit",
    label: "Estimate form submit",
    description: "User submits the free estimate form on the homepage or CTAs.",
  },
  {
    id: "outbound_link",
    label: "Outbound link",
    description: "User clicks an external https link on the public site.",
  },
] as const;

export function createDefaultAnalyticsSettings(): AnalyticsSettings {
  return {
    ga4MeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "",
    ga4Enabled: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()),
    searchConsoleProperty: "https://www.elitebuildersco.com/",
    clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() ?? "",
    clarityEnabled: Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim()),
    trackPhoneClicks: true,
    trackEstimateForms: true,
    trackOutboundLinks: true,
  };
}

export function readAnalyticsSettings(): AnalyticsSettings {
  const defaults = createDefaultAnalyticsSettings();

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(ANALYTICS_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as Partial<AnalyticsSettings>;
    return {
      ...defaults,
      ...parsed,
      ga4MeasurementId: parsed.ga4MeasurementId?.trim() ?? defaults.ga4MeasurementId,
      clarityProjectId: parsed.clarityProjectId?.trim() ?? defaults.clarityProjectId,
      searchConsoleProperty:
        parsed.searchConsoleProperty?.trim() ?? defaults.searchConsoleProperty,
    };
  } catch {
    return defaults;
  }
}

export function writeAnalyticsSettings(settings: AnalyticsSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ANALYTICS_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(ANALYTICS_SETTINGS_CHANGED_EVENT));
}

export function resolveGaMeasurementId(settings = readAnalyticsSettings()): string | null {
  if (!settings.ga4Enabled) {
    return null;
  }

  const fromSettings = settings.ga4MeasurementId.trim();
  if (fromSettings) {
    return fromSettings;
  }

  const fromEnv = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return fromEnv || null;
}

export function resolveClarityProjectId(settings = readAnalyticsSettings()): string | null {
  if (!settings.clarityEnabled) {
    return null;
  }

  const fromSettings = settings.clarityProjectId.trim();
  if (fromSettings) {
    return fromSettings;
  }

  const fromEnv = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  return fromEnv || null;
}

export function maskMeasurementId(id: string): string {
  if (!id) {
    return "Not set";
  }

  if (id.length <= 6) {
    return id;
  }

  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}
