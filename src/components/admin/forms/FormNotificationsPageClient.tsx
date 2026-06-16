"use client";

import { useParams } from "next/navigation";
import { FormNotificationsList } from "@/components/admin/forms/FormNotificationsList";
import { FormSettingsShell } from "@/components/admin/forms/FormSettingsShell";

export function FormNotificationsPageClient() {
  const params = useParams();
  const rawId = params.id;
  const formId = typeof rawId === "string" ? Number(rawId) || 0 : 0;

  return (
    <FormSettingsShell formId={formId}>
      <FormNotificationsList />
    </FormSettingsShell>
  );
}
