import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Trade from "@/models/Trade";
import { getSymbolMultiplier } from "@/lib/brokers/dhan";

export async function GET() {
    try {
        await db();

        // Find all Dhan trades
        const trades = await Trade.find({ source: "dhan" });

        let updatedCount = 0;
        const updates = [];

        for (const trade of trades) {
            const multiplier = getSymbolMultiplier(trade.symbol);

            // Only update if multiplier > 1 to avoid unnecessary writes, 
            // OR if we want to ensure everything is consistent.
            // Let's just re-calculate everything to be safe.

            const isLong = trade.type === "long";
            const qty = trade.quantity;
            const entry = trade.entryPrice;
            const exit = trade.exitPrice;

            const expectedPnL = isLong
                ? (exit - entry) * qty * multiplier
                : (entry - exit) * qty * multiplier;


            const expectedTotal = entry * qty * multiplier;

            // Debugging first 5 trades
            if (updates.length < 5) {
                console.log(`Trade: ${trade.symbol}, Multiplier: ${multiplier}, PnL: ${trade.pnl} -> ${expectedPnL}`);
            }

            // Check if update is needed (allowing for small float diffs)
            if (Math.abs(trade.pnl - expectedPnL) > 0.1 || Math.abs(trade.totalAmount - expectedTotal) > 0.1) {
                trade.pnl = Math.round(expectedPnL * 100) / 100;
                trade.pnlPercent = expectedTotal > 0 ? (expectedPnL / expectedTotal) * 100 : 0;
                trade.pnlPercent = Math.round(trade.pnlPercent * 100) / 100;
                trade.totalAmount = Math.round(expectedTotal * 100) / 100;
                trade.outcome = trade.pnl >= 0 ? "success" : "failure";

                updates.push(trade.save());
                updatedCount++;
            }
        }

        const silverTrades = trades.filter(t => t.symbol.includes("SILVER"));
        const debugInfo = silverTrades.slice(0, 5).map(t => ({
            symbol: t.symbol,
            multiplier: getSymbolMultiplier(t.symbol),
            qty: t.quantity,
            entry: t.entryPrice,
            exit: t.exitPrice,
            currentPnL: t.pnl,
            calculatedPnL: (t.type === "long" ? t.exitPrice - t.entryPrice : t.entryPrice - t.exitPrice) * t.quantity * getSymbolMultiplier(t.symbol)
        }));

        await Promise.all(updates);

        return NextResponse.json({
            success: true,
            totalTrades: trades.length,
            silverTradesCount: silverTrades.length,
            updatedTrades: updatedCount,
            debugInfo,
            message: `recalculated PnL for ${updatedCount} trades.`
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
