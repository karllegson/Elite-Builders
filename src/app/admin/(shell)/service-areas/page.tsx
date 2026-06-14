"use client";

import dynamic from "next/dynamic";

const ServiceAreasList = dynamic(
  () =>
    import("@/components/admin/service-areas/ServiceAreasList").then(
      (module) => module.ServiceAreasList,
    ),
  {
    ssr: false,
    loading: () => <p className="admin-sa-list-loading">Loading service areas…</p>,
  },
);

export default function AdminServiceAreasPage() {
  return <ServiceAreasList />;
}
