"use client";

import { ArrowRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { FormToggle } from "@/components/admin/forms/FormToggle";
import {
  DEFAULT_FORM_PERSONAL_DATA,
  RETENTION_POLICY_OPTIONS,
  type FormPersonalDataState,
  type RetentionPolicy,
} from "@/lib/admin/formPersonalData";

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

export function FormPersonalDataSettings() {
  const toast = useAdminToast();
  const [settings, setSettings] = useState<FormPersonalDataState>(DEFAULT_FORM_PERSONAL_DATA);

  const updateSettings = <K extends keyof FormPersonalDataState>(
    key: K,
    value: FormPersonalDataState[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    toast.success("Personal data settings saved.");
  };

  return (
    <div className="admin-form-settings-editor admin-form-personal-data">
      <SettingsMetabox title="General Settings">
        <FormToggle
          id="prevent-ip-storage"
          stacked
          label="Prevent the storage of IP addresses during form submission"
          checked={settings.preventIpStorage}
          onChange={(checked) => updateSettings("preventIpStorage", checked)}
        />

        <fieldset className="admin-form-settings-fieldset">
          <legend className="admin-form-settings-field-label">Retention Policy</legend>
          {RETENTION_POLICY_OPTIONS.map((option) => (
            <label key={option.value} className="admin-form-settings-radio">
              <input
                type="radio"
                name="retention-policy"
                checked={settings.retentionPolicy === option.value}
                onChange={() => updateSettings("retentionPolicy", option.value as RetentionPolicy)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
      </SettingsMetabox>

      <SettingsMetabox title="Exporting and Erasing Data">
        <FormToggle
          id="export-erase-data"
          stacked
          label="Enable integration with the WordPress tools for exporting and erasing personal data."
          checked={settings.enableExportErase}
          onChange={(checked) => updateSettings("enableExportErase", checked)}
        />
      </SettingsMetabox>

      <button type="button" className="admin-form-settings-save" onClick={handleSave}>
        Save Settings
        <ArrowRight size={16} aria-hidden />
      </button>
    </div>
  );
}
