"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { deleteUsersAction, fetchUsersAction } from "@/app/admin/(shell)/users/actions";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { siteConfig } from "@/lib/admin/config";
import type { AdminUser } from "@/lib/admin/usersData";

function formatDate(value: string | null): string {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
  return initials.toUpperCase();
}

export function UsersList() {
  const toast = useAdminToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [isPending, startTransition] = useTransition();

  const applyResult = (result: Awaited<ReturnType<typeof fetchUsersAction>>) => {
    setUsers(result.users);
    setCanManage(result.canManage);
    setLoadError(result.error ?? null);
    setLoading(false);
  };

  const reloadUsers = async () => applyResult(await fetchUsersAction());

  useEffect(() => {
    let cancelled = false;

    void fetchUsersAction().then((result) => {
      if (!cancelled) {
        applyResult(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter(
      (user) =>
        !query ||
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [users, search]);

  const selectableUsers = canManage ? visibleUsers.filter((user) => !user.isSuperAdmin) : [];
  const allSelected =
    selectableUsers.length > 0 && selectableUsers.every((user) => selectedIds.has(user.id));

  const applySearch = () => {
    setSearch(searchInput);
    setSelectedIds(new Set());
  };

  const toggleSelected = (id: string) => {
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

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(selectableUsers.map((user) => user.id)));
  };

  const deleteUsers = (ids: string[], label: string) => {
    if (
      !window.confirm(`Delete ${label}? They will no longer be able to log in. This can't be undone.`)
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteUsersAction(ids);

      if (result.deleted > 0) {
        toast.success(`Deleted ${result.deleted} user${result.deleted === 1 ? "" : "s"}.`);
      }

      if (result.error) {
        toast.error(result.error);
      }

      setSelectedIds(new Set());
      await reloadUsers();
    });
  };

  const applyBulkAction = () => {
    if (bulkAction !== "delete") {
      return;
    }

    if (selectedIds.size === 0) {
      toast.info("Select at least one user.");
      return;
    }

    deleteUsers(
      Array.from(selectedIds),
      selectedIds.size === 1 ? "the selected user" : `these ${selectedIds.size} users`,
    );
  };

  if (loading) {
    return <p className="admin-post-editor-loading">Loading users…</p>;
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
      {canManage ? null : (
        <p className="admin-posts-status-message">
          View only — only the super admin can add, edit or delete users.
        </p>
      )}

      <ul className="admin-posts-views">
        <li>
          <span className="admin-posts-view-link is-current">
            All<span className="admin-posts-view-count"> ({users.length})</span>
          </span>
        </li>
      </ul>

      <div className="admin-posts-tablenav admin-posts-tablenav-top">
        {canManage ? (
          <div className="admin-posts-tablenav-actions">
            <label className="screen-reader-text" htmlFor="users-bulk-action">
              Select bulk action
            </label>
            <select
              id="users-bulk-action"
              className="admin-posts-select"
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value)}
            >
              <option value="">Bulk actions</option>
              <option value="delete">Delete</option>
            </select>
            <button
              type="button"
              className="admin-btn-secondary admin-posts-apply-btn"
              disabled={isPending}
              onClick={applyBulkAction}
            >
              Apply
            </button>
          </div>
        ) : null}

        <div className="admin-posts-search-wrap">
          <label className="screen-reader-text" htmlFor="users-search">
            Search Users
          </label>
          <input
            id="users-search"
            type="search"
            className="admin-posts-search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applySearch();
              }
            }}
          />
          <button type="button" className="admin-btn-secondary" onClick={applySearch}>
            Search Users
          </button>
        </div>

        <div className="admin-posts-pagination">
          <span className="admin-posts-pagination-count">
            {visibleUsers.length} {visibleUsers.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <div className="admin-posts-table-wrap">
        <table className="admin-posts-table admin-users-table">
          <thead>
            <tr>
              {canManage ? (
                <td className="admin-posts-col-check">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    disabled={selectableUsers.length === 0}
                    onChange={toggleAll}
                  />
                </td>
              ) : null}
              <th scope="col" className="admin-users-col-name">
                Name
              </th>
              <th scope="col">Email</th>
              <th scope="col" className="admin-users-col-nowrap">
                Role
              </th>
              <th scope="col" className="admin-users-col-nowrap">
                Last Login
              </th>
              <th scope="col" className="admin-users-col-nowrap">
                Registered
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 6 : 5} className="admin-posts-empty">
                  No users found.
                </td>
              </tr>
            ) : (
              visibleUsers.map((user) => (
                <tr key={user.id}>
                  {canManage ? (
                    <th scope="row" className="admin-posts-col-check">
                      {user.isSuperAdmin ? null : (
                        <input
                          type="checkbox"
                          aria-label={`Select ${user.displayName}`}
                          checked={selectedIds.has(user.id)}
                          onChange={() => toggleSelected(user.id)}
                        />
                      )}
                    </th>
                  ) : null}
                  <td className="admin-users-col-name">
                    <div className="admin-users-name">
                      <span className="admin-users-avatar" aria-hidden>
                        {getInitials(user.displayName)}
                      </span>
                      <div>
                        {user.isSuperAdmin || !canManage ? (
                          <strong>{user.displayName}</strong>
                        ) : (
                          <>
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="admin-posts-title-link"
                            >
                              {user.displayName}
                            </Link>
                            <div className="admin-categories-row-actions">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="admin-categories-row-action"
                              >
                                Edit
                              </Link>
                              <span className="admin-categories-row-action-sep" aria-hidden>
                                |
                              </span>
                              <button
                                type="button"
                                className="admin-categories-row-action admin-categories-row-action-delete"
                                disabled={isPending}
                                onClick={() => deleteUsers([user.id], user.displayName)}
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </td>
                  <td className="admin-users-col-nowrap">
                    {user.isSuperAdmin ? "Super Admin" : siteConfig.defaultUserRole}
                  </td>
                  <td className="admin-users-col-nowrap">{formatDate(user.lastSignInAt)}</td>
                  <td className="admin-users-col-nowrap">{formatDate(user.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
