import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "kt_session";

/**
 * Optimistic gate: bounce visitors without a session cookie away from private
 * areas. Real authorisation happens server-side in every layout and action.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  const publicAccount = ["/account/login", "/account/register", "/account/forgot"];
  if (pathname.startsWith("/account") && !publicAccount.includes(pathname) && !hasSession) {
    const url = new URL("/account/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
