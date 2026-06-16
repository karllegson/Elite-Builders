"use client";

import { useParams } from "next/navigation";
import { FormAkismetSettings } from "@/components/admin/forms/FormAkismetSettings";
import { FormSettingsShell } from "@/components/admin/forms/FormSettingsShell";

export function FormAkismetPageClient() {
  const params = useParams();
  const rawId = params.id;
  const formId = typeof rawId === "string" ? Number(rawId) || 0 : 0;

  return (
    <FormSettingsShell formId={formId}>
      <FormAkismetSettings />
    </FormSettingsShell>
  );
}
