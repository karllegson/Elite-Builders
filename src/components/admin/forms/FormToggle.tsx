"use client";

import { Check, X } from "lucide-react";

type FormToggleProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  stacked?: boolean;
};

export function FormToggle({
  id,
  checked,
  onChange,
  label,
  description,
  stacked = false,
}: FormToggleProps) {
  if (stacked) {
    return (
      <div className="admin-form-settings-toggle-wrap is-stacked">
        <p className="admin-form-settings-field-label">{label}</p>
        <label className="admin-form-settings-toggle-label-stacked" htmlFor={id}>
          <span className="screen-reader-text">{label}</span>
          <input
            id={id}
            type="checkbox"
            className="admin-form-settings-toggle-input"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className={`admin-form-settings-toggle${checked ? " is-on" : ""}`} aria-hidden>
            {checked ? <Check size={10} /> : <X size={10} />}
          </span>
        </label>
        {description ? <p className="admin-form-settings-help">{description}</p> : null}
      </div>
    );
  }

  return (
    <div className="admin-form-settings-toggle-wrap">
      <label className="admin-form-settings-toggle-label" htmlFor={id}>
        <span className="admin-form-settings-toggle-text">{label}</span>
        <input
          id={id}
          type="checkbox"
          className="admin-form-settings-toggle-input"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className={`admin-form-settings-toggle${checked ? " is-on" : ""}`} aria-hidden>
          {checked ? <Check size={10} /> : <X size={10} />}
        </span>
      </label>
      {description ? <p className="admin-form-settings-help">{description}</p> : null}
    </div>
  );
}
