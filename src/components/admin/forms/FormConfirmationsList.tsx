"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  CONFIRMATION_TYPE_LABELS,
  DEFAULT_FORM_CONFIRMATIONS,
  sortConfirmations,
  type ConfirmationSortDirection,
  type ConfirmationSortKey,
  type FormConfirmationItem,
} from "@/lib/admin/formConfirmations";

type SortableHeaderProps = {
  label: string;
  sortKey: ConfirmationSortKey;
  activeSortKey: ConfirmationSortKey;
  sortDirection: ConfirmationSortDirection;
  onSort: (key: ConfirmationSortKey) => void;
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

function ConfirmationsTableHead({
  sortKey,
  sortDirection,
  onSort,
}: {
  sortKey: ConfirmationSortKey;
  sortDirection: ConfirmationSortDirection;
  onSort: (key: ConfirmationSortKey) => void;
}) {
  return (
    <tr>
      <SortableHeader
        label="Name"
        sortKey="name"
        activeSortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        className="admin-form-confirmations-col-name"
      />
      <SortableHeader
        label="Type"
        sortKey="type"
        activeSortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        className="admin-form-confirmations-col-type"
      />
      <SortableHeader
        label="Content"
        sortKey="content"
        activeSortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        className="admin-form-confirmations-col-content"
      />
    </tr>
  );
}

export function FormConfirmationsList() {
  const toast = useAdminToast();
  const [confirmations] = useState<FormConfirmationItem[]>(DEFAULT_FORM_CONFIRMATIONS);
  const [sortKey, setSortKey] = useState<ConfirmationSortKey>("name");
  const [sortDirection, setSortDirection] = useState<ConfirmationSortDirection>("asc");

  const visibleConfirmations = useMemo(
    () => sortConfirmations(confirmations, sortKey, sortDirection),
    [confirmations, sortDirection, sortKey],
  );

  const handleSort = (key: ConfirmationSortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const handleAddNew = () => {
    toast.info("Add New confirmation is coming soon.");
  };

  return (
    <div className="admin-form-confirmations">
      <section className="admin-form-confirmations-panel">
        <header className="admin-form-confirmations-header">
          <h2 className="admin-form-confirmations-title">Confirmations</h2>
          <button type="button" className="admin-page-title-action" onClick={handleAddNew}>
            Add New
          </button>
        </header>

        <div className="admin-form-confirmations-table-wrap">
          <table className="admin-form-confirmations-table">
            <thead>
              <ConfirmationsTableHead
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </thead>
            <tbody>
              {visibleConfirmations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="admin-posts-empty">
                    No confirmations found.
                  </td>
                </tr>
              ) : (
                visibleConfirmations.map((confirmation) => (
                  <tr key={confirmation.id}>
                    <td className="admin-form-confirmations-col-name">
                      <button type="button" className="admin-form-entries-name-link">
                        {confirmation.name}
                      </button>
                    </td>
                    <td className="admin-form-confirmations-col-type">
                      {CONFIRMATION_TYPE_LABELS[confirmation.type]}
                    </td>
                    <td className="admin-form-confirmations-col-content">
                      <button type="button" className="admin-form-entries-name-link">
                        {confirmation.content}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <ConfirmationsTableHead
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
