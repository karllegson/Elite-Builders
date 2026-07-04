import { ServicePageEditor } from "@/components/admin/services/ServicePageEditor";

type ServicePageAdminProps = {
  params: Promise<{ category: string }>;
};

export default async function ServicePageAdminPage({ params }: ServicePageAdminProps) {
  const { category } = await params;
  return <ServicePageEditor slug={category} />;
}
