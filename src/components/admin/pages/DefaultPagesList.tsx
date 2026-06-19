"use client";

import { CornerDownLeft, ExternalLink, Link2, Pencil } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  DEFAULT_PAGE_BULK_ACTIONS,
  DEFAULT_PAGE_LIST_VIEWS,
  filterDefaultPages,
  formatDefaultPageListDate,
  getDefaultPageDateOptions,
  getDefaultPageTitlePrefix,
  getDefaultPageViewCounts,
  paginateDefaultPages,
  type DefaultPageListItem,
  type DefaultPageListView,
} from "@/lib/admin/defaultPagesList";

const PER_PAGE = 20;

function SeoDetailsCell({ page }: { page: DefaultPageListItem }) {
  return (
    <div className="admin-posts-seo-details">
      <span className="admin-posts-seo-badge">N/A</span>
      <div className="admin-posts-seo-line">
        <strong>Keyword:</strong> {page.seoKeyword ?? "Not Set"}
      </div>
      {page.seoNoIndex ? (
        <div className="admin-posts-seo-line">No Index</div>
      ) : null}
      <div className="admin-posts-seo-line">
        <strong>Schema:</strong> {page.seoSchema}
      </div>
      <div className="admin-posts-seo-links">
        <span title="Internal links">
          <Link2 size={14} aria-hidden />
          {page.internalLinks}
        </span>
        <span title="External links">
          <ExternalLink size={14} aria-hidden />
          {page.externalLinks}
        </span>
        <span title="Backlinks">
          <CornerDownLeft size={14} aria-hidden />
          {page.backlinks}
        </span>
      </div>
    </div>
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
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  position: "top" | "bottom";
};

function DefaultPagesTablenav({
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
  dateFilter,
  onDateFilterChange,
  dateOptions,
  onFilter,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  position,
}: TablenavProps) {
  return (
    <div className={`admin-posts-tablenav admin-posts-tablenav-${position}`}>
      <div className="admin-posts-tablenav-actions">
        <label className="screen-reader-text" htmlFor={`pages-bulk-action-${position}`}>
          Select bulk action
        </label>
        <select
          id={`pages-bulk-action-${position}`}
          className="admin-posts-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {DEFAULT_PAGE_BULK_ACTIONS.map((action) => (
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
            <label className="screen-reader-text" htmlFor={`pages-filter-date-${position}`}>
              Filter by date
            </label>
            <select
              id={`pages-filter-date-${position}`}
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

      {position === "top" ? (
        <div className="admin-posts-search-wrap">
          <label className="screen-reader-text" htmlFor="default-pages-search">
            Search Pages
          </label>
          <input
            id="default-pages-search"
            type="search"
            className="admin-posts-search-input"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearch();
              }
            }}
          />
          <button type="button" className="admin-btn-secondary" onClick={onSearch}>
            Search Pages
          </button>
        </div>
      ) : null}

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

export function DefaultPagesList() {
  const toast = useAdminToast();
  const allPages = useMemo<DefaultPageListItem[]>(() => [], []);
  const viewCounts = useMemo(() => getDefaultPageViewCounts(allPages), [allPages]);
  const dateOptions = useMemo(() => getDefaultPageDateOptions(allPages), [allPages]);

  const [view, setView] = useState<DefaultPageListView>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState("");

  const filteredPages = useMemo(
    () =>
      filterDefaultPages(allPages, {
        view,
        search: searchQuery,
        dateFilter,
      }),
    [allPages, dateFilter, searchQuery, view],
  );

  const pagination = useMemo(
    () => paginateDefaultPages(filteredPages, page, PER_PAGE),
    [filteredPages, page],
  );

  const allVisibleSelected =
    pagination.items.length > 0 &&
    pagination.items.every((item) => selectedIds.has(item.id));

  const handleViewChange = (nextView: DefaultPageListView) => {
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

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => {
        const next = new Set(current);
        for (const item of pagination.items) {
          next.delete(item.id);
        }
        return next;
      });
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      for (const item of pagination.items) {
        next.add(item.id);
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
      toast.info("Select at least one page.");
      return;
    }

    toast.success(
      `Applied "${bulkAction}" to ${selectedIds.size} page${selectedIds.size === 1 ? "" : "s"}.`,
    );
    setSelectedIds(new Set());
    setBulkAction("");
  };

  return (
    <div className="admin-posts-list admin-default-pages-list">
      <ul className="admin-posts-views">
        {DEFAULT_PAGE_LIST_VIEWS.map((item, index) => {
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
                {item.showCount ? (
                  <span className="admin-posts-view-count"> ({count})</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <DefaultPagesTablenav
        position="top"
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onApplyBulkAction={handleApplyBulkAction}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        dateOptions={dateOptions}
        onFilter={handleFilter}
        searchQuery={searchInput}
        onSearchQueryChange={setSearchInput}
        onSearch={handleSearch}
        totalItems={pagination.totalItems}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />

      <div className="admin-posts-table-wrap">
        <table className="admin-posts-table admin-default-pages-table">
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
              <th scope="col" className="admin-posts-col-title admin-default-pages-col-title">
                Title
              </th>
              <th scope="col" className="admin-posts-col-author">
                Author
              </th>
              <th scope="col" className="admin-posts-col-date">
                Date
              </th>
              <th scope="col" className="admin-posts-col-id">
                ID
              </th>
              <th scope="col" className="admin-posts-col-seo admin-default-pages-col-seo">
                <span className="admin-default-pages-seo-heading">
                  SEO Details
                  <Pencil size={12} aria-hidden />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-posts-empty">
                  No pages found.
                </td>
              </tr>
            ) : (
              pagination.items.map((pageItem) => (
                <tr key={pageItem.id}>
                  <th scope="row" className="admin-posts-col-check">
                    <input
                      type="checkbox"
                      aria-label={`Select ${pageItem.title}`}
                      checked={selectedIds.has(pageItem.id)}
                      onChange={() => toggleSelect(pageItem.id)}
                    />
                  </th>
                  <td className="admin-posts-col-title">
                    <Link
                      href={`/admin/pages/new?page=${pageItem.id}`}
                      className="admin-posts-title-link"
                    >
                      {getDefaultPageTitlePrefix(pageItem.depth)}
                      {pageItem.title}
                    </Link>
                  </td>
                  <td className="admin-posts-col-author">
                    <button type="button" className="admin-default-pages-author-link">
                      {pageItem.author}
                    </button>
                  </td>
                  <td className="admin-posts-col-date">
                    {pageItem.dateType === "modified" ? "Last Modified" : "Published"}
                    <br />
                    {formatDefaultPageListDate(pageItem.date)}
                  </td>
                  <td className="admin-posts-col-id">{pageItem.id}</td>
                  <td className="admin-posts-col-seo">
                    <SeoDetailsCell page={pageItem} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DefaultPagesTablenav
        position="bottom"
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onApplyBulkAction={handleApplyBulkAction}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        dateOptions={dateOptions}
        onFilter={handleFilter}
        searchQuery={searchInput}
        onSearchQueryChange={setSearchInput}
        onSearch={handleSearch}
        totalItems={pagination.totalItems}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
