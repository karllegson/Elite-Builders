"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  filterReviews,
  formatReviewListDate,
  getReviewDateOptions,
  getReviewViewCounts,
  paginateReviews,
  REVIEW_BULK_ACTIONS,
  REVIEW_LIST_VIEWS,
  sortReviews,
  type ReviewListItem,
  type ReviewListView,
  type ReviewSortDirection,
  type ReviewSortKey,
} from "@/lib/admin/reviewsList";

const PER_PAGE = 20;

type SortableHeaderProps = {
  label: string;
  sortKey: ReviewSortKey;
  activeSortKey: ReviewSortKey;
  sortDirection: ReviewSortDirection;
  onSort: (key: ReviewSortKey) => void;
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

type TablenavProps = {
  bulkAction: string;
  onBulkActionChange: (value: string) => void;
  onApplyBulkAction: () => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  dateOptions: { value: string; label: string }[];
  onFilter: () => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  position: "top" | "bottom";
};

function ReviewsTablenav({
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
  dateFilter,
  onDateFilterChange,
  dateOptions,
  onFilter,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  position,
}: TablenavProps) {
  return (
    <div className={`admin-posts-tablenav admin-posts-tablenav-${position}`}>
      <div className="admin-posts-tablenav-actions">
        <label className="screen-reader-text" htmlFor={`reviews-bulk-action-${position}`}>
          Select bulk action
        </label>
        <select
          id={`reviews-bulk-action-${position}`}
          className="admin-posts-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {REVIEW_BULK_ACTIONS.map((action) => (
            <option key={action.value || "default"} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="admin-btn-secondary admin-posts-apply-btn"
          onClick={onApplyBulkAction}
        >
          Apply
        </button>

        {position === "top" ? (
          <>
            <label className="screen-reader-text" htmlFor={`reviews-filter-date-${position}`}>
              Filter by date
            </label>
            <select
              id={`reviews-filter-date-${position}`}
              className="admin-posts-select"
              value={dateFilter}
              onChange={(event) => onDateFilterChange(event.target.value)}
            >
              <option value="all">All dates</option>
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="admin-btn-secondary admin-posts-filter-btn"
              onClick={onFilter}
            >
              Filter
            </button>
          </>
        ) : null}
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

export function ReviewsList() {
  const toast = useAdminToast();
  const allReviews = useMemo<ReviewListItem[]>(() => [], []);
  const viewCounts = useMemo(() => getReviewViewCounts(allReviews), [allReviews]);
  const dateOptions = useMemo(() => getReviewDateOptions(allReviews), [allReviews]);

  const [view, setView] = useState<ReviewListView>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortKey, setSortKey] = useState<ReviewSortKey>("date");
  const [sortDirection, setSortDirection] = useState<ReviewSortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState("");

  const filteredReviews = useMemo(
    () =>
      sortReviews(
        filterReviews(allReviews, {
          view,
          search: searchQuery,
          dateFilter,
        }),
        sortKey,
        sortDirection,
      ),
    [allReviews, dateFilter, searchQuery, sortDirection, sortKey, view],
  );

  const pagination = useMemo(
    () => paginateReviews(filteredReviews, page, PER_PAGE),
    [filteredReviews, page],
  );

  const allVisibleSelected =
    pagination.items.length > 0 &&
    pagination.items.every((review) => selectedIds.has(review.id));

  const handleViewChange = (nextView: ReviewListView) => {
    setView(nextView);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleFilter = () => {
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleSort = (key: ReviewSortKey) => {
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
        for (const review of pagination.items) {
          next.delete(review.id);
        }
        return next;
      });
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      for (const review of pagination.items) {
        next.add(review.id);
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
      toast.info("Select at least one review.");
      return;
    }

    toast.success(
      `Applied "${bulkAction}" to ${selectedIds.size} review${selectedIds.size === 1 ? "" : "s"}.`,
    );
    setSelectedIds(new Set());
    setBulkAction("");
  };

  return (
    <div className="admin-posts-list admin-reviews-list">
      <div className="admin-reviews-toolbar-top">
        <ul className="admin-posts-views">
          {REVIEW_LIST_VIEWS.map((item, index) => {
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

        <div className="admin-reviews-search-wrap">
          <label className="screen-reader-text" htmlFor="reviews-search">
            Search Reviews
          </label>
          <input
            id="reviews-search"
            type="search"
            className="admin-posts-search-input"
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
            Search Reviews
          </button>
        </div>
      </div>

      <ReviewsTablenav
        position="top"
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onApplyBulkAction={handleApplyBulkAction}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        dateOptions={dateOptions}
        onFilter={handleFilter}
        totalItems={pagination.totalItems}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />

      <div className="admin-posts-table-wrap">
        <table className="admin-posts-table admin-reviews-table">
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
                label="Title"
                sortKey="title"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-posts-col-title admin-reviews-col-title"
              />
              <th scope="col" className="admin-reviews-col-reviewer">
                Reviewer Name
              </th>
              <th scope="col" className="admin-reviews-col-categories">
                Categories
              </th>
              <SortableHeader
                label="Date"
                sortKey="date"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="admin-posts-col-date"
              />
              <th scope="col" className="admin-posts-col-id">
                ID
              </th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-posts-empty">
                  No reviews found.
                </td>
              </tr>
            ) : (
              pagination.items.map((review) => (
                <tr key={review.id}>
                  <th scope="row" className="admin-posts-col-check">
                    <input
                      type="checkbox"
                      aria-label={`Select ${review.title}`}
                      checked={selectedIds.has(review.id)}
                      onChange={() => toggleSelect(review.id)}
                    />
                  </th>
                  <td className="admin-posts-col-title">
                    <Link
                      href={`/admin/reviews/${review.id}`}
                      className="admin-posts-title-link"
                    >
                      {review.title}
                    </Link>
                  </td>
                  <td className="admin-reviews-col-reviewer">{review.reviewerName}</td>
                  <td className="admin-reviews-col-categories">
                    {review.categories.length > 0
                      ? review.categories.map((category, index) => (
                          <span key={category}>
                            {index > 0 ? ", " : null}
                            <button type="button" className="admin-posts-taxonomy-link">
                              {category}
                            </button>
                          </span>
                        ))
                      : "—"}
                  </td>
                  <td className="admin-posts-col-date">
                    {review.dateType === "modified" ? "Last Modified" : "Published"}
                    <br />
                    {formatReviewListDate(review.date)}
                  </td>
                  <td className="admin-posts-col-id">{review.id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReviewsTablenav
        position="bottom"
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onApplyBulkAction={handleApplyBulkAction}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        dateOptions={dateOptions}
        onFilter={handleFilter}
        totalItems={pagination.totalItems}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
