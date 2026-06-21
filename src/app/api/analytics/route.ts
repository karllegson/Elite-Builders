import { NextResponse, type NextRequest } from "next/server";
import { isValidAnalyticsEvent, recordSiteAnalyticsEvent } from "@/lib/analytics/server";
import type { SiteAnalyticsEventPayload } from "@/lib/analytics/types";

export async function POST(request: NextRequest) {
  let body: Partial<SiteAnalyticsEventPayload>;

  try {
    body = (await request.json()) as Partial<SiteAnalyticsEventPayload>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidAnalyticsEvent(body)) {
    return NextResponse.json({ ok: false, error: "Invalid event" }, { status: 400 });
  }

  const saved = await recordSiteAnalyticsEvent({
    eventType: body.eventType,
    pagePath: body.pagePath,
    metadata: body.metadata,
    referrer: body.referrer ?? request.headers.get("referer") ?? undefined,
  });

  if (!saved) {
    return NextResponse.json(
      { ok: false, error: "Analytics storage unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
