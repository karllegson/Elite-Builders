"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildFaqCategoryEditorOptions } from "@/lib/admin/faqCategoriesList";

type FaqCategoriesMetaboxProps = {
  categoryId: string | null;
  onChange: (categoryId: string | null) => void;
};

export function FaqCategoriesMetabox({
  categoryId,
  onChange,
}: FaqCategoriesMetaboxProps) {
  const [ready, setReady] = useState(false);
  const [categoriesTab, setCategoriesTab] = useState<"all" | "most-used">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const handleFocus = () => setRefreshKey((current) => current + 1);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const visibleOptions = useMemo(() => {
    if (!ready) {
      return [];
    }

    return buildFaqCategoryEditorOptions(categoriesTab);
  }, [categoriesTab, ready, refreshKey]);

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
          {!ready ? (
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
