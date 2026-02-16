import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import User from "@/models/User";
import { verifyUser } from "@/lib/verifyUser";
import mongoose from "mongoose";

export async function PUT(req: Request) {
    try {
        const { name, email } = await req.json();

        if (!name || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        await db();
        const userData = await verifyUser();
        if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check if email is being changed and if it's already taken
        // Use native check to be safe
        const usersCollection = mongoose.connection.collection("users");

        // We need to fetch the current user first to check if email is different
        const currentUser = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userData.id) });
        if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (email !== currentUser.email) {
            const existingUser = await usersCollection.findOne({ email });
            if (existingUser) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }
        }

        // Native Update
        await usersCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(userData.id) },
            { $set: { name, email } }
        );

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: currentUser._id,
                name: name,
                email: email,
                username: currentUser.username,
                initials: name ? name.charAt(0).toUpperCase() : "U"
            }
        });
    } catch (err: any) {
        console.error("Profile update error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
