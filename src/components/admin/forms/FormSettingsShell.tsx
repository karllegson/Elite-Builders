"use client";

import { FormEditorToolbar } from "@/components/admin/forms/FormEditorToolbar";
import { FormSettingsNav } from "@/components/admin/forms/FormSettingsNav";

type FormSettingsShellProps = {
  formId: number;
  children: React.ReactNode;
};

export function FormSettingsShell({ formId, children }: FormSettingsShellProps) {
  return (
    <div className="admin-form-editor">
      <FormEditorToolbar formId={formId} activeTab="settings" />
      <div className="admin-form-settings-layout">
        <FormSettingsNav formId={formId} />
        <div className="admin-form-settings-content">{children}</div>
      </div>
    </div>
  );
}
