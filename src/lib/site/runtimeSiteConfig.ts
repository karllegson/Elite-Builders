import {
  SITE_CONFIG_STORAGE_KEY,
  createDefaultSiteConfigValues,
  migrateLegacyValues,
} from "@/lib/admin/siteConfigSettings";

export type RuntimeSiteConfig = {
  businessName: string;
  phoneMain: string;
  logoImage: string;
  heroLocationLine: string;
  heroHeadline: string;
  homepagePrimaryCtaText: string;
  homepagePrimaryCtaLink: string;
  ctaButtonText: string;
  ctaButtonPage: string;
};

function toRuntime(values: Record<string, string>): RuntimeSiteConfig {
  const defaults = createDefaultSiteConfigValues();
  const merged = migrateLegacyValues({ ...defaults, ...values });

  return {
    businessName: merged.businessName || defaults.businessName,
    phoneMain: merged.phoneMain || defaults.phoneMain,
    logoImage: merged.logoImage || defaults.logoImage,
    heroLocationLine: merged.heroLocationLine || defaults.heroLocationLine,
    heroHeadline: merged.heroHeadline || defaults.heroHeadline,
    homepagePrimaryCtaText: merged.homepagePrimaryCtaText || defaults.homepagePrimaryCtaText,
    homepagePrimaryCtaLink: merged.homepagePrimaryCtaLink || defaults.homepagePrimaryCtaLink,
    ctaButtonText: merged.ctaButtonText || defaults.ctaButtonText,
    ctaButtonPage: merged.ctaButtonPage || defaults.ctaButtonPage,
  };
}

export function readRuntimeSiteConfig(): RuntimeSiteConfig {
  const defaults = createDefaultSiteConfigValues();

  if (typeof window === "undefined") {
    return toRuntime(defaults);
  }

  try {
    const raw = window.localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (!raw) {
      return toRuntime(defaults);
    }

    const parsed = JSON.parse(raw) as Record<string, string>;
    return toRuntime(parsed);
  } catch {
    return toRuntime(defaults);
  }
}

export function phoneToHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "tel:+12093456727";
}

export function normalizeCtaButtonHref(href: string): string {
  const trimmed = href.trim() || "/contact";

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    return trimmed;
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function getCtaButtonConfig(
  config: Pick<RuntimeSiteConfig, "ctaButtonText" | "ctaButtonPage"> = readRuntimeSiteConfig(),
): { label: string; href: string } {
  const defaults = createDefaultSiteConfigValues();

  return {
    label: config.ctaButtonText.trim() || defaults.ctaButtonText,
    href: normalizeCtaButtonHref(config.ctaButtonPage || defaults.ctaButtonPage),
  };
}

