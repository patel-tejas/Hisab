import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import User from "@/models/User";
import { verifyUser } from "@/lib/verifyUser";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
        }

        await db();
        const userData = await verifyUser();
        if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch full user logic with password
        const user = await User.findById(userData.id).select("+password");
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
