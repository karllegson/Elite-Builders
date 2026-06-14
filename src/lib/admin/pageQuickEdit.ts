import type { FlatPageRow, PageStatus } from "@/lib/admin/pagesList";

export type PageQuickEditTab = "page" | "menu";

export type PageQuickEditValues = {
  title: string;
  slug: string;
  month: string;
  day: string;
  year: string;
  hour: string;
  minute: string;
  author: string;
  status: PageStatus;
  template: string;
  password: string;
  isPrivate: boolean;
  allowComments: boolean;
  hideInNestedPages: boolean;
  navigationLabel: string;
  titleAttribute: string;
  cssClasses: string;
  customUrl: string;
  hideInNavMenu: boolean;
  openInNewTab: boolean;
};

export const PAGE_QUICK_EDIT_AUTHORS = [
  {
    value: "kori-switzer",
    label: "Kori Switzer - Director of Design & Development",
  },
  { value: "admin", label: "Site Administrator" },
];

export const PAGE_QUICK_EDIT_TEMPLATES = [
  { value: "default", label: "Default Template" },
  { value: "full-width", label: "Full Width" },
  { value: "landing", label: "Landing Page" },
];

export const PAGE_QUICK_EDIT_MONTHS = [
  { value: "01", label: "01-Jan" },
  { value: "02", label: "02-Feb" },
  { value: "03", label: "03-Mar" },
  { value: "04", label: "04-Apr" },
  { value: "05", label: "05-May" },
  { value: "06", label: "06-Jun" },
  { value: "07", label: "07-Jul" },
  { value: "08", label: "08-Aug" },
  { value: "09", label: "09-Sep" },
  { value: "10", label: "10-Oct" },
  { value: "11", label: "11-Nov" },
  { value: "12", label: "12-Dec" },
];

export const PAGE_QUICK_EDIT_STATUSES: { value: PageStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const QUICK_EDIT_NUMERIC_IDS: Record<string, number> = {
  resources: 1297,
};

export function slugifyPageTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getPageQuickEditNumericId(pageId: string): number {
  if (QUICK_EDIT_NUMERIC_IDS[pageId]) {
    return QUICK_EDIT_NUMERIC_IDS[pageId];
  }

  let hash = 1000;

  for (const char of pageId) {
    hash += char.charCodeAt(0);
  }

  return hash;
}

export function getDefaultQuickEditValues(row: FlatPageRow): PageQuickEditValues {
  return {
    title: row.title,
    slug: slugifyPageTitle(row.title),
    month: "11",
    day: "07",
    year: "2024",
    hour: "04",
    minute: "33",
    author: PAGE_QUICK_EDIT_AUTHORS[0].value,
    status: row.status,
    template: PAGE_QUICK_EDIT_TEMPLATES[0].value,
    password: "",
    isPrivate: false,
    allowComments: false,
    hideInNestedPages: false,
    navigationLabel: "",
    titleAttribute: "",
    cssClasses: "",
    customUrl: "",
    hideInNavMenu: false,
    openInNewTab: false,
  };
}
