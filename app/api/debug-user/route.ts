import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await db();
        // Use native driver to bypass Mongoose schema
        const users = await mongoose.connection.collection("users").find({}).toArray();

        return NextResponse.json({
            debug_id: "user_check_v1",
            count: users.length,
            users: users.map(u => ({
                _id: u._id,
                username: u.username,
                name: u.name,      // Check if this exists
                email: u.email,    // Check if this exists
                hasName: "name" in u,
                hasEmail: "email" in u
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
