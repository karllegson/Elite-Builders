import { business } from "./config";
import { SITE_URL, logoSchemaImage } from "./seo";

/**
 * JSON-LD builders for public pages. Every value comes from facts shown on the
 * page or in `business` (no ratings or reviews are invented here).
 */

export type BreadcrumbItem = { name: string; path: string };

const BUSINESS_ID = `${SITE_URL}/#business`;

function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return path === "/" || path === "" ? SITE_URL : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: business.address.street,
  addressLocality: business.address.city,
  addressRegion: business.address.state,
  postalCode: business.address.zip,
  addressCountry: "US",
};

/** The company itself, referenced by @id from page-level schema. */
export function businessReference() {
  return {
    "@type": "GeneralContractor",
    "@id": BUSINESS_ID,
    name: business.name,
    url: SITE_URL,
    telephone: business.phone,
    email: business.email,
    image: logoSchemaImage.url,
    logo: logoSchemaImage,
    address: postalAddress,
    foundingDate: String(business.foundedYear),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: `California contractor license ${business.license}`,
      recognizedBy: {
        "@type": "GovernmentOrganization",
        name: "Contractors State License Board",
        url: "https://www.cslb.ca.gov/",
      },
    },
  };
}

/** City landing page: the contractor, serving that city. */
export function cityServiceAreaSchema(input: {
  city: string;
  path: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    ...businessReference(),
    description: input.description,
    areaServed: { "@type": "City", name: `${input.city}, CA` },
    mainEntityOfPage: absoluteUrl(input.path),
  };
}

/** A service page, optionally tied to one city. */
export function serviceSchema(input: {
  name: string;
  path: string;
  description: string;
  city?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    serviceType: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: businessReference(),
    areaServed: input.city
      ? { "@type": "City", name: `${input.city}, CA` }
      : { "@type": "State", name: "California" },
  };
}

export function blogPostingSchema(input: {
  headline: string;
  path: string;
  description: string;
  datePublished?: string | null;
  dateModified?: string | null;
  image?: string | null;
}) {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline.slice(0, 110),
    description: input.description,
    url,
    mainEntityOfPage: url,
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified || input.datePublished
      ? { dateModified: input.dateModified || input.datePublished }
      : {}),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    author: { "@type": "Organization", name: business.name, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: business.name,
      logo: logoSchemaImage,
    },
  };
}
