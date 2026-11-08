import { siteConfig } from "@/lib/admin/config";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  isSuperAdmin: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

export type SaveAdminUserInput = {
  email: string;
  displayName: string;
  /** Required for new users; blank when editing keeps the current password. */
  password: string;
};

export const MIN_PASSWORD_LENGTH = 8;

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === siteConfig.superAdminEmail;
}
