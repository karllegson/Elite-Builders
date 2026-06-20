"use client";

import { ArrowRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { FormToggle } from "@/components/admin/forms/FormToggle";
import {
  AKISMET_FIELD_OPTIONS,
  DEFAULT_FORM_AKISMET,
  type AkismetFieldValue,
  type FormAkismetState,
} from "@/lib/admin/formAkismet";

function SettingsMetabox({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-form-settings-metabox">
      <header className="admin-form-settings-metabox-header">{title}</header>
      <div className="admin-form-settings-metabox-body">{children}</div>
    </section>
  );
}

function SettingsField({
  label,
  mergeTags,
  children,
}: {
  label: string;
  mergeTags?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="admin-form-settings-field">
      <div className="admin-form-akismet-label-row">
        <label className="admin-form-settings-field-label">{label}</label>
        {mergeTags ? (
          <button type="button" className="admin-form-akismet-merge-btn" aria-label="Insert merge tag">
            {"{..}"}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function FormAkismetSettings() {
  const toast = useAdminToast();
  const [settings, setSettings] = useState<FormAkismetState>(DEFAULT_FORM_AKISMET);

  const updateSettings = <K extends keyof FormAkismetState>(
    key: K,
    value: FormAkismetState[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    toast.success("Akismet settings saved.");
  };

  return (
    <div className="admin-form-settings-editor admin-form-akismet">
      <SettingsMetabox title="Akismet Settings">
        <FormToggle
          id="akismet-enabled"
          stacked
          label="Enable to protect this form's entries from spam using Akismet"
          checked={settings.enabled}
          onChange={(checked) => updateSettings("enabled", checked)}
        />

        {settings.enabled ? (
          <div className="admin-form-akismet-fields">
            <SettingsField label="First Name">
              <select
                className="admin-form-settings-select"
                value={settings.firstNameField}
                onChange={(event) =>
                  updateSettings("firstNameField", event.target.value as AkismetFieldValue)
                }
              >
                {AKISMET_FIELD_OPTIONS.filter((option) => option.value !== "").map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </SettingsField>

            <SettingsField label="Last Name">
              <select
                className="admin-form-settings-select"
                value={settings.lastNameField}
                onChange={(event) =>
                  updateSettings("lastNameField", event.target.value as AkismetFieldValue)
                }
              >
                {AKISMET_FIELD_OPTIONS.filter((option) => option.value !== "").map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </SettingsField>

            <SettingsField label="Email">
              <select
                className="admin-form-settings-select"
                value={settings.emailField}
                onChange={(event) =>
                  updateSettings("emailField", event.target.value as AkismetFieldValue)
                }
              >
                {AKISMET_FIELD_OPTIONS.filter((option) => option.value !== "").map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </SettingsField>

            <SettingsField label="Website">
              <select
                className="admin-form-settings-select"
                value={settings.websiteField}
                onChange={(event) =>
                  updateSettings("websiteField", event.target.value as AkismetFieldValue)
                }
              >
                {AKISMET_FIELD_OPTIONS.map((option) => (
                  <option key={option.value || "empty"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </SettingsField>

            <SettingsField label="Subject" mergeTags>
              <input
                type="text"
                className="admin-form-settings-input"
                value={settings.subject}
                onChange={(event) => updateSettings("subject", event.target.value)}
              />
            </SettingsField>

            <SettingsField label="Content" mergeTags>
              <textarea
                className="admin-form-settings-textarea admin-form-akismet-content"
                rows={4}
                value={settings.content}
                onChange={(event) => updateSettings("content", event.target.value)}
              />
            </SettingsField>
          </div>
        ) : null}
      </SettingsMetabox>

      <button type="button" className="admin-form-settings-save" onClick={handleSave}>
        Save Settings
        <ArrowRight size={16} aria-hidden />
      </button>
    </div>
  );
}
