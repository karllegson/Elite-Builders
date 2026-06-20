"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  createCategoryAction,
  deleteCategoriesAction,
  fetchCategoriesWithCountsAction,
} from "@/app/admin/(shell)/posts/actions";
import {
  buildCategoryParentOptions,
  CATEGORY_BULK_ACTIONS,
  filterCategories,
  slugifyCategoryName,
  sortCategories,
  type CategoryListItem,
  type CategorySortDirection,
  type CategorySortKey,
} from "@/lib/admin/categoriesList";

type SortableHeaderProps = {
  label: string;
  sortKey: CategorySortKey;
  activeSortKey: CategorySortKey;
  sortDirection: CategorySortDirection;
  onSort: (key: CategorySortKey) => void;
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

function CategoriesTablenav({
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
        <label className="screen-reader-text" htmlFor={`category-bulk-${showSearch ? "top" : "bottom"}`}>
          Select bulk action
        </label>
        <select
          id={`category-bulk-${showSearch ? "top" : "bottom"}`}
          className="admin-categories-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {CATEGORY_BULK_ACTIONS.map((action) => (
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
          <label className="screen-reader-text" htmlFor="category-search">
            Search Categories
          </label>
          <input
            id="category-search"
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

export function CategoriesManager() {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<CategorySortKey>("name");
  const [sortDirection, setSortDirection] = useState<CategorySortDirection>("asc");
  const toast = useAdminToast();

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    const items = await fetchCategoriesWithCountsAction();
    setCategories(
      items.map((category) => ({
        id: category.id,
        name: category.name,
        parentId: category.parentId,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        postCount: category.postCount,
      })),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const parentOptions = useMemo(
    () => buildCategoryParentOptions(categories),
    [categories],
  );

  const filteredCategories = useMemo(
    () => filterCategories(categories, searchQuery),
    [categories, searchQuery],
  );

  const visibleCategories = useMemo(
    () => sortCategories(filteredCategories, sortKey, sortDirection),
    [filteredCategories, sortDirection, sortKey],
  );

  const allVisibleSelected =
    visibleCategories.length > 0 &&
    visibleCategories.every((category) => selectedIds.has(category.id));

  const handleNameChange = (value: string) => {
    setName(value);

    if (!slugTouched) {
      setSlug(slugifyCategoryName(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const handleAddCategory = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const result = await createCategoryAction({
      name: trimmedName,
      slug,
      description,
      parentId: parentId || null,
      icon,
    });

    if (result.error || !result.category) {
      toast.error(result.error ?? "Could not create category.");
      return;
    }

    await loadCategories();
    setName("");
    setSlug("");
    setSlugTouched(false);
    setParentId("");
    setDescription("");
    setIcon(null);
    toast.success(`Category "${result.category.name}" added.`);
  };

  const handleSort = (key: CategorySortKey) => {
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
      setSelectedIds((current) => {
        const next = new Set(current);
        for (const category of visibleCategories) {
          next.delete(category.id);
        }
        return next;
      });
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      for (const category of visibleCategories) {
        next.add(category.id);
      }
      return next;
    });
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
      const result = await deleteCategoriesAction(Array.from(selectedIds));

      if (result.error) {
        toast.error(result.error);
      } else {
        setSelectedIds(new Set());
        toast.success("Selected categories deleted.");
        await loadCategories();
      }
    }

    setBulkAction("");
  };

  if (isLoading) {
    return <p className="admin-post-editor-loading">Loading categories…</p>;
  }

  return (
    <div className="admin-categories-page">

      <div className="admin-categories-layout">
        <section className="admin-categories-form-panel">
          <h2 className="admin-categories-form-title">Add Category</h2>
          <form className="admin-categories-form" onSubmit={handleAddCategory}>
            <div className="admin-categories-field">
              <label htmlFor="category-name">Name</label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
              />
              <p className="admin-categories-help">
                The name is how it appears on your site.
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="category-slug">Slug</label>
              <input
                id="category-slug"
                type="text"
                value={slug}
                onChange={(event) => handleSlugChange(event.target.value)}
              />
              <p className="admin-categories-help">
                The &ldquo;slug&rdquo; is the URL-friendly version of the name. It is
                usually all lowercase and contains only letters, numbers, and
                hyphens.
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="category-parent">Parent Category</label>
              <select
                id="category-parent"
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
                Categories, unlike tags, can have a hierarchy. You might have a
                Jazz category, and under that have children categories for Bebop
                and Big Band. Totally optional.
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="category-description">Description</label>
              <textarea
                id="category-description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <p className="admin-categories-help">
                The description is not prominent by default; however, some
                themes may show it.
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="category-icon">Icon</label>
              <div className="admin-categories-icon-picker">
                <button
                  type="button"
                  className="admin-categories-icon-clear"
                  aria-label="Clear icon"
                  onClick={() => setIcon(null)}
                >
                  <X size={14} aria-hidden />
                </button>
                {icon ? (
                  <span className="admin-categories-icon-value">{icon}</span>
                ) : null}
              </div>
              <p className="admin-categories-help">
                <button type="button" className="admin-inline-link">
                  Choose your category icon from Font Awesome Icons.
                </button>
              </p>
            </div>

            <button type="submit" className="admin-btn-primary admin-categories-submit">
              Add Category
            </button>
          </form>
        </section>

        <section className="admin-categories-table-panel">
          <CategoriesTablenav
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
                  <th scope="col" className="admin-categories-col-icon">
                    Icon
                  </th>
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
                    <td colSpan={6} className="admin-categories-empty">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  visibleCategories.map((category) => (
                    <tr key={category.id}>
                      <th scope="row" className="admin-categories-col-check">
                        <input
                          type="checkbox"
                          aria-label={`Select ${category.name}`}
                          checked={selectedIds.has(category.id)}
                          onChange={() => toggleSelect(category.id)}
                        />
                      </th>
                      <td className="admin-categories-col-icon">
                        {category.icon ? (
                          <span className="admin-categories-icon-display">
                            {category.icon}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="admin-categories-col-name">
                        <button type="button" className="admin-categories-name-link">
                          {category.name}
                        </button>
                      </td>
                      <td className="admin-categories-col-description">
                        {category.description || "—"}
                      </td>
                      <td className="admin-categories-col-slug">{category.slug}</td>
                      <td className="admin-categories-col-count">
                        <button type="button" className="admin-categories-count-link">
                          {category.postCount}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <CategoriesTablenav
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
