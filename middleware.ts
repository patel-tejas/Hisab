import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
  return jwtVerify(token, secret); // throws if invalid/expired
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("Hisaab_token")?.value;

  // ── Auth pages: redirect to /dashboard if already signed in ──
  const isAuthPage =
    pathname === "/sign-in" || pathname === "/sign-up";

  if (isAuthPage && token) {
    try {
      await verifyToken(token);
      // Token is valid → user is already signed in, send to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // Token is expired/invalid → let them sign in
      return NextResponse.next();
    }
  }

  // ── Protected pages: redirect to /sign-in if not authenticated ──
  const isProtected =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/sign-in", "/sign-up"],
};
