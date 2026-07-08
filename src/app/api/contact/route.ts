import { NextResponse, type NextRequest } from "next/server";
import {
  createContactSubmission,
  sanitizeContactSubmissionInput,
} from "@/lib/contact/submissions.server";
import type { ContactSubmissionInput } from "@/lib/contact/submissions.types";
import {
  evaluateContactSpamProtection,
  getRequestIp,
} from "@/lib/contact/spamProtection";

type ContactRequestBody = Partial<ContactSubmissionInput> & {
  website?: string;
  formLoadedAt?: number;
  turnstileToken?: string;
};

function parseFormLoadedAt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export async function POST(request: NextRequest) {
  let body: ContactRequestBody;

  try {
    body = (await request.json()) as ContactRequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const spamCheck = await evaluateContactSpamProtection({
    website: body.website,
    formLoadedAt: parseFormLoadedAt(body.formLoadedAt),
    turnstileToken: body.turnstileToken,
    remoteIp: getRequestIp(request),
  });

  if (spamCheck.blocked) {
    if (spamCheck.reason === "honeypot") {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Unable to verify submission." },
      { status: 400 },
    );
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
