import type { ServiceDetail } from "@/lib/site/scope";
import { serviceDetails } from "@/lib/site/scope";

export type ServiceSubPageDefinition = {
  slug: string;
  label: string;
};

/** Sub-service pages nested under each main GBP category. */
export const serviceSubPagesByCategory: Record<string, ServiceSubPageDefinition[]> = {
  "home-builder": [
    { slug: "custom-home-building", label: "Custom Home Building" },
    { slug: "new-home-construction", label: "New Home Construction" },
    { slug: "home-addition-construction", label: "Home Addition Construction" },
  ],
  "general-contractor": [
    { slug: "residential-framing", label: "Residential Framing" },
    { slug: "commercial-framing", label: "Commercial Framing" },
    { slug: "rough-framing", label: "Rough Framing" },
    { slug: "structural-framing", label: "Structural Framing" },
  ],
  remodeler: [
    { slug: "whole-home-remodeling", label: "Whole Home Remodeling" },
    { slug: "kitchen-remodeling", label: "Kitchen Remodeling" },
    { slug: "bathroom-remodeling", label: "Bathroom Remodeling" },
  ],
  "deck-builder": [
    { slug: "wood-deck-construction", label: "Wood Deck Construction" },
    { slug: "deck-replacement", label: "Deck Replacement" },
  ],
  "siding-contractor": [
    { slug: "siding-installation", label: "Siding Installation" },
    { slug: "siding-replacement", label: "Siding Replacement" },
    { slug: "fiber-cement-siding", label: "Fiber Cement Siding" },
  ],
};

export type ServiceSubPageRef = ServiceSubPageDefinition & {
  categorySlug: string;
  href: string;
};

export function serviceCategoryHref(categorySlug: string) {
  return `/services/${categorySlug}`;
}

export function serviceSubPageHref(categorySlug: string, subSlug: string) {
  return `/services/${categorySlug}/${subSlug}`;
}

export function getServiceSubPagesForCategory(categorySlug: string): ServiceSubPageRef[] {
  return (serviceSubPagesByCategory[categorySlug] ?? []).map((page) => ({
    ...page,
    categorySlug,
    href: serviceSubPageHref(categorySlug, page.slug),
  }));
}

export function getAllServiceSubPages(): ServiceSubPageRef[] {
  return Object.keys(serviceSubPagesByCategory).flatMap((categorySlug) =>
    getServiceSubPagesForCategory(categorySlug),
  );
}

export function findServiceSubPage(
  categorySlug: string,
  subSlug: string,
): ServiceSubPageRef | null {
  const match = serviceSubPagesByCategory[categorySlug]?.find((page) => page.slug === subSlug);
  if (!match) return null;

  return {
    ...match,
    categorySlug,
    href: serviceSubPageHref(categorySlug, match.slug),
  };
}

export function buildServiceSubPageDetail(
  categorySlug: string,
  subSlug: string,
): ServiceDetail | null {
  const parent = serviceDetails[categorySlug];
  const subPage = findServiceSubPage(categorySlug, subSlug);
  if (!parent || !subPage) return null;

  const siblings = getServiceSubPagesForCategory(categorySlug).filter(
    (page) => page.slug !== subSlug,
  );

  const isFramingSubPage = categorySlug === "general-contractor";

  return {
    ...parent,
    slug: `${categorySlug}/${subSlug}`,
    name: subPage.label,
    h1: `${subPage.label} — Bay Area, Central Valley & Southern California`,
    metaTitle: `${subPage.label} Bay Area & Central Valley CA`,
    metaDescription: `Elite Builders provides ${subPage.label.toLowerCase()} across the Bay Area, Central Valley, and Southern California. CSLB #970551.`,
    intro: [
      `Elite Builders delivers professional ${subPage.label.toLowerCase()} with framing-first structural precision across California.`,
      parent.intro[1] ?? parent.intro[0],
    ],
    scopeHeading: subPage.label,
    scope: [
      subPage.label,
      ...parent.scope.filter((item) => item !== subPage.label).slice(0, 4),
    ],
    relatedServices: [
      { label: parent.name, href: serviceCategoryHref(categorySlug) },
      ...siblings.slice(0, 2).map((page) => ({
        label: page.label,
        href: page.href,
      })),
    ],
    featured: isFramingSubPage ? parent.featured : undefined,
  };
}
