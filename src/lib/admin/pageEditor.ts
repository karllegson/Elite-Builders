import {
  insertAtCursor,
  insertH2WithId,
  insertHr,
  insertShortHr,
  wrapSelection,
  wrapStrongEm,
  type LinkInsertOptions,
} from "@/lib/admin/postEditor";
import { business } from "@/lib/site/config";

export type PageToolbarButton = {
  label: string;
  variant?: "default" | "purple" | "pink" | "red" | "orange" | "teal" | "green";
  action: (textarea: HTMLTextAreaElement) => string;
};

export function buildPagePermalinkUrl(slug: string): string {
  const domain = business.domain.replace(/\/$/, "");
  const path = slug.trim() || "sample-page";
  return `${domain}/${path}/`;
}

export function insertShortcode(
  textarea: HTMLTextAreaElement,
  shortcode: string,
): string {
  const tag = shortcode.replace(/\s+/g, "_").toLowerCase();
  return insertAtCursor(textarea, `[${tag}]`);
}

export function insertMoreTag(textarea: HTMLTextAreaElement): string {
  return insertAtCursor(textarea, "<!--more-->");
}

export function insertCloseTags(textarea: HTMLTextAreaElement): string {
  return insertAtCursor(textarea, "</p>");
}

export function insertImageTag(textarea: HTMLTextAreaElement): string {
  return insertAtCursor(
    textarea,
    '<img src="" alt="" />',
    '<img src="'.length,
  );
}

export const PAGE_EDITOR_MEDIA_ACTIONS = [
  { label: "Add Media", icon: "media" as const },
  { label: "Add Gallery", icon: "gallery" as const },
  { label: "Add Form", icon: "form" as const },
];

export const PAGE_EDITOR_HTML_BUTTONS: PageToolbarButton[] = [
  { label: "H1", action: (textarea) => wrapSelection(textarea, "h1") },
  { label: "H2", action: (textarea) => wrapSelection(textarea, "h2") },
  { label: "H2 w/ ID", action: (textarea) => insertH2WithId(textarea) },
  { label: "H3", action: (textarea) => wrapSelection(textarea, "h3") },
  { label: "H4", action: (textarea) => wrapSelection(textarea, "h4") },
  { label: "p", action: (textarea) => wrapSelection(textarea, "p") },
  { label: "HR", action: (textarea) => insertHr(textarea) },
  { label: "Short HR", action: (textarea) => insertShortHr(textarea) },
  { label: "b", action: (textarea) => wrapSelection(textarea, "strong") },
  { label: "u", action: (textarea) => wrapSelection(textarea, "u") },
  { label: "i", action: (textarea) => wrapSelection(textarea, "em") },
  { label: "b > i", action: (textarea) => wrapStrongEm(textarea) },
  { label: "b-quote", action: (textarea) => wrapSelection(textarea, "blockquote") },
  { label: "EN-Dash", action: (textarea) => insertAtCursor(textarea, "&ndash;") },
  { label: "EM-Dash", action: (textarea) => insertAtCursor(textarea, "&mdash;") },
  { label: "del", action: (textarea) => wrapSelection(textarea, "del") },
  { label: "ins", action: (textarea) => wrapSelection(textarea, "ins") },
  { label: "img", action: (textarea) => insertImageTag(textarea) },
  { label: "ul ✓", action: (textarea) => wrapSelection(textarea, "ul") },
  { label: "ul X", action: (textarea) => insertAtCursor(textarea, '<ul class="no-check">') },
  { label: "ol", action: (textarea) => wrapSelection(textarea, "ol") },
  { label: "li", action: (textarea) => wrapSelection(textarea, "li") },
  { label: "code", action: (textarea) => wrapSelection(textarea, "code") },
  { label: "more", action: (textarea) => insertMoreTag(textarea) },
  { label: "close tags", action: (textarea) => insertCloseTags(textarea) },
];

export const PAGE_EDITOR_SHORTCODE_BUTTONS: PageToolbarButton[] = [
  { label: "2x1 Grid", action: (ta) => insertShortcode(ta, "2x1 Grid") },
  { label: "2x1 Image Card Grid", action: (ta) => insertShortcode(ta, "2x1 Image Card Grid") },
  { label: "3x1 Image Card Grid", action: (ta) => insertShortcode(ta, "3x1 Image Card Grid") },
  {
    label: "3x1 Image Card w/ Icon Grid",
    action: (ta) => insertShortcode(ta, "3x1 Image Card w/ Icon Grid"),
  },
  {
    label: "3x1 Image Card w/ Ribbon",
    action: (ta) => insertShortcode(ta, "3x1 Image Card w/ Ribbon"),
  },
  {
    label: "3x1 Mini CTA w/ Ribbon",
    action: (ta) => insertShortcode(ta, "3x1 Mini CTA w/ Ribbon"),
  },
  {
    label: "3x1 Mini Icon CTA Grid",
    action: (ta) => insertShortcode(ta, "3x1 Mini Icon CTA Grid"),
  },
  { label: "Accordion", action: (ta) => insertShortcode(ta, "Accordion") },
  { label: "Auto BR Fix", action: (ta) => insertShortcode(ta, "Auto BR Fix") },
  {
    label: "Auto Quicks Link ID",
    action: (ta) => insertShortcode(ta, "Auto Quicks Link ID"),
  },
  { label: "Badge CTA", action: (ta) => insertShortcode(ta, "Badge CTA") },
  {
    label: "Badge CTA (no image)",
    action: (ta) => insertShortcode(ta, "Badge CTA (no image)"),
  },
  {
    label: "Before After Slider",
    action: (ta) => insertShortcode(ta, "Before After Slider"),
  },
  { label: "CTA", action: (ta) => insertShortcode(ta, "CTA") },
  { label: "CTA Button", variant: "green", action: (ta) => insertShortcode(ta, "CTA Button") },
  { label: "FAQs", variant: "orange", action: (ta) => insertShortcode(ta, "FAQs") },
  { label: "Highlight Box", action: (ta) => insertShortcode(ta, "Highlight Box") },
  {
    label: "Horizontal Image Card",
    action: (ta) => insertShortcode(ta, "Horizontal Image Card"),
  },
  { label: "Icon Box Alt", action: (ta) => insertShortcode(ta, "Icon Box Alt") },
  { label: "Icon Box Alt 2", action: (ta) => insertShortcode(ta, "Icon Box Alt 2") },
  { label: "Icon CTA Box", action: (ta) => insertShortcode(ta, "Icon CTA Box") },
  { label: "Image Card", action: (ta) => insertShortcode(ta, "Image Card") },
  { label: "Image Card Left", action: (ta) => insertShortcode(ta, "Image Card Left") },
  { label: "Image Card Right", action: (ta) => insertShortcode(ta, "Image Card Right") },
  { label: "Image Highlights", action: (ta) => insertShortcode(ta, "Image Highlights") },
  { label: "Map", action: (ta) => insertShortcode(ta, "Map") },
  { label: "Quick Links", variant: "red", action: (ta) => insertShortcode(ta, "Quick Links") },
  {
    label: "Related Posts",
    variant: "purple",
    action: (ta) => insertShortcode(ta, "Related Posts"),
  },
  { label: "Reviews", variant: "pink", action: (ta) => insertShortcode(ta, "Reviews") },
  {
    label: "Scrolling Gallery",
    variant: "orange",
    action: (ta) => insertShortcode(ta, "Scrolling Gallery"),
  },
  { label: "Site Button", variant: "teal", action: (ta) => insertShortcode(ta, "Site Button") },
  { label: "Staff", variant: "green", action: (ta) => insertShortcode(ta, "Staff") },
  {
    label: "Tabbed Content",
    variant: "purple",
    action: (ta) => insertShortcode(ta, "Tabbed Content"),
  },
  {
    label: "Tagged Posts",
    variant: "orange",
    action: (ta) => insertShortcode(ta, "Tagged Posts"),
  },
  { label: "Tel", variant: "red", action: (ta) => insertShortcode(ta, "Tel") },
];

export type { LinkInsertOptions };
