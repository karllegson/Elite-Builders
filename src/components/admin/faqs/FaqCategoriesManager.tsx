"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import {
  createFaqCategoryAction,
  deleteFaqCategoriesAction,
  fetchFaqCategoriesWithCountsAction,
  updateFaqCategoryAction,
} from "@/app/admin/(shell)/faqs/actions";
import {
  buildFaqCategoryParentOptions,
  FAQ_CATEGORY_BULK_ACTIONS,
  filterFaqCategories,
  slugifyFaqCategoryName,
  sortFaqCategories,
  type FaqCategoryListItem,
  type FaqCategorySortDirection,
  type FaqCategorySortKey,
} from "@/lib/admin/faqCategoriesList";
import type { FaqCategory } from "@/lib/admin/faqsData";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";

type SortableHeaderProps = {
  label: string;
  sortKey: FaqCategorySortKey;
  activeSortKey: FaqCategorySortKey;
  sortDirection: FaqCategorySortDirection;
  onSort: (key: FaqCategorySortKey) => void;
  className?: string;
};

function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  sortDirection,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = activeSortKey === sortKey;

  return (
    <th scope="col" className={className}>
      <button
        type="button"
        className={`admin-categories-sort${isActive ? " is-active" : ""}`}
        onClick={() => onSort(sortKey)}
      >
        <span>{label}</span>
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp size={12} aria-hidden />
          ) : (
            <ArrowDown size={12} aria-hidden />
          )
        ) : (
          <span className="admin-categories-sort-idle" aria-hidden>
            ↕
          </span>
        )}
      </button>
    </th>
  );
}

type CategoriesTablenavProps = {
  bulkAction: string;
  onBulkActionChange: (value: string) => void;
  onApplyBulkAction: () => void;
  totalItems: number;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  showSearch?: boolean;
};

function FaqCategoriesTablenav({
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
  totalItems,
  searchInput,
  onSearchInputChange,
  onSearch,
  showSearch = false,
}: CategoriesTablenavProps) {
  return (
    <div className="admin-categories-tablenav">
      <div className="admin-categories-tablenav-actions">
        <label className="screen-reader-text" htmlFor={`faq-category-bulk-${showSearch ? "top" : "bottom"}`}>
          Select bulk action
        </label>
        <select
          id={`faq-category-bulk-${showSearch ? "top" : "bottom"}`}
          className="admin-categories-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {FAQ_CATEGORY_BULK_ACTIONS.map((action) => (
            <option key={action.value || "default"} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="admin-btn-secondary admin-categories-apply-btn"
          onClick={onApplyBulkAction}
        >
          Apply
        </button>
      </div>

      {showSearch ? (
        <div className="admin-categories-search-wrap admin-categories-search-wrap-end">
          <label className="screen-reader-text" htmlFor="faq-category-search">
            Search Categories
          </label>
          <input
            id="faq-category-search"
            type="search"
            className="admin-categories-search-input"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearch();
              }
            }}
          />
          <button type="button" className="admin-btn-secondary" onClick={onSearch}>
            Search Categories
          </button>
        </div>
      ) : (
        <div className="admin-categories-item-count admin-categories-item-count-end">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </div>
      )}
    </div>
  );
}

export function FaqCategoriesManager() {
  const toast = useAdminToast();
  const [, startTransition] = useTransition();
  const [categories, setCategories] = useState<FaqCategoryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<FaqCategorySortKey>("name");
  const [sortDirection, setSortDirection] = useState<FaqCategorySortDirection>("asc");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const loadCategories = useCallback(() => {
    startTransition(async () => {
      setIsLoading(true);
      const result = await fetchFaqCategoriesWithCountsAction();

      if (result.error) {
        toast.error(result.error);
        setCategories([]);
      } else {
        setCategories(result.categories);
      }

      setIsLoading(false);
    });
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const parentOptions = useMemo(() => {
    const options = buildFaqCategoryParentOptions(categories);
    if (!editingCategoryId) {
      return options;
    }

    return options.filter((option) => option.id !== editingCategoryId);
  }, [categories, editingCategoryId]);

  const filteredCategories = useMemo(
    () => filterFaqCategories(categories, searchQuery),
    [categories, searchQuery],
  );

  const visibleCategories = useMemo(
    () => sortFaqCategories(filteredCategories, sortKey, sortDirection),
    [filteredCategories, sortDirection, sortKey],
  );

  const allVisibleSelected =
    visibleCategories.length > 0 &&
    visibleCategories.every((category) => selectedIds.has(category.id));

  const handleNameChange = (value: string) => {
    setName(value);

    if (!slugTouched) {
      setSlug(slugifyFaqCategoryName(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const resetCategoryForm = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setParentId("");
    setDescription("");
    setEditingCategoryId(null);
  };

  const handleAddCategory = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    setIsSaving(true);

    const payload = {
      name: trimmedName,
      slug,
      description,
      parentId: parentId || null,
    };

    const result = editingCategoryId
      ? await updateFaqCategoryAction(editingCategoryId, payload)
      : await createFaqCategoryAction(payload);

    setIsSaving(false);

    if (result.error || !result.category) {
      toast.error(result.error ?? "Could not save category.");
      return;
    }

    loadCategories();
    toast.success(
      editingCategoryId
        ? `Category "${result.category.name}" updated.`
        : `Category "${result.category.name}" added.`,
    );
    resetCategoryForm();
  };

  const handleEditCategory = (category: FaqCategory) => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setSlugTouched(true);
    setParentId(category.parentId ?? "");
    setDescription(category.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteCategory = async (category: FaqCategory) => {
    if (!window.confirm(`Delete "${category.name}"? FAQs in this category will be uncategorized.`)) {
      return;
    }

    const result = await deleteFaqCategoriesAction([category.id]);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    loadCategories();

    if (editingCategoryId === category.id) {
      resetCategoryForm();
    }

    toast.success(`Category "${category.name}" deleted.`);
  };

  const handleSort = (key: FaqCategorySortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(visibleCategories.map((category) => category.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction) {
      return;
    }

    if (selectedIds.size === 0) {
      toast.info("Select at least one category.");
      return;
    }

    if (bulkAction === "delete") {
      const result = await deleteFaqCategoriesAction([...selectedIds]);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      loadCategories();
      setSelectedIds(new Set());
      toast.info("Selected categories deleted.");
    }

    setBulkAction("");
  };

  if (isLoading) {
    return <p className="admin-faqs-loading">Loading categories…</p>;
  }

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-layout">
        <section className="admin-categories-form-panel">
          <h2 className="admin-categories-form-title">
            {editingCategoryId ? "Edit Category" : "Add New Category"}
          </h2>
          <form className="admin-categories-form" onSubmit={handleAddCategory}>
            <div className="admin-categories-field">
              <label htmlFor="faq-category-name">Name</label>
              <input
                id="faq-category-name"
                type="text"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
              />
              <p className="admin-categories-help">
                The name is how it appears on your site.
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="faq-category-slug">Slug</label>
              <input
                id="faq-category-slug"
                type="text"
                value={slug}
                onChange={(event) => handleSlugChange(event.target.value)}
              />
              <p className="admin-categories-help">
                Match this slug to the <code>[faqs category=&quot;…&quot;]</code> shortcode in blog
                or service area content (e.g.{" "}
                <code>common-questions-about-replacement-windows-tri-state-area</code>).
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="faq-category-parent">Parent Category</label>
              <select
                id="faq-category-parent"
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
              >
                <option value="">None</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="admin-categories-help">
                Assign a parent term to create a hierarchy.
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="faq-category-description">Description</label>
              <textarea
                id="faq-category-description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <p className="admin-categories-help">
                Optional description for admin reference.
              </p>
            </div>

            <button
              type="submit"
              className="admin-btn-primary admin-categories-submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving…"
                : editingCategoryId
                  ? "Update Category"
                  : "Add New Category"}
            </button>
            {editingCategoryId ? (
              <button
                type="button"
                className="admin-btn-secondary admin-categories-cancel-edit"
                onClick={resetCategoryForm}
              >
                Cancel
              </button>
            ) : null}
          </form>
        </section>

        <section className="admin-categories-table-panel">
          <FaqCategoriesTablenav
            showSearch
            bulkAction={bulkAction}
            onBulkActionChange={setBulkAction}
            onApplyBulkAction={handleApplyBulkAction}
            totalItems={visibleCategories.length}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearch={handleSearch}
          />

          <div className="admin-categories-item-count admin-categories-item-count-above-table">
            {visibleCategories.length}{" "}
            {visibleCategories.length === 1 ? "item" : "items"}
          </div>

          <div className="admin-categories-table-wrap">
            <table className="admin-categories-table">
              <thead>
                <tr>
                  <td className="admin-categories-col-check">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                    />
                  </td>
                  <SortableHeader
                    label="Name"
                    sortKey="name"
                    activeSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="admin-categories-col-name"
                  />
                  <SortableHeader
                    label="Description"
                    sortKey="description"
                    activeSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="admin-categories-col-description"
                  />
                  <SortableHeader
                    label="Slug"
                    sortKey="slug"
                    activeSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="admin-categories-col-slug"
                  />
                  <SortableHeader
                    label="Count"
                    sortKey="count"
                    activeSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="admin-categories-col-count"
                  />
                </tr>
              </thead>
              <tbody>
                {visibleCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-categories-empty">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  visibleCategories.map((category) => (
                    <tr key={category.id} className="admin-categories-data-row">
                      <th scope="row" className="admin-categories-col-check">
                        <input
                          type="checkbox"
                          aria-label={`Select ${category.name}`}
                          checked={selectedIds.has(category.id)}
                          onChange={() => toggleSelect(category.id)}
                        />
                      </th>
                      <td className="admin-categories-col-name">
                        <strong>
                          <span className="admin-categories-name-text">{category.name}</span>
                        </strong>
                        <div className="admin-categories-row-actions">
                          <button
                            type="button"
                            className="admin-categories-row-action"
                            onClick={() => handleEditCategory(category)}
                          >
                            Edit
                          </button>
                          <span className="admin-categories-row-action-sep" aria-hidden>
                            |
                          </span>
                          <button
                            type="button"
                            className="admin-categories-row-action admin-categories-row-action-delete"
                            onClick={() => void handleDeleteCategory(category)}
                          >
                            Delete
                          </button>
                          <span className="admin-categories-row-action-sep" aria-hidden>
                            |
                          </span>
                          <Link
                            href={`/admin/faqs?category=${category.id}`}
                            className="admin-categories-row-action"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                      <td className="admin-categories-col-description">
                        {category.description || "—"}
                      </td>
                      <td className="admin-categories-col-slug">{category.slug}</td>
                      <td className="admin-categories-col-count">
                        {category.faqCount > 0 ? (
                          <Link
                            href={`/admin/faqs?category=${category.id}`}
                            className="admin-categories-count-link"
                          >
                            {category.faqCount}
                          </Link>
                        ) : (
                          <span className="admin-categories-count-empty">0</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <FaqCategoriesTablenav
            bulkAction={bulkAction}
            onBulkActionChange={setBulkAction}
            onApplyBulkAction={handleApplyBulkAction}
            totalItems={visibleCategories.length}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearch={handleSearch}
          />
        </section>
      </div>
    </div>
  );
}
