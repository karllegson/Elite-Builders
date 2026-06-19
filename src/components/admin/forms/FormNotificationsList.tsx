"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  DEFAULT_FORM_NOTIFICATIONS,
  sortNotifications,
  type FormNotificationItem,
  type NotificationSortDirection,
  type NotificationSortKey,
} from "@/lib/admin/formNotifications";

type SortableHeaderProps = {
  label: string;
  sortKey: NotificationSortKey;
  activeSortKey: NotificationSortKey;
  sortDirection: NotificationSortDirection;
  onSort: (key: NotificationSortKey) => void;
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

function StaticHeader({ label, className }: { label: string; className?: string }) {
  return (
    <th scope="col" className={className}>
      {label}
    </th>
  );
}

function NotificationsTableHead({
  sortKey,
  sortDirection,
  onSort,
}: {
  sortKey: NotificationSortKey;
  sortDirection: NotificationSortDirection;
  onSort: (key: NotificationSortKey) => void;
}) {
  return (
    <tr>
      <SortableHeader
        label="Name"
        sortKey="name"
        activeSortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        className="admin-form-notifications-col-name"
      />
      <StaticHeader label="Subject" className="admin-form-notifications-col-subject" />
      <StaticHeader label="Event" className="admin-form-notifications-col-event" />
      <StaticHeader label="Service" className="admin-form-notifications-col-service" />
    </tr>
  );
}

function NotificationStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`admin-forms-status-badge admin-forms-status-${isActive ? "active" : "inactive"}`}
    >
      <span aria-hidden>•</span> {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export function FormNotificationsList() {
  const toast = useAdminToast();
  const [notifications] = useState<FormNotificationItem[]>(DEFAULT_FORM_NOTIFICATIONS);
  const [sortKey, setSortKey] = useState<NotificationSortKey>("name");
  const [sortDirection, setSortDirection] = useState<NotificationSortDirection>("asc");

  const visibleNotifications = useMemo(
    () => sortNotifications(notifications, sortKey, sortDirection),
    [notifications, sortDirection, sortKey],
  );

  const handleSort = (key: NotificationSortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const handleAddNew = () => {
    toast.info("Add New notification is coming soon.");
  };

  return (
    <div className="admin-form-notifications">
      <section className="admin-form-notifications-panel">
        <header className="admin-form-notifications-header">
          <h2 className="admin-form-notifications-title">Notifications</h2>
          <button type="button" className="admin-page-title-action" onClick={handleAddNew}>
            Add New
          </button>
        </header>

        <div className="admin-form-notifications-table-wrap">
          <table className="admin-form-notifications-table">
            <thead>
              <NotificationsTableHead
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </thead>
            <tbody>
              {visibleNotifications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-posts-empty">
                    No notifications found.
                  </td>
                </tr>
              ) : (
                visibleNotifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="admin-form-notifications-col-name">
                      <div className="admin-form-notifications-name-cell">
                        <NotificationStatusBadge isActive={notification.isActive} />
                        <button type="button" className="admin-form-entries-name-link">
                          {notification.name}
                        </button>
                      </div>
                    </td>
                    <td className="admin-form-notifications-col-subject">{notification.subject}</td>
                    <td className="admin-form-notifications-col-event">{notification.event}</td>
                    <td className="admin-form-notifications-col-service">{notification.service}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <NotificationsTableHead
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
