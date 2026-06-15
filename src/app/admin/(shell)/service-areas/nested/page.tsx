"use client";

import dynamic from "next/dynamic";

const ServiceAreaNestedViewManager = dynamic(
  () =>
    import("@/components/admin/service-areas/ServiceAreaNestedViewManager").then(
      (module) => module.ServiceAreaNestedViewManager,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="admin-sa-nested-page">
        <p className="admin-sa-nested-loading">Loading service areas…</p>
      </div>
    ),
  },
);

export default function AdminServiceAreaNestedViewPage() {
  return <ServiceAreaNestedViewManager />;
}
