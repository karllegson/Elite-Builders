import { Suspense } from "react";
import { FaqsList } from "@/components/admin/faqs/FaqsList";

export default function AdminFaqsPage() {
  return (
    <Suspense fallback={<p className="admin-faqs-loading">Loading FAQs…</p>}>
      <FaqsList />
    </Suspense>
  );
}
