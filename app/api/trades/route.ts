import { NextResponse } from "next/server"; // API Route
import { db } from "@/lib/db";
import Trade from "@/models/Trade";
import { verifyUser } from "@/lib/verifyUser";

export async function POST(req: Request) {
  try {
    await db();
    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("Creating trade for user:", user.id);

    const body = await req.json();
    console.log("Request body:", body);

    const trade = await Trade.create({
      ...body,
      user: user.id,
    });

    console.log("Created trade:", trade);

    return NextResponse.json(trade, { status: 201 });
  } catch (err: any) {
    console.log("Error creating trade:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await db();
    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const trades = await Trade.find({ user: user.id })
      .sort({ date: -1 });

    return NextResponse.json(trades);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await db();
    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Trade ID is required" }, { status: 400 });
    }

    console.log("Updating trade:", _id, updateData);

    const updatedTrade = await Trade.findOneAndUpdate(
      { _id, user: user.id },
      updateData,
      { new: true }
    );

    if (!updatedTrade) {
      return NextResponse.json({ error: "Trade not found or unauthorized" }, { status: 404 });
    }

    console.log("Updated trade:", updatedTrade);

    return NextResponse.json(updatedTrade);
  } catch (err: any) {
    console.log("Error updating trade:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
