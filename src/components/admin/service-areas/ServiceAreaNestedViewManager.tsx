"use client";

import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  buildFilteredServiceAreaTree,
  collectExpandableIds,
  filterServiceAreasForNestedView,
  flattenServiceAreaTree,
  getNestedViewCounts,
  type FlatNestedServiceAreaRow,
  type NestedListView,
} from "@/lib/admin/serviceAreasNested";
import {
  deleteServiceArea,
  listNestedServiceAreas,
  type ServiceAreaRecord,
} from "@/lib/admin/serviceAreasData";
import { getServiceAreaPublicHref } from "@/lib/site/serviceAreaUrls";

const NESTED_VIEWS: { id: NestedListView; label: string; countKey: keyof ReturnType<typeof getNestedViewCounts> }[] = [
  { id: "all", label: "All", countKey: "all" },
  { id: "published", label: "Published", countKey: "published" },
  { id: "draft", label: "Draft", countKey: "draft" },
];

type ContextMenuProps = {
  area: ServiceAreaRecord;
  onClose: () => void;
  onAction: (message: string) => void;
};

function RowContextMenu({ area, onClose, onAction }: ContextMenuProps) {
  const items = [
    { label: "Insert Service Area Before", message: "Insert before is not connected yet." },
    { label: "Insert Service Area After", message: "Insert after is not connected yet." },
    { label: "Push to Top", message: "Push to top is not connected yet." },
    { label: "Push to Bottom", message: "Push to bottom is not connected yet." },
    { label: "Clone", message: "Clone is not connected yet." },
  ];
  const canAddChild = area.parentId === null;

  return (
    <div className="admin-sa-nested-menu" role="menu">
      {canAddChild ? (
        <Link
          href={`/admin/service-areas/new?parent=${area.id}`}
          className="admin-sa-nested-menu-item"
          role="menuitem"
          onClick={onClose}
        >
          Add Child Service Area
        </Link>
      ) : null}
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          className="admin-sa-nested-menu-item"
          onClick={() => {
            onAction(`${item.label} — ${area.title}: ${item.message}`);
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

type NestedRowProps = {
  row: FlatNestedServiceAreaRow;
  expanded: boolean;
  selected: boolean;
  menuOpen: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onDelete: () => void;
  onAction: (message: string) => void;
};

function NestedServiceAreaRow({
  row,
  expanded,
  selected,
  menuOpen,
  onToggleSelect,
  onToggleExpand,
  onToggleMenu,
  onCloseMenu,
  onDelete,
  onAction,
}: NestedRowProps) {
  const { area, depth, hasChildren } = row;

  return (
    <div className="admin-sa-nested-row-wrap">
      <div
        className={`admin-sa-nested-row${selected ? " is-selected" : ""}`}
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        <span className="admin-sa-nested-drag" aria-hidden>
          <GripVertical size={14} />
        </span>

        <button
          type="button"
          className={`admin-sa-nested-expand${hasChildren ? "" : " is-spacer"}`}
          onClick={hasChildren ? onToggleExpand : undefined}
          disabled={!hasChildren}
          aria-label={hasChildren ? `Toggle ${area.title} children` : undefined}
        >
          {hasChildren ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
        </button>

        <div className="admin-sa-nested-title-wrap">
          <Link href={`/admin/service-areas/${area.id}`} className="admin-sa-nested-title">
            {depth > 0 ? `— ${area.title}` : area.title}
          </Link>
          {area.status === "draft" ? (
            <span className="admin-sa-nested-status"> — Draft</span>
          ) : null}
          {area.hidden ? (
            <span className="admin-sa-nested-hidden-badge">Hidden</span>
          ) : null}
        </div>

        <div className="admin-sa-nested-row-actions">
          <div className="admin-sa-nested-menu-wrap">
            <button
              type="button"
              className="admin-sa-nested-icon-btn"
              aria-label={`Actions for ${area.title}`}
              aria-expanded={menuOpen}
              onClick={onToggleMenu}
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen ? (
              <RowContextMenu area={area} onClose={onCloseMenu} onAction={onAction} />
            ) : null}
          </div>
          <button
            type="button"
            className="admin-sa-nested-link-btn"
            onClick={() => onAction("Quick Edit will be available in a future update.")}
          >
            Quick Edit
          </button>
          <Link
            href={getServiceAreaPublicHref(area)}
            className="admin-sa-nested-link-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            View
          </Link>
          <button
            type="button"
            className="admin-sa-nested-icon-btn admin-sa-nested-delete"
            aria-label={`Delete ${area.title}`}
            onClick={onDelete}
          >
            <Trash2 size={15} />
          </button>
          <label className="admin-sa-nested-check">
            <span className="screen-reader-text">Select {area.title}</span>
            <input type="checkbox" checked={selected} onChange={onToggleSelect} />
          </label>
        </div>
      </div>
    </div>
  );
}

export function ServiceAreaNestedViewManager() {
  const toast = useAdminToast();
  const [areas, setAreas] = useState<ServiceAreaRecord[]>(() => listNestedServiceAreas());
  const [view, setView] = useState<NestedListView>("all");
  const [showHidden, setShowHidden] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const counts = useMemo(() => getNestedViewCounts(areas), [areas]);

  const filteredAreas = useMemo(
    () =>
      filterServiceAreasForNestedView(areas, {
        view,
        showHidden,
        search: searchQuery,
      }),
    [areas, searchQuery, showHidden, view],
  );

  const tree = useMemo(
    () => buildFilteredServiceAreaTree(areas, filteredAreas),
    [areas, filteredAreas],
  );

  const rows = useMemo(
    () => flattenServiceAreaTree(tree, expandedIds),
    [expandedIds, tree],
  );

  const showStatus = (message: string) => {
    toast.success(message);
  };

  const refreshAreas = () => {
    setAreas(listNestedServiceAreas());
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setSelectedIds(new Set());
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(collectExpandableIds(tree)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const toggleExpanded = (id: string) => {
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

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Move "${title}" to trash?`)) {
      return;
    }

    deleteServiceArea(id);
    refreshAreas();
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    showStatus(`"${title}" removed.`);
  };

  const allVisibleSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.area.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(rows.map((row) => row.area.id)));
  };

  return (
    <div className="admin-sa-nested-page">
      <div className="admin-sa-nested-header">
        <div className="admin-sa-nested-header-actions">
          <Link href="/admin/service-areas/new" className="admin-btn-primary-inline">
            Add New
          </Link>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => showStatus("Add Multiple will be available in a future update.")}
          >
            Add Multiple
          </button>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={handleExpandAll}>
          Expand All
        </button>
      </div>

      <div className="admin-sa-nested-views">
        {NESTED_VIEWS.map((item, index) => (
          <span key={item.id} className="admin-sa-nested-view-item">
            {index > 0 ? <span className="admin-sa-nested-view-sep">|</span> : null}
            <button
              type="button"
              className={`admin-sa-nested-view-link${view === item.id ? " is-current" : ""}`}
              onClick={() => {
                setView(item.id);
                setSelectedIds(new Set());
              }}
            >
              {item.label}
              <span className="admin-sa-nested-view-count"> ({counts[item.countKey]})</span>
            </button>
          </span>
        ))}
        <span className="admin-sa-nested-view-sep">|</span>
        <label className="admin-sa-nested-hidden-toggle">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(event) => {
              setShowHidden(event.target.checked);
              setSelectedIds(new Set());
            }}
          />
          Show Hidden ({counts.hidden})
        </label>
      </div>

      <div className="admin-sa-nested-toolbar">
        <label className="admin-sa-nested-select-all">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleSelectAll}
            aria-label="Select all service areas"
          />
        </label>
        <div className="admin-sa-nested-search-wrap">
          <input
            type="search"
            className="admin-posts-search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search service areas"
            aria-label="Search service areas"
          />
          <button type="button" className="admin-btn-secondary" onClick={handleSearch}>
            Search Service Area
          </button>
        </div>
        {expandedIds.size > 0 ? (
          <button type="button" className="admin-inline-link" onClick={handleCollapseAll}>
            Collapse All
          </button>
        ) : null}
      </div>

      <div className="admin-sa-nested-list">
        {rows.length === 0 ? (
          <p className="admin-sa-nested-empty">
            No service areas found.{" "}
            <Link href="/admin/service-areas/new">Add your first service area</Link>.
          </p>
        ) : (
          rows.map((row) => (
            <NestedServiceAreaRow
              key={row.area.id}
              row={row}
              expanded={expandedIds.has(row.area.id)}
              selected={selectedIds.has(row.area.id)}
              menuOpen={openMenuId === row.area.id}
              onToggleSelect={() =>
                setSelectedIds((current) => {
                  const next = new Set(current);
                  if (next.has(row.area.id)) {
                    next.delete(row.area.id);
                  } else {
                    next.add(row.area.id);
                  }
                  return next;
                })
              }
              onToggleExpand={() => toggleExpanded(row.area.id)}
              onToggleMenu={() =>
                setOpenMenuId((current) => (current === row.area.id ? null : row.area.id))
              }
              onCloseMenu={() => setOpenMenuId(null)}
              onDelete={() => handleDelete(row.area.id, row.area.title)}
              onAction={showStatus}
            />
          ))
        )}
      </div>

      <p className="admin-sa-nested-footnote">
        Parent service areas (when Parent page is set to <strong>This page is the parent</strong>)
        appear in Sorting. Sub-pages with another city selected as parent appear nested under that
        service area here.
      </p>
    </div>
  );
}
