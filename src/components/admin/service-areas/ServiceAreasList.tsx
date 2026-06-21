"use client";

import { CornerDownLeft, ExternalLink, Link2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  DEFAULT_SERVICE_AREA_AUTHOR,
  deleteServiceArea,
  listAllServiceAreas,
} from "@/lib/admin/serviceAreasData";
import { ensureServiceAreasStoreReady } from "@/lib/admin/serviceAreasSync.client";
import {
  filterServiceAreaListItems,
  formatServiceAreaListDate,
  getSeoScoreClass,
  getServiceAreaDateOptions,
  getServiceAreaViewCounts,
  paginateServiceAreaListItems,
  SERVICE_AREA_BULK_ACTIONS,
  SERVICE_AREA_LIST_VIEWS,
  toServiceAreaListItem,
  type ServiceAreaListItem,
  type ServiceAreaListView,
} from "@/lib/admin/serviceAreasList";

const PER_PAGE = 20;

function ServiceAreaStatusLabel({ item }: { item: ServiceAreaListItem }) {
  if (item.status === "draft") {
    return (
      <>
        {" "}
        — <span className="admin-post-status-draft">Draft</span>
      </>
    );
  }

  return null;
}

function ServiceAreaSeoCell({ item }: { item: ServiceAreaListItem }) {
  return (
    <div className="admin-posts-seo-details">
      <span className={`admin-posts-seo-badge ${getSeoScoreClass(item.seoScore)}`}>
        {item.seoScore === null ? "N/A" : `${item.seoScore} / 100`}
      </span>
      <div className="admin-posts-seo-line">
        <strong>Keyword:</strong> {item.seoKeyword ?? "Not Set"}
      </div>
      <div className="admin-posts-seo-line">
        <strong>Schema:</strong> {item.seoSchema.toLowerCase()}
      </div>
      <div className="admin-posts-seo-links">
        <span title="Internal links">
          <Link2 size={14} aria-hidden />
          {item.internalLinks}
        </span>
        <span title="External links">
          <ExternalLink size={14} aria-hidden />
          {item.externalLinks}
        </span>
        <span title="Backlinks">
          <CornerDownLeft size={14} aria-hidden />
          0
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

function ServiceAreasTablenav({
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
        <label className="screen-reader-text" htmlFor={`sa-bulk-${position}`}>
          Select bulk action
        </label>
        <select
          id={`sa-bulk-${position}`}
          className="admin-posts-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {SERVICE_AREA_BULK_ACTIONS.map((action) => (
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

        <label className="screen-reader-text" htmlFor={`sa-date-${position}`}>
          Filter by date
        </label>
        <select
          id={`sa-date-${position}`}
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
        <button type="button" className="admin-btn-secondary admin-posts-filter-btn" onClick={onFilter}>
          Filter
        </button>
      </div>

      {position === "top" ? (
        <div className="admin-posts-search-wrap">
          <label className="screen-reader-text" htmlFor="sa-search">
            Search Service Area
          </label>
          <input
            id="sa-search"
            type="search"
            className="admin-posts-search-input"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearch();
              }
            }}
          />
          <button type="button" className="admin-btn-secondary" onClick={onSearch}>
            Search Service Area
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
        </span>
      </div>
    </div>
  );
}

export function ServiceAreasList() {
  const toast = useAdminToast();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    void ensureServiceAreasStoreReady();
  }, []);

  const allItems = useMemo(
    () =>
      listAllServiceAreas()
        .filter((area) => !area.unused)
        .map((area) => toServiceAreaListItem(area, DEFAULT_SERVICE_AREA_AUTHOR)),
    [refreshKey],
  );

  const viewCounts = useMemo(() => getServiceAreaViewCounts(allItems), [allItems]);
  const dateOptions = useMemo(() => getServiceAreaDateOptions(allItems), [allItems]);

  const [view, setView] = useState<ServiceAreaListView>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");

  const filteredItems = useMemo(
    () =>
      filterServiceAreaListItems(allItems, {
        view,
        search: searchQuery,
        dateFilter,
      }),
    [allItems, dateFilter, searchQuery, view],
  );

  const pagination = useMemo(
    () => paginateServiceAreaListItems(filteredItems, page, PER_PAGE),
    [filteredItems, page],
  );

  const allVisibleSelected =
    pagination.items.length > 0 &&
    pagination.items.every((item) => selectedIds.has(item.id));

  const showStatus = (message: string) => {
    toast.success(message);
  };

  const handleViewChange = (nextView: ServiceAreaListView) => {
    setView(nextView);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleFilter = () => {
    setPage(1);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(pagination.items.map((item) => item.id)));
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
      showStatus("Select at least one service area.");
      return;
    }

    if (bulkAction === "trash") {
      for (const id of selectedIds) {
        deleteServiceArea(id);
      }

      setRefreshKey((current) => current + 1);
      showStatus(`Moved ${selectedIds.size} service area(s) to trash.`);
      setSelectedIds(new Set());
      setBulkAction("");
      return;
    }

    showStatus(`Applied "${bulkAction}" to ${selectedIds.size} service area(s).`);
    setSelectedIds(new Set());
    setBulkAction("");
  };

  return (
    <div className="admin-posts-list admin-sa-list">
      <ul className="admin-posts-views">
        {SERVICE_AREA_LIST_VIEWS.map((item, index) => {
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
        <li>
          <span className="admin-posts-view-sep"> | </span>
          <Link href="/admin/service-areas/nested" className="admin-posts-view-link">
            Nested View
          </Link>
        </li>
      </ul>

      <ServiceAreasTablenav
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
        <table className="admin-posts-table admin-sa-table">
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
              <th scope="col" className="admin-posts-col-title">
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
              <th scope="col" className="admin-sa-col-featured">
                Featured Image
              </th>
              <th scope="col" className="admin-sa-col-archive">
                Archive Only
              </th>
              <th scope="col" className="admin-posts-col-seo">
                SEO Details
              </th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="admin-posts-empty">
                  No service areas found.{" "}
                  <Link href="/admin/service-areas/new">Add your first service area</Link>.
                </td>
              </tr>
            ) : (
              pagination.items.map((item) => (
                <tr key={item.id}>
                  <th scope="row" className="admin-posts-col-check">
                    <input
                      type="checkbox"
                      aria-label={`Select ${item.title}`}
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </th>
                  <td className="admin-posts-col-title">
                    <Link
                      href={`/admin/service-areas/${item.id}`}
                      className="admin-posts-title-link"
                    >
                      {item.listTitle}
                    </Link>
                    <ServiceAreaStatusLabel item={item} />
                  </td>
                  <td className="admin-posts-col-author">{item.author}</td>
                  <td className="admin-posts-col-date">
                    {item.dateType === "published" ? "Published" : "Last Modified"}
                    <br />
                    {formatServiceAreaListDate(item.date)}
                  </td>
                  <td className="admin-posts-col-id">{item.numericId}</td>
                  <td className="admin-sa-col-featured">
                    {item.hasFeaturedImage ? "Yes" : "No"}
                  </td>
                  <td className="admin-sa-col-archive">{item.archiveOnly ? "Yes" : "No"}</td>
                  <td className="admin-posts-col-seo">
                    <ServiceAreaSeoCell item={item} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ServiceAreasTablenav
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
