import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware — first-line gate for staff/admin areas.
 * It only checks for the presence of a session cookie (cheap, edge-safe).
 * FULL HMAC verification + role authorization happens server-side in every
 * protected page/action via requireStaff() — defense in depth, and the real
 * enforcement boundary (Node runtime, constant-time compare).
 */
const COOKIE = "mvp_staff_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = pathname.startsWith("/staff") || pathname.startsWith("/admin");
  if (!isProtected) return NextResponse.next();

  const isLogin = pathname === "/staff/login" || pathname === "/admin/login";
  const hasSession = Boolean(req.cookies.get(COOKIE)?.value);

  if (!hasSession && !isLogin) {
    const loginUrl = new URL(pathname.startsWith("/admin") ? "/admin/login" : "/staff/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (hasSession && isLogin) {
    return NextResponse.redirect(new URL(pathname.startsWith("/admin") ? "/admin" : "/staff", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/admin/:path*"],
};
