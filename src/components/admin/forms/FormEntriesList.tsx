"use client";

import { ArrowDown, ArrowUp, Settings, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { FormEditorToolbar } from "@/components/admin/forms/FormEditorToolbar";
import {
  filterFormEntries,
  FORM_ENTRY_BULK_ACTIONS,
  FORM_ENTRY_SEARCH_FIELDS,
  FORM_ENTRY_SEARCH_OPERATORS,
  FORM_ENTRY_VIEWS,
  getFormEntryViewCounts,
  paginateFormEntries,
  sortFormEntries,
  type FormEntryItem,
  type FormEntrySearchField,
  type FormEntrySearchOperator,
  type FormEntrySortDirection,
  type FormEntrySortKey,
  type FormEntryView,
} from "@/lib/admin/formEntriesList";

const PER_PAGE = 20;

type SortableHeaderProps = {
  label: string;
  sortKey: FormEntrySortKey;
  activeSortKey: FormEntrySortKey;
  sortDirection: FormEntrySortDirection;
  onSort: (key: FormEntrySortKey) => void;
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

type EntriesTablenavProps = {
  bulkAction: string;
  onBulkActionChange: (value: string) => void;
  onApplyBulkAction: () => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  position: "top" | "bottom";
};

function EntriesTablenav({
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  position,
}: EntriesTablenavProps) {
  return (
    <div className={`admin-form-entries-tablenav admin-form-entries-tablenav-${position}`}>
      <div className="admin-categories-tablenav-actions">
        <label className="screen-reader-text" htmlFor={`form-entries-bulk-${position}`}>
          Select bulk action
        </label>
        <select
          id={`form-entries-bulk-${position}`}
          className="admin-categories-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {FORM_ENTRY_BULK_ACTIONS.map((action) => (
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

      <div className="admin-posts-pagination">
        <span className="admin-posts-pagination-count">
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
    </div>
  );
}

export function FormEntriesList() {
  const toast = useAdminToast();
  const [entries, setEntries] = useState<FormEntryItem[]>([]);
  const [view, setView] = useState<FormEntryView>("all");
  const [searchField, setSearchField] = useState<FormEntrySearchField>("any");
  const [searchOperator, setSearchOperator] =
    useState<FormEntrySearchOperator>("contains");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<FormEntrySortKey>("first");
  const [sortDirection, setSortDirection] = useState<FormEntrySortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const viewCounts = useMemo(() => getFormEntryViewCounts(entries), [entries]);

  const filteredEntries = useMemo(
    () =>
      sortFormEntries(
        filterFormEntries(entries, view, searchField, searchOperator, searchQuery),
        sortKey,
        sortDirection,
      ),
    [entries, searchField, searchOperator, searchQuery, sortDirection, sortKey, view],
  );

  const pagination = useMemo(
    () => paginateFormEntries(filteredEntries, currentPage, PER_PAGE),
    [currentPage, filteredEntries],
  );

  const visibleEntries = pagination.items;
  const allVisibleSelected =
    visibleEntries.length > 0 &&
    visibleEntries.every((entry) => selectedIds.has(entry.id));

  const handleViewChange = (nextView: FormEntryView) => {
    setView(nextView);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleSort = (key: FormEntrySortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => {
        const next = new Set(current);
        for (const entry of visibleEntries) {
          next.delete(entry.id);
        }
        return next;
      });
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      for (const entry of visibleEntries) {
        next.add(entry.id);
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

  const toggleStar = (id: number) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, isStarred: !entry.isStarred } : entry,
      ),
    );
  };

  const handleApplyBulkAction = () => {
    if (!bulkAction) {
      return;
    }

    if (selectedIds.size === 0) {
      toast.info("Select at least one entry.");
      return;
    }

    toast.success(
      `Applied "${bulkAction}" to ${selectedIds.size} entr${selectedIds.size === 1 ? "y" : "ies"}.`,
    );
    setSelectedIds(new Set());
    setBulkAction("");
  };

  const tablenavProps = {
    bulkAction,
    onBulkActionChange: setBulkAction,
    onApplyBulkAction: handleApplyBulkAction,
    totalItems: pagination.totalItems,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    onPageChange: setCurrentPage,
  };

  return (
    <div className="admin-form-entries">
      <FormEditorToolbar formId={0} activeTab="entries" />

      <ul className="admin-posts-views admin-form-entries-views">
        {FORM_ENTRY_VIEWS.map((item, index) => {
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

      <div className="admin-form-entries-search-bar">
        <label className="screen-reader-text" htmlFor="form-entries-search-field">
          Search field
        </label>
        <select
          id="form-entries-search-field"
          className="admin-categories-select"
          value={searchField}
          onChange={(event) => setSearchField(event.target.value as FormEntrySearchField)}
        >
          {FORM_ENTRY_SEARCH_FIELDS.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>

        <label className="screen-reader-text" htmlFor="form-entries-search-operator">
          Search operator
        </label>
        <select
          id="form-entries-search-operator"
          className="admin-categories-select"
          value={searchOperator}
          onChange={(event) =>
            setSearchOperator(event.target.value as FormEntrySearchOperator)
          }
        >
          {FORM_ENTRY_SEARCH_OPERATORS.map((operator) => (
            <option key={operator.value} value={operator.value}>
              {operator.label}
            </option>
          ))}
        </select>

        <label className="screen-reader-text" htmlFor="form-entries-search-input">
          Search entries
        </label>
        <input
          id="form-entries-search-input"
          type="search"
          className="admin-categories-search-input"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }
          }}
        />

        <button type="button" className="admin-btn-secondary" onClick={handleSearch}>
          Search
        </button>
      </div>

      <EntriesTablenav {...tablenavProps} position="top" />

      <div className="admin-posts-table-wrap admin-form-entries-table-wrap">
        <table className="admin-posts-table admin-form-entries-table">
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
              <th scope="col" className="admin-form-entries-col-star" aria-label="Starred" />
              <SortableHeader
                label="First"
                sortKey="first"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-form-entries-col-first"
              />
              <SortableHeader
                label="Last"
                sortKey="last"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-form-entries-col-last"
              />
              <SortableHeader
                label="Email Address"
                sortKey="email"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-form-entries-col-email"
              />
              <SortableHeader
                label="Zip Code"
                sortKey="zipCode"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-form-entries-col-zip"
              />
              <SortableHeader
                label="Phone Number"
                sortKey="phone"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-form-entries-col-phone"
              />
              <SortableHeader
                label="How can we help?"
                sortKey="message"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-form-entries-col-message"
              />
              <th scope="col" className="admin-form-entries-col-settings">
                <button
                  type="button"
                  className="admin-form-entries-settings-btn"
                  aria-label="Column settings"
                >
                  <Settings size={16} aria-hidden />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleEntries.length === 0 ? (
              <tr>
                <td colSpan={9} className="admin-posts-empty">
                  No entries found.
                </td>
              </tr>
            ) : (
              visibleEntries.map((entry) => (
                <FormEntryRow
                  key={entry.id}
                  entry={entry}
                  selected={selectedIds.has(entry.id)}
                  onToggleSelect={() => toggleSelect(entry.id)}
                  onToggleStar={() => toggleStar(entry.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <EntriesTablenav {...tablenavProps} position="bottom" />
    </div>
  );
}

type FormEntryRowProps = {
  entry: FormEntryItem;
  selected: boolean;
  onToggleSelect: () => void;
  onToggleStar: () => void;
};

function FormEntryRow({
  entry,
  selected,
  onToggleSelect,
  onToggleStar,
}: FormEntryRowProps) {
  return (
    <tr>
      <th scope="row" className="admin-posts-col-check">
        <input
          type="checkbox"
          aria-label={`Select ${entry.first} ${entry.last}`}
          checked={selected}
          onChange={onToggleSelect}
        />
      </th>
      <td className="admin-form-entries-col-star">
        <button
          type="button"
          className={`admin-form-entries-star-btn${entry.isStarred ? " is-starred" : ""}`}
          onClick={onToggleStar}
          aria-label={entry.isStarred ? "Remove star" : "Add star"}
        >
          <Star size={15} aria-hidden />
        </button>
      </td>
      <td className="admin-form-entries-col-first">
        <button type="button" className="admin-form-entries-name-link">
          {entry.first}
        </button>
      </td>
      <td className="admin-form-entries-col-last">
        <strong>{entry.last}</strong>
      </td>
      <td className="admin-form-entries-col-email">{entry.email}</td>
      <td className="admin-form-entries-col-zip">{entry.zipCode}</td>
      <td className="admin-form-entries-col-phone">{entry.phone}</td>
      <td className="admin-form-entries-col-message">{entry.message}</td>
      <td className="admin-form-entries-col-settings" />
    </tr>
  );
}
