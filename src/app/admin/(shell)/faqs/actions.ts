"use server";

import { isAuthBypassEnabled } from "@/lib/admin/auth";
import type { CreateFaqCategoryInput, UpsertFaqInput } from "@/lib/admin/faqsData";
import {
  createFaqCategory,
  deleteFaqCategories,
  deleteFaqs,
  getFaqById,
  getFaqCategoryById,
  listFaqCategories,
  listFaqs,
  listPublishedPublicFaqsForCategoryRef,
  updateFaqCategory,
  upsertFaq,
} from "@/lib/admin/faqs.server";
import { countFaqsInCategory } from "@/lib/admin/faqsData";
import { createClient } from "@/lib/supabase/server";

async function assertAdminAuth(): Promise<void> {
  if (isAuthBypassEnabled()) {
    return;
  }

  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Unauthorized");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }
}

export async function fetchFaqCategoriesWithCountsAction(): Promise<{
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    createdAt: string;
    faqCount: number;
  }>;
  error?: string;
}> {
  try {
    await assertAdminAuth();

    const [categories, faqs] = await Promise.all([listFaqCategories(), listFaqs()]);

    return {
      categories: categories.map((category) => ({
        ...category,
        faqCount: countFaqsInCategory(category.id, faqs),
      })),
    };
  } catch (error) {
    return {
      categories: [],
      error: error instanceof Error ? error.message : "Could not load FAQ categories.",
    };
  }
}

export async function fetchFaqCategoriesAction() {
  try {
    await assertAdminAuth();
    return { categories: await listFaqCategories() };
  } catch (error) {
    return {
      categories: [],
      error: error instanceof Error ? error.message : "Could not load FAQ categories.",
    };
  }
}

export async function createFaqCategoryAction(input: CreateFaqCategoryInput) {
  try {
    await assertAdminAuth();
    const category = await createFaqCategory(input);
    return { category };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create category.",
    };
  }
}

export async function updateFaqCategoryAction(id: string, input: CreateFaqCategoryInput) {
  try {
    await assertAdminAuth();
    const category = await updateFaqCategory(id, input);

    if (!category) {
      return { error: "Category not found." };
    }

    return { category };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not update category.",
    };
  }
}

export async function deleteFaqCategoriesAction(ids: string[]) {
  try {
    await assertAdminAuth();
    const deleted = await deleteFaqCategories(ids);
    return { deleted };
  } catch (error) {
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : "Could not delete categories.",
    };
  }
}

export async function fetchFaqsForAdminAction() {
  try {
    await assertAdminAuth();

    const [faqs, categories] = await Promise.all([listFaqs(), listFaqCategories()]);

    return { faqs, categories };
  } catch (error) {
    return {
      faqs: [],
      categories: [],
      error: error instanceof Error ? error.message : "Could not load FAQs.",
    };
  }
}

export async function fetchFaqForEditAction(faqId: string) {
  try {
    await assertAdminAuth();
    const faq = await getFaqById(faqId);
    return { faq };
  } catch (error) {
    return {
      faq: null,
      error: error instanceof Error ? error.message : "Could not load FAQ.",
    };
  }
}

export async function saveFaqAction(input: UpsertFaqInput) {
  try {
    await assertAdminAuth();
    const faq = await upsertFaq(input);
    return { faq };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save FAQ.",
    };
  }
}

export async function deleteFaqsAction(ids: string[]) {
  try {
    await assertAdminAuth();
    const deleted = await deleteFaqs(ids);
    return { deleted };
  } catch (error) {
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : "Could not delete FAQs.",
    };
  }
}

export async function fetchFaqCategoryByIdAction(id: string) {
  try {
    await assertAdminAuth();
    const category = await getFaqCategoryById(id);
    return { category };
  } catch (error) {
    return {
      category: null,
      error: error instanceof Error ? error.message : "Could not load category.",
    };
  }
}

export async function fetchPublishedFaqsForCategoryRefAction(categoryRef: string) {
  try {
    const items = await listPublishedPublicFaqsForCategoryRef(categoryRef);
    return { items };
  } catch {
    return { items: [] };
  }
}
