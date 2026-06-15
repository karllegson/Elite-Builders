"use client";

import { useParams } from "next/navigation";
import { FaqEditor } from "@/components/admin/faqs/FaqEditor";

export default function AdminEditFaqPage() {
  const params = useParams<{ id: string }>();

  return <FaqEditor faqId={params.id} />;
}
