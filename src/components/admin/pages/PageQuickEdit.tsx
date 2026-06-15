"use client";

import type { ReactNode } from "react";
import {
  getPageQuickEditNumericId,
  PAGE_QUICK_EDIT_AUTHORS,
  PAGE_QUICK_EDIT_MONTHS,
  PAGE_QUICK_EDIT_STATUSES,
  PAGE_QUICK_EDIT_TEMPLATES,
  type PageQuickEditTab,
  type PageQuickEditValues,
} from "@/lib/admin/pageQuickEdit";
import type { FlatPageRow } from "@/lib/admin/pagesList";

type PageQuickEditProps = {
  row: FlatPageRow;
  values: PageQuickEditValues;
  activeTab: PageQuickEditTab;
  onTabChange: (tab: PageQuickEditTab) => void;
  onChange: (values: PageQuickEditValues) => void;
  onCancel: () => void;
  onUpdate: () => void;
};

function QuickEditField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`admin-pages-quick-edit-field${className ? ` ${className}` : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export function PageQuickEdit({
  row,
  values,
  activeTab,
  onTabChange,
  onChange,
  onCancel,
  onUpdate,
}: PageQuickEditProps) {
  const fieldId = (name: string) => `page-quick-edit-${row.id}-${name}`;
  const numericId = getPageQuickEditNumericId(row.id);

  const patch = (next: Partial<PageQuickEditValues>) => {
    onChange({ ...values, ...next });
  };

  return (
    <div className="admin-pages-quick-edit" role="region" aria-label={`Quick edit ${row.title}`}>
      <div className="admin-pages-quick-edit-header">
        <div className="admin-pages-quick-edit-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            id={fieldId("tab-page")}
            aria-selected={activeTab === "page"}
            aria-controls={fieldId("panel-page")}
            className={`admin-pages-quick-edit-tab${activeTab === "page" ? " is-active" : ""}`}
            onClick={() => onTabChange("page")}
          >
            Page
          </button>
          <button
            type="button"
            role="tab"
            id={fieldId("tab-menu")}
            aria-selected={activeTab === "menu"}
            aria-controls={fieldId("panel-menu")}
            className={`admin-pages-quick-edit-tab${activeTab === "menu" ? " is-active" : ""}`}
            onClick={() => onTabChange("menu")}
          >
            Menu Options
          </button>
        </div>
        <span className="admin-pages-quick-edit-id">Quick Edit ID: {numericId}</span>
      </div>

      {activeTab === "page" ? (
        <div
          id={fieldId("panel-page")}
          role="tabpanel"
          aria-labelledby={fieldId("tab-page")}
          className="admin-pages-quick-edit-body admin-pages-quick-edit-body-page"
        >
          <div className="admin-pages-quick-edit-col">
            <QuickEditField label="Title" htmlFor={fieldId("title")}>
              <input
                id={fieldId("title")}
                type="text"
                className="admin-pages-quick-edit-input"
                value={values.title}
                onChange={(event) => patch({ title: event.target.value })}
              />
            </QuickEditField>

            <QuickEditField label="Slug" htmlFor={fieldId("slug")}>
              <input
                id={fieldId("slug")}
                type="text"
                className="admin-pages-quick-edit-input"
                value={values.slug}
                onChange={(event) => patch({ slug: event.target.value })}
              />
            </QuickEditField>

            <div className="admin-pages-quick-edit-field">
              <span className="admin-pages-quick-edit-label">Date</span>
              <div className="admin-pages-quick-edit-date">
                <select
                  id={fieldId("month")}
                  className="admin-pages-quick-edit-select admin-pages-quick-edit-date-month"
                  value={values.month}
                  onChange={(event) => patch({ month: event.target.value })}
                  aria-label="Month"
                >
                  {PAGE_QUICK_EDIT_MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <input
                  id={fieldId("day")}
                  type="text"
                  className="admin-pages-quick-edit-input admin-pages-quick-edit-date-part"
                  value={values.day}
                  onChange={(event) => patch({ day: event.target.value })}
                  aria-label="Day"
                />
                <input
                  id={fieldId("year")}
                  type="text"
                  className="admin-pages-quick-edit-input admin-pages-quick-edit-date-part"
                  value={values.year}
                  onChange={(event) => patch({ year: event.target.value })}
                  aria-label="Year"
                />
                <span className="admin-pages-quick-edit-date-at">at</span>
                <input
                  id={fieldId("hour")}
                  type="text"
                  className="admin-pages-quick-edit-input admin-pages-quick-edit-date-part"
                  value={values.hour}
                  onChange={(event) => patch({ hour: event.target.value })}
                  aria-label="Hour"
                />
                <span className="admin-pages-quick-edit-date-colon">:</span>
                <input
                  id={fieldId("minute")}
                  type="text"
                  className="admin-pages-quick-edit-input admin-pages-quick-edit-date-part"
                  value={values.minute}
                  onChange={(event) => patch({ minute: event.target.value })}
                  aria-label="Minute"
                />
              </div>
            </div>

            <QuickEditField label="Author" htmlFor={fieldId("author")}>
              <select
                id={fieldId("author")}
                className="admin-pages-quick-edit-select"
                value={values.author}
                onChange={(event) => patch({ author: event.target.value })}
              >
                {PAGE_QUICK_EDIT_AUTHORS.map((author) => (
                  <option key={author.value} value={author.value}>
                    {author.label}
                  </option>
                ))}
              </select>
            </QuickEditField>

            <QuickEditField label="Status" htmlFor={fieldId("status")}>
              <select
                id={fieldId("status")}
                className="admin-pages-quick-edit-select"
                value={values.status}
                onChange={(event) =>
                  patch({ status: event.target.value as PageQuickEditValues["status"] })
                }
              >
                {PAGE_QUICK_EDIT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </QuickEditField>
          </div>

          <div className="admin-pages-quick-edit-col">
            <QuickEditField label="Template" htmlFor={fieldId("template")}>
              <select
                id={fieldId("template")}
                className="admin-pages-quick-edit-select"
                value={values.template}
                onChange={(event) => patch({ template: event.target.value })}
              >
                {PAGE_QUICK_EDIT_TEMPLATES.map((template) => (
                  <option key={template.value} value={template.value}>
                    {template.label}
                  </option>
                ))}
              </select>
            </QuickEditField>

            <div className="admin-pages-quick-edit-field">
              <span className="admin-pages-quick-edit-label">Password</span>
              <div className="admin-pages-quick-edit-password-row">
                <input
                  id={fieldId("password")}
                  type="text"
                  className="admin-pages-quick-edit-input"
                  value={values.password}
                  onChange={(event) => patch({ password: event.target.value })}
                />
                <span className="admin-pages-quick-edit-or">—OR—</span>
                <label className="admin-pages-quick-edit-checkbox">
                  <input
                    type="checkbox"
                    checked={values.isPrivate}
                    onChange={(event) => patch({ isPrivate: event.target.checked })}
                  />
                  <span>Private</span>
                </label>
              </div>
            </div>

            <label className="admin-pages-quick-edit-checkbox admin-pages-quick-edit-checkbox-block">
              <input
                type="checkbox"
                checked={values.allowComments}
                onChange={(event) => patch({ allowComments: event.target.checked })}
              />
              <span>Allow Comments</span>
            </label>

            <label className="admin-pages-quick-edit-checkbox admin-pages-quick-edit-checkbox-block">
              <input
                type="checkbox"
                checked={values.hideInNestedPages}
                onChange={(event) => patch({ hideInNestedPages: event.target.checked })}
              />
              <span>Hide in Nested Pages</span>
            </label>
          </div>
        </div>
      ) : (
        <div
          id={fieldId("panel-menu")}
          role="tabpanel"
          aria-labelledby={fieldId("tab-menu")}
          className="admin-pages-quick-edit-body admin-pages-quick-edit-body-menu"
        >
          <div className="admin-pages-quick-edit-menu-fields">
            <QuickEditField label="Navigation Label" htmlFor={fieldId("nav-label")}>
              <input
                id={fieldId("nav-label")}
                type="text"
                className="admin-pages-quick-edit-input"
                value={values.navigationLabel}
                onChange={(event) => patch({ navigationLabel: event.target.value })}
              />
            </QuickEditField>

            <QuickEditField label="Title Attribute" htmlFor={fieldId("title-attr")}>
              <input
                id={fieldId("title-attr")}
                type="text"
                className="admin-pages-quick-edit-input"
                value={values.titleAttribute}
                onChange={(event) => patch({ titleAttribute: event.target.value })}
              />
            </QuickEditField>

            <QuickEditField label="CSS Classes" htmlFor={fieldId("css-classes")}>
              <input
                id={fieldId("css-classes")}
                type="text"
                className="admin-pages-quick-edit-input"
                value={values.cssClasses}
                onChange={(event) => patch({ cssClasses: event.target.value })}
              />
            </QuickEditField>

            <QuickEditField label="Custom URL" htmlFor={fieldId("custom-url")}>
              <input
                id={fieldId("custom-url")}
                type="text"
                className="admin-pages-quick-edit-input"
                placeholder="Example: #"
                value={values.customUrl}
                onChange={(event) => patch({ customUrl: event.target.value })}
              />
            </QuickEditField>
          </div>

          <div className="admin-pages-quick-edit-menu-checks">
            <label className="admin-pages-quick-edit-checkbox admin-pages-quick-edit-checkbox-block">
              <input
                type="checkbox"
                checked={values.hideInNavMenu}
                onChange={(event) => patch({ hideInNavMenu: event.target.checked })}
              />
              <span>Hide in Nav Menu</span>
            </label>

            <label className="admin-pages-quick-edit-checkbox admin-pages-quick-edit-checkbox-block">
              <input
                type="checkbox"
                checked={values.openInNewTab}
                onChange={(event) => patch({ openInNewTab: event.target.checked })}
              />
              <span>Open link in a new window/tab</span>
            </label>
          </div>
        </div>
      )}

      <div className="admin-pages-quick-edit-footer">
        <button type="button" className="admin-pages-quick-edit-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="admin-pages-quick-edit-update" onClick={onUpdate}>
          Update
        </button>
      </div>
    </div>
  );
}
