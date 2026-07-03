import { ServicePageEditor } from "@/components/admin/services/ServicePageEditor";

type ServicePageAdminProps = {
  params: Promise<{ slug: string }>;
};

export default async function ServicePageAdminPage({ params }: ServicePageAdminProps) {
  const { slug } = await params;
  return <ServicePageEditor slug={slug} />;
}
