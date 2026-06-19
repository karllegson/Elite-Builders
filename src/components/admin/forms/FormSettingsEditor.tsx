"use client";

import { ArrowRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { FormToggle } from "@/components/admin/forms/FormToggle";
import {
  DEFAULT_FORM_SETTINGS,
  FORM_DESCRIPTION_PLACEMENTS,
  FORM_LABEL_PLACEMENTS,
  FORM_SUBLABEL_PLACEMENTS,
  FORM_VALIDATION_PLACEMENTS,
  type FormSettingsState,
} from "@/lib/admin/formSettings";

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
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="admin-form-settings-field">
      <label className="admin-form-settings-field-label">
        {label}
        {required ? <span className="admin-form-settings-required"> (Required)</span> : null}
      </label>
      {children}
    </div>
  );
}

export function FormSettingsEditor() {
  const toast = useAdminToast();
  const [settings, setSettings] = useState<FormSettingsState>(DEFAULT_FORM_SETTINGS);

  const updateSettings = <K extends keyof FormSettingsState>(
    key: K,
    value: FormSettingsState[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    toast.success("Form settings saved.");
  };

  return (
    <div className="admin-form-settings-editor">
      <SettingsMetabox title="Form Basics">
        <SettingsField label="Form Title" required>
          <input
            type="text"
            className="admin-form-settings-input"
            value={settings.title}
            onChange={(event) => updateSettings("title", event.target.value)}
          />
        </SettingsField>
        <SettingsField label="Form Description">
          <textarea
            className="admin-form-settings-textarea"
            rows={5}
            value={settings.description}
            onChange={(event) => updateSettings("description", event.target.value)}
          />
        </SettingsField>
      </SettingsMetabox>

      <SettingsMetabox title="Form Layout">
        <SettingsField label="Label Placement">
          <select
            className="admin-form-settings-select"
            value={settings.labelPlacement}
            onChange={(event) => updateSettings("labelPlacement", event.target.value)}
          >
            {FORM_LABEL_PLACEMENTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField label="Description Placement">
          <select
            className="admin-form-settings-select"
            value={settings.descriptionPlacement}
            onChange={(event) => updateSettings("descriptionPlacement", event.target.value)}
          >
            {FORM_DESCRIPTION_PLACEMENTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField label="Validation Message Placement">
          <select
            className="admin-form-settings-select"
            value={settings.validationPlacement}
            onChange={(event) => updateSettings("validationPlacement", event.target.value)}
          >
            {FORM_VALIDATION_PLACEMENTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField label="Sub-Label Placement">
          <select
            className="admin-form-settings-select"
            value={settings.subLabelPlacement}
            onChange={(event) => updateSettings("subLabelPlacement", event.target.value)}
          >
            {FORM_SUBLABEL_PLACEMENTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <FormToggle
          id="validation-summary"
          label="Validation Summary"
          checked={settings.validationSummary}
          onChange={(checked) => updateSettings("validationSummary", checked)}
        />

        <fieldset className="admin-form-settings-fieldset">
          <legend className="admin-form-settings-field-label">Required Field Indicator</legend>
          <label className="admin-form-settings-radio">
            <input
              type="radio"
              name="required-indicator"
              checked={settings.requiredIndicator === "text"}
              onChange={() => updateSettings("requiredIndicator", "text")}
            />
            <span>Text: (Required)</span>
          </label>
          <label className="admin-form-settings-radio">
            <input
              type="radio"
              name="required-indicator"
              checked={settings.requiredIndicator === "asterisk"}
              onChange={() => updateSettings("requiredIndicator", "asterisk")}
            />
            <span>Asterisk: *</span>
          </label>
          <label className="admin-form-settings-radio admin-form-settings-radio-custom">
            <input
              type="radio"
              name="required-indicator"
              checked={settings.requiredIndicator === "custom"}
              onChange={() => updateSettings("requiredIndicator", "custom")}
            />
            <span>Custom:</span>
            <input
              type="text"
              className="admin-form-settings-input admin-form-settings-input-inline"
              value={settings.requiredCustomText}
              disabled={settings.requiredIndicator !== "custom"}
              onChange={(event) => updateSettings("requiredCustomText", event.target.value)}
            />
          </label>
        </fieldset>

        <SettingsField label="CSS Class Name">
          <input
            type="text"
            className="admin-form-settings-input"
            value={settings.cssClassName}
            onChange={(event) => updateSettings("cssClassName", event.target.value)}
          />
        </SettingsField>
      </SettingsMetabox>

      <SettingsMetabox title="Form Button">
        <p className="admin-form-settings-notice">
          Form button settings are now located in the form editor! To edit the button settings,
          go to the form editor and click on the submit button.
        </p>
      </SettingsMetabox>

      <SettingsMetabox title="Save and Continue">
        <FormToggle
          id="save-and-continue"
          label="Enable Save and Continue"
          checked={settings.saveAndContinue}
          onChange={(checked) => updateSettings("saveAndContinue", checked)}
        />
      </SettingsMetabox>

      <SettingsMetabox title="Restrictions">
        <div className="admin-form-settings-checkbox-group">
          <p className="admin-form-settings-group-label">Limit number of entries</p>
          <label className="admin-form-settings-checkbox">
            <input
              type="checkbox"
              checked={settings.limitEntries}
              onChange={(event) => updateSettings("limitEntries", event.target.checked)}
            />
            <span>Enable entry limit</span>
          </label>
        </div>
        <div className="admin-form-settings-checkbox-group">
          <p className="admin-form-settings-group-label">Schedule Form</p>
          <label className="admin-form-settings-checkbox">
            <input
              type="checkbox"
              checked={settings.scheduleForm}
              onChange={(event) => updateSettings("scheduleForm", event.target.checked)}
            />
            <span>Schedule Form</span>
          </label>
        </div>
        <div className="admin-form-settings-checkbox-group">
          <p className="admin-form-settings-group-label">Require user to be logged in</p>
          <label className="admin-form-settings-checkbox">
            <input
              type="checkbox"
              checked={settings.requireLogin}
              onChange={(event) => updateSettings("requireLogin", event.target.checked)}
            />
            <span>Require user to be logged in</span>
          </label>
        </div>
      </SettingsMetabox>

      <SettingsMetabox title="Spam Detection">
        <FormToggle
          id="honeypot"
          label="Honeypot"
          checked={settings.honeypot}
          onChange={(checked) => updateSettings("honeypot", checked)}
        />
        {settings.honeypot ? (
          <fieldset className="admin-form-settings-fieldset admin-form-settings-fieldset-nested">
            <legend className="admin-form-settings-help">
              If the honeypot flags a submission as spam:
            </legend>
            <label className="admin-form-settings-radio">
              <input
                type="radio"
                name="honeypot-action"
                checked={settings.honeypotAction === "discard"}
                onChange={() => updateSettings("honeypotAction", "discard")}
              />
              <span>Do not create an entry</span>
            </label>
            <label className="admin-form-settings-radio">
              <input
                type="radio"
                name="honeypot-action"
                checked={settings.honeypotAction === "mark-spam"}
                onChange={() => updateSettings("honeypotAction", "mark-spam")}
              />
              <span>Create an entry and mark it as spam</span>
            </label>
          </fieldset>
        ) : null}

        <FormToggle
          id="submission-speed-check"
          label="Submission Speed Check"
          description="Flags the submission as spam if the elapsed time between page load and form submission is less than the threshold."
          checked={settings.submissionSpeedCheck}
          onChange={(checked) => updateSettings("submissionSpeedCheck", checked)}
        />

        <FormToggle
          id="custom-spam-confirmation"
          label="Custom Spam Confirmation"
          description="Allows customization of the confirmation used for spam submissions in the Confirmations area of the form."
          checked={settings.customSpamConfirmation}
          onChange={(checked) => updateSettings("customSpamConfirmation", checked)}
        />
      </SettingsMetabox>

      <SettingsMetabox title="Form Options">
        <FormToggle
          id="animated-transitions"
          label="Animated transitions"
          checked={settings.animatedTransitions}
          onChange={(checked) => updateSettings("animatedTransitions", checked)}
        />
      </SettingsMetabox>

      <button type="button" className="admin-form-settings-save" onClick={handleSave}>
        Save Settings
        <ArrowRight size={16} aria-hidden />
      </button>
    </div>
  );
}
