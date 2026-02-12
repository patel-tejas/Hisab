import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Strategy from "@/models/Strategy";
import { verifyUser } from "@/lib/verifyUser";
import { defaultStrategies } from "@/lib/default-strategies";

export async function GET() {
  try {
    await db();
    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userStrategies = await Strategy.find({ user: user.id });

    const combined = [
      ...defaultStrategies,
      ...userStrategies.map((s) => s.name),
    ];

    return NextResponse.json([...new Set(combined)]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await db();
    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { name } = await req.json();

    const exists =
      defaultStrategies.includes(name) ||
      (await Strategy.findOne({ name, user: user.id }));

    if (exists)
      return NextResponse.json({ error: "Strategy already exists" }, { status: 400 });

    const strategy = await Strategy.create({ name, user: user.id });
    return NextResponse.json(strategy, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
