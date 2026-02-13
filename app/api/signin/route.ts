import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await db();
    console.log("API SECRET:", process.env.JWT_SECRET);
    const { username, password }: { username: string; password: string } =
      await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username & password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("Found user:", user);

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    console.log("Password match for user:", match);

    // Create JWT token
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Send cookie
    const res = NextResponse.json(
      { message: "Signin successful" },
      { status: 200 }
    );

    res.cookies.set("Hisaab_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
