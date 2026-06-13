export type SchemaTemplateId =
  | "article-post"
  | "breadcrumb-auto"
  | "local-business-only"
  | "local-business-global"
  | "organization-global"
  | "service-page"
  | "webpage-page-post"
  | "website-global";

export type SchemaTemplate = {
  id: SchemaTemplateId;
  label: string;
};

export const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  { id: "article-post", label: "Article (Post)" },
  { id: "breadcrumb-auto", label: "BreadcrumbList (Auto basic)" },
  { id: "local-business-only", label: "Local Business Only" },
  { id: "local-business-global", label: "LocalBusiness (Global)" },
  { id: "organization-global", label: "Organization (Global)" },
  { id: "service-page", label: "Service (Page)" },
  { id: "webpage-page-post", label: "WebPage (Page/Post)" },
  { id: "website-global", label: "WebSite (Global)" },
];

export type SchemaPlaceholderGroup = {
  label: string;
  placeholders: string[];
};

export const SCHEMA_PLACEHOLDER_GROUPS: SchemaPlaceholderGroup[] = [
  {
    label: "Post/page",
    placeholders: [
      "post_title",
      "post_url",
      "post_excerpt",
      "post_date_published",
      "post_date_modified",
      "post_featured_image",
      "post_author_name",
    ],
  },
  {
    label: "Site",
    placeholders: [
      "site_name",
      "site_url",
      "site_locale",
      "site_logo",
    ],
  },
  {
    label: "Business",
    placeholders: [],
  },
  {
    label: "Branding",
    placeholders: [],
  },
  {
    label: "Social",
    placeholders: [],
  },
  {
    label: "Special",
    placeholders: [
      "business_address_full",
      "areas_served",
      "geo",
      "geo[lat,lon]",
      "geo_radius",
      "opening_hours",
      "opening_hours_special",
      "faqs",
      "faqs[slug]",
      "contact_point",
      "aggregate_rating",
      "offers_catalog",
      "offers_catalog[slug]",
      "same_as",
      "same_as[url]",
      "breadcrumbs_list",
    ],
  },
];

export type SchemaGeneratorConfig = {
  templates: Record<SchemaTemplateId, boolean>;
  customJsonMode: "add" | "override";
  customJsonLd: string;
};

export const DEFAULT_CUSTOM_JSON_LD = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": []
}`;

export function createDefaultSchemaGeneratorConfig(): SchemaGeneratorConfig {
  return {
    templates: {
      "article-post": true,
      "breadcrumb-auto": false,
      "local-business-only": false,
      "local-business-global": false,
      "organization-global": false,
      "service-page": false,
      "webpage-page-post": false,
      "website-global": false,
    },
    customJsonMode: "add",
    customJsonLd: DEFAULT_CUSTOM_JSON_LD,
  };
}

export function formatSchemaPlaceholder(token: string): string {
  return `{{${token}}}`;
}

export function insertTextAtCursor(
  textarea: HTMLTextAreaElement,
  text: string,
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const nextValue =
    textarea.value.slice(0, start) + text + textarea.value.slice(end);

  textarea.value = nextValue;
  textarea.focus();

  const cursor = start + text.length;
  textarea.setSelectionRange(cursor, cursor);

  return nextValue;
}

export function filterPlaceholderGroups(
  groups: SchemaPlaceholderGroup[],
  query: string,
): SchemaPlaceholderGroup[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      placeholders: group.placeholders.filter((placeholder) =>
        placeholder.toLowerCase().includes(normalized),
      ),
    }))
    .filter((group) => group.placeholders.length > 0);
}
