"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  createTagAction,
  deleteTagsAction,
  fetchTagsWithCountsAction,
} from "@/app/admin/(shell)/posts/actions";
import {
  filterTags,
  slugifyTagName,
  sortTags,
  TAG_BULK_ACTIONS,
  type TagListItem,
  type TagSortDirection,
  type TagSortKey,
} from "@/lib/admin/tagsList";

type SortableHeaderProps = {
  label: string;
  sortKey: TagSortKey;
  activeSortKey: TagSortKey;
  sortDirection: TagSortDirection;
  onSort: (key: TagSortKey) => void;
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

type TagsTablenavProps = {
  bulkAction: string;
  onBulkActionChange: (value: string) => void;
  onApplyBulkAction: () => void;
  totalItems: number;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  showSearch?: boolean;
};

function TagsTablenav({
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
  totalItems,
  searchInput,
  onSearchInputChange,
  onSearch,
  showSearch = false,
}: TagsTablenavProps) {
  return (
    <div className="admin-categories-tablenav">
      <div className="admin-categories-tablenav-actions">
        <label className="screen-reader-text" htmlFor={`tag-bulk-${showSearch ? "top" : "bottom"}`}>
          Select bulk action
        </label>
        <select
          id={`tag-bulk-${showSearch ? "top" : "bottom"}`}
          className="admin-categories-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {TAG_BULK_ACTIONS.map((action) => (
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
          <label className="screen-reader-text" htmlFor="tag-search">
            Search Tags
          </label>
          <input
            id="tag-search"
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
            Search Tags
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

function TagsTableHead({
  allVisibleSelected,
  onToggleSelectAll,
  sortKey,
  sortDirection,
  onSort,
}: {
  allVisibleSelected: boolean;
  onToggleSelectAll: () => void;
  sortKey: TagSortKey;
  sortDirection: TagSortDirection;
  onSort: (key: TagSortKey) => void;
}) {
  return (
    <tr>
      <td className="admin-categories-col-check">
        <input
          type="checkbox"
          aria-label="Select all"
          checked={allVisibleSelected}
          onChange={onToggleSelectAll}
        />
      </td>
      <SortableHeader
        label="Name"
        sortKey="name"
        activeSortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        className="admin-tags-col-name"
      />
      <SortableHeader
        label="Description"
        sortKey="description"
        activeSortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        className="admin-tags-col-description"
      />
      <SortableHeader
        label="Slug"
        sortKey="slug"
        activeSortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        className="admin-tags-col-slug"
      />
      <SortableHeader
        label="Count"
        sortKey="count"
        activeSortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        className="admin-categories-col-count"
      />
    </tr>
  );
}

export function TagsManager() {
  const [tags, setTags] = useState<TagListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<TagSortKey>("name");
  const [sortDirection, setSortDirection] = useState<TagSortDirection>("asc");
  const toast = useAdminToast();

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    const items = await fetchTagsWithCountsAction();
    setTags(
      items.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        postCount: tag.postCount,
      })),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  const filteredTags = useMemo(
    () => filterTags(tags, searchQuery),
    [tags, searchQuery],
  );

  const visibleTags = useMemo(
    () => sortTags(filteredTags, sortKey, sortDirection),
    [filteredTags, sortDirection, sortKey],
  );

  const allVisibleSelected =
    visibleTags.length > 0 &&
    visibleTags.every((tag) => selectedIds.has(tag.id));

  const handleNameChange = (value: string) => {
    setName(value);

    if (!slugTouched) {
      setSlug(slugifyTagName(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const handleAddTag = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const result = await createTagAction({
      name: trimmedName,
      slug,
      description,
    });

    if (result.error || !result.tag) {
      toast.error(result.error ?? "Could not create tag.");
      return;
    }

    await loadTags();
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    toast.success(`Tag "${result.tag.name}" added.`);
  };

  const handleSort = (key: TagSortKey) => {
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
        for (const tag of visibleTags) {
          next.delete(tag.id);
        }
        return next;
      });
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      for (const tag of visibleTags) {
        next.add(tag.id);
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
      toast.info("Select at least one tag.");
      return;
    }

    if (bulkAction === "delete") {
      const result = await deleteTagsAction(Array.from(selectedIds));

      if (result.error) {
        toast.error(result.error);
      } else {
        setSelectedIds(new Set());
        toast.success("Selected tags deleted.");
        await loadTags();
      }
    }

    setBulkAction("");
  };

  if (isLoading) {
    return <p className="admin-post-editor-loading">Loading tags…</p>;
  }

  return (
    <div className="admin-categories-page admin-tags-page">

      <div className="admin-categories-layout">
        <section className="admin-categories-form-panel">
          <h2 className="admin-categories-form-title">Add Tag</h2>
          <form className="admin-categories-form" onSubmit={handleAddTag}>
            <div className="admin-categories-field">
              <label htmlFor="tag-name">Name</label>
              <input
                id="tag-name"
                type="text"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
              />
              <p className="admin-categories-help">
                The name is how it appears on your site.
              </p>
            </div>

            <div className="admin-categories-field">
              <label htmlFor="tag-slug">Slug</label>
              <input
                id="tag-slug"
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
              <label htmlFor="tag-description">Description</label>
              <textarea
                id="tag-description"
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
              Add Tag
            </button>
          </form>
        </section>

        <section className="admin-categories-table-panel">
          <TagsTablenav
            showSearch
            bulkAction={bulkAction}
            onBulkActionChange={setBulkAction}
            onApplyBulkAction={handleApplyBulkAction}
            totalItems={visibleTags.length}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearch={handleSearch}
          />

          <div className="admin-categories-item-count admin-categories-item-count-above-table">
            {visibleTags.length} {visibleTags.length === 1 ? "item" : "items"}
          </div>

          <div className="admin-categories-table-wrap">
            <table className="admin-categories-table admin-tags-table">
              <thead>
                <TagsTableHead
                  allVisibleSelected={allVisibleSelected}
                  onToggleSelectAll={toggleSelectAll}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </thead>
              <tbody>
                {visibleTags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-categories-empty">
                      No tags found.
                    </td>
                  </tr>
                ) : (
                  visibleTags.map((tag) => (
                    <tr key={tag.id}>
                      <th scope="row" className="admin-categories-col-check">
                        <input
                          type="checkbox"
                          aria-label={`Select ${tag.name}`}
                          checked={selectedIds.has(tag.id)}
                          onChange={() => toggleSelect(tag.id)}
                        />
                      </th>
                      <td className="admin-tags-col-name">
                        <button type="button" className="admin-categories-name-link">
                          {tag.name}
                        </button>
                      </td>
                      <td className="admin-tags-col-description">
                        {tag.description || "—"}
                      </td>
                      <td className="admin-tags-col-slug">{tag.slug}</td>
                      <td className="admin-categories-col-count">
                        <button type="button" className="admin-categories-count-link">
                          {tag.postCount}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <TagsTableHead
                  allVisibleSelected={allVisibleSelected}
                  onToggleSelectAll={toggleSelectAll}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </tfoot>
            </table>
          </div>

          <TagsTablenav
            bulkAction={bulkAction}
            onBulkActionChange={setBulkAction}
            onApplyBulkAction={handleApplyBulkAction}
            totalItems={visibleTags.length}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearch={handleSearch}
          />
        </section>
      </div>

      <p className="admin-tags-footer-note">
        Tags can be selectively converted to categories using the{" "}
        <button type="button" className="admin-inline-link">
          tag to category converter
        </button>
        .
      </p>
    </div>
  );
}
