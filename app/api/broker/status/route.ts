import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import User from "@/models/User";
import { verifyUser } from "@/lib/verifyUser";

/* ── GET: Broker connection status ── */
export async function GET() {
    try {
        await db();
        const user = await verifyUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const dbUser = await User.findById(user.id).lean();
        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const brokers = (dbUser.brokerConnections || []).map((c: any) => ({
            broker: c.broker,
            clientId: c.clientId,
            isActive: c.isActive,
            lastSynced: c.lastSynced,
            // Never expose the access token
        }));

        return NextResponse.json({ brokers });
    } catch (err: any) {
        console.error("Error in GET /api/broker/status:", err);
        return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
    }
}
