import {
  EB_SECTIONS,
  findHeadingsMissingBar,
  findSectionsMissingRule,
  isEbContent,
} from "@/lib/site/ebContent";
import { EB_WRITE_PROMPT } from "@/lib/admin/ebPageTemplates";
import { services } from "@/lib/site/config";
import { MOVED_SERVICE_AREA_PATHS } from "@/lib/site/serviceLandingPages";
import { getAllServiceSubPages } from "@/lib/site/serviceSubPages";

export type EbCheckStatus = "pass" | "warn" | "fail";

export type EbCheckResult = {
  id: string;
  label: string;
  status: EbCheckStatus;
  detail: string;
};

export type EbPageKind = "city" | "subpage" | "service";

export type EbPageCheckInput = {
  content: string;
  kind: EbPageKind;
  /** City the page is about (empty for statewide service pages). */
  city: string;
  seoTitle: string;
  metaDescription: string;
};

const BRAND = "Elite Builders IX";
const MIN_WORDS = 900;
const LOW_WORDS = 600;
const MIN_CITY_MENTIONS = 3;
const MAX_CITY_MENTIONS = 30;
const META_MIN = 120;
const META_MAX = 160;
const TITLE_MAX = 65;

/** Section ids each page type should have. Sub-pages skip "Our Process" (same as the Modesto sub-pages). */
function requiredSections(kind: EbPageKind) {
  return EB_SECTIONS.filter((section) => !(kind === "subpage" && section.id === "our-process"));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function visibleText(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

const WEAK_FILE_NAME =
  /(^|\/)(img|dsc|dscn|pxl|image|photo|screenshot|screen shot|untitled|whatsapp)[\s_-]?\d*|(^|\/)\d+\.(jpe?g|png|webp)$/i;

/** Every /services page that renders (not a redirect). */
const LIVE_SERVICE_PATHS = new Set([
  ...services.map((service) => service.href),
  ...getAllServiceSubPages().map((subPage) => subPage.href),
]);

const SITE_ORIGIN_PATTERN = /^https?:\/\/(?:www\.)?elitebuildersco\.com/i;

/** Links to /services URLs that redirect or are gone, and to moved /service-areas pages. */
function findOldLinks(content: string): string[] {
  const hrefs = content.matchAll(/(?:href=["']|\[button\s+href=["'])([^"']+)["']/gi);
  const found = new Set<string>();

  for (const [, href] of hrefs) {
    const path = href.replace(SITE_ORIGIN_PATTERN, "").replace(/[?#].*$/, "").replace(/(.)\/$/, "$1");
    const movedTo = MOVED_SERVICE_AREA_PATHS[path];
    if (movedTo) {
      found.add(`${path} (now ${movedTo})`);
    } else if (path.startsWith("/services/") && !LIVE_SERVICE_PATHS.has(path)) {
      found.add(path);
    }
  }

  return Array.from(found);
}

/** Runs every Elite page rule on the editor content and SEO fields. */
export function checkEbPage(input: EbPageCheckInput): EbCheckResult[] {
  const { content, kind, seoTitle, metaDescription } = input;
  const city = input.city.trim();
  const results: EbCheckResult[] = [];
  const add = (id: string, label: string, status: EbCheckStatus, detail: string) =>
    results.push({ id, label, status, detail });

  if (!content.trim()) {
    add("empty", "Content", "fail", 'The page is empty. Click "New page template" to start.');
    return results;
  }

  // Format
  add(
    "format",
    "Elite format",
    isEbContent(content) ? "pass" : "fail",
    isEbContent(content)
      ? "The page uses the Elite format."
      : 'No Elite blocks found. Start from "New page template".',
  );

  // H1
  const h1s = content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) ?? [];
  const h1Text = h1s[0] ? visibleText(h1s[0]) : "";
  if (h1s.length === 1) {
    const hasCity = !city || h1Text.toLowerCase().includes(city.toLowerCase());
    add(
      "h1",
      "One H1",
      hasCity ? "pass" : "warn",
      hasCity ? `H1: "${h1Text}"` : `H1 "${h1Text}" doesn't name ${city}.`,
    );
  } else {
    add(
      "h1",
      "One H1",
      "fail",
      h1s.length === 0 ? "Add one H1 (it becomes the page title band)." : `There are ${h1s.length} H1s. Keep one.`,
    );
  }

  // Sections and order
  const required = requiredSections(kind);
  const foundIds = Array.from(content.matchAll(/<h2\b[^>]*\bid=["']([^"']+)["']/gi), (m) => m[1]);
  const missing = required.filter((section) => !foundIds.includes(section.id));
  const orderOk = required
    .map((section) => foundIds.indexOf(section.id))
    .filter((index) => index >= 0)
    .every((index, position, list) => position === 0 || index > list[position - 1]);
  if (missing.length > 0) {
    add(
      "sections",
      "All sections",
      missing.length > 2 ? "fail" : "warn",
      `Missing: ${missing.map((section) => section.label).join(", ")}.`,
    );
  } else {
    add(
      "sections",
      "All sections",
      orderOk ? "pass" : "warn",
      orderOk ? `All ${required.length} sections, in order.` : "All sections are there but out of order.",
    );
  }

  // Divider lines are typed by hand: an <hr> before every section H2 except the first.
  const missingRules = findSectionsMissingRule(content);
  const h2WithoutId = Array.from(
    content.matchAll(/<h2\b(?![^>]*\bid=)[^>]*>([\s\S]*?)<\/h2>/gi),
    (m) => visibleText(m[1]),
  );
  const dividerIssues = [
    missingRules.length
      ? `No <hr> before: "${missingRules.join('", "')}". Click "HR (section line)" just above each one`
      : "",
    h2WithoutId.length
      ? `H2 without an id gets no line style, label or jump link: "${h2WithoutId.join('", "')}"`
      : "",
  ].filter(Boolean);
  add(
    "dividers",
    "Section lines (<hr>)",
    missingRules.length ? "fail" : h2WithoutId.length ? "warn" : "pass",
    dividerIssues.length ? `${dividerIssues.join(". ")}.` : "Every section after the first has its <hr>.",
  );

  // The H1 sits right on top of The Basics heading (one stack, label above, bar below).
  const stacked = /<h1\b[^>]*>[\s\S]*?<\/h1>\s*<h2\b[^>]*\bid=["']/i.test(content);
  if (/<h1\b/i.test(content)) {
    add(
      "order",
      "H1 stacked on The Basics",
      stacked ? "pass" : "warn",
      stacked
        ? "H1 sits right above the first section heading."
        : "Put the H1 directly above <h2 id=\"the-basics\"> (nothing between them), after The Short Version.",
    );
  }

  // Short red bars are typed by hand: <hr class="short"> under the H1 and each section heading.
  const missingBars = findHeadingsMissingBar(content);
  add(
    "bars",
    'Red bars (<hr class="short">)',
    missingBars.length ? "warn" : "pass",
    missingBars.length
      ? `No red bar under: "${missingBars.join('", "')}". Click "Short HR (red bar)" right after each heading (after the subhead if there is one).`
      : "Every heading has its red bar.",
  );

  // Short Version
  add(
    "short",
    "The Short Version",
    /class=["'][^"']*\beb-short\b/.test(content) ? "pass" : "warn",
    /class=["'][^"']*\beb-short\b/.test(content)
      ? "Summary box is there."
      : 'Add the "Short Version" summary box at the top.',
  );

  // Leftover placeholders
  const leftovers: string[] = [];
  const writeCount = content.split(EB_WRITE_PROMPT).length - 1;
  if (writeCount > 0) leftovers.push(plural(writeCount, `"${EB_WRITE_PROMPT}" prompt`));
  if (/>\s*(Title|Body|Text)\s*</.test(content)) leftovers.push('"Title" / "Body" / "Text"');
  if (/\bCity, CA\b/.test(content)) leftovers.push('"City, CA"');
  if (/href=["']\s*["']/.test(content)) leftovers.push("empty link");
  if (/\[faqs\s+category=["']\s*["']\]/i.test(content)) leftovers.push("empty FAQ category");
  add(
    "placeholders",
    "Template text filled in",
    leftovers.length === 0 ? "pass" : "fail",
    leftovers.length === 0 ? "No template text left." : `Still in the page: ${leftovers.join(", ")}.`,
  );

  // Words
  const words = visibleText(content).split(" ").filter(Boolean).length;
  add(
    "words",
    "Length",
    words >= MIN_WORDS ? "pass" : words >= LOW_WORDS ? "warn" : "fail",
    `${words} words (aim for ${MIN_WORDS}+).`,
  );

  // City mentions
  if (city && kind !== "service") {
    const mentions = (visibleText(content).match(new RegExp(`\\b${escapeRegExp(city)}\\b`, "gi")) ?? []).length;
    add(
      "city",
      `Mentions of ${city}`,
      mentions < MIN_CITY_MENTIONS ? "fail" : mentions > MAX_CITY_MENTIONS ? "warn" : "pass",
      mentions > MAX_CITY_MENTIONS
        ? `${mentions} times. That reads like keyword stuffing; cut some.`
        : `${plural(mentions, "time")} (at least ${MIN_CITY_MENTIONS}).`,
    );
  }

  // Images
  const images = Array.from(content.matchAll(/<img\b[^>]*>/gi), (m) => m[0]);
  const noSrc = images.filter((tag) => !/\bsrc=["'][^"']+["']/i.test(tag)).length;
  const noAlt = images.filter((tag) => !/\balt=["'][^"']+["']/i.test(tag)).length;
  const weakNames = images
    .map((tag) => tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? "")
    .filter((src) => src && WEAK_FILE_NAME.test(src.split("?")[0]))
    .map((src) => src.split("/").pop());
  const imageIssues = [
    noSrc ? `${plural(noSrc, "image")} with no photo` : "",
    noAlt ? `${plural(noAlt, "image")} with no alt text` : "",
    weakNames.length ? `camera-style file names: ${weakNames.join(", ")}` : "",
  ].filter(Boolean);
  add(
    "images",
    "Images",
    images.length === 0 ? "warn" : noSrc || noAlt ? "fail" : weakNames.length ? "warn" : "pass",
    images.length === 0
      ? "No images. Add real job photos."
      : imageIssues.length
        ? `${imageIssues.join("; ")}.`
        : `${plural(images.length, "image")}, all with alt text and good names.`,
  );

  // Blocks
  const faq = content.match(/\[faqs\s+category=["']([^"']*)["']\]/i);
  add(
    "faqs",
    "FAQs",
    faq && faq[1].trim() && !faq[1].includes(EB_WRITE_PROMPT) ? "pass" : "warn",
    faq ? (faq[1].trim() ? `Category: ${faq[1]}` : "FAQ block has no category.") : "No FAQ block.",
  );
  if (kind !== "service") {
    add("map", "Map", /\[map\]/i.test(content) ? "pass" : "warn", /\[map\]/i.test(content) ? "Map block is there." : "Add [map] in Where We Work.");
  }
  const estimates = (content.match(/\[estimate_button\]/gi) ?? []).length;
  add(
    "estimate",
    "Estimate buttons",
    estimates >= 2 ? "pass" : "warn",
    estimates >= 2 ? `${estimates} estimate buttons.` : "Add an estimate button after The Basics and at the end.",
  );

  // Old links that redirect
  const oldLinks = findOldLinks(content);
  add(
    "links",
    "Links",
    oldLinks.length ? "warn" : "pass",
    oldLinks.length
      ? `These links redirect or no longer exist: ${oldLinks.join(", ")}. Link to the page they end up on instead.`
      : "No links to old redirected pages.",
  );

  // SEO title
  const title = seoTitle.trim();
  const brandCount = title.split(BRAND).length - 1;
  if (!title) {
    add("seo-title", "SEO title", "fail", "Fill in the SEO title below.");
  } else if (/,\s*[A-Z]{2}$/.test(title) && kind === "city") {
    add("seo-title", "SEO title", "fail", `Ends in ", CA", so the site ignores it. Add " | ${BRAND}" at the end.`);
  } else if (brandCount > 1) {
    add("seo-title", "SEO title", "warn", "The brand is in the title twice.");
  } else if (city && kind !== "service" && !title.toLowerCase().includes(city.toLowerCase())) {
    add("seo-title", "SEO title", "warn", `Doesn't name ${city}.`);
  } else if (title.length > TITLE_MAX) {
    add("seo-title", "SEO title", "warn", `${title.length} characters; Google cuts it around 60.`);
  } else {
    add("seo-title", "SEO title", "pass", `${title.length} characters.`);
  }

  // Meta description
  const meta = metaDescription.trim();
  add(
    "meta",
    "Meta description",
    !meta ? "fail" : meta.length < META_MIN || meta.length > META_MAX ? "warn" : "pass",
    !meta ? "Fill in the meta description below." : `${meta.length} characters (aim for ${META_MIN} to ${META_MAX}).`,
  );

  return results;
}
