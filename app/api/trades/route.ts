import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Trade from "@/models/Trade";
import { verifyUser } from "@/lib/verifyUser";

export async function POST(req: Request) {
  try {
    await db();
    const user = await verifyUser();

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

    const trades = await Trade.find({ user: user.id })
      .populate("strategy")
      .sort({ date: -1 });

    return NextResponse.json(trades);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
