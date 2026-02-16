import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { db } from "@/lib/db";
import User from "@/models/User";
import { verifyUser } from "@/lib/verifyUser";
import { encrypt, decrypt } from "@/lib/encryption";

/* ── POST: Save / Update broker connection ── */
export async function POST(req: Request) {
    try {
        await db();
        const user = await verifyUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { broker, clientId, accessToken } = await req.json();

        if (!broker || !clientId || !accessToken) {
            return NextResponse.json({ error: "broker, clientId, and accessToken are required" }, { status: 400 });
        }

        if (broker !== "dhan") {
            return NextResponse.json({ error: "Only 'dhan' broker is supported currently" }, { status: 400 });
        }

        // Verify the token works before saving
        const testRes = await fetch("https://api.dhan.co/v2/trades", {
            headers: { "Content-Type": "application/json", "access-token": accessToken },
        });

        if (!testRes.ok) {
            return NextResponse.json(
                { error: "Invalid Dhan credentials. Make sure your access token is valid and not expired." },
                { status: 400 }
            );
        }

        const encryptedToken = encrypt(accessToken);

        // Use direct collection update to bypass potential stale Mongoose schema strict mode
        // Fetch current raw doc first to handle the array logic manually
        const rawUser = await User.collection.findOne({ _id: new mongoose.Types.ObjectId(user.id) });
        if (!rawUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        let connections = (rawUser.brokerConnections || []) as any[];
        const existingIdx = connections.findIndex((c: any) => c.broker === broker);

        const newConnection = {
            broker,
            clientId,
            accessToken: encryptedToken,
            isActive: true,
            lastSynced: existingIdx >= 0 ? connections[existingIdx].lastSynced : undefined
        };

        if (existingIdx >= 0) {
            connections[existingIdx] = newConnection;
        } else {
            connections.push(newConnection);
        }

        await User.collection.updateOne(
            { _id: new mongoose.Types.ObjectId(user.id) },
            { $set: { brokerConnections: connections } }
        );

        console.log(`Updated broker connections for user ${user.id}:`, connections.map(c => c.broker));

        return NextResponse.json({ success: true, message: "Dhan broker connected successfully" });
    } catch (err: any) {
        console.error("Broker connect error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* ── DELETE: Remove broker connection ── */
export async function DELETE(req: Request) {
    try {
        await db();
        const user = await verifyUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { broker } = await req.json();

        const dbUser = await User.findById(user.id);
        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        dbUser.brokerConnections = (dbUser.brokerConnections || []).filter(
            (c: any) => c.broker !== broker
        ) as any;
        await dbUser.save();

        return NextResponse.json({ success: true, message: "Broker disconnected" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
