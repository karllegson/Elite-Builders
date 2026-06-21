"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  ChevronDown,
  ChevronRight,
  Copy,
  FilePlus2,
  GripVertical,
  Link2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { PageQuickEdit } from "@/components/admin/pages/PageQuickEdit";
import {
  getDefaultQuickEditValues,
  type PageQuickEditTab,
  type PageQuickEditValues,
} from "@/lib/admin/pageQuickEdit";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { ensureServiceAreasStoreReady } from "@/lib/admin/serviceAreasSync.client";
import {
  listAllServiceAreas,
  SERVICE_AREAS_CHANGED_EVENT,
} from "@/lib/admin/serviceAreasData";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  countPages,
  filterPageRows,
  flattenPageTree,
  getDefaultExpandedPageIds,
  getSitePages,
  getViewLabel,
  PAGE_LIST_VIEWS,
  PAGE_ROW_MORE_MENU_ITEMS,
  type FlatPageRow,
  type PageListView,
  type PageRowMoreMenuAction,
  type PageTreeItem,
} from "@/lib/admin/pagesList";

const PAGE_ROW_MENU_ICONS: Record<
  PageRowMoreMenuAction,
  ReactNode
> = {
  "add-child-link": <Link2 size={16} aria-hidden />,
  "add-child-page": <FilePlus2 size={16} aria-hidden />,
  "insert-before": <ArrowUpToLine size={16} aria-hidden />,
  "insert-after": <ArrowDownToLine size={16} aria-hidden />,
  "push-top": <ArrowUp size={16} aria-hidden />,
  "push-bottom": <ArrowDown size={16} aria-hidden />,
  clone: <Copy size={16} aria-hidden />,
};

function PageRowMoreMenu({
  row,
  isOpen,
  onToggle,
  onClose,
  onSelect,
}: {
  row: FlatPageRow;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (action: PageRowMoreMenuAction) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={menuRef}
      className={`admin-pages-more-menu-wrap${isOpen ? " is-open" : ""}`}
    >
      <button
        type="button"
        className="admin-pages-icon-btn"
        aria-label={`More actions for ${row.title}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        <MoreHorizontal size={16} aria-hidden />
      </button>
      {isOpen ? (
        <ul className="admin-pages-more-menu" role="menu">
          {PAGE_ROW_MORE_MENU_ITEMS.map((item) => {
            const isDisabled = item.disabled?.(row) ?? false;

            return (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="admin-pages-more-menu-item"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }

                    onSelect(item.id);
                    onClose();
                  }}
                >
                  <span className="admin-pages-more-menu-icon">
                    {PAGE_ROW_MENU_ICONS[item.id]}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function PageRow({
  row,
  isExpanded,
  isSelected,
  isMoreMenuOpen,
  isQuickEditOpen,
  onToggleExpand,
  onToggleSelect,
  onToggleMoreMenu,
  onCloseMoreMenu,
  onMoreMenuAction,
  onQuickEdit,
}: {
  row: FlatPageRow;
  isExpanded: boolean;
  isSelected: boolean;
  isMoreMenuOpen: boolean;
  isQuickEditOpen: boolean;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleMoreMenu: (id: string) => void;
  onCloseMoreMenu: () => void;
  onMoreMenuAction: (row: FlatPageRow, action: PageRowMoreMenuAction) => void;
  onQuickEdit: () => void;
}) {
  return (
    <div
      className={`admin-pages-row${isMoreMenuOpen ? " is-more-menu-open" : ""}${isQuickEditOpen ? " is-quick-edit-active" : ""}`}
    >
      <div
        className="admin-pages-row-main"
        style={{ paddingLeft: `${12 + row.depth * 24}px` }}
      >
        {row.hasChildren ? (
          <button
            type="button"
            className="admin-pages-expand-btn"
            aria-label={isExpanded ? "Collapse section" : "Expand section"}
            aria-expanded={isExpanded}
            onClick={() => onToggleExpand(row.id)}
          >
            {isExpanded ? (
              <ChevronDown size={14} aria-hidden />
            ) : (
              <ChevronRight size={14} aria-hidden />
            )}
          </button>
        ) : (
          <span className="admin-pages-expand-spacer" aria-hidden />
        )}

        <span className="admin-pages-drag-handle" aria-hidden>
          <GripVertical size={14} />
        </span>

        <div className="admin-pages-row-title-wrap">
          {row.href ? (
            <Link href={row.href} className="admin-pages-title-link" target="_blank" rel="noopener noreferrer">
              {row.title}
            </Link>
          ) : (
            <span className="admin-pages-title-link">{row.title}</span>
          )}
          {row.suffix ? (
            <span className="admin-pages-title-suffix"> — {row.suffix}</span>
          ) : null}
        </div>
      </div>

      <div className="admin-pages-row-actions">
        <div className="admin-pages-row-hover-actions admin-pages-row-hover-actions-end">
          {row.adminHref ? (
            <Link href={row.adminHref} className="admin-btn-secondary admin-pages-action-btn">
              Edit
            </Link>
          ) : null}
          {row.href ? (
            <Link
              href={row.href}
              className="admin-btn-secondary admin-pages-action-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </Link>
          ) : null}
        </div>
        <label className="admin-pages-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(row.id)}
            aria-label={`Select ${row.title}`}
          />
        </label>
      </div>
    </div>
  );
}

export function PagesManager({ initialView = "all" }: { initialView?: PageListView }) {
  const toast = useAdminToast();
  const [pages, setPages] = useState<PageTreeItem[]>(() => getSitePages());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(getDefaultExpandedPageIds(getSitePages())),
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<PageListView>(initialView);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncMenu, setSyncMenu] = useState(false);
  const [openMoreMenuId, setOpenMoreMenuId] = useState<string | null>(null);
  const [quickEditRowId, setQuickEditRowId] = useState<string | null>(null);
  const [quickEditTab, setQuickEditTab] = useState<PageQuickEditTab>("page");
  const [quickEditDraft, setQuickEditDraft] = useState<PageQuickEditValues | null>(
    null,
  );

  const counts = useMemo(() => countPages(pages), [pages]);

  const flatRows = useMemo(
    () => flattenPageTree(pages, expandedIds),
    [expandedIds, pages],
  );

  const visibleRows = useMemo(
    () => filterPageRows(flatRows, view, searchQuery),
    [flatRows, searchQuery, view],
  );

  const quickEditRow = useMemo(
    () => flatRows.find((item) => item.id === quickEditRowId) ?? null,
    [flatRows, quickEditRowId],
  );

  useEffect(() => {
    const refreshPages = () => {
      const nextPages = getSitePages(listAllServiceAreas());
      setPages(nextPages);
      setExpandedIds((current) => {
        const next = new Set(current);
        next.add("service-areas");
        for (const id of getDefaultExpandedPageIds(nextPages)) {
          next.add(id);
        }
        return next;
      });
    };

    void ensureServiceAreasStoreReady().then(refreshPages);

    window.addEventListener(SERVICE_AREAS_CHANGED_EVENT, refreshPages);
    window.addEventListener("storage", refreshPages);

    return () => {
      window.removeEventListener(SERVICE_AREAS_CHANGED_EVENT, refreshPages);
      window.removeEventListener("storage", refreshPages);
    };
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(getDefaultExpandedPageIds(pages)));
    toast.success("All sections expanded.");
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

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const toggleMoreMenu = (id: string) => {
    setOpenMoreMenuId((current) => (current === id ? null : id));
  };

  const handleMoreMenuAction = (
    row: FlatPageRow,
    action: PageRowMoreMenuAction,
  ) => {
    const label =
      PAGE_ROW_MORE_MENU_ITEMS.find((item) => item.id === action)?.label ??
      action;

    toast.success(`${label} — ${row.title}`);
  };

  const openQuickEdit = (row: FlatPageRow) => {
    setOpenMoreMenuId(null);
    setQuickEditRowId(row.id);
    setQuickEditTab("page");
    setQuickEditDraft(getDefaultQuickEditValues(row));
  };

  const closeQuickEdit = () => {
    setQuickEditRowId(null);
    setQuickEditDraft(null);
    setQuickEditTab("page");
  };

  useEffect(() => {
    if (!quickEditRowId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeQuickEdit();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [quickEditRowId]);

  const handleQuickEditUpdate = () => {
    const row = flatRows.find((item) => item.id === quickEditRowId);

    if (row) {
      toast.success(`Page updated — ${row.title}`);
    }

    closeQuickEdit();
  };

  return (
    <div className="admin-pages-manager">
      <p className="admin-categories-status-message" role="status">
        Read-only mirror of live routes. <strong>Service Areas</strong> is a page — city landing
        pages (e.g. Stockton, CA) and their sub-pages nest underneath. Edit those in{" "}
        <Link href="/admin/service-areas">Service Areas</Link>. Other pages still require a pages
        CMS or code changes.
      </p>
      <div className="admin-pages-toolbar-top">
        <label className="admin-pages-sync-menu">
          <input
            type="checkbox"
            checked={syncMenu}
            onChange={(event) => setSyncMenu(event.target.checked)}
          />
          <span>Sync Menu</span>
        </label>
        <button type="button" className="admin-btn-secondary" onClick={expandAll}>
          Expand All
        </button>
      </div>

      <ul className="admin-pages-views">
        {PAGE_LIST_VIEWS.map((item, index) => {
          const isActive = view === item.value;
          const label =
            item.value === "hidden"
              ? getViewLabel("hidden", counts)
              : item.label;

          return (
            <li key={item.value}>
              {index > 0 ? <span className="admin-pages-view-sep"> | </span> : null}
              <button
                type="button"
                className={`admin-pages-view-link${isActive ? " is-current" : ""}`}
                onClick={() => setView(item.value)}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="admin-pages-search-wrap">
        <label className="screen-reader-text" htmlFor="pages-search">
          Search Pages
        </label>
        <input
          id="pages-search"
          type="search"
          className="admin-pages-search-input"
          placeholder=""
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
          Search Pages
        </button>
      </div>

      <div className="admin-pages-list-wrap">
        {visibleRows.length === 0 ? (
          <p className="admin-pages-empty">No pages found.</p>
        ) : (
          visibleRows.map((row) => (
            <PageRow
              key={row.id}
              row={row}
              isExpanded={expandedIds.has(row.id)}
              isSelected={selectedIds.has(row.id)}
              isMoreMenuOpen={openMoreMenuId === row.id}
              isQuickEditOpen={quickEditRowId === row.id}
              onToggleExpand={toggleExpand}
              onToggleSelect={toggleSelect}
              onToggleMoreMenu={toggleMoreMenu}
              onCloseMoreMenu={() => setOpenMoreMenuId(null)}
              onMoreMenuAction={handleMoreMenuAction}
              onQuickEdit={() => openQuickEdit(row)}
            />
          ))
        )}
      </div>

      {quickEditRow && quickEditDraft ? (
        <div
          className="admin-pages-quick-edit-overlay"
          role="presentation"
          onClick={closeQuickEdit}
        >
          <div
            className="admin-pages-quick-edit-floating"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`page-quick-edit-title-${quickEditRow.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <span id={`page-quick-edit-title-${quickEditRow.id}`} className="screen-reader-text">
              Quick edit {quickEditRow.title}
            </span>
            <PageQuickEdit
              row={quickEditRow}
              values={quickEditDraft}
              activeTab={quickEditTab}
              onTabChange={setQuickEditTab}
              onChange={setQuickEditDraft}
              onCancel={closeQuickEdit}
              onUpdate={handleQuickEditUpdate}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
