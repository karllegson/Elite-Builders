"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchFaqsForAdminAction,
  saveFaqAction,
} from "@/app/admin/(shell)/faqs/actions";
import { buildFaqCategoryEditorOptions } from "@/lib/admin/faqCategoriesList";
import { buildPublishDate } from "@/lib/admin/postPublish";
import type { FaqCategory, FaqRecord, FaqStatus, FaqVisibility } from "@/lib/admin/faqsData";

const QUICK_EDIT_MONTHS = [
  { value: 0, label: "Jan" },
  { value: 1, label: "Feb" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Apr" },
  { value: 4, label: "May" },
  { value: 5, label: "Jun" },
  { value: 6, label: "Jul" },
  { value: 7, label: "Aug" },
  { value: 8, label: "Sep" },
  { value: 9, label: "Oct" },
  { value: 10, label: "Nov" },
  { value: 11, label: "Dec" },
];

const FAQ_STATUS_OPTIONS: { value: FaqStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

type DateDraft = {
  month: number;
  day: string;
  year: string;
  hour: string;
  minute: string;
};

function dateToDraft(date: Date): DateDraft {
  return {
    month: date.getMonth(),
    day: String(date.getDate()).padStart(2, "0"),
    year: String(date.getFullYear()),
    hour: String(date.getHours()).padStart(2, "0"),
    minute: String(date.getMinutes()).padStart(2, "0"),
  };
}

function draftToIso(draft: DateDraft): string {
  const day = Number.parseInt(draft.day, 10);
  const year = Number.parseInt(draft.year, 10);
  const hour = Number.parseInt(draft.hour, 10);
  const minute = Number.parseInt(draft.minute, 10);

  if (
    Number.isNaN(day) ||
    Number.isNaN(year) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return new Date().toISOString();
  }

  return buildPublishDate(draft.month, day, year, hour, minute).toISOString();
}

type FaqQuickEditRowProps = {
  faqId: string;
  onCancel: () => void;
  onUpdated: (title: string) => void;
};

export function FaqQuickEditRow({ faqId, onCancel, onUpdated }: FaqQuickEditRowProps) {
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [faqs, setFaqs] = useState<FaqRecord[]>([]);
  const [title, setTitle] = useState("");
  const [dateDraft, setDateDraft] = useState<DateDraft>(dateToDraft(new Date()));
  const [password, setPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [menuOrder, setMenuOrder] = useState("0");
  const [status, setStatus] = useState<FaqStatus>("published");

  useEffect(() => {
    void (async () => {
      const result = await fetchFaqsForAdminAction();
      const faq = result.faqs.find((item) => item.id === faqId);

      setCategories(result.categories);
      setFaqs(result.faqs);

      if (!faq) {
        setReady(true);
        return;
      }

      const sourceDate = new Date(faq.publishedAt ?? faq.updatedAt);
      setTitle(faq.title);
      setDateDraft(dateToDraft(sourceDate));
      setPassword(faq.visibility === "password" ? faq.password : "");
      setIsPrivate(faq.visibility === "private");
      setCategoryId(faq.categoryId);
      setMenuOrder(String(faq.menuOrder));
      setStatus(faq.status);
      setReady(true);
    })();
  }, [faqId]);

  const categoryOptions = useMemo(
    () => buildFaqCategoryEditorOptions(categories, faqs, "all"),
    [categories, faqs],
  );

  const selectCategory = (nextId: string) => {
    setCategoryId(categoryId === nextId ? null : nextId);
  };

  const resolveVisibility = (): FaqVisibility => {
    if (isPrivate) {
      return "private";
    }

    if (password.trim()) {
      return "password";
    }

    return "public";
  };

  const handleUpdate = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const parsedOrder = Number.parseInt(menuOrder, 10);
    const visibility = resolveVisibility();
    const publishedAt = draftToIso(dateDraft);

    const result = await saveFaqAction({
      id: faqId,
      title: trimmedTitle,
      status,
      categoryId,
      publishedAt: status === "published" ? publishedAt : null,
      menuOrder: Number.isNaN(parsedOrder) ? 0 : parsedOrder,
      visibility,
      password: visibility === "password" ? password.trim() : "",
    });

    if (result.error) {
      return;
    }

    onUpdated(trimmedTitle);
  };

  if (!ready) {
    return (
      <tr className="admin-quick-edit-row">
        <td colSpan={5}>Loading…</td>
      </tr>
    );
  }

  return (
    <tr className="admin-quick-edit-row">
      <td colSpan={5}>
        <form
          className="admin-quick-edit-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleUpdate();
          }}
        >
          <div className="admin-quick-edit-col admin-quick-edit-col-main">
            <p className="admin-quick-edit-heading">Quick Edit</p>

            <label className="admin-quick-edit-field">
              <span className="admin-quick-edit-field-label">Title</span>
              <input
                type="text"
                className="admin-quick-edit-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <fieldset className="admin-quick-edit-field admin-quick-edit-date">
              <legend className="admin-quick-edit-field-label">Date</legend>
              <div className="admin-quick-edit-date-fields">
                <input
                  type="text"
                  className="admin-quick-edit-date-part is-day"
                  value={dateDraft.day}
                  onChange={(event) =>
                    setDateDraft((current) => ({ ...current, day: event.target.value }))
                  }
                  aria-label="Day"
                />
                <select
                  className="admin-quick-edit-date-part is-month"
                  value={dateDraft.month}
                  onChange={(event) =>
                    setDateDraft((current) => ({
                      ...current,
                      month: Number.parseInt(event.target.value, 10),
                    }))
                  }
                  aria-label="Month"
                >
                  {QUICK_EDIT_MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="admin-quick-edit-date-part is-year"
                  value={dateDraft.year}
                  onChange={(event) =>
                    setDateDraft((current) => ({ ...current, year: event.target.value }))
                  }
                  aria-label="Year"
                />
                <span className="admin-quick-edit-date-at">at</span>
                <input
                  type="text"
                  className="admin-quick-edit-date-part is-hour"
                  value={dateDraft.hour}
                  onChange={(event) =>
                    setDateDraft((current) => ({ ...current, hour: event.target.value }))
                  }
                  aria-label="Hour"
                />
                <span className="admin-quick-edit-date-colon">:</span>
                <input
                  type="text"
                  className="admin-quick-edit-date-part is-minute"
                  value={dateDraft.minute}
                  onChange={(event) =>
                    setDateDraft((current) => ({ ...current, minute: event.target.value }))
                  }
                  aria-label="Minute"
                />
              </div>
            </fieldset>

            <div className="admin-quick-edit-password-row">
              <label className="admin-quick-edit-field admin-quick-edit-password">
                <span className="admin-quick-edit-field-label">Password</span>
                <input
                  type="text"
                  className="admin-quick-edit-input"
                  value={password}
                  disabled={isPrivate}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (event.target.value.trim()) {
                      setIsPrivate(false);
                    }
                  }}
                />
              </label>
              <span className="admin-quick-edit-or">-OR-</span>
              <label className="admin-quick-edit-private">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(event) => {
                    setIsPrivate(event.target.checked);
                    if (event.target.checked) {
                      setPassword("");
                    }
                  }}
                />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div className="admin-quick-edit-col admin-quick-edit-col-categories">
            <span className="admin-quick-edit-field-label">Categories</span>
            <div className="admin-quick-edit-category-list" aria-label="FAQ categories">
              {categoryOptions.length === 0 ? (
                <p className="admin-category-empty">No categories yet.</p>
              ) : (
                categoryOptions.map((option) => (
                  <label key={option.id} className="admin-category-item">
                    <input
                      type="checkbox"
                      checked={categoryId === option.id}
                      onChange={() => selectCategory(option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="admin-quick-edit-col admin-quick-edit-col-meta">
            <label className="admin-quick-edit-field">
              <span className="admin-quick-edit-field-label">Order</span>
              <input
                type="number"
                className="admin-quick-edit-input admin-quick-edit-order"
                value={menuOrder}
                onChange={(event) => setMenuOrder(event.target.value)}
              />
            </label>

            <label className="admin-quick-edit-field">
              <span className="admin-quick-edit-field-label">Status</span>
              <select
                className="admin-quick-edit-input"
                value={status}
                onChange={(event) => setStatus(event.target.value as FaqStatus)}
              >
                {FAQ_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-quick-edit-actions">
            <button type="submit" className="admin-btn-primary-inline">
              Update
            </button>
            <button type="button" className="admin-btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
