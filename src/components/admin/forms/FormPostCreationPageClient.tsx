"use client";

import { useParams } from "next/navigation";
import { FormPostCreationList } from "@/components/admin/forms/FormPostCreationList";
import { FormSettingsShell } from "@/components/admin/forms/FormSettingsShell";

export function FormPostCreationPageClient() {
  const params = useParams();
  const rawId = params.id;
  const formId = typeof rawId === "string" ? Number(rawId) || 0 : 0;

  return (
    <FormSettingsShell formId={formId}>
      <FormPostCreationList />
    </FormSettingsShell>
  );
}
