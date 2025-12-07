import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Trade from "@/models/Trade";
import { verifyUser } from "@/lib/verifyUser";

export async function GET(req: Request) {
  try {
    await db();

    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const trades = await Trade.find({ user: user.id }).lean();

    if (!trades.length) {
      return NextResponse.json({
        highestPnl: 0,
        winRate: 0,
        avgRiskReward: "N/A",
        tradesThisMonth: 0,
        confidenceIndex: 50,
        cumulativePnl: [],
        topTrades: [],
      });
    }

    // Highest PNL
    const highestPnl = Math.max(...trades.map(t => t.pnl));

    // Win Rate
    const wins = trades.filter(t => t.pnl > 0).length;
    const winRate = Math.round((wins / trades.length) * 100);

    // Avg Risk Reward (approx using pnlPercent)
    const avgRR =
      trades.length > 0
        ? `1:${(trades.reduce((a, t) => a + Math.abs(t.pnlPercent), 0) / trades.length / 10).toFixed(2)}`
        : "N/A";

    // Trades this month
    const now = new Date();
    const tradesThisMonth = trades.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // Confidence Index = (avg(entryConfidence+satisfaction) * 5)
    const avgConfidence =
      (trades.reduce((a, t) => a + (t.entryConfidence + t.satisfaction), 0) /
        (2 * trades.length)) *
      10;

    // Cumulative Pnl chart data
    let cumulative = 0;
    const cumulativePnl = trades
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .map(t => {
        cumulative += t.pnl;
        return { date: new Date(t.date).toDateString(), pnl: cumulative };
      });

    // Top Trades
    const topTrades = trades
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 3)
      .map(t => ({
        symbol: t.symbol,
        pnl: t.pnl,
        pnlPercent: t.pnlPercent,
      }));

    return NextResponse.json({
      highestPnl,
      winRate,
      avgRiskReward: avgRR,
      tradesThisMonth,
      confidenceIndex: Math.round(avgConfidence),
      cumulativePnl,
      topTrades,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error", details: error }, { status: 500 });
  }
}
