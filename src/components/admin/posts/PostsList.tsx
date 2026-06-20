"use client";

import { Link2, ExternalLink, CornerDownLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  bulkPostsAction,
  fetchPostsForAdmin,
} from "@/app/admin/(shell)/posts/actions";
import {
  BULK_ACTIONS,
  filterPosts,
  formatPostListDate,
  getPostCategoryOptions,
  getPostDateOptions,
  getPostViewCounts,
  paginatePosts,
  POST_LIST_VIEWS,
  type PostListItem,
  type PostListView,
} from "@/lib/admin/postsList";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";

const PER_PAGE = 20;

function PostStatusLabel({ post }: { post: PostListItem }) {
  if (post.status === "draft") {
    return (
      <>
        {" "}
        — <span className="admin-post-status-draft">Draft</span>
      </>
    );
  }

  if (post.status === "scheduled") {
    return (
      <>
        {" "}
        — <span className="admin-post-status-draft">Scheduled</span>
      </>
    );
  }

  return null;
}

function SeoDetailsCell({ post }: { post: PostListItem }) {
  return (
    <div className="admin-posts-seo-details">
      <span className="admin-posts-seo-badge">N/A</span>
      <div className="admin-posts-seo-line">
        <strong>Keyword:</strong> {post.seoKeyword ?? "Not Set"}
      </div>
      <div className="admin-posts-seo-line">
        <strong>Schema:</strong> {post.seoSchema}
      </div>
      <div className="admin-posts-seo-links">
        <span title="Internal links">
          <Link2 size={14} aria-hidden />
          {post.internalLinks}
        </span>
        <span title="External links">
          <ExternalLink size={14} aria-hidden />
          {post.externalLinks}
        </span>
        <span title="Backlinks">
          <CornerDownLeft size={14} aria-hidden />
          {post.backlinks}
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
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryOptions: string[];
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

function PostsTablenav({
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
  dateFilter,
  onDateFilterChange,
  dateOptions,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
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
        <label className="screen-reader-text" htmlFor={`bulk-action-${position}`}>
          Select bulk action
        </label>
        <select
          id={`bulk-action-${position}`}
          className="admin-posts-select"
          value={bulkAction}
          onChange={(event) => onBulkActionChange(event.target.value)}
        >
          {BULK_ACTIONS.map((action) => (
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
            <label className="screen-reader-text" htmlFor={`filter-date-${position}`}>
              Filter by date
            </label>
            <select
              id={`filter-date-${position}`}
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

            <label className="screen-reader-text" htmlFor={`filter-category-${position}`}>
              Filter by category
            </label>
            <select
              id={`filter-category-${position}`}
              className="admin-posts-select"
              value={categoryFilter}
              onChange={(event) => onCategoryFilterChange(event.target.value)}
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
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
          <label className="screen-reader-text" htmlFor="posts-search">
            Search Posts
          </label>
          <input
            id="posts-search"
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
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={onSearch}
          >
            Search Posts
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

export function PostsList() {
  const router = useRouter();
  const [allPosts, setAllPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const viewCounts = useMemo(() => getPostViewCounts(allPosts), [allPosts]);
  const dateOptions = useMemo(() => getPostDateOptions(allPosts), [allPosts]);
  const categoryOptions = useMemo(() => getPostCategoryOptions(allPosts), [allPosts]);

  const [view, setView] = useState<PostListView>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const toast = useAdminToast();

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await fetchPostsForAdmin();
      setAllPosts(result.items);

      if (result.error) {
        setLoadError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load posts.";
      setAllPosts([]);
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(
    () =>
      filterPosts(allPosts, {
        view,
        search: searchQuery,
        dateFilter,
        categoryFilter,
      }),
    [allPosts, categoryFilter, dateFilter, searchQuery, view],
  );

  const pagination = useMemo(
    () => paginatePosts(filteredPosts, page, PER_PAGE),
    [filteredPosts, page],
  );

  const allVisibleSelected =
    pagination.items.length > 0 &&
    pagination.items.every((post) => selectedIds.has(post.id));

  const handleViewChange = (nextView: PostListView) => {
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
        for (const post of pagination.items) {
          next.delete(post.id);
        }
        return next;
      });
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      for (const post of pagination.items) {
        next.add(post.id);
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
      toast.info("Select at least one post.");
      return;
    }

    const ids = Array.from(selectedIds);

    if (bulkAction === "edit") {
      if (ids.length === 1) {
        router.push(`/admin/posts/new?post=${ids[0]}`);
        return;
      }

      toast.info("Select only one post to edit.");
      return;
    }

    if (bulkAction === "trash") {
      const result = await bulkPostsAction(ids, "trash");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `Moved ${result.updated} post${result.updated === 1 ? "" : "s"} to trash.`,
        );
      }
      setSelectedIds(new Set());
      setBulkAction("");
      await loadPosts();
      return;
    }

    if (bulkAction === "restore") {
      const result = await bulkPostsAction(ids, "restore");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `Restored ${result.updated} post${result.updated === 1 ? "" : "s"}.`,
        );
      }
      setSelectedIds(new Set());
      setBulkAction("");
      await loadPosts();
      return;
    }

    if (bulkAction === "delete") {
      const result = await bulkPostsAction(ids, "delete");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `Deleted ${result.updated} post${result.updated === 1 ? "" : "s"} permanently.`,
        );
      }
      setSelectedIds(new Set());
      setBulkAction("");
      await loadPosts();
    }
  };

  if (isLoading) {
    return <p className="admin-post-editor-loading">Loading posts…</p>;
  }

  if (loadError) {
    return (
      <p className="admin-categories-status-message admin-post-editor-status" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <div className="admin-posts-list">
      <ul className="admin-posts-views">
        {POST_LIST_VIEWS.map((item, index) => {
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

      <PostsTablenav
        position="top"
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onApplyBulkAction={handleApplyBulkAction}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        dateOptions={dateOptions}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categoryOptions={categoryOptions}
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
        <table className="admin-posts-table">
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
              <th scope="col" className="admin-posts-col-categories">
                Categories
              </th>
              <th scope="col" className="admin-posts-col-tags">
                Tags
              </th>
              <th scope="col" className="admin-posts-col-date">
                Date
              </th>
              <th scope="col" className="admin-posts-col-id">
                ID
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
                  No posts found.
                </td>
              </tr>
            ) : (
              pagination.items.map((post) => (
                <tr key={post.id}>
                  <th scope="row" className="admin-posts-col-check">
                    <input
                      type="checkbox"
                      aria-label={`Select ${post.title}`}
                      checked={selectedIds.has(post.id)}
                      onChange={() => toggleSelect(post.id)}
                    />
                  </th>
                  <td className="admin-posts-col-title">
                    <Link
                      href={`/admin/posts/new?post=${post.id}`}
                      className="admin-posts-title-link"
                    >
                      {post.title}
                    </Link>
                    <PostStatusLabel post={post} />
                  </td>
                  <td className="admin-posts-col-author">{post.author}</td>
                  <td className="admin-posts-col-categories">
                    {post.categories.map((category, index) => (
                      <span key={category}>
                        {index > 0 ? ", " : null}
                        <button type="button" className="admin-posts-taxonomy-link">
                          {category}
                        </button>
                      </span>
                    ))}
                  </td>
                  <td className="admin-posts-col-tags">
                    {post.tags.length > 0
                      ? post.tags.map((tag, index) => (
                          <span key={tag}>
                            {index > 0 ? ", " : null}
                            <button type="button" className="admin-posts-taxonomy-link">
                              {tag}
                            </button>
                          </span>
                        ))
                      : "—"}
                  </td>
                  <td className="admin-posts-col-date">
                    {post.dateType === "modified" ? "Last Modified" : "Published"}
                    <br />
                    {formatPostListDate(post.date)}
                  </td>
                  <td className="admin-posts-col-id">{post.numericId}</td>
                  <td className="admin-posts-col-seo">
                    <SeoDetailsCell post={post} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PostsTablenav
        position="bottom"
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onApplyBulkAction={handleApplyBulkAction}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        dateOptions={dateOptions}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categoryOptions={categoryOptions}
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
