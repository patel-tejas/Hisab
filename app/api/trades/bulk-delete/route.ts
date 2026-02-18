import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Trade from "@/models/Trade";
import { verifyUser } from "@/lib/verifyUser";

export async function POST(req: Request) {
    try {
        await db();
        const user = await verifyUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { ids } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No trade IDs provided" }, { status: 400 });
        }

        console.log("Bulk deleting trades for user:", user.id, "Count:", ids.length);

        const result = await Trade.deleteMany({
            _id: { $in: ids },
            user: user.id
        });

        console.log("Deleted trades result:", result);

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} trades`,
            deletedCount: result.deletedCount
        });
    } catch (err: any) {
        console.error("Error bulk deleting trades:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
