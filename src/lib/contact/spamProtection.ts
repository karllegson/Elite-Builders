import { getTurnstileSiteKey } from "@/lib/contact/turnstileConfig";

export const MIN_FORM_SUBMIT_MS = 3000;

export function getTurnstileSecretKey(): string | null {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || null;
}

export function isTurnstileEnabled(): boolean {
  return Boolean(getTurnstileSiteKey() && getTurnstileSecretKey());
}

export function shouldEnforceTimingCheck(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isHoneypotTriggered(website: string | undefined): boolean {
  return Boolean(website?.trim());
}

export function isSubmissionTooFast(formLoadedAt: number | undefined): boolean {
  if (!shouldEnforceTimingCheck()) {
    return false;
  }

  if (!formLoadedAt || !Number.isFinite(formLoadedAt)) {
    return true;
  }

  return Date.now() - formLoadedAt < MIN_FORM_SUBMIT_MS;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string | null,
): Promise<boolean> {
  const secret = getTurnstileSecretKey();
  if (!secret) {
    return true;
  }

  if (!token?.trim()) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = (await response.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export type SpamBlockReason = "honeypot" | "timing" | "captcha";

export type SpamCheckResult =
  | { blocked: true; reason: SpamBlockReason }
  | { blocked: false };

export function getRequestIp(request: { headers: Headers }): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip")?.trim() || null;
}

export async function evaluateContactSpamProtection(input: {
  website?: string;
  formLoadedAt?: number;
  turnstileToken?: string;
  remoteIp?: string | null;
}): Promise<SpamCheckResult> {
  if (isHoneypotTriggered(input.website)) {
    return { blocked: true, reason: "honeypot" };
  }

  if (isSubmissionTooFast(input.formLoadedAt)) {
    return { blocked: true, reason: "timing" };
  }

  if (isTurnstileEnabled()) {
    const valid = await verifyTurnstileToken(input.turnstileToken, input.remoteIp ?? null);
    if (!valid) {
      return { blocked: true, reason: "captcha" };
    }
  }

  return { blocked: false };
}
