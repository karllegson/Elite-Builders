"use client";

import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { FormEditorCanvas } from "@/components/admin/forms/FormEditorCanvas";
import { FormEditorSidebar } from "@/components/admin/forms/FormEditorSidebar";
import { FormEditorToolbar } from "@/components/admin/forms/FormEditorToolbar";
import { PLACEHOLDER_FORM_CANVAS_FIELDS } from "@/lib/admin/formEditorFields";

type FormEditorProps = {
  formId: number;
};

export function FormEditor({ formId }: FormEditorProps) {
  const toast = useAdminToast();

  const handleSave = () => {
    toast.success("Form saved.");
  };

  return (
    <div className="admin-form-editor admin-form-editor-page">
      <FormEditorToolbar
        formId={formId}
        activeTab="edit"
        showEditActions
        onSave={handleSave}
      />

      <div className="admin-form-editor-layout">
        <div className="admin-form-editor-canvas-wrap">
          <FormEditorCanvas fields={PLACEHOLDER_FORM_CANVAS_FIELDS} />
        </div>
        <FormEditorSidebar />
      </div>
    </div>
  );
}
