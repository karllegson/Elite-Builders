"use client";

import { useSearchParams } from "next/navigation";
import { ServiceAreaEditor } from "@/components/admin/service-areas/ServiceAreaEditor";
import { resolveServiceAreaParentId } from "@/lib/admin/serviceAreaEditor";

export function AddServiceAreaPageClient() {
  const searchParams = useSearchParams();
  const parentParam = searchParams.get("parent");
  const defaultParentId = resolveServiceAreaParentId(parentParam);

  return <ServiceAreaEditor defaultParentId={defaultParentId} />;
}
