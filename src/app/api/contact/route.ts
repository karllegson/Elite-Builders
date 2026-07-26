import { NextResponse, type NextRequest } from "next/server";
import {
  createContactSubmission,
  sanitizeContactSubmissionInput,
} from "@/lib/contact/submissions.server";
import type { ContactSubmissionInput } from "@/lib/contact/submissions.types";

export async function POST(request: NextRequest) {
  let body: Partial<ContactSubmissionInput> & { website?: string };

  try {
    body = (await request.json()) as Partial<ContactSubmissionInput> & { website?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const input = sanitizeContactSubmissionInput(body);
  if (!input) {
    return NextResponse.json({ ok: false, error: "Invalid submission" }, { status: 400 });
  }

  const saved = await createContactSubmission(input);
  if (!saved) {
    return NextResponse.json(
      { ok: false, error: "Unable to save submission" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, id: saved.id });
}
