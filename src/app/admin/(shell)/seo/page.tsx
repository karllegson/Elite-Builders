import { SeoDashboard } from "@/components/admin/seo/SeoDashboard";
import { loadSeoDashboardData } from "@/lib/admin/seoDashboard.server";

export default async function AdminSeoPage() {
  const data = await loadSeoDashboardData();

  return <SeoDashboard data={data} />;
}
