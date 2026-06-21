"use server";

import { isAuthBypassEnabled } from "@/lib/admin/auth";
import { getSiteAnalyticsSummary } from "@/lib/analytics/server";
import type { SiteAnalyticsSummary } from "@/lib/analytics/types";
import { createClient } from "@/lib/supabase/server";

async function assertAdminAuth(): Promise<void> {
  if (isAuthBypassEnabled()) {
    return;
  }

  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }
}

export async function fetchAnalyticsSummary(periodDays = 30): Promise<SiteAnalyticsSummary> {
  await assertAdminAuth();
  return getSiteAnalyticsSummary(periodDays);
}
