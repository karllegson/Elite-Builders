import { cookies } from "next/headers";
import {
  ADMIN_DEV_OPT_OUT_COOKIE,
  bypassAdminUser,
  isDevBypassSessionActive,
} from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export type SiteAdminSession = {
  isAdmin: boolean;
  displayName?: string;
  email?: string | null;
  authBypass?: boolean;
};

export async function getSiteAdminSession(): Promise<SiteAdminSession> {
  const cookieStore = await cookies();
  const devBypassActive = isDevBypassSessionActive(
    cookieStore.get(ADMIN_DEV_OPT_OUT_COOKIE)?.value,
  );

  if (devBypassActive) {
    return {
      isAdmin: true,
      displayName: bypassAdminUser.displayName,
      email: bypassAdminUser.email,
      authBypass: true,
    };
  }

  const hasAuthCookie = cookieStore
    .getAll()
    .some(
      (cookie) =>
        cookie.name.includes("auth-token") ||
        (cookie.name.startsWith("sb-") && cookie.value.length > 0),
    );

  if (!hasAuthCookie) {
    return { isAdmin: false };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { isAdmin: false };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false };
  }

  let displayName = user.email?.split("@")[0] ?? "Admin";

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.display_name) {
    displayName = profile.display_name;
  }

  return {
    isAdmin: true,
    displayName,
    email: user.email,
    authBypass: false,
  };
}
