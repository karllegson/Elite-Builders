import type {
  ContactFormType,
  ContactSubmission,
  ContactSubmissionInput,
} from "@/lib/contact/submissions.types";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type ContactSubmissionRow = {
  id: string;
  name: string;
  phone: string;
  city: string;
  service: string;
  message: string;
  page_path: string;
  form_type: ContactFormType;
  is_read: boolean;
  created_at: string;
};

function normalizeText(value: string | undefined, maxLength: number): string {
  return (value ?? "").trim().slice(0, maxLength);
}

function normalizePagePath(path: string | undefined): string {
  const trimmed = (path ?? "/").trim() || "/";
  return trimmed.startsWith("/") ? trimmed.slice(0, 300) : `/${trimmed}`.slice(0, 300);
}

export function sanitizeContactSubmissionInput(
  input: Partial<ContactSubmissionInput>,
): ContactSubmissionInput | null {
  const name = normalizeText(input.name, 120);
  const phone = normalizeText(input.phone, 40);

  if (name.length < 2 || phone.length < 7) {
    return null;
  }

  const formType = input.formType === "contact" ? "contact" : "estimate";

  return {
    name,
    phone,
    city: normalizeText(input.city, 120),
    service: normalizeText(input.service, 80),
    message: normalizeText(input.message, 4000),
    pagePath: normalizePagePath(input.pagePath),
    formType,
  };
}

function mapRow(row: ContactSubmissionRow): ContactSubmission {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    city: row.city,
    service: row.service,
    message: row.message,
    pagePath: row.page_path,
    formType: row.form_type,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export async function createContactSubmission(
  input: ContactSubmissionInput,
): Promise<ContactSubmission | null> {
  if (!hasAdminClient()) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({
        name: input.name,
        phone: input.phone,
        city: input.city ?? "",
        service: input.service ?? "",
        message: input.message ?? "",
        page_path: input.pagePath ?? "/",
        form_type: input.formType ?? "estimate",
      })
      .select("*")
      .single();

    if (error || !data) {
      return null;
    }

    return mapRow(data as ContactSubmissionRow);
  } catch {
    return null;
  }
}

export async function listContactSubmissions(): Promise<{
  available: boolean;
  message?: string;
  submissions: ContactSubmission[];
}> {
  if (!isSupabaseConfigured() || !hasAdminClient()) {
    return {
      available: false,
      message:
        "Connect Supabase and run migration 007_contact_submissions.sql to store form submissions.",
      submissions: [],
    };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return {
        available: false,
        message:
          error.message ??
          "Contact submissions table not found. Apply supabase/migrations/007_contact_submissions.sql.",
        submissions: [],
      };
    }

    return {
      available: true,
      submissions: ((data ?? []) as ContactSubmissionRow[]).map(mapRow),
    };
  } catch (error) {
    return {
      available: false,
      message: error instanceof Error ? error.message : "Unable to load submissions.",
      submissions: [],
    };
  }
}

export async function markContactSubmissionRead(
  id: string,
  isRead: boolean,
): Promise<boolean> {
  if (!hasAdminClient()) {
    return false;
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: isRead })
      .eq("id", id);

    return !error;
  } catch {
    return false;
  }
}

export async function deleteContactSubmission(id: string): Promise<boolean> {
  if (!hasAdminClient()) {
    return false;
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);

    return !error;
  } catch {
    return false;
  }
}
