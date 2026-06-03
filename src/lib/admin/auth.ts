/** Local dev only — set BYPASS_ADMIN_AUTH=true in .env.local */
export function isAuthBypassEnabled() {
  return (
    process.env.BYPASS_ADMIN_AUTH === "true" &&
    process.env.NODE_ENV === "development"
  );
}

export const bypassAdminUser = {
  email: "dev@local.test",
  displayName: "Dev Admin",
} as const;
