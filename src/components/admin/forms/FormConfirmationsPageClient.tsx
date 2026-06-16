"use client";

import { useParams } from "next/navigation";
import { FormConfirmationsList } from "@/components/admin/forms/FormConfirmationsList";
import { FormSettingsShell } from "@/components/admin/forms/FormSettingsShell";

export function FormConfirmationsPageClient() {
  const params = useParams();
  const rawId = params.id;
  const formId = typeof rawId === "string" ? Number(rawId) || 0 : 0;

  return (
    <FormSettingsShell formId={formId}>
      <FormConfirmationsList />
    </FormSettingsShell>
  );
}
