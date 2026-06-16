"use client";

import { useState } from "react";
import { FormEditorCanvas } from "@/components/admin/forms/FormEditorCanvas";
import { FormEditorSidebar } from "@/components/admin/forms/FormEditorSidebar";
import { FormEditorToolbar } from "@/components/admin/forms/FormEditorToolbar";
import { PLACEHOLDER_FORM_CANVAS_FIELDS } from "@/lib/admin/formEditorFields";

type FormEditorProps = {
  formId: number;
};

export function FormEditor({ formId }: FormEditorProps) {
  const [statusMessage, setStatusMessage] = useState("");

  const handleSave = () => {
    setStatusMessage("Form saved.");
    window.setTimeout(() => setStatusMessage(""), 2500);
  };

  return (
    <div className="admin-form-editor admin-form-editor-page">
      <FormEditorToolbar
        formId={formId}
        activeTab="edit"
        showEditActions
        onSave={handleSave}
      />

      {statusMessage ? (
        <p className="admin-posts-status-message" role="status">
          {statusMessage}
        </p>
      ) : null}

      <div className="admin-form-editor-layout">
        <div className="admin-form-editor-canvas-wrap">
          <FormEditorCanvas fields={PLACEHOLDER_FORM_CANVAS_FIELDS} />
        </div>
        <FormEditorSidebar />
      </div>
    </div>
  );
}
