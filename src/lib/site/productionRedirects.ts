import { NextResponse, type NextRequest } from "next/server";

const PRIMARY_HOST = "www.elitebuildersco.com";

/** Production-only HTTPS + canonical www redirects (Phase 1 SEO). */
export function applyProductionSeoRedirects(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const proto = request.headers.get("x-forwarded-proto");
  const url = request.nextUrl.clone();
  let shouldRedirect = false;

  if (proto === "http") {
    url.protocol = "https:";
    shouldRedirect = true;
  }

  if (host === "elitebuildersco.com") {
    url.host = PRIMARY_HOST;
    url.protocol = "https:";
    shouldRedirect = true;
  }

  if (!shouldRedirect) {
    return null;
  }

  return NextResponse.redirect(url, 301);
}
