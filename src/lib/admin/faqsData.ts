import { siteConfig } from "@/lib/admin/config";
import { slugify } from "@/lib/admin/postSeo";

import { homepageFaqs } from "@/lib/site/messaging";

export const FAQS_STORAGE_KEY = "elite-builders-faqs-v2";
export const DEFAULT_FAQ_AUTHOR = siteConfig.defaultUserRole;

export type FaqStatus = "published" | "draft";
export type FaqVisibility = "public" | "password" | "private";

export type FaqCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  createdAt: string;
};

export type FaqRecord = {
  id: string;
  numericId: number;
  title: string;
  slug: string;
  content: string;
  status: FaqStatus;
  categoryId: string | null;
  author: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  menuOrder: number;
  visibility: FaqVisibility;
  password: string;
};

function normalizeFaqRecord(faq: FaqRecord): FaqRecord {
  return {
    ...faq,
    menuOrder: faq.menuOrder ?? 0,
    visibility: faq.visibility ?? "public",
    password: faq.password ?? "",
  };
}

export type FaqsStore = {
  version: 1;
  categories: FaqCategory[];
  faqs: FaqRecord[];
};

export function createFaqCategoryId(): string {
  return `faq-cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugifyFaqCategoryName(name: string): string {
  return slugify(name);
}

function createDefaultStore(): FaqsStore {
  const categoryId = "faq-cat-general";
  const now = new Date().toISOString();

  const category: FaqCategory = {
    id: categoryId,
    name: "General",
    slug: "general",
    description: "Common questions about Elite Builders framing and construction services.",
    parentId: null,
    createdAt: now,
  };

  const faqs: FaqRecord[] = homepageFaqs.map((faq, index) => ({
    id: `faq-seed-${index + 1}`,
    numericId: 1000 + index,
    title: faq.question,
    slug: slugify(faq.question),
    content: faq.answer,
    status: "published" as const,
    categoryId,
    author: DEFAULT_FAQ_AUTHOR,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    menuOrder: index,
    visibility: "public",
    password: "",
  }));

  return {
    version: 1,
    categories: [category],
    faqs,
  };
}

export function readFaqsStore(): FaqsStore {
  if (typeof window === "undefined") {
    return createDefaultStore();
  }

  try {
    const raw = window.localStorage.getItem(FAQS_STORAGE_KEY);

    if (!raw) {
      const seeded = createDefaultStore();
      writeFaqsStore(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as FaqsStore;

    if (parsed.version !== 1 || !Array.isArray(parsed.categories) || !Array.isArray(parsed.faqs)) {
      return createDefaultStore();
    }

    return normalizeFaqsStore(parsed);
  } catch {
    return createDefaultStore();
  }
}

function normalizeFaqsStore(store: FaqsStore): FaqsStore {
  return {
    ...store,
    faqs: store.faqs.map((faq) => normalizeFaqRecord(faq as FaqRecord)),
  };
}

export function writeFaqsStore(store: FaqsStore): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FAQS_STORAGE_KEY, JSON.stringify(store));
}

export function countFaqsInCategory(categoryId: string, faqs: FaqRecord[]): number {
  return faqs.filter((faq) => faq.categoryId === categoryId).length;
}

export function listFaqCategories(): FaqCategory[] {
  return readFaqsStore().categories.sort((left, right) => left.name.localeCompare(right.name));
}

export function getFaqCategoryById(id: string): FaqCategory | null {
  return readFaqsStore().categories.find((category) => category.id === id) ?? null;
}

export function listFaqs(): FaqRecord[] {
  return readFaqsStore().faqs.sort(
    (left, right) =>
      new Date(right.publishedAt ?? right.updatedAt).getTime() -
      new Date(left.publishedAt ?? left.updatedAt).getTime(),
  );
}

export function getFaqById(id: string): FaqRecord | null {
  const faq = readFaqsStore().faqs.find((item) => item.id === id) ?? null;
  return faq ? normalizeFaqRecord(faq) : null;
}

export type CreateFaqCategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
};

export function createFaqCategory(input: CreateFaqCategoryInput): FaqCategory {
  const store = readFaqsStore();
  const trimmedName = input.name.trim();

  const category: FaqCategory = {
    id: createFaqCategoryId(),
    name: trimmedName,
    slug: input.slug?.trim() || slugifyFaqCategoryName(trimmedName),
    description: input.description?.trim() ?? "",
    parentId: input.parentId ?? null,
    createdAt: new Date().toISOString(),
  };

  store.categories.push(category);
  writeFaqsStore(store);
  return category;
}

export function deleteFaqCategories(ids: string[]): void {
  const store = readFaqsStore();
  const idSet = new Set(ids);

  store.categories = store.categories.filter((category) => !idSet.has(category.id));
  store.faqs = store.faqs.map((faq) =>
    faq.categoryId && idSet.has(faq.categoryId) ? { ...faq, categoryId: null } : faq,
  );

  writeFaqsStore(store);
}

export function updateFaqCategory(
  id: string,
  input: CreateFaqCategoryInput,
): FaqCategory | null {
  const store = readFaqsStore();
  const index = store.categories.findIndex((category) => category.id === id);

  if (index === -1) {
    return null;
  }

  const trimmedName = input.name.trim();
  const existing = store.categories[index];

  const updated: FaqCategory = {
    ...existing,
    name: trimmedName,
    slug: input.slug?.trim() || slugifyFaqCategoryName(trimmedName),
    description: input.description?.trim() ?? "",
    parentId: input.parentId ?? null,
  };

  store.categories[index] = updated;
  writeFaqsStore(store);
  return updated;
}

export function deleteFaqs(ids: string[]): void {
  const store = readFaqsStore();
  const idSet = new Set(ids);
  store.faqs = store.faqs.filter((faq) => !idSet.has(faq.id));
  writeFaqsStore(store);
}

function nextFaqNumericId(faqs: FaqRecord[]): number {
  const highest = faqs.reduce((max, faq) => Math.max(max, faq.numericId), 8800);
  return highest + 1;
}

export function createFaqId(): string {
  return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type UpsertFaqInput = {
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  status?: FaqStatus;
  categoryId?: string | null;
  publishedAt?: string | null;
  menuOrder?: number;
  visibility?: FaqVisibility;
  password?: string;
};

export function upsertFaq(input: UpsertFaqInput): FaqRecord {
  const store = readFaqsStore();
  const now = new Date().toISOString();
  const trimmedTitle = input.title.trim();
  const slug = input.slug?.trim() || slugify(trimmedTitle);
  const id = input.id ?? createFaqId();
  const existingIndex = store.faqs.findIndex((faq) => faq.id === id);
  const existing = existingIndex >= 0 ? store.faqs[existingIndex] : null;
  const status = input.status ?? existing?.status ?? "draft";
  const isPublished = status === "published";

  const record: FaqRecord = {
    id,
    numericId: existing?.numericId ?? nextFaqNumericId(store.faqs),
    title: trimmedTitle,
    slug,
    content: input.content ?? existing?.content ?? "",
    status,
    categoryId:
      input.categoryId !== undefined ? input.categoryId : (existing?.categoryId ?? null),
    author: existing?.author ?? DEFAULT_FAQ_AUTHOR,
    publishedAt:
      input.publishedAt !== undefined
        ? input.publishedAt
        : isPublished
          ? (existing?.publishedAt ?? now)
          : (existing?.publishedAt ?? null),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    menuOrder: input.menuOrder ?? existing?.menuOrder ?? 0,
    visibility: input.visibility ?? existing?.visibility ?? "public",
    password: input.password ?? existing?.password ?? "",
  };

  if (existingIndex >= 0) {
    store.faqs[existingIndex] = record;
  } else {
    store.faqs.push(record);
  }

  writeFaqsStore(store);
  return record;
}
