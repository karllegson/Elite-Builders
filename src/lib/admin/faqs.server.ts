import {
  createDefaultStore,
  createFaqCategoryId,
  createFaqId,
  DEFAULT_FAQ_AUTHOR,
  normalizeFaqsStore,
  slugifyFaqCategoryName,
  type CreateFaqCategoryInput,
  type FaqCategory,
  type FaqRecord,
  type FaqsStore,
  type UpsertFaqInput,
} from "@/lib/admin/faqsData";
import { readFaqsStoreFromDisk, writeFaqsStoreToDisk } from "@/lib/admin/faqsLocalData";
import {
  MISSING_FAQS_TABLE_MESSAGE,
  SUPABASE_REQUIRED_MESSAGE,
  canUseLocalFileStore,
} from "@/lib/admin/localFileStore";
import { slugify } from "@/lib/admin/postSeo";
import {
  findFaqCategoryByRefInStore,
  listPublishedFaqsForCategoryInStore,
  type PublicFaqItem,
} from "@/lib/site/faqsPublic";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

const FAQS_STORE_ROW_ID = "default";

function shouldUseLocalStore(): boolean {
  return !hasAdminClient() && canUseLocalFileStore();
}

function assertFaqsStorageConfigured(): void {
  if (!hasAdminClient() && !canUseLocalFileStore()) {
    throw new Error(SUPABASE_REQUIRED_MESSAGE);
  }
}

function isMissingFaqsStoreError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string };

  return (
    candidate.code === "PGRST205" ||
    Boolean(candidate.message?.includes("Could not find the table 'public.faqs_store'"))
  );
}

async function withFaqsStoreFallback<T>(
  supabaseFn: () => Promise<T>,
  localFn: () => Promise<T>,
): Promise<T> {
  assertFaqsStorageConfigured();

  if (shouldUseLocalStore()) {
    return localFn();
  }

  try {
    return await supabaseFn();
  } catch (error) {
    if (isMissingFaqsStoreError(error)) {
      throw new Error(MISSING_FAQS_TABLE_MESSAGE);
    }

    throw error;
  }
}

async function loadFaqsStoreFromSupabase(): Promise<FaqsStore> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("faqs_store")
    .select("payload")
    .eq("id", FAQS_STORE_ROW_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.payload || typeof data.payload !== "object") {
    return createDefaultStore();
  }

  return normalizeFaqsStore(data.payload as FaqsStore);
}

async function saveFaqsStoreToSupabase(store: FaqsStore): Promise<void> {
  const normalized = normalizeFaqsStore(store);
  const client = createAdminClient();
  const { error } = await client.from("faqs_store").upsert({
    id: FAQS_STORE_ROW_ID,
    version: normalized.version,
    payload: normalized,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

async function loadFaqsStoreFromDisk(): Promise<FaqsStore> {
  const store = await readFaqsStoreFromDisk();
  return normalizeFaqsStore(store);
}

async function withFaqsStore<T>(fn: (store: FaqsStore) => T | Promise<T>): Promise<T> {
  return withFaqsStoreFallback(
    async () => {
      const store = await loadFaqsStoreFromSupabase();
      const result = await fn(store);
      await saveFaqsStoreToSupabase(store);
      return result;
    },
    async () => {
      const store = await loadFaqsStoreFromDisk();
      const result = await fn(store);
      await writeFaqsStoreToDisk(store);
      return result;
    },
  );
}

async function withFaqsStoreRead<T>(fn: (store: FaqsStore) => T): Promise<T> {
  return withFaqsStoreFallback(
    async () => fn(await loadFaqsStoreFromSupabase()),
    async () => fn(await loadFaqsStoreFromDisk()),
  );
}

export async function loadFaqsStore(): Promise<FaqsStore> {
  return withFaqsStoreRead((store) => store);
}

function sanitizeCategorySlug(value: string, fallbackName: string): string {
  const trimmed = value.trim();
  return slugify(trimmed || fallbackName);
}

function assertUniqueCategorySlug(
  store: FaqsStore,
  slug: string,
  excludeId?: string,
): void {
  const duplicate = store.categories.find(
    (category) => category.slug === slug && category.id !== excludeId,
  );

  if (duplicate) {
    throw new Error(`Slug "${slug}" is already in use by category "${duplicate.name}".`);
  }
}

function nextFaqNumericId(faqs: FaqRecord[]): number {
  const highest = faqs.reduce((max, faq) => Math.max(max, faq.numericId), 8800);
  return highest + 1;
}

export async function listFaqCategories(): Promise<FaqCategory[]> {
  return withFaqsStoreRead((store) =>
    [...store.categories].sort((left, right) => left.name.localeCompare(right.name)),
  );
}

export async function getFaqCategoryById(id: string): Promise<FaqCategory | null> {
  return withFaqsStoreRead(
    (store) => store.categories.find((category) => category.id === id) ?? null,
  );
}

export async function createFaqCategory(input: CreateFaqCategoryInput): Promise<FaqCategory> {
  return withFaqsStore((store) => {
    const trimmedName = input.name.trim();

    if (!trimmedName) {
      throw new Error("Category name is required.");
    }

    const slug = sanitizeCategorySlug(
      input.slug?.trim() || slugifyFaqCategoryName(trimmedName),
      trimmedName,
    );

    assertUniqueCategorySlug(store, slug);

    const category: FaqCategory = {
      id: createFaqCategoryId(),
      name: trimmedName,
      slug,
      description: input.description?.trim() ?? "",
      parentId: input.parentId ?? null,
      createdAt: new Date().toISOString(),
    };

    store.categories.push(category);
    return category;
  });
}

export async function updateFaqCategory(
  id: string,
  input: CreateFaqCategoryInput,
): Promise<FaqCategory | null> {
  return withFaqsStore((store) => {
    const index = store.categories.findIndex((category) => category.id === id);

    if (index === -1) {
      return null;
    }

    const trimmedName = input.name.trim();

    if (!trimmedName) {
      throw new Error("Category name is required.");
    }

    const existing = store.categories[index];
    const slug = sanitizeCategorySlug(
      input.slug?.trim() || slugifyFaqCategoryName(trimmedName),
      trimmedName,
    );

    assertUniqueCategorySlug(store, slug, id);

    const updated: FaqCategory = {
      ...existing,
      name: trimmedName,
      slug,
      description: input.description?.trim() ?? "",
      parentId: input.parentId ?? null,
    };

    store.categories[index] = updated;
    return updated;
  });
}

export async function deleteFaqCategories(ids: string[]): Promise<number> {
  return withFaqsStore((store) => {
    const idSet = new Set(ids);
    const before = store.categories.length;

    store.categories = store.categories.filter((category) => !idSet.has(category.id));
    store.faqs = store.faqs.map((faq) =>
      faq.categoryId && idSet.has(faq.categoryId) ? { ...faq, categoryId: null } : faq,
    );

    return before - store.categories.length;
  });
}

export async function listFaqs(): Promise<FaqRecord[]> {
  return withFaqsStoreRead((store) =>
    [...store.faqs].sort(
      (left, right) =>
        new Date(right.publishedAt ?? right.updatedAt).getTime() -
        new Date(left.publishedAt ?? left.updatedAt).getTime(),
    ),
  );
}

export async function getFaqById(id: string): Promise<FaqRecord | null> {
  return withFaqsStoreRead((store) => store.faqs.find((item) => item.id === id) ?? null);
}

export async function upsertFaq(input: UpsertFaqInput): Promise<FaqRecord> {
  return withFaqsStore((store) => {
    const now = new Date().toISOString();
    const trimmedTitle = input.title.trim();

    if (!trimmedTitle) {
      throw new Error("Title is required.");
    }

    const slug = slugify(input.slug?.trim() || trimmedTitle);
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

    return record;
  });
}

export async function deleteFaqs(ids: string[]): Promise<number> {
  return withFaqsStore((store) => {
    const idSet = new Set(ids);
    const before = store.faqs.length;
    store.faqs = store.faqs.filter((faq) => !idSet.has(faq.id));
    return before - store.faqs.length;
  });
}

export async function findPublicFaqCategoryByRef(
  categoryRef: string,
): Promise<FaqCategory | null> {
  const store = await loadFaqsStore();
  return findFaqCategoryByRefInStore(categoryRef, store);
}

export async function listPublishedPublicFaqsForCategoryRef(
  categoryRef: string,
): Promise<PublicFaqItem[]> {
  const store = await loadFaqsStore();
  const category = findFaqCategoryByRefInStore(categoryRef, store);

  if (!category) {
    return [];
  }

  return listPublishedFaqsForCategoryInStore(category.id, store);
}

export async function listPublishedPublicFaqsForCategory(
  categoryId: string,
): Promise<PublicFaqItem[]> {
  const store = await loadFaqsStore();
  return listPublishedFaqsForCategoryInStore(categoryId, store);
}

export { createDefaultStore };
