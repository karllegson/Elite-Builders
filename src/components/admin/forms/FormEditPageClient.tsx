"use client";

import { useParams } from "next/navigation";
import { FormEditor } from "@/components/admin/forms/FormEditor";

export function FormEditPageClient() {
  const params = useParams();
  const rawId = params.id;
  const formId = typeof rawId === "string" ? Number(rawId) || 0 : 0;

  return <FormEditor formId={formId} />;
}
