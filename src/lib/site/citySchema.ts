import { business, serviceAreas } from "@/lib/site/config";
import { logoSchemaImage, SITE_URL } from "@/lib/site/seo";

/** Stable id for the one real business entity — every page references it. */
export const BUSINESS_SCHEMA_ID = `${SITE_URL}/#business`;

type Crumb = { name: string; path: string };

type CitySchemaInput = {
  path: string;
  pageTitle: string;
  description: string;
  /** The city this page targets. Omit for non-city pages (e.g. dashboard service pages). */
  city?: string;
  county?: string;
  breadcrumbs: Crumb[];
  /** Nearby cities also served from this page. */
  nearbyCities?: string[];
  services?: { name: string; path?: string }[];
  /** Visible, answered FAQs only — never include placeholder answers. */
  faqs?: { question: string; answer: string }[];
  imageUrl?: string;
};

function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function cityPlace(name: string, county?: string) {
  return {
    "@type": "City",
    name: `${name}, CA`,
    ...(county
      ? { containedInPlace: { "@type": "AdministrativeArea", name: `${county} County, CA` } }
      : {}),
  };
}

/**
 * The business entity. Address is always the real Modesto office — city pages
 * describe where we work via `areaServed`, never with a local address.
 */
export function buildBusinessEntity(areaServed?: unknown[]) {
  return {
    "@type": "GeneralContractor",
    "@id": BUSINESS_SCHEMA_ID,
    name: business.name,
    url: SITE_URL,
    telephone: business.phone,
    email: business.email,
    logo: logoSchemaImage,
    image: logoSchemaImage.url,
    foundingDate: String(business.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.zip,
      addressCountry: "US",
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: "California Contractor License",
      identifier: business.licenseNumber,
      recognizedBy: {
        "@type": "Organization",
        name: "Contractors State License Board",
        url: "https://www.cslb.ca.gov",
      },
    },
    areaServed: areaServed ?? [
      cityPlace(business.address.city, "Stanislaus"),
      ...serviceAreas.map((area) => cityPlace(area.city)),
    ],
  };
}

/** JSON-LD @graph for a city landing page. */
export function buildCityPageSchema(input: CitySchemaInput) {
  const url = absoluteUrl(input.path);
  const servedPlaces = input.city
    ? [
        cityPlace(input.city, input.county),
        ...(input.nearbyCities ?? []).map((name) => cityPlace(name, input.county)),
      ]
    : undefined;

  const graph: Record<string, unknown>[] = [
    buildBusinessEntity(servedPlaces),
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: input.pageTitle,
      description: input.description,
      about: { "@id": BUSINESS_SCHEMA_ID },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      ...(input.imageUrl ? { primaryImageOfPage: absoluteUrl(input.imageUrl) } : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: input.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    },
  ];

  for (const service of input.services ?? []) {
    graph.push({
      "@type": "Service",
      name: input.city ? `${service.name} in ${input.city}, CA` : service.name,
      serviceType: service.name,
      provider: { "@id": BUSINESS_SCHEMA_ID },
      ...(input.city ? { areaServed: cityPlace(input.city, input.county) } : {}),
      ...(service.path ? { url: absoluteUrl(service.path) } : {}),
    });
  }

  if (input.faqs && input.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: input.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: stripHtml(faq.answer) },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** Serialize JSON-LD safely for an inline <script> tag. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
