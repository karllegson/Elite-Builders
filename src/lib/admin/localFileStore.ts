export const SUPABASE_REQUIRED_MESSAGE =
  "Supabase is required in production. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your deployment environment.";

export const MISSING_POSTS_TABLES_MESSAGE =
  "Post tables are missing in Supabase. Run migration supabase/migrations/003_posts.sql.";

export const MISSING_SERVICE_AREAS_TABLE_MESSAGE =
  "Service areas table is missing in Supabase. Run migration supabase/migrations/005_service_areas_store.sql.";

export const MISSING_FAQS_TABLE_MESSAGE =
  "FAQs table is missing in Supabase. Run migration supabase/migrations/008_faqs_store.sql.";

/**
 * Local JSON under ./data is allowed only in local development when Supabase
 * is not configured. Never used on Vercel, Lambda, or NODE_ENV=production.
 */
export function canUseLocalFileStore(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  if (
    process.env.VERCEL === "1" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.AWS_EXECUTION_ENV
  ) {
    return false;
  }

  if (process.cwd() === "/var/task") {
    return false;
  }

  return true;
}

export function assertCanUseLocalFileStore(): void {
  if (!canUseLocalFileStore()) {
    throw new Error(SUPABASE_REQUIRED_MESSAGE);
  }
}
