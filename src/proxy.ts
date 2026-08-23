import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * Only the landing page ("/") is public (Section 2). Everything else —
 * forms, policies, PDFs, admin — requires a session cookie.
 *
 * This is a lightweight presence check only: proxy runs on the Edge
 * runtime and can't call firebase-admin, so every protected page/route
 * still re-verifies the cookie server-side via getServerUser()/requireUser().
 * Never trust this gate alone for authorization.
 */
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("signInRequired", "1");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/forms/:path*",
    "/policies/:path*",
    "/pending-approval",
    "/admin/:path*",
  ],
};
