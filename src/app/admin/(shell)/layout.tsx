import { cookies } from "next/headers";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { AdminShellProviders } from "@/components/admin/AdminShellProviders";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import {
  ADMIN_DEV_OPT_OUT_COOKIE,
  bypassAdminUser,
  isDevBypassSessionActive,
} from "@/lib/admin/auth";
import { siteConfig } from "@/lib/admin/config";
import { isSuperAdminEmail } from "@/lib/admin/usersData";
import { createClient } from "@/lib/supabase/server";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const bypass = isDevBypassSessionActive(
    cookieStore.get(ADMIN_DEV_OPT_OUT_COOKIE)?.value,
  );

  const supabase = bypass ? null : await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  let displayName: string | null = bypass ? bypassAdminUser.displayName : null;
  const userEmail: string | null | undefined = bypass
    ? bypassAdminUser.email
    : user?.email;

  if (user && supabase) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!error) {
      displayName = profile?.display_name ?? null;
    }
  }

  const canManageUsers = bypass || isSuperAdminEmail(userEmail);

  return (
    <AdminShellProviders>
      <div className="admin-shell">
        <AdminToolbar
          userEmail={userEmail}
          displayName={displayName}
          userRole={canManageUsers ? "Super Admin" : siteConfig.defaultUserRole}
          authBypass={bypass}
        />
        <AdminSidebar canManageUsers={canManageUsers} />
        <main className="admin-main">
          <AdminContentHeader canManageUsers={canManageUsers} />
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </AdminShellProviders>
  );
}
