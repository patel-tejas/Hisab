import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("Hisaab_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
      const { payload }: any = await jwtVerify(token, secret);

      await db();

      // Use native driver to bypass Mongoose schema caching issues in dev mode
      const usersCollection = mongoose.connection.collection("users");
      const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(payload.id) });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          initials: (user.name || user.username)?.charAt(0).toUpperCase() || "U",
        }
      });
    } catch (err) {
      console.error("Token verification error:", err);
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