"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  buildCategoryParentOptions,
  CATEGORY_BULK_ACTIONS,
  createCategoryListItem,
  filterCategories,
  slugifyCategoryName,
  sortCategories,
  type CategoryListItem,
  type CategorySortDirection,
  type CategorySortKey,
} from "@/lib/admin/categoriesList";
import { paginatePosts } from "@/lib/admin/postsList";

const PER_PAGE = 20;

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

type ReviewCategoriesTablenavProps = {
  bulkAction: string;
  onBulkActionChange: (value: string) => void;
  onApplyBulkAction: () => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  showSearch?: boolean;
  position: "top" | "bottom";
};

function ReviewCategoriesTablenav({
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  searchInput,
  onSearchInputChange,
  onSearch,
  showSearch = false,
  position,
}: ReviewCategoriesTablenavProps) {
  return (
    <div className={`admin-categories-tablenav admin-categories-tablenav-${position}`}>
      <div className="admin-categories-tablenav-actions">
        <label
          className="screen-reader-text"
          htmlFor={`review-category-bulk-${position}`}
        >
          Select bulk action
        </label>
        <select
          id={`review-category-bulk-${position}`}
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
          <label className="screen-reader-text" htmlFor="review-category-search">
            Search Categories
          </label>
          <input
            id="review-category-search"
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
        <div className="admin-categories-pagination">
          <span className="admin-categories-item-count">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
          <span className="admin-posts-pagination-links">
            <button
              type="button"
              className="admin-posts-page-btn"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(1)}
              aria-label="First page"
            >
              «
            </button>
            <button
              type="button"
              className="admin-posts-page-btn"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className="admin-posts-page-current">
              <span className="admin-posts-page-number">{currentPage}</span>
              <span className="admin-posts-page-of"> of </span>
              <span className="admin-posts-page-total">{totalPages}</span>
            </span>
            <button
              type="button"
              className="admin-posts-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
            >
              ›
            </button>
            <button
              type="button"
              className="admin-posts-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label="Last page"
            >
              »
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

export function ReviewCategoriesManager() {
  const toast = useAdminToast();
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [bulkAction, setBulkAction] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<CategorySortKey>("name");
  const [sortDirection, setSortDirection] = useState<CategorySortDirection>("asc");

  const parentOptions = useMemo(
    () => buildCategoryParentOptions(categories),
    [categories],
  );

  const filteredCategories = useMemo(
    () => filterCategories(categories, searchQuery),
    [categories, searchQuery],
  );

  const sortedCategories = useMemo(
    () => sortCategories(filteredCategories, sortKey, sortDirection),
    [filteredCategories, sortDirection, sortKey],
  );

  const pagination = useMemo(
    () => paginatePosts(sortedCategories, page, PER_PAGE),
    [page, sortedCategories],
  );

  const allVisibleSelected =
    pagination.items.length > 0 &&
    pagination.items.every((category) => selectedIds.has(category.id));

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

  const handleAddCategory = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const category = createCategoryListItem(trimmedName, parentId || null, {
      slug,
      description,
    });

    setCategories((current) => [...current, category]);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setParentId("");
    setDescription("");
    toast.success(`Category "${category.name}" added.`);
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
    setPage(1);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => {
        const next = new Set(current);
        for (const category of pagination.items) {
          next.delete(category.id);
        }
        return next;
      });
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      for (const category of pagination.items) {
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

  const handleApplyBulkAction = () => {
    if (!bulkAction) {
      return;
    }

    if (selectedIds.size === 0) {
      toast.info("Select at least one category.");
      return;
    }

    if (bulkAction === "delete") {
      setCategories((current) =>
        current.filter((category) => !selectedIds.has(category.id)),
      );
      setSelectedIds(new Set());
      toast.info("Selected categories deleted.");
    }

    setBulkAction("");
  };

  const tablenavProps = {
    bulkAction,
    onBulkActionChange: setBulkAction,
    onApplyBulkAction: handleApplyBulkAction,
    totalItems: pagination.totalItems,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    onPageChange: setPage,
    searchInput,
    onSearchInputChange: setSearchInput,
    onSearch: handleSearch,
  };

  return (
    <div className="admin-categories-page admin-review-categories-page">
      <div className="admin-categories-layout">
        <section className="admin-categories-form-panel">
          <h2 className="admin-categories-form-title">Add New Category</h2>
          <form className="admin-categories-form" onSubmit={handleAddCategory}>
            <div className="admin-categories-field">
              <label htmlFor="review-category-name">Name</label>
              <input
                id="review-category-name"
                type="text"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
              />
              <p className="admin-categories-help">
                The name is how it appears on your site.
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="review-category-slug">Slug</label>
              <input
                id="review-category-slug"
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
              <label htmlFor="review-category-parent">Parent Category</label>
              <select
                id="review-category-parent"
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
                Assign a parent term to create a hierarchy. The term Jazz, for
                example, would be the parent of Bebop and Big Band.
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="review-category-description">Description</label>
              <textarea
                id="review-category-description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <p className="admin-categories-help">
                The description is not prominent by default; however, some
                themes may show it.
              </p>
            </div>

            <button type="submit" className="admin-btn-primary admin-categories-submit">
              Add New Category
            </button>
          </form>
        </section>

        <section className="admin-categories-table-panel">
          <ReviewCategoriesTablenav
            {...tablenavProps}
            position="top"
            showSearch
          />

          <div className="admin-categories-item-count admin-categories-item-count-above-table">
            {pagination.totalItems}{" "}
            {pagination.totalItems === 1 ? "item" : "items"}
          </div>

          <div className="admin-categories-table-wrap">
            <table className="admin-categories-table admin-review-categories-table">
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
                {pagination.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-categories-empty">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  pagination.items.map((category) => (
                    <tr key={category.id}>
                      <th scope="row" className="admin-categories-col-check">
                        <input
                          type="checkbox"
                          aria-label={`Select ${category.name}`}
                          checked={selectedIds.has(category.id)}
                          onChange={() => toggleSelect(category.id)}
                        />
                      </th>
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

          <ReviewCategoriesTablenav {...tablenavProps} position="bottom" />
        </section>
      </div>
    </div>
  );
}
