import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
  return jwtVerify(token, secret); // throws if invalid/expired
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("🔍 Middleware running on:", pathname);

  const isProtected =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get("Hisab_token")?.value;

  console.log("🔑 Token found:", token ? "yes" : "no");

  if (!token) {
    console.log("❌ No token → redirect to /sign-in");
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  try {
    await verifyToken(token);
    console.log("✅ Token valid → allow access");
    return NextResponse.next();
  } catch (err) {
    console.log("❌ JWT verify error in middleware:", err);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
