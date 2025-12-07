import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("Hisab_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
      const { payload }: any = await jwtVerify(token, secret);

      return NextResponse.json({
        success: true,
        user: {
          id: payload.id,
          username: payload.username,
          initials: payload.username?.charAt(0).toUpperCase() || "U",
        }
      });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("User details fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}