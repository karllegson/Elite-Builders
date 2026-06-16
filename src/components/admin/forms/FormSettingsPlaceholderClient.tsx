"use client";

import { useParams } from "next/navigation";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { FormSettingsShell } from "@/components/admin/forms/FormSettingsShell";

export function FormSettingsPlaceholderClient({ title }: { title: string }) {
  const params = useParams();
  const rawId = params.id;
  const formId = typeof rawId === "string" ? Number(rawId) || 0 : 0;

  return (
    <FormSettingsShell formId={formId}>
      <ComingSoon />
      <p className="admin-form-settings-placeholder-label">{title}</p>
    </FormSettingsShell>
  );
}
