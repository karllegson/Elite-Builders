export type PostSeoSnippet = {
  seoTitle: string;
  permalink: string;
  metaDescription: string;
};

export type SchemaItem = {
  id: string;
  type: string;
  headline: string;
  description: string;
  customJsonLd?: string;
};

export const SEO_TITLE_MAX = 60;
export const SEO_PERMALINK_MAX = 75;
export const SEO_DESCRIPTION_MAX = 160;

export const SCHEMA_TYPE_OPTIONS = [
  "Article",
  "WebPage",
  "FAQPage",
  "Organization",
  "LocalBusiness",
] as const;

export type SchemaTypeOption = (typeof SCHEMA_TYPE_OPTIONS)[number];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Service area permalink from the full title (e.g. "San Jose, CA" → "san-jose-ca"). */
export function slugifyServiceAreaPermalink(title: string): string {
  const trimmed = title.trim();

  if (!trimmed) {
    return "";
  }

  const commaIndex = trimmed.lastIndexOf(",");

  if (commaIndex !== -1) {
    const cityPart = trimmed.slice(0, commaIndex).trim();
    const statePart = trimmed.slice(commaIndex + 1).trim();

    if (cityPart && statePart) {
      const citySlug = slugify(cityPart);
      const stateSlug = slugify(statePart);

      if (citySlug && stateSlug) {
        return `${citySlug}-${stateSlug}`;
      }
    }
  }

  return slugify(trimmed);
}

export function createSchemaItem(
  type: string,
  headline = "",
  description = "",
): SchemaItem {
  return {
    id: `${type.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    type,
    headline,
    description,
  };
}

export function createSchemaItemFromType(
  type: string,
  headline = "",
  description = "",
  customJsonLd?: string,
): SchemaItem {
  return {
    id: `${type.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    type,
    headline,
    description,
    customJsonLd,
  };
}

export function createDefaultArticleSchema(
  headline = "",
  description = "",
): SchemaItem {
  return createSchemaItem("Article", headline, description);
}

export function schemaToJsonLd(
  schema: SchemaItem,
  pageUrl: string,
): Record<string, string> {
  return {
    "@context": "https://schema.org",
    "@type": schema.type,
    headline: schema.headline,
    description: schema.description,
    url: pageUrl,
  };
}

export function getSeoProgress(
  length: number,
  max: number,
): "good" | "ok" | "bad" {
  const ratio = length / max;

  if (ratio <= 0.75) {
    return "good";
  }

  if (ratio <= 1) {
    return "ok";
  }

  return "bad";
}

export function buildPermalinkUrl(
  siteDomain: string,
  slug: string,
  basePath: string,
): string {
  const cleanSlug = slugify(slug) || "sample-post";
  const base = siteDomain.replace(/\/$/, "");
  const path = basePath.startsWith("/") ? basePath : `/${basePath}`;

  return `${base}${path}${cleanSlug}/`;
}

export function buildBlogPermalinkUrl(
  siteDomain: string,
  slug: string,
): string {
  return buildPermalinkUrl(siteDomain, slug, "/blog/");
}

export { buildServiceAreaPermalinkUrl } from "@/lib/site/serviceAreaUrls";
