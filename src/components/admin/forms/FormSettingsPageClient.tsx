"use client";

import { useParams } from "next/navigation";
import { FormSettingsEditor } from "@/components/admin/forms/FormSettingsEditor";
import { FormSettingsShell } from "@/components/admin/forms/FormSettingsShell";

export function FormSettingsPageClient() {
  const params = useParams();
  const rawId = params.id;
  const formId = typeof rawId === "string" ? Number(rawId) || 0 : 0;

  return (
    <FormSettingsShell formId={formId}>
      <FormSettingsEditor />
    </FormSettingsShell>
  );
}
