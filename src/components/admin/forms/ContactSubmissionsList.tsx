"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import {
  deleteContactSubmissionAction,
  fetchContactSubmissions,
  setContactSubmissionReadAction,
} from "@/app/admin/(shell)/forms/entries/actions";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  formatContactFormType,
  formatContactService,
  type ContactSubmission,
} from "@/lib/contact/submissions.types";

const PER_PAGE = 20;

function formatSubmittedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ContactSubmissionsList() {
  const toast = useAdminToast();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [available, setAvailable] = useState(true);
  const [notice, setNotice] = useState<string | undefined>();
  const [view, setView] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadSubmissions = () => {
    startTransition(async () => {
      const result = await fetchContactSubmissions();
      setSubmissions(result.submissions);
      setAvailable(result.available);
      setNotice(result.message);
      setSelectedId((current) =>
        current && result.submissions.some((item) => item.id === current) ? current : null,
      );
    });
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filtered = useMemo(
    () =>
      view === "unread" ? submissions.filter((item) => !item.isRead) : submissions,
    [submissions, view],
  );

  const unreadCount = useMemo(
    () => submissions.filter((item) => !item.isRead).length,
    [submissions],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const selected =
    submissions.find((item) => item.id === selectedId) ??
    visible[0] ??
    null;

  const handleMarkRead = (id: string, isRead: boolean) => {
    startTransition(async () => {
      const ok = await setContactSubmissionReadAction(id, isRead);
      if (!ok) {
        toast.error("Could not update submission.");
        return;
      }

      setSubmissions((current) =>
        current.map((item) => (item.id === id ? { ...item, isRead } : item)),
      );
      toast.success(isRead ? "Marked as read." : "Marked as unread.");
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this submission permanently?")) {
      return;
    }

    startTransition(async () => {
      const ok = await deleteContactSubmissionAction(id);
      if (!ok) {
        toast.error("Could not delete submission.");
        return;
      }

      setSubmissions((current) => current.filter((item) => item.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
      toast.success("Submission deleted.");
    });
  };

  return (
    <div className="admin-contact-submissions">
      <p className="admin-analytics-intro">
        Contact Us and Free Estimate form submissions from the live site appear here.
      </p>

      {!available && notice ? (
        <div className="admin-analytics-notice" role="status">
          {notice}
        </div>
      ) : null}

      <div className="admin-analytics-toolbar-row">
        <ul className="admin-posts-views">
          <li>
            <button
              type="button"
              className={`admin-posts-view-link${view === "all" ? " is-current" : ""}`}
              onClick={() => {
                setView("all");
                setPage(1);
              }}
            >
              All
              <span className="admin-posts-view-count"> ({submissions.length})</span>
            </button>
          </li>
          <li>
            <span className="admin-posts-view-sep"> | </span>
            <button
              type="button"
              className={`admin-posts-view-link${view === "unread" ? " is-current" : ""}`}
              onClick={() => {
                setView("unread");
                setPage(1);
              }}
            >
              Unread
              <span className="admin-posts-view-count"> ({unreadCount})</span>
            </button>
          </li>
        </ul>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={loadSubmissions}
          disabled={isPending}
        >
          {isPending ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="admin-contact-submissions-layout">
        <div className="admin-posts-table-wrap">
          <table className="admin-posts-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Phone</th>
                <th scope="col">Form</th>
                <th scope="col">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-posts-empty">
                    {available
                      ? "No submissions yet. They will appear here when someone uses the Contact or Estimate form."
                      : "Submissions unavailable until Supabase storage is connected."}
                  </td>
                </tr>
              ) : (
                visible.map((item) => (
                  <tr
                    key={item.id}
                    className={`admin-contact-submission-row${!item.isRead ? " is-unread" : ""}${
                      selected?.id === item.id ? " is-selected" : ""
                    }`}
                  >
                    <td>
                      <button
                        type="button"
                        className="admin-contact-submission-open"
                        onClick={() => {
                          setSelectedId(item.id);
                          if (!item.isRead) {
                            handleMarkRead(item.id, true);
                          }
                        }}
                      >
                        {!item.isRead ? <strong>{item.name}</strong> : item.name}
                      </button>
                    </td>
                    <td>{item.phone}</td>
                    <td>{formatContactFormType(item.formType)}</td>
                    <td>{formatSubmittedAt(item.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {filtered.length > PER_PAGE ? (
            <div className="admin-posts-pagination admin-contact-submissions-pagination">
              <button
                type="button"
                className="admin-posts-page-btn"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                ‹
              </button>
              <span className="admin-posts-page-current">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="admin-posts-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                ›
              </button>
            </div>
          ) : null}
        </div>

        <div className="admin-card admin-contact-submission-detail">
          {selected ? (
            <>
              <div className="admin-contact-submission-detail-header">
                <div>
                  <h3>{selected.name}</h3>
                  <p className="admin-contact-submission-meta">
                    {formatContactFormType(selected.formType)} ·{" "}
                    {formatSubmittedAt(selected.createdAt)}
                  </p>
                </div>
                <div className="admin-contact-submission-detail-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => handleMarkRead(selected.id, !selected.isRead)}
                    disabled={isPending}
                  >
                    Mark as {selected.isRead ? "unread" : "read"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => handleDelete(selected.id)}
                    disabled={isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <dl className="admin-contact-submission-fields">
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}>{selected.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt>City</dt>
                  <dd>{selected.city || "—"}</dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd>{formatContactService(selected.service)}</dd>
                </div>
                <div>
                  <dt>Page</dt>
                  <dd>
                    <code>{selected.pagePath}</code>
                  </dd>
                </div>
                <div>
                  <dt>Message</dt>
                  <dd>{selected.message || "—"}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="admin-analytics-empty">Select a submission to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
