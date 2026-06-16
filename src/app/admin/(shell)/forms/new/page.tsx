"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FORMS_OPEN_TEMPLATES_EVENT } from "@/lib/admin/formTemplates";

export default function AdminNewFormPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/forms");
    window.dispatchEvent(new CustomEvent(FORMS_OPEN_TEMPLATES_EVENT));
  }, [router]);

  return null;
}
