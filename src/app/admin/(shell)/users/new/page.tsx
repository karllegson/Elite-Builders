import { SuperAdminOnlyNotice } from "@/components/admin/users/SuperAdminOnlyNotice";
import { UserEditor } from "@/components/admin/users/UserEditor";
import { isSuperAdminSession } from "@/lib/admin/users.server";

export default async function AdminAddUserPage() {
  return (await isSuperAdminSession()) ? <UserEditor /> : <SuperAdminOnlyNotice />;
}
