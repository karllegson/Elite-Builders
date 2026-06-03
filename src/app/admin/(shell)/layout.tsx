import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { bypassAdminUser, isAuthBypassEnabled } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bypass = isAuthBypassEnabled();

  const supabase = bypass ? null : await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  let displayName: string | null = bypass ? bypassAdminUser.displayName : null;
  let userEmail: string | null | undefined = bypass
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

  return (
    <div className="admin-shell">
      <AdminTopBar
        userEmail={userEmail}
        displayName={displayName}
        authBypass={bypass}
      />
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
