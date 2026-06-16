"use client";

import { Code2 } from "lucide-react";
import type { FormCanvasField } from "@/lib/admin/formEditorFields";

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="admin-form-canvas-label">
      {label}
      {required ? <span className="admin-form-canvas-required"> *</span> : null}
    </label>
  );
}

function CanvasTextField({ field }: { field: FormCanvasField }) {
  return (
    <div className="admin-form-canvas-field">
      <FieldLabel label={field.label} required={field.required} />
      <input
        type="text"
        className="admin-form-canvas-input"
        defaultValue={field.value}
        readOnly
        aria-readonly="true"
      />
    </div>
  );
}

function CanvasTextareaField({ field }: { field: FormCanvasField }) {
  return (
    <div className="admin-form-canvas-field">
      <FieldLabel label={field.label} required={field.required} />
      <textarea className="admin-form-canvas-textarea" rows={5} readOnly aria-readonly="true" />
    </div>
  );
}

function CanvasRadioField({ field }: { field: FormCanvasField }) {
  return (
    <div className="admin-form-canvas-field">
      <FieldLabel label={field.label} required={field.required} />
      <div className="admin-form-canvas-radio-group">
        {(field.options ?? []).map((option) => (
          <label key={option} className="admin-form-canvas-radio">
            <input type="radio" name={field.id} disabled />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CanvasHtmlField({ field }: { field: FormCanvasField }) {
  return (
    <div className="admin-form-canvas-field">
      <FieldLabel label={field.label} />
      <div className="admin-form-canvas-html">
        <Code2 size={18} aria-hidden />
        <div>
          <strong>HTML CONTENT</strong>
          <p>
            This is a content placeholder. HTML content is not displayed in the form admin.
            Preview this form to view the content.
          </p>
        </div>
      </div>
    </div>
  );
}

function CanvasField({ field }: { field: FormCanvasField }) {
  if (field.type === "row" && field.children) {
    return (
      <div className="admin-form-canvas-row">
        {field.children.map((child) => (
          <CanvasField key={child.id} field={child} />
        ))}
      </div>
    );
  }

  if (field.type === "textarea") {
    return <CanvasTextareaField field={field} />;
  }

  if (field.type === "radio") {
    return <CanvasRadioField field={field} />;
  }

  if (field.type === "html") {
    return <CanvasHtmlField field={field} />;
  }

  if (field.type === "submit") {
    return (
      <div className="admin-form-canvas-field admin-form-canvas-submit-wrap">
        <button type="button" className="admin-form-canvas-submit">
          {field.label}
        </button>
      </div>
    );
  }

  return <CanvasTextField field={field} />;
}

type FormEditorCanvasProps = {
  fields: FormCanvasField[];
};

export function FormEditorCanvas({ fields }: FormEditorCanvasProps) {
  return (
    <div className="admin-form-canvas">
      {fields.map((field) => (
        <CanvasField key={field.id} field={field} />
      ))}
    </div>
  );
}
