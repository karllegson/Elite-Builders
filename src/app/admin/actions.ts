"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_DEV_OPT_OUT_COOKIE, isAuthBypassEnabled } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  if (!supabase) {
    redirect("/admin/login?setup=1");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_DEV_OPT_OUT_COOKIE);

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  if (isAuthBypassEnabled()) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_DEV_OPT_OUT_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  redirect("/admin/login?logged_out=1");
}
