import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isAuthBypassEnabled } from "@/lib/admin/auth";

/**
 * Office dashboard sign-in: one shared password (DASHBOARD_PASSWORD), kept as a
 * signed, expiring cookie. The password is also the signing key, so changing it
 * signs every device out.
 */
export const DASHBOARD_COOKIE = "eb_dashboard";

const SESSION_DAYS = 30;

function getPassword(): string | null {
  const password = process.env.DASHBOARD_PASSWORD?.trim();
  return password ? password : null;
}

export function isDashboardConfigured(): boolean {
  return Boolean(getPassword()) || isAuthBypassEnabled();
}

function sign(expiresAt: number, password: string): string {
  return createHmac("sha256", password).update(`dashboard:${expiresAt}`).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function checkDashboardPassword(attempt: string): boolean {
  const password = getPassword();
  return Boolean(password) && safeEqual(attempt.trim(), password as string);
}

export async function startDashboardSession(): Promise<void> {
  const password = getPassword();

  if (!password) {
    throw new Error("DASHBOARD_PASSWORD is not set.");
  }

  const expiresAt = Date.now() + SESSION_DAYS * 86_400_000;
  const cookieStore = await cookies();
  cookieStore.set(DASHBOARD_COOKIE, `${expiresAt}.${sign(expiresAt, password)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function endDashboardSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DASHBOARD_COOKIE);
}

export async function hasDashboardSession(): Promise<boolean> {
  if (isAuthBypassEnabled()) {
    return true;
  }

  const password = getPassword();

  if (!password) {
    return false;
  }

  const value = (await cookies()).get(DASHBOARD_COOKIE)?.value ?? "";
  const [expiresRaw, signature] = value.split(".");
  const expiresAt = Number(expiresRaw);

  if (!signature || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  return safeEqual(signature, sign(expiresAt, password));
}

export async function assertDashboardSession(): Promise<void> {
  if (!(await hasDashboardSession())) {
    throw new Error("Your session ended — sign in again.");
  }
}
