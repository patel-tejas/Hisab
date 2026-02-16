import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Trade from "@/models/Trade";
import { verifyUser } from "@/lib/verifyUser";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: "Trade ID is required" }, { status: 400 });

        await db();
        const user = await verifyUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const deletedTrade = await Trade.findOneAndDelete({ _id: id, user: user.id });

        if (!deletedTrade) {
            return NextResponse.json({ error: "Trade not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Trade deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
