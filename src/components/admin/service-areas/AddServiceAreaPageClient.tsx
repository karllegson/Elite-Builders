"use client";

import { useSearchParams } from "next/navigation";
import { ServiceAreaEditor } from "@/components/admin/service-areas/ServiceAreaEditor";

export function AddServiceAreaPageClient() {
  const searchParams = useSearchParams();
  const parentId = searchParams.get("parent");

  return <ServiceAreaEditor defaultParentId={parentId} />;
}
