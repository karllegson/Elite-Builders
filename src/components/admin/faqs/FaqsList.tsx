"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { FaqQuickEditRow } from "@/components/admin/faqs/FaqQuickEditRow";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  DEFAULT_FAQ_AUTHOR,
  FAQ_BULK_ACTIONS,
  FAQ_LIST_VIEWS,
  filterFaqListItems,
  formatFaqListDate,
  getFaqViewCounts,
  paginateFaqListItems,
  toFaqListItem,
  type FaqListView,
} from "@/lib/admin/faqsList";
import {
  deleteFaqsAction,
  fetchFaqsForAdminAction,
  fetchFaqCategoryByIdAction,
} from "@/app/admin/(shell)/faqs/actions";
import type { FaqListItem } from "@/lib/admin/faqsList";

const PER_PAGE = 20;

function FaqStatusLabel({ status }: { status: "published" | "draft" }) {
  if (status === "draft") {
    return (
      <>
        {" "}
        — <span className="admin-post-status-draft">Draft</span>
      </>
    );
  }

  return null;
}

type TablenavProps = {
  bulkAction: string;
  onBulkActionChange: (value: string) => void;
  onApplyBulkAction: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  position: "top" | "bottom";
};

function FaqsTablenav({
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
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
        <label className="screen-reader-text" htmlFor={`faq-bulk-${position}`}>
          Select bulk action
        </label>
        <select
          id={`faq-bulk-${position}`}
          className="admin-posts-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {FAQ_BULK_ACTIONS.map((action) => (
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
      </div>

      {position === "top" ? (
        <div className="admin-posts-search-wrap">
          <label className="screen-reader-text" htmlFor="faq-search">
            Search FAQs
          </label>
          <input
            id="faq-search"
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
            Search FAQs
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

export function FaqsList() {
  const toast = useAdminToast();
  const searchParams = useSearchParams();
  const categoryFilterId = searchParams.get("category");
  const [allItems, setAllItems] = useState<FaqListItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  const loadFaqs = useCallback(() => {
    startTransition(async () => {
      setIsLoading(true);

      const [faqsResult, categoryResult] = await Promise.all([
        fetchFaqsForAdminAction(),
        categoryFilterId
          ? fetchFaqCategoryByIdAction(categoryFilterId)
          : Promise.resolve({ category: null }),
      ]);

      if (faqsResult.error) {
        toast.error(faqsResult.error);
        setAllItems([]);
      } else {
        setAllItems(
          faqsResult.faqs.map((faq) =>
            toFaqListItem(faq, faqsResult.categories, DEFAULT_FAQ_AUTHOR),
          ),
        );
      }

      setActiveCategory(
        categoryResult.category
          ? { id: categoryResult.category.id, name: categoryResult.category.name }
          : null,
      );
      setIsLoading(false);
    });
  }, [categoryFilterId, toast]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  const viewCounts = useMemo(() => getFaqViewCounts(allItems), [allItems]);

  const [view, setView] = useState<FaqListView>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [quickEditId, setQuickEditId] = useState<string | null>(null);

  const filteredItems = useMemo(
    () =>
      filterFaqListItems(allItems, {
        view,
        search: searchQuery,
        categoryId: categoryFilterId,
      }),
    [allItems, categoryFilterId, searchQuery, view],
  );

  const pagination = useMemo(
    () => paginateFaqListItems(filteredItems, page, PER_PAGE),
    [filteredItems, page],
  );

  const allVisibleSelected =
    pagination.items.length > 0 &&
    pagination.items.every((item) => selectedIds.has(item.id));

  const showStatus = (message: string) => {
    toast.success(message);
  };

  const handleViewChange = (nextView: FaqListView) => {
    setView(nextView);
    setPage(1);
    setSelectedIds(new Set());
    setQuickEditId(null);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setPage(1);
    setSelectedIds(new Set());
    setQuickEditId(null);
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

  const handleApplyBulkAction = async () => {
    if (!bulkAction) {
      return;
    }

    if (selectedIds.size === 0) {
      showStatus("Select at least one FAQ.");
      return;
    }

    if (bulkAction === "trash") {
      const result = await deleteFaqsAction([...selectedIds]);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      loadFaqs();
      showStatus(`Moved ${selectedIds.size} FAQ(s) to trash.`);
      setSelectedIds(new Set());
      setBulkAction("");
      return;
    }

    showStatus(`Applied "${bulkAction}" to ${selectedIds.size} FAQ(s).`);
    setSelectedIds(new Set());
    setBulkAction("");
  };

  const handleTrashFaq = async (item: FaqListItem) => {
    if (!window.confirm(`Move "${item.title}" to trash?`)) {
      return;
    }

    const result = await deleteFaqsAction([item.id]);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    loadFaqs();
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(item.id);
      return next;
    });
    showStatus(`"${item.title}" moved to trash.`);
  };

  if (isLoading) {
    return <p className="admin-faqs-loading">Loading FAQs…</p>;
  }

  return (
    <div className="admin-posts-list admin-faqs-list">
      <ul className="admin-posts-views">
        {FAQ_LIST_VIEWS.map((item, index) => {
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

      {activeCategory ? (
        <p className="admin-faqs-category-filter" role="status">
          Showing FAQs in category: <strong>{activeCategory.name}</strong>{" "}
          <Link href="/admin/faqs" className="admin-inline-link">
            Clear filter
          </Link>
        </p>
      ) : null}

      <FaqsTablenav
        position="top"
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onApplyBulkAction={handleApplyBulkAction}
        searchQuery={searchInput}
        onSearchQueryChange={setSearchInput}
        onSearch={handleSearch}
        totalItems={pagination.totalItems}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />

      <div className="admin-posts-table-wrap">
        <table className="admin-posts-table admin-faqs-table">
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
              <th scope="col" className="admin-faqs-col-categories">
                Categories
              </th>
              <th scope="col" className="admin-posts-col-date">
                Date
              </th>
              <th scope="col" className="admin-posts-col-id">
                ID
              </th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-posts-empty">
                  {activeCategory
                    ? `No FAQs found in "${activeCategory.name}".`
                    : "No FAQs found."}{" "}
                  <Link href="/admin/faqs/new">Add your first FAQ</Link>.
                </td>
              </tr>
            ) : (
              pagination.items.map((item) => (
                <Fragment key={item.id}>
                  <tr className="admin-faqs-data-row">
                    <th scope="row" className="admin-posts-col-check">
                      <input
                        type="checkbox"
                        aria-label={`Select ${item.title}`}
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </th>
                    <td className="admin-posts-col-title">
                      <strong>
                        <Link href={`/admin/faqs/${item.id}`} className="admin-posts-title-link">
                          {item.title}
                        </Link>
                      </strong>
                      <FaqStatusLabel status={item.status} />
                      <div className="admin-categories-row-actions">
                        <Link
                          href={`/admin/faqs/${item.id}`}
                          className="admin-categories-row-action"
                        >
                          Edit
                        </Link>
                        <span className="admin-categories-row-action-sep" aria-hidden>
                          |
                        </span>
                        <button
                          type="button"
                          className="admin-categories-row-action"
                          onClick={() =>
                            setQuickEditId((current) => (current === item.id ? null : item.id))
                          }
                        >
                          Quick Edit
                        </button>
                        <span className="admin-categories-row-action-sep" aria-hidden>
                          |
                        </span>
                        <button
                          type="button"
                          className="admin-categories-row-action admin-categories-row-action-delete"
                          onClick={() => handleTrashFaq(item)}
                        >
                          Trash
                        </button>
                        <span className="admin-categories-row-action-sep" aria-hidden>
                          |
                        </span>
                        <button
                          type="button"
                          className="admin-categories-row-action"
                          onClick={() => showStatus("Download will be available in a future update.")}
                        >
                          Download
                        </button>
                        <span className="admin-categories-row-action-sep" aria-hidden>
                          |
                        </span>
                        <button
                          type="button"
                          className="admin-categories-row-action"
                          onClick={() => showStatus("Duplicate will be available in a future update.")}
                        >
                          Duplicate
                        </button>
                      </div>
                    </td>
                    <td className="admin-faqs-col-categories">
                      {item.categoryId && item.categoryName ? (
                        <Link
                          href={`/admin/faqs?category=${item.categoryId}`}
                          className="admin-posts-taxonomy-link"
                        >
                          {item.categoryName}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="admin-posts-col-date">
                      {item.dateType === "published" ? "Published" : "Last Modified"}
                      <br />
                      {formatFaqListDate(item.date)}
                    </td>
                    <td className="admin-posts-col-id">{item.numericId}</td>
                  </tr>
                  {quickEditId === item.id ? (
                    <FaqQuickEditRow
                      faqId={item.id}
                      onCancel={() => setQuickEditId(null)}
                      onUpdated={(title) => {
                        setQuickEditId(null);
                        loadFaqs();
                        showStatus(`"${title}" updated.`);
                      }}
                    />
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FaqsTablenav
        position="bottom"
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onApplyBulkAction={handleApplyBulkAction}
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
