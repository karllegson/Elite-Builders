import { checkEbPage, type EbPageKind } from "@/lib/admin/ebPageCheck";
import { serviceNameFromTitle } from "@/lib/admin/ebPageTemplates";
import { parseServiceAreaTitle, type ServiceAreaRecord } from "@/lib/admin/serviceAreasData";
import type { ServicePageRecord } from "@/lib/admin/servicesData";
import { isEbContent } from "@/lib/site/ebContent";
import { isServiceLandingSlug } from "@/lib/site/serviceLandingPages";

export type PageHealthState = "ready" | "check" | "fix" | "placeholder" | "empty";

/** One-line summary of a page for the admin Pages list. */
export type PageHealth = {
  state: PageHealthState;
  words: number;
  images: number;
  /** Image URLs on the page (for the in-browser "does it load" check). */
  imageUrls: string[];
  /** Share of this page's paragraphs that also appear word-for-word on another page. */
  copiedPercent: number;
  fixes: string[];
  checks: string[];
};

const STOCK_HOSTS =
  /(unsplash\.com|pexels\.com|pixabay\.com|shutterstock\.com|istockphoto\.com|gettyimages\.|adobestock|stock\.adobe|depositphotos|dreamstime|freepik|placeholder\.com|placehold\.|picsum\.photos|dummyimage)/i;
const PLACEHOLDER_TEXT = /lorem ipsum|dolor sit amet|\bWRITE:|\bTODO\b|\bTBD\b|xxx+/i;

function visibleText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/&nbsp;|&amp;|&#\d+;|&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text: string): number {
  return text ? text.split(" ").filter(Boolean).length : 0;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Paragraph-sized chunks of text, normalised so small spacing/case changes still match. */
function paragraphs(html: string): string[] {
  return Array.from(html.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi), (match) =>
    visibleText(match[2]).toLowerCase(),
  ).filter((text) => text.length >= 80);
}

function imageSrcs(html: string): string[] {
  return Array.from(
    html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi),
    (match) => match[1].trim(),
  ).filter(Boolean);
}

function fileName(src: string): string {
  return decodeURIComponent(src.split("?")[0].split("/").pop() ?? "").toLowerCase();
}

/** Headings opened but never closed (e.g. "<h2>Title<h2>"), which turn the rest of the section into a heading. */
function brokenHeadings(html: string): string[] {
  const broken: string[] = [];
  for (const match of html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<(\/?)h([1-6])\b/gi)) {
    if (match[3] !== "/" || match[1] !== match[4]) {
      broken.push(visibleText(match[2]).slice(0, 50) || `empty <h${match[1]}>`);
    }
  }
  return broken;
}

function stateFor(fixes: string[], checks: string[]): PageHealthState {
  return fixes.length ? "fix" : checks.length ? "check" : "ready";
}

function pageKind(area: ServiceAreaRecord, byId: Map<string, ServiceAreaRecord>) {
  const parent = area.parentId ? byId.get(area.parentId) : undefined;
  if (parent) {
    const city = parseServiceAreaTitle(parent.title).city;
    return { kind: "subpage" as EbPageKind, city, service: serviceNameFromTitle(area.title, city) };
  }
  if (isServiceLandingSlug(area.slug)) {
    return { kind: "service" as EbPageKind, city: "", service: area.title };
  }
  return { kind: "city" as EbPageKind, city: parseServiceAreaTitle(area.title).city, service: "" };
}

/** Health for every city page, city sub-page and service landing page, keyed by record id. */
export function buildServiceAreaHealth(areas: ServiceAreaRecord[]): Map<string, PageHealth> {
  const active = areas.filter((area) => !area.unused);
  const byId = new Map(active.map((area) => [area.id, area]));
  const cities = active
    .filter((area) => !area.parentId && !isServiceLandingSlug(area.slug))
    .map((area) => slugify(parseServiceAreaTitle(area.title).city))
    .filter((slug) => slug.length > 3);

  // Where each paragraph and each photo is used, to spot copies across pages.
  const paragraphPages = new Map<string, Set<string>>();
  const imagePages = new Map<string, Set<string>>();
  // Only published pages count as "another page" (drafts are often copies being worked on).
  for (const area of active.filter((item) => item.status === "published")) {
    for (const text of new Set(paragraphs(area.content))) {
      paragraphPages.set(text, (paragraphPages.get(text) ?? new Set()).add(area.id));
    }
    for (const src of new Set(imageSrcs(area.content))) {
      imagePages.set(src, (imagePages.get(src) ?? new Set()).add(area.id));
    }
  }

  const result = new Map<string, PageHealth>();
  for (const area of active) {
    const content = area.content ?? "";
    const text = visibleText(content);
    const words = wordCount(text);
    const srcs = imageSrcs(content);
    const imageCount = (content.match(/<img\b/gi) ?? []).length;
    const ownParagraphs = paragraphs(content);
    const copiedFrom = new Map<string, number>();
    let copied = 0;
    for (const text of ownParagraphs) {
      const others = [...(paragraphPages.get(text) ?? [])].filter((id) => id !== area.id);
      if (others.length) {
        copied += 1;
        for (const id of others) copiedFrom.set(id, (copiedFrom.get(id) ?? 0) + 1);
      }
    }
    const copiedPercent = ownParagraphs.length ? Math.round((copied / ownParagraphs.length) * 100) : 0;
    const topSource = [...copiedFrom.entries()].sort((a, b) => b[1] - a[1])[0];
    const sourceNote = topSource ? ` Most match "${byId.get(topSource[0])?.title ?? "another page"}".` : "";
    const base = { words, images: imageCount, imageUrls: srcs, copiedPercent };

    if (!text) {
      result.set(area.id, { ...base, state: "empty", fixes: ["No content yet."], checks: [] });
      continue;
    }

    const fixes: string[] = [];
    const checks: string[] = [];
    const { kind, city } = pageKind(area, byId);

    if (isEbContent(content)) {
      for (const item of checkEbPage({
        content,
        kind,
        city,
        seoTitle: area.seoTitle,
        metaDescription: area.metaDescription,
      })) {
        if (item.status === "fail") fixes.push(`${item.label}: ${item.detail}`);
        if (item.status === "warn") checks.push(`${item.label}: ${item.detail}`);
      }
    } else {
      checks.push("Old page format (not the Elite layout).");
      if (words < 300) fixes.push(`Only ${words} words.`);
    }

    const placeholder = text.match(PLACEHOLDER_TEXT);
    if (placeholder) {
      fixes.push(`Placeholder text left in: "${placeholder[0]}".`);
    }

    for (const heading of brokenHeadings(content)) {
      fixes.push(`Broken heading (not closed): "${heading}".`);
    }
    const literalTags = content.match(/\[(?:h[1-6]|H[1-6])\]/g);
    if (literalTags) {
      fixes.push(`"${literalTags[0]}" typed into the text ${literalTags.length}×.`);
    }

    const stock = srcs.filter((src) => STOCK_HOSTS.test(src));
    if (stock.length) {
      fixes.push(`${stock.length} stock photo(s): ${stock.map(fileName).join(", ")}. Use real Elite job photos.`);
    }
    const external = srcs.filter((src) => /^https?:\/\//i.test(src) && !STOCK_HOSTS.test(src) && !/supabase|elitebuildersco\.com/i.test(src));
    if (external.length) {
      checks.push(`${external.length} photo(s) hosted on another site: ${external.map(fileName).join(", ")}.`);
    }
    const ownCity = slugify(city);
    const otherCity = srcs.filter((src) => {
      const name = fileName(src);
      return cities.some((slug) => slug !== ownCity && !ownCity.includes(slug) && name.includes(slug));
    });
    if (otherCity.length && kind !== "service") {
      checks.push(`Photo named after another city: ${otherCity.map(fileName).join(", ")}.`);
    }
    const reused = srcs.filter((src) => [...(imagePages.get(src) ?? [])].some((id) => id !== area.id));
    if (reused.length) {
      checks.push(`${reused.length} photo(s) also used on another page.`);
    }
    if (!area.featuredImage && area.status === "published") {
      checks.push("No featured image.");
    }

    if (copiedPercent >= 30) {
      fixes.push(`${copiedPercent}% of paragraphs are word-for-word on another page (Google treats this as duplicate).${sourceNote}`);
    } else if (copiedPercent >= 10) {
      checks.push(`${copiedPercent}% of paragraphs also appear on another page.${sourceNote}`);
    }

    const isPlaceholder = Boolean(placeholder) || (words < 150 && isEbContent(content));
    result.set(area.id, {
      ...base,
      state: isPlaceholder ? "placeholder" : stateFor(fixes, checks),
      fixes,
      checks,
    });
  }
  return result;
}

/** Health for the Services pages (built from a fixed template; only the text fields vary). */
export function buildServicePageHealth(pages: ServicePageRecord[]): Map<string, PageHealth> {
  const result = new Map<string, PageHealth>();
  for (const page of pages) {
    const text = [
      page.h1,
      ...page.intro,
      page.scopeHeading,
      ...page.scope,
      page.residential.heading,
      page.residential.body,
      page.commercial.heading,
      page.commercial.body,
      ...page.faqs.flatMap((faq) => [faq.question, faq.answer]),
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const fixes: string[] = [];
    const checks: string[] = [];
    const meta = page.metaDescription.trim().length;
    if (!meta) fixes.push("No meta description.");
    else if (meta < 120 || meta > 160) checks.push(`Meta description is ${meta} characters (aim for 120 to 160).`);
    if (page.metaTitle.length > 65) checks.push(`SEO title is ${page.metaTitle.length} characters; Google cuts it around 60.`);
    if (page.faqs.length < 3) checks.push(`Only ${page.faqs.length} FAQs.`);
    if (PLACEHOLDER_TEXT.test(text)) fixes.push("Placeholder text left in.");
    result.set(page.id, {
      state: stateFor(fixes, checks),
      words: wordCount(text),
      images: 1,
      imageUrls: [],
      copiedPercent: 0,
      fixes,
      checks,
    });
  }
  return result;
}
