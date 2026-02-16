import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import User from "@/models/User";
import Trade from "@/models/Trade";
import { verifyUser } from "@/lib/verifyUser";
import { decrypt } from "@/lib/encryption";
import { fetchDhanTrades, pairTrades, mapToAppTrade } from "@/lib/brokers/dhan";

/* ── POST: Sync trades from broker ── */
export async function POST(req: Request) {
    try {
        await db();
        const user = await verifyUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { broker } = await req.json();
        if (broker !== "dhan") {
            return NextResponse.json({ error: "Only 'dhan' broker is supported" }, { status: 400 });
        }

        const dbUser = await User.findById(user.id);
        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const connection = dbUser.brokerConnections.find(
            (c: any) => c.broker === "dhan" && c.isActive
        );

        if (!connection) {
            return NextResponse.json(
                { error: "Dhan broker not connected. Please connect from Broker Settings." },
                { status: 400 }
            );
        }

        // Decrypt the stored access token
        let accessToken: string;
        try {
            accessToken = decrypt(connection.accessToken);
        } catch {
            return NextResponse.json(
                { error: "Failed to decrypt access token. Please reconnect your Dhan account." },
                { status: 400 }
            );
        }

        // Fetch trades from Dhan
        const rawTrades = await fetchDhanTrades(accessToken);

        if (rawTrades.length === 0) {
            // Update lastSynced even if no trades
            connection.lastSynced = new Date();
            await dbUser.save();
            return NextResponse.json({
                success: true,
                imported: 0,
                skipped: 0,
                message: "No trades found for today on Dhan.",
            });
        }

        // Pair BUY+SELL legs
        const paired = pairTrades(rawTrades);

        // Deduplicate: check which orderIds already exist
        const existingOrderIds = await Trade.find({
            user: user.id,
            source: "dhan",
            brokerOrderId: { $in: paired.map((p) => p.orderId) },
        }).distinct("brokerOrderId");

        const existingSet = new Set(existingOrderIds);
        const newTrades = paired.filter((p) => !existingSet.has(p.orderId));

        // Insert new trades
        let imported = 0;
        if (newTrades.length > 0) {
            const docs = newTrades.map((p) => mapToAppTrade(p, user.id));
            await Trade.insertMany(docs);
            imported = docs.length;
        }

        // Update lastSynced
        connection.lastSynced = new Date();
        await dbUser.save();

        return NextResponse.json({
            success: true,
            imported,
            skipped: paired.length - newTrades.length,
            total: rawTrades.length,
            paired: paired.length,
            message:
                imported > 0
                    ? `Successfully imported ${imported} trade(s) from Dhan.`
                    : "All trades already imported. No new trades to sync.",
        });
    } catch (err: any) {
        console.error("Broker sync error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
