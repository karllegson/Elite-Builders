import { Suspense } from "react";
import { AddServiceAreaPageClient } from "@/components/admin/service-areas/AddServiceAreaPageClient";

export default function AdminAddServiceAreaPage() {
  return (
    <Suspense fallback={<p className="admin-post-editor-status">Loading editor…</p>}>
      <AddServiceAreaPageClient />
    </Suspense>
  );
}
