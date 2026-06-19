"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  readSiteConfigValues,
  siteConfigSections,
  writeSiteConfigValues,
  type SiteConfigField,
  type SiteConfigSection,
  type SiteConfigValues,
} from "@/lib/admin/siteConfigSettings";

function renderField(
  field: SiteConfigField,
  values: SiteConfigValues,
  onChange: (key: string, value: string) => void,
) {
  const commonProps = {
    id: field.key,
    name: field.key,
    value: values[field.key] ?? "",
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(field.key, event.target.value),
  };

  if (field.type === "textarea") {
    return <textarea className="admin-site-config-input admin-site-config-textarea" {...commonProps} />;
  }

  if (field.type === "select") {
    return (
      <select className="admin-site-config-input admin-site-config-select" {...commonProps}>
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return <input type="text" className="admin-site-config-input" {...commonProps} />;
}

function SectionForm({
  section,
  values,
  onChange,
  onSave,
}: {
  section: SiteConfigSection;
  values: SiteConfigValues;
  onChange: (key: string, value: string) => void;
  onSave: () => void;
}) {
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave();
  };

  return (
    <form className="admin-site-config-form" onSubmit={onSubmit}>
      <p className="admin-site-config-heading">{section.heading}</p>
      <table className="admin-site-config-table">
        <tbody>
          {section.fields.map((field) => (
            <tr key={field.key}>
              <th scope="row">
                <label htmlFor={field.key}>{field.label}</label>
              </th>
              <td>
                {renderField(field, values, onChange)}
                {field.help ? <p className="admin-site-config-help">{field.help}</p> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="admin-site-config-submit-wrap">
        <button type="submit" className="admin-btn-primary-inline">
          Save Changes
        </button>
      </p>
    </form>
  );
}

export function SiteConfigSettings() {
  const toast = useAdminToast();
  const [activeSectionId, setActiveSectionId] = useState(siteConfigSections[0]?.id ?? "");
  const [values, setValues] = useState<SiteConfigValues>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValues(readSiteConfigValues());
    setReady(true);
  }, []);

  const activeSection = useMemo(
    () => siteConfigSections.find((section) => section.id === activeSectionId) ?? siteConfigSections[0],
    [activeSectionId],
  );

  const handleSave = () => {
    writeSiteConfigValues(values);
    toast.success(`Saved ${activeSection.label} settings.`);
  };

  const handleChange = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  if (!ready || !activeSection) {
    return <p className="admin-faqs-loading">Loading settings…</p>;
  }

  return (
    <div className="admin-site-config-page">
      <p className="admin-site-config-description">
        Configure the information displayed on your site.
      </p>

      <nav className="admin-site-config-tabs" aria-label="Site config sections">
        {siteConfigSections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`admin-site-config-tab${activeSectionId === section.id ? " is-active" : ""}`}
            onClick={() => setActiveSectionId(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <SectionForm
        section={activeSection}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
      />
    </div>
  );
}

