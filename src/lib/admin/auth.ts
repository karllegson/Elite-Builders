/** Local dev only — set BYPASS_ADMIN_AUTH=true in .env.local */
export function isAuthBypassEnabled() {
  return (
    process.env.BYPASS_ADMIN_AUTH === "true" &&
    process.env.NODE_ENV === "development"
  );
}

export const ADMIN_DEV_OPT_OUT_COOKIE = "admin_dev_opt_out";

export const bypassAdminUser = {
  email: "dev@local.test",
  displayName: "Dev Admin",
} as const;

export function hasDevBypassOptOut(
  cookieValue: string | undefined | null,
): boolean {
  return cookieValue === "1";
}

/** Dev bypass is on and the user has not chosen to log out for this browser session. */
export function isDevBypassSessionActive(
  cookieValue: string | undefined | null,
): boolean {
  return isAuthBypassEnabled() && !hasDevBypassOptOut(cookieValue);
}
