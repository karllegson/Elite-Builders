"use client";

import {
  CheckCircle2,
  Code2,
  Eye,
  Flag,
  Save,
  Settings,
  ShieldCheck,
  Star,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FormEmbedModal } from "@/components/admin/forms/FormEmbedModal";
import { FORM_ENTRY_FORMS } from "@/lib/admin/formEntriesList";
import {
  FORM_SETTINGS_NAV,
  getFormSettingsHref,
  type FormEditorTab,
} from "@/lib/admin/formSettings";

type FormEditorToolbarProps = {
  formId: number;
  activeTab: FormEditorTab;
  showEditActions?: boolean;
  onSave?: () => void;
};

export function FormEditorToolbar({
  formId,
  activeTab,
  showEditActions = false,
  onSave,
}: FormEditorToolbarProps) {
  const pathname = usePathname();
  const [isSettingsFlyoutOpen, setIsSettingsFlyoutOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(
    FORM_ENTRY_FORMS[0]?.id ?? formId,
  );

  const isSettingsActive = activeTab === "settings";

  return (
    <>
    <div className="admin-form-entries-toolbar">
      <div className="admin-form-entries-toolbar-start">
        <label className="screen-reader-text" htmlFor="form-editor-form-select">
          Select form
        </label>
        <select
          id="form-editor-form-select"
          className="admin-form-entries-form-select"
          value={selectedFormId ?? ""}
          disabled={FORM_ENTRY_FORMS.length === 0}
          onChange={(event) => setSelectedFormId(Number(event.target.value))}
        >
          {FORM_ENTRY_FORMS.length === 0 ? (
            <option value="">No forms</option>
          ) : (
            FORM_ENTRY_FORMS.map((form) => (
              <option key={form.id} value={form.id}>
                {form.label}
              </option>
            ))
          )}
        </select>
      </div>

      <nav className="admin-form-entries-tabs" aria-label="Form sections">
        <Link
          href={`/admin/forms/${formId}/edit`}
          className={`admin-form-entries-tab${activeTab === "edit" ? " is-current" : ""}`}
          aria-current={activeTab === "edit" ? "page" : undefined}
        >
          Edit
        </Link>

        <div
          className="admin-form-entries-settings-flyout"
          onMouseEnter={() => setIsSettingsFlyoutOpen(true)}
          onMouseLeave={() => setIsSettingsFlyoutOpen(false)}
        >
          {isSettingsActive ? (
            <span className="admin-form-entries-tab is-current" aria-current="page">
              Settings
            </span>
          ) : (
            <Link
              href={getFormSettingsHref(formId)}
              className="admin-form-entries-tab admin-form-entries-settings-trigger"
            >
              Settings
            </Link>
          )}

          {isSettingsFlyoutOpen ? (
            <div
              className="admin-form-entries-settings-menu"
              role="menu"
              aria-label="Form settings sections"
            >
              {FORM_SETTINGS_NAV.map((item) => {
                const href = getFormSettingsHref(formId, item.path);
                const isActive = pathname === href;

                return (
                  <Link
                    key={item.section}
                    href={href}
                    className={`admin-form-entries-settings-item${isActive ? " is-active" : ""}`}
                    role="menuitem"
                    onClick={() => setIsSettingsFlyoutOpen(false)}
                  >
                    {item.section === "form-settings" ? (
                      <Settings size={16} aria-hidden />
                    ) : item.section === "confirmations" ? (
                      <CheckCircle2 size={16} aria-hidden />
                    ) : item.section === "notifications" ? (
                      <Flag size={16} aria-hidden />
                    ) : item.section === "personal-data" ? (
                      <UserCircle2 size={16} aria-hidden />
                    ) : item.section === "akismet" ? (
                      <ShieldCheck size={16} aria-hidden />
                    ) : (
                      <Star size={16} aria-hidden />
                    )}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <Link
          href="/admin/forms/entries"
          className={`admin-form-entries-tab${activeTab === "entries" ? " is-current" : ""}`}
          aria-current={activeTab === "entries" ? "page" : undefined}
        >
          Entries
        </Link>
      </nav>

      <div className="admin-form-editor-toolbar-actions">
        {showEditActions ? (
          <>
            <button
              type="button"
              className="admin-form-editor-action"
              onClick={() => setIsEmbedOpen(true)}
            >
              <Code2 size={16} aria-hidden />
              Embed
            </button>
            <button type="button" className="admin-form-editor-action">
              <Eye size={16} aria-hidden />
              Preview
            </button>
            <button type="button" className="admin-form-editor-save" onClick={onSave}>
              <Save size={16} aria-hidden />
              Save Form
            </button>
            <Link
              href={getFormSettingsHref(formId)}
              className="admin-form-editor-settings-gear"
              aria-label="Form settings"
            >
              <Settings size={18} aria-hidden />
            </Link>
          </>
        ) : (
          <button type="button" className="admin-form-entries-preview">
            <Eye size={16} aria-hidden />
            Preview
          </button>
        )}
      </div>
    </div>

    <FormEmbedModal
      isOpen={isEmbedOpen}
      formId={formId}
      onClose={() => setIsEmbedOpen(false)}
    />
    </>
  );
}
