import type { AdminUserAttributes, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { ADMIN_DEV_OPT_OUT_COOKIE, isDevBypassSessionActive } from "@/lib/admin/auth";
import {
  isSuperAdminEmail,
  type AdminUser,
  type SaveAdminUserInput,
} from "@/lib/admin/usersData";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const LIST_PAGE_SIZE = 1000;

/**
 * "manage" for the super admin (or local dev bypass), "view" for any other
 * signed-in admin, null when signed out.
 */
export async function getUsersAccess(): Promise<"manage" | "view" | null> {
  const cookieStore = await cookies();

  if (isDevBypassSessionActive(cookieStore.get(ADMIN_DEV_OPT_OUT_COOKIE)?.value)) {
    return "manage";
  }

  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return isSuperAdminEmail(user.email) ? "manage" : "view";
}

export async function isSuperAdminSession(): Promise<boolean> {
  return (await getUsersAccess()) === "manage";
}

function toAdminUser(user: User, displayName: string | null | undefined): AdminUser {
  const email = user.email ?? "";

  return {
    id: user.id,
    email,
    displayName: displayName || email.split("@")[0] || "—",
    isSuperAdmin: isSuperAdminEmail(email),
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const client = createAdminClient();
  const users: User[] = [];

  for (let page = 1; ; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: LIST_PAGE_SIZE });

    if (error) {
      throw new Error(error.message);
    }

    users.push(...data.users);

    if (data.users.length < LIST_PAGE_SIZE) {
      break;
    }
  }

  const { data: profiles, error } = await client.from("profiles").select("id, display_name");

  if (error) {
    throw new Error(error.message);
  }

  const names = new Map(
    (profiles as { id: string; display_name: string | null }[]).map((profile) => [
      profile.id,
      profile.display_name,
    ]),
  );

  return users
    .map((user) => toAdminUser(user, names.get(user.id)))
    .sort((a, b) => Number(b.isSuperAdmin) - Number(a.isSuperAdmin) || a.displayName.localeCompare(b.displayName));
}

export async function getAdminUser(id: string): Promise<AdminUser | null> {
  const client = createAdminClient();
  const { data, error } = await client.auth.admin.getUserById(id);

  if (error) {
    // Unknown or malformed ids come back as 404 / 400.
    if (error.status === 404 || error.status === 400) {
      return null;
    }

    throw new Error(error.message);
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("display_name")
    .eq("id", id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return toAdminUser(data.user, profile?.display_name);
}

export async function createAdminUser(input: SaveAdminUserInput): Promise<AdminUser> {
  const client = createAdminClient();
  // The on_auth_user_created trigger copies display_name into profiles.
  const { data, error } = await client.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { display_name: input.displayName },
  });

  if (error) {
    throw new Error(error.message);
  }

  return toAdminUser(data.user, input.displayName);
}

export async function updateAdminUser(
  existing: AdminUser,
  input: SaveAdminUserInput,
): Promise<AdminUser> {
  const client = createAdminClient();
  const attributes: AdminUserAttributes = { user_metadata: { display_name: input.displayName } };

  if (input.email !== existing.email) {
    attributes.email = input.email;
    attributes.email_confirm = true;
  }

  if (input.password) {
    attributes.password = input.password;
  }

  const { data, error } = await client.auth.admin.updateUserById(existing.id, attributes);

  if (error) {
    throw new Error(error.message);
  }

  const { error: profileError } = await client
    .from("profiles")
    .upsert({ id: existing.id, display_name: input.displayName, updated_at: new Date().toISOString() });

  if (profileError) {
    throw new Error(profileError.message);
  }

  return toAdminUser(data.user, input.displayName);
}

export async function deleteAdminUsers(ids: string[]): Promise<{ deleted: number; errors: string[] }> {
  const client = createAdminClient();
  const errors: string[] = [];
  let deleted = 0;

  for (const id of ids) {
    const { error } = await client.auth.admin.deleteUser(id);

    if (error) {
      errors.push(error.message);
    } else {
      deleted += 1;
    }
  }

  return { deleted, errors };
}
