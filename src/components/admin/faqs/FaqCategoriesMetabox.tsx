"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { fetchFaqsForAdminAction } from "@/app/admin/(shell)/faqs/actions";
import { buildFaqCategoryEditorOptions } from "@/lib/admin/faqCategoriesList";
import type { FaqCategory, FaqRecord } from "@/lib/admin/faqsData";

type FaqCategoriesMetaboxProps = {
  categoryId: string | null;
  onChange: (categoryId: string | null) => void;
};

export function FaqCategoriesMetabox({
  categoryId,
  onChange,
}: FaqCategoriesMetaboxProps) {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [faqs, setFaqs] = useState<FaqRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesTab, setCategoriesTab] = useState<"all" | "most-used">("all");
  const [, startTransition] = useTransition();

  const loadCategories = useCallback(() => {
    startTransition(async () => {
      setIsLoading(true);
      const result = await fetchFaqsForAdminAction();
      setCategories(result.categories);
      setFaqs(result.faqs);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const handleFocus = () => {
      void loadCategories();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadCategories]);

  const visibleOptions = useMemo(
    () => buildFaqCategoryEditorOptions(categories, faqs, categoriesTab),
    [categories, categoriesTab, faqs],
  );

  const selectCategory = (nextId: string) => {
    onChange(categoryId === nextId ? null : nextId);
  };

  return (
    <div className="admin-metabox">
      <div className="admin-metabox-header">
        <span>Categories</span>
        <span className="admin-metabox-toggle" aria-hidden>
          ▲
        </span>
      </div>
      <div className="admin-metabox-body">
        <div className="admin-metabox-tabs">
          <button
            type="button"
            className={`admin-metabox-tab${categoriesTab === "all" ? " is-active" : ""}`}
            onClick={() => setCategoriesTab("all")}
          >
            All Categories
          </button>
          <button
            type="button"
            className={`admin-metabox-tab${categoriesTab === "most-used" ? " is-active" : ""}`}
            onClick={() => setCategoriesTab("most-used")}
          >
            Most Used
          </button>
        </div>

        <div className="admin-category-list" aria-label="FAQ categories">
          {isLoading ? (
            <p className="admin-category-empty">Loading categories…</p>
          ) : visibleOptions.length === 0 ? (
            <p className="admin-category-empty">
              No categories yet.{" "}
              <Link href="/admin/faqs/categories">Add a category</Link>.
            </p>
          ) : (
            visibleOptions.map((option) => (
              <label key={option.id} className="admin-category-item">
                <input
                  type="checkbox"
                  checked={categoryId === option.id}
                  onChange={() => selectCategory(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))
          )}
        </div>

        <Link href="/admin/faqs/categories" className="admin-inline-link admin-add-category">
          + Add New Category
        </Link>
      </div>
    </div>
  );
}
