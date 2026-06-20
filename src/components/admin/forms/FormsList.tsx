"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  filterForms,
  FORM_BULK_ACTIONS,
  FORM_LIST_VIEWS,
  formatFormConversion,
  getFormStatusLabel,
  getFormViewCounts,
  sortForms,
  type FormListItem,
  type FormListView,
  type FormSortDirection,
  type FormSortKey,
} from "@/lib/admin/formsList";

type SortableHeaderProps = {
  label: string;
  sortKey: FormSortKey;
  activeSortKey: FormSortKey;
  sortDirection: FormSortDirection;
  onSort: (key: FormSortKey) => void;
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

function FormStatusBadge({ status }: { status: FormListItem["status"] }) {
  return (
    <span className={`admin-forms-status-badge admin-forms-status-${status}`}>
      <span aria-hidden>•</span> {getFormStatusLabel(status)}
    </span>
  );
}

type FormsTablenavProps = {
  bulkAction: string;
  onBulkActionChange: (value: string) => void;
  onApplyBulkAction: () => void;
  totalItems: number;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  showSearch?: boolean;
  position: "top" | "bottom";
};

function FormsTablenav({
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
  totalItems,
  searchInput,
  onSearchInputChange,
  onSearch,
  showSearch = false,
  position,
}: FormsTablenavProps) {
  return (
    <div className={`admin-forms-tablenav admin-forms-tablenav-${position}`}>
      <div className="admin-categories-tablenav-actions">
        <label className="screen-reader-text" htmlFor={`forms-bulk-action-${position}`}>
          Select bulk action
        </label>
        <select
          id={`forms-bulk-action-${position}`}
          className="admin-categories-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {FORM_BULK_ACTIONS.map((action) => (
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
        <div className="admin-forms-search-wrap">
          <label className="screen-reader-text" htmlFor="forms-search">
            Search Forms
          </label>
          <input
            id="forms-search"
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
            Search Forms
          </button>
        </div>
      ) : (
        <div className="admin-forms-item-count">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </div>
      )}
    </div>
  );
}

export function FormsList() {
  const toast = useAdminToast();
  const allForms = useMemo<FormListItem[]>(() => [], []);

  const viewCounts = useMemo(() => getFormViewCounts(allForms), [allForms]);

  const [view, setView] = useState<FormListView>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<FormSortKey>("title");
  const [sortDirection, setSortDirection] = useState<FormSortDirection>("asc");

  const visibleForms = useMemo(
    () =>
      sortForms(filterForms(allForms, view, searchQuery), sortKey, sortDirection),
    [allForms, searchQuery, sortDirection, sortKey, view],
  );

  const allVisibleSelected =
    visibleForms.length > 0 &&
    visibleForms.every((form) => selectedIds.has(form.id));

  const handleViewChange = (nextView: FormListView) => {
    setView(nextView);
    setSelectedIds(new Set());
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setSelectedIds(new Set());
  };

  const handleSort = (key: FormSortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "title" ? "asc" : "desc");
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => {
        const next = new Set(current);
        for (const form of visibleForms) {
          next.delete(form.id);
        }
        return next;
      });
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      for (const form of visibleForms) {
        next.add(form.id);
      }
      return next;
    });
  };

  const toggleSelect = (id: number) => {
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
      toast.info("Select at least one form.");
      return;
    }

    toast.success(
      `Applied "${bulkAction}" to ${selectedIds.size} form${selectedIds.size === 1 ? "" : "s"}.`,
    );
    setSelectedIds(new Set());
    setBulkAction("");
  };

  const tablenavProps = {
    bulkAction,
    onBulkActionChange: setBulkAction,
    onApplyBulkAction: handleApplyBulkAction,
    totalItems: visibleForms.length,
    searchInput,
    onSearchInputChange: setSearchInput,
    onSearch: handleSearch,
  };

  return (
    <div className="admin-posts-list admin-forms-list">
      <ul className="admin-posts-views">
        {FORM_LIST_VIEWS.map((item, index) => {
          const count = viewCounts[item.value];
          const isActive = view === item.value;

          return (
            <li key={item.value}>
              {index > 0 ? <span className="admin-posts-view-sep"> | </span> : null}
              <button
                type="button"
                className={`admin-posts-view-link${isActive ? " is-current" : ""}`}
                onClick={() => handleViewChange(item.value)}
              >
                {item.label}
                <span className="admin-posts-view-count"> ({count})</span>
              </button>
            </li>
          );
        })}
      </ul>

      <FormsTablenav {...tablenavProps} position="top" showSearch />

      <div className="admin-forms-item-count admin-forms-item-count-above-table">
        {visibleForms.length} {visibleForms.length === 1 ? "item" : "items"}
      </div>

      <div className="admin-posts-table-wrap admin-forms-table-wrap">
        <table className="admin-posts-table admin-forms-table">
          <thead>
            <tr>
              <td className="admin-posts-col-check">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                />
              </td>
              <SortableHeader
                label="Status"
                sortKey="status"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-forms-col-status"
              />
              <SortableHeader
                label="Title"
                sortKey="title"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-forms-col-title"
              />
              <SortableHeader
                label="ID"
                sortKey="id"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-forms-col-id"
              />
              <SortableHeader
                label="Entries"
                sortKey="entries"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-forms-col-entries"
              />
              <SortableHeader
                label="Views"
                sortKey="views"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-forms-col-views"
              />
              <SortableHeader
                label="Conversion"
                sortKey="conversion"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-forms-col-conversion"
              />
            </tr>
          </thead>
          <tbody>
            {visibleForms.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-posts-empty">
                  No forms found.
                </td>
              </tr>
            ) : (
              visibleForms.map((form) => (
                <tr key={form.id}>
                  <th scope="row" className="admin-posts-col-check">
                    <input
                      type="checkbox"
                      aria-label={`Select ${form.title}`}
                      checked={selectedIds.has(form.id)}
                      onChange={() => toggleSelect(form.id)}
                    />
                  </th>
                  <td className="admin-forms-col-status">
                    <FormStatusBadge status={form.status} />
                  </td>
                  <td className="admin-forms-col-title">
                    <Link href={`/admin/forms/${form.id}`} className="admin-posts-title-link">
                      {form.title}
                    </Link>
                  </td>
                  <td className="admin-forms-col-id">
                    <button type="button" className="admin-forms-metric-link">
                      {form.id}
                    </button>
                  </td>
                  <td className="admin-forms-col-entries">
                    <button type="button" className="admin-forms-metric-link">
                      {form.entries}
                    </button>
                  </td>
                  <td className="admin-forms-col-views">
                    <button type="button" className="admin-forms-metric-link">
                      {form.views}
                    </button>
                  </td>
                  <td className="admin-forms-col-conversion">
                    <button type="button" className="admin-forms-metric-link">
                      {formatFormConversion(form.conversion)}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FormsTablenav {...tablenavProps} position="bottom" />
    </div>
  );
}
