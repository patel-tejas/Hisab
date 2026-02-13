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
        totalPnl: 0,
        totalTrades: 0,
        winRate: 0,
        winCount: 0,
        lossCount: 0,
        avgRiskReward: "N/A",
        tradesThisMonth: 0,
        confidenceIndex: 50,
        cumulativePnl: [],
        topTrades: [],
        recentTrades: [],
        dailyPnl: [],
        weeklyPnl: [],
      });
    }

    // Total P&L
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

    // Highest PNL
    const highestPnl = Math.max(...trades.map(t => t.pnl));

    // Win / Loss counts
    const winCount = trades.filter(t => t.pnl > 0).length;
    const lossCount = trades.filter(t => t.pnl <= 0).length;
    const winRate = Math.round((winCount / trades.length) * 100);

    // Avg Risk Reward
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

    // Confidence Index
    const avgConfidence =
      (trades.reduce((a, t) => a + (t.entryConfidence + t.satisfaction), 0) /
        (2 * trades.length)) * 10;

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => +new Date(a.date) - +new Date(b.date));

    // Cumulative PnL chart data
    let cumulative = 0;
    const cumulativePnl = sortedTrades.map(t => {
      cumulative += t.pnl;
      return { date: new Date(t.date).toDateString(), pnl: cumulative };
    });

    // Top Trades (best performers)
    const topTrades = [...trades]
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5)
      .map(t => ({
        symbol: t.symbol,
        pnl: t.pnl,
        pnlPercent: t.pnlPercent,
        direction: t.direction,
        date: t.date,
      }));

    // Recent Trades (last 5 by date)
    const recentTrades = [...trades]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 5)
      .map(t => ({
        symbol: t.symbol,
        pnl: t.pnl,
        pnlPercent: t.pnlPercent,
        direction: t.direction,
        date: t.date,
      }));

    // Daily P&L (for calendar heatmap) - aggregate by date
    const dailyMap = new Map<string, number>();
    trades.forEach(t => {
      const dateKey = new Date(t.date).toISOString().split("T")[0];
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + t.pnl);
    });
    const dailyPnl = Array.from(dailyMap.entries())
      .map(([date, pnl]) => ({ date, pnl }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Weekly P&L (last 7 data points for sparklines)
    const weeklyPnl = cumulativePnl.slice(-7).map(d => d.pnl);

    return NextResponse.json({
      highestPnl,
      totalPnl: Math.round(totalPnl),
      totalTrades: trades.length,
      winRate,
      winCount,
      lossCount,
      avgRiskReward: avgRR,
      tradesThisMonth,
      confidenceIndex: Math.round(avgConfidence),
      cumulativePnl,
      topTrades,
      recentTrades,
      dailyPnl,
      weeklyPnl,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error", details: error }, { status: 500 });
  }
}
