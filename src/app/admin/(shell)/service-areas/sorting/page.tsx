"use client";

import dynamic from "next/dynamic";

const ServiceAreaSortingManager = dynamic(
  () =>
    import("@/components/admin/service-areas/ServiceAreaSortingManager").then(
      (module) => module.ServiceAreaSortingManager,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="admin-sa-sort-page">
        <p className="admin-sa-sort-loading">Loading service areas…</p>
      </div>
    ),
  },
);

export default function AdminServiceAreaSortingPage() {
  return <ServiceAreaSortingManager />;
}
