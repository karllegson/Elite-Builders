"use client";

import { useTransition } from "react";
import {
  deleteMessageAction,
  markMessageReadAction,
} from "@/app/dashboard/actions";
import {
  formatContactFormType,
  formatContactService,
  type ContactSubmission,
} from "@/lib/contact/submissions.types";

function formatReceived(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

/** Contact Us and Free Estimate submissions from the website, newest first. */
export default function MessagesList({
  messages,
  unavailable,
  onChange,
  onError,
}: {
  messages: ContactSubmission[];
  unavailable: string | null;
  onChange: (messages: ContactSubmission[]) => void;
  onError: (error: string | null) => void;
}) {
  const [, startTransition] = useTransition();

  if (unavailable) {
    return <p className="db-empty">{unavailable}</p>;
  }

  if (messages.length === 0) {
    return <p className="db-empty">No website messages yet.</p>;
  }

  const setRead = (message: ContactSubmission, isRead: boolean) => {
    onError(null);
    const apply = (value: boolean) =>
      messages.map((item) =>
        item.id === message.id ? { ...item, isRead: value } : item,
      );
    onChange(apply(isRead));

    startTransition(async () => {
      const result = await markMessageReadAction(message.id, isRead);

      if (result.error) {
        onChange(apply(message.isRead));
        onError(result.error);
      }
    });
  };

  const remove = (message: ContactSubmission) => {
    if (
      !window.confirm(
        `Delete the message from ${message.name}? This can't be undone.`,
      )
    ) {
      return;
    }

    onError(null);
    onChange(messages.filter((item) => item.id !== message.id));

    startTransition(async () => {
      const result = await deleteMessageAction(message.id);

      if (result.error) {
        onChange(messages);
        onError(result.error);
      }
    });
  };

  const renderMessage = (message: ContactSubmission) => {
    const details = [
      message.city,
      message.service ? formatContactService(message.service) : "",
      formatContactFormType(message.formType),
    ].filter(Boolean);

    return (
      <li
        key={message.id}
        className={`db-row db-msg${message.isRead ? " db-row--resolved" : ""}`}
      >
        <div className="db-msg-head">
          <div className="db-job-title">
            <strong>
              {message.isRead ? null : (
                <span className="db-dot" aria-label="Unread" />
              )}
              {message.name}
            </strong>
            <span>{details.join(" · ")}</span>
          </div>
          <span className="db-msg-date">
            {formatReceived(message.createdAt)}
          </span>
        </div>

        <div className="db-msg-contact">
          <a
            href={`tel:${message.phone.replace(/[^\d+]/g, "")}`}
            className="db-btn db-btn--ghost"
          >
            {message.phone}
          </a>
          {message.email ? (
            <a
              href={`mailto:${message.email}`}
              className="db-btn db-btn--ghost"
            >
              {message.email}
            </a>
          ) : null}
          <button
            type="button"
            className="db-link db-row-push"
            onClick={() => setRead(message, !message.isRead)}
          >
            {message.isRead ? "Mark unread" : "Mark read"}
          </button>
          <button
            type="button"
            className="db-link db-link--danger-only"
            onClick={() => remove(message)}
          >
            Delete
          </button>
        </div>

        {message.message ? (
          <p className="db-msg-body">{message.message}</p>
        ) : null}
      </li>
    );
  };

  const unread = messages.filter((message) => !message.isRead);
  const read = messages.filter((message) => message.isRead);

  // New on the left, read on the right; stacks (new first) on a phone.
  return (
    <div className="db-msg-columns">
      <section className="db-msg-column" aria-label="New messages">
        <h2 className="db-msg-column-head">
          New <span className="db-tab-count">{unread.length}</span>
        </h2>
        {unread.length > 0 ? (
          <ul className="db-list">{unread.map(renderMessage)}</ul>
        ) : (
          <p className="db-empty">All caught up.</p>
        )}
      </section>
      <section className="db-msg-column" aria-label="Read messages">
        <h2 className="db-msg-column-head">
          Read <span className="db-tab-count">{read.length}</span>
        </h2>
        {read.length > 0 ? (
          <ul className="db-list">{read.map(renderMessage)}</ul>
        ) : (
          <p className="db-empty">Messages you mark read move here.</p>
        )}
      </section>
    </div>
  );
}
