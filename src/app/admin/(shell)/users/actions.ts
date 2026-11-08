"use server";

import {
  createAdminUser,
  deleteAdminUsers,
  getAdminUser,
  getUsersAccess,
  isSuperAdminSession,
  listAdminUsers,
  updateAdminUser,
} from "@/lib/admin/users.server";
import {
  MIN_PASSWORD_LENGTH,
  type AdminUser,
  type SaveAdminUserInput,
} from "@/lib/admin/usersData";
import { hasAdminClient } from "@/lib/supabase/admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOT_ALLOWED_MESSAGE = "Only the super admin can manage users.";
const PROTECTED_MESSAGE = "The super admin account can't be changed from here.";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function requireAdminClient(): void {
  if (!hasAdminClient()) {
    throw new Error("Add SUPABASE_SERVICE_ROLE_KEY to .env.local to manage users.");
  }
}

async function requireSuperAdmin(): Promise<void> {
  if (!(await isSuperAdminSession())) {
    throw new Error(NOT_ALLOWED_MESSAGE);
  }

  requireAdminClient();
}

function normalizeInput(input: SaveAdminUserInput, isNew: boolean): SaveAdminUserInput {
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (isNew && !password) {
    throw new Error("Enter a password.");
  }

  if (password && password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Passwords must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  return {
    email,
    password,
    displayName: String(input.displayName ?? "").trim() || email.split("@")[0],
  };
}

/** Any signed-in admin can view the list; only the super admin can change it. */
export async function fetchUsersAction(): Promise<{
  users: AdminUser[];
  canManage: boolean;
  error?: string;
}> {
  try {
    const access = await getUsersAccess();

    if (!access) {
      throw new Error("Unauthorized");
    }

    requireAdminClient();
    return { users: await listAdminUsers(), canManage: access === "manage" };
  } catch (error) {
    return { users: [], canManage: false, error: errorMessage(error, "Could not load users.") };
  }
}

export async function fetchUserForEditAction(
  id: string,
): Promise<{ user: AdminUser | null; error?: string }> {
  try {
    await requireSuperAdmin();
    const user = await getAdminUser(id);

    if (user?.isSuperAdmin) {
      return { user: null, error: PROTECTED_MESSAGE };
    }

    return { user };
  } catch (error) {
    return { user: null, error: errorMessage(error, "Could not load the user.") };
  }
}

export async function createUserAction(
  input: SaveAdminUserInput,
): Promise<{ user?: AdminUser; error?: string }> {
  try {
    await requireSuperAdmin();
    return { user: await createAdminUser(normalizeInput(input, true)) };
  } catch (error) {
    return { error: errorMessage(error, "Could not add the user.") };
  }
}

export async function updateUserAction(
  id: string,
  input: SaveAdminUserInput,
): Promise<{ user?: AdminUser; error?: string }> {
  try {
    await requireSuperAdmin();
    const existing = await getAdminUser(id);

    if (!existing) {
      return { error: "User not found." };
    }

    if (existing.isSuperAdmin) {
      return { error: PROTECTED_MESSAGE };
    }

    return { user: await updateAdminUser(existing, normalizeInput(input, false)) };
  } catch (error) {
    return { error: errorMessage(error, "Could not update the user.") };
  }
}

export async function deleteUsersAction(
  ids: string[],
): Promise<{ deleted: number; error?: string }> {
  try {
    await requireSuperAdmin();
    const targetIds = Array.from(new Set(ids.filter((id) => typeof id === "string" && id)));

    if (targetIds.length === 0) {
      return { deleted: 0, error: "Select at least one user." };
    }

    const targets = await Promise.all(targetIds.map((id) => getAdminUser(id)));

    if (targets.some((user) => user?.isSuperAdmin)) {
      return { deleted: 0, error: PROTECTED_MESSAGE };
    }

    const { deleted, errors } = await deleteAdminUsers(targetIds);
    return errors.length > 0 ? { deleted, error: errors.join(" ") } : { deleted };
  } catch (error) {
    return { deleted: 0, error: errorMessage(error, "Could not delete users.") };
  }
}
