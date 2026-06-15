"use client";

import { useParams } from "next/navigation";
import { ServiceAreaEditor } from "@/components/admin/service-areas/ServiceAreaEditor";

export default function AdminEditServiceAreaPage() {
  const params = useParams<{ id: string }>();
  const serviceAreaId = params.id;

  if (!serviceAreaId) {
    return <p className="admin-post-editor-status">Service area not found.</p>;
  }

  return <ServiceAreaEditor serviceAreaId={serviceAreaId} />;
}
