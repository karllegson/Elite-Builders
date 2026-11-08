import { SuperAdminOnlyNotice } from "@/components/admin/users/SuperAdminOnlyNotice";
import { UserEditor } from "@/components/admin/users/UserEditor";
import { isSuperAdminSession } from "@/lib/admin/users.server";

type AdminEditUserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditUserPage({ params }: AdminEditUserPageProps) {
  const [{ id }, canManage] = await Promise.all([params, isSuperAdminSession()]);
  return canManage ? <UserEditor key={id} userId={id} /> : <SuperAdminOnlyNotice />;
}
