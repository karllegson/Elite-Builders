import { ServiceSubPageAdmin } from "@/components/admin/services/ServiceSubPageAdmin";
import { findServiceSubPage } from "@/lib/site/serviceSubPages";
import { notFound } from "next/navigation";

type ServiceSubPageAdminRouteProps = {
  params: Promise<{ category: string; subslug: string }>;
};

export default async function ServiceSubPageAdminRoute({
  params,
}: ServiceSubPageAdminRouteProps) {
  const { category, subslug } = await params;

  if (!findServiceSubPage(category, subslug)) {
    notFound();
  }

  return <ServiceSubPageAdmin category={category} subslug={subslug} />;
}
