import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Only the admin area needs the Supabase session refresh / login redirect. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
