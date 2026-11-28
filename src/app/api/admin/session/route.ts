import { NextResponse } from "next/server";
import { getSiteAdminSession, type SiteAdminSession } from "@/lib/admin/getSiteAdminSession";

/**
 * Admin-bar check for the public site. Pages stay cached; the browser only calls this
 * when it holds a Supabase auth cookie (or in local dev for the auth bypass).
 */
export async function GET() {
  const session = await getSiteAdminSession().catch((): SiteAdminSession => ({ isAdmin: false }));

  return NextResponse.json(
    session.isAdmin
      ? {
          isAdmin: true,
          displayName: session.displayName ?? "Admin",
          email: session.email ?? null,
          authBypass: session.authBypass ?? false,
        }
      : { isAdmin: false },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
