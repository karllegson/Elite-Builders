"use client";

import { useParams } from "next/navigation";
import { FormPersonalDataSettings } from "@/components/admin/forms/FormPersonalDataSettings";
import { FormSettingsShell } from "@/components/admin/forms/FormSettingsShell";

export function FormPersonalDataPageClient() {
  const params = useParams();
  const rawId = params.id;
  const formId = typeof rawId === "string" ? Number(rawId) || 0 : 0;

  return (
    <FormSettingsShell formId={formId}>
      <FormPersonalDataSettings />
    </FormSettingsShell>
  );
}
