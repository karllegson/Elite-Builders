import { NextResponse, type NextRequest } from "next/server";
import { applyProductionSeoRedirects } from "@/lib/site/productionRedirects";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const seoRedirect = applyProductionSeoRedirects(request);
  if (seoRedirect) {
    return seoRedirect;
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    return updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
