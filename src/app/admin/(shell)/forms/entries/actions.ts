"use server";

import { isAuthBypassEnabled } from "@/lib/admin/auth";
import {
  deleteContactSubmission,
  listContactSubmissions,
  markContactSubmissionRead,
} from "@/lib/contact/submissions.server";
import type { ContactSubmission } from "@/lib/contact/submissions.types";
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

export async function fetchContactSubmissions(): Promise<{
  available: boolean;
  message?: string;
  submissions: ContactSubmission[];
}> {
  await assertAdminAuth();
  return listContactSubmissions();
}

export async function setContactSubmissionReadAction(
  id: string,
  isRead: boolean,
): Promise<boolean> {
  await assertAdminAuth();
  return markContactSubmissionRead(id, isRead);
}

export async function deleteContactSubmissionAction(id: string): Promise<boolean> {
  await assertAdminAuth();
  return deleteContactSubmission(id);
}
