import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await db();

    const { username, password }: { username: string; password: string } =
      await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username & password required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashed,
    });

    // Auto-login by creating token
    const token = jwt.sign(
      { id: newUser._id.toString(), username: newUser.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json(
      { message: "Signup successful" },
      { status: 201 }
    );

    res.cookies.set("Hisab_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
