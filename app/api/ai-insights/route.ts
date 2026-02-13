import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import Trade from "@/models/Trade";
import { verifyUser } from "@/lib/verifyUser";

export async function GET(req: Request) {
    try {
        const apiKey = (process.env.GEMINI_API_KEY || "").trim();
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set in .env" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        await db();

        const user = await verifyUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const trades = await Trade.find({ user: user.id }).sort({ date: -1 }).lean();

        if (trades.length < 3) {
            return NextResponse.json({
                summary: "Add at least 3 trades to unlock AI insights.",
                ready: false,
            });
        }

        // ── Core Stats ──
        const now = new Date();
        const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
        const winCount = trades.filter(t => t.pnl > 0).length;
        const lossCount = trades.filter(t => t.pnl <= 0).length;
        const winRate = Math.round((winCount / trades.length) * 100);
        const avgPnl = Math.round(totalPnl / trades.length);
        const biggestWin = Math.max(...trades.map(t => t.pnl));
        const biggestLoss = Math.min(...trades.map(t => t.pnl));

        // ── Month data ──
        const thisMonth = trades.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = trades.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
        });

        // ── Strategy breakdown ──
        const stratMap: Record<string, { pnl: number; count: number; wins: number }> = {};
        trades.forEach(t => {
            if (!stratMap[t.strategy]) stratMap[t.strategy] = { pnl: 0, count: 0, wins: 0 };
            stratMap[t.strategy].pnl += t.pnl;
            stratMap[t.strategy].count++;
            if (t.pnl > 0) stratMap[t.strategy].wins++;
        });

        // ── Day of week ──
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayMap: Record<string, { pnl: number; count: number; wins: number }> = {};
        trades.forEach(t => {
            const day = dayNames[new Date(t.date).getDay()];
            if (!dayMap[day]) dayMap[day] = { pnl: 0, count: 0, wins: 0 };
            dayMap[day].pnl += t.pnl;
            dayMap[day].count++;
            if (t.pnl > 0) dayMap[day].wins++;
        });

        // ── Emotional state ──
        const emotionMap: Record<string, { pnl: number; count: number; wins: number }> = {};
        trades.forEach(t => {
            const e = t.emotionalState || "Unknown";
            if (!emotionMap[e]) emotionMap[e] = { pnl: 0, count: 0, wins: 0 };
            emotionMap[e].pnl += t.pnl;
            emotionMap[e].count++;
            if (t.pnl > 0) emotionMap[e].wins++;
        });

        // ── Streak ──
        let currentStreak = 0;
        let streakType = "";
        for (const t of trades) {
            if (currentStreak === 0) {
                streakType = t.pnl > 0 ? "win" : "loss";
                currentStreak = 1;
            } else if ((streakType === "win" && t.pnl > 0) || (streakType === "loss" && t.pnl <= 0)) {
                currentStreak++;
            } else break;
        }

        // ═════════════════════════════════════════════
        // NEW DEEP ANALYTICS
        // ═════════════════════════════════════════════

        // 1️⃣ Confidence Calibration
        const confMap: Record<number, { count: number; wins: number; pnl: number }> = {};
        trades.forEach(t => {
            const c = t.entryConfidence || 3;
            if (!confMap[c]) confMap[c] = { count: 0, wins: 0, pnl: 0 };
            confMap[c].count++;
            confMap[c].pnl += t.pnl;
            if (t.pnl > 0) confMap[c].wins++;
        });

        // 2️⃣ Loss Recovery — how many trades after a big loss to recover
        const losses = trades.filter(t => t.pnl < 0);
        const bigLossThreshold = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
        const recoveryData: number[] = [];
        const sortedByDate = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        for (let i = 0; i < sortedByDate.length; i++) {
            if (sortedByDate[i].pnl < -bigLossThreshold) {
                let cumulative = sortedByDate[i].pnl;
                let count = 0;
                for (let j = i + 1; j < sortedByDate.length; j++) {
                    cumulative += sortedByDate[j].pnl;
                    count++;
                    if (cumulative >= 0) {
                        recoveryData.push(count);
                        break;
                    }
                }
            }
        }
        const avgRecoveryTrades = recoveryData.length > 0 ? Math.round(recoveryData.reduce((s, v) => s + v, 0) / recoveryData.length * 10) / 10 : 0;

        // 3️⃣ Overtrading — group by date, compare PnL on high vs low trade days
        const dateTradeMap: Record<string, { count: number; pnl: number; wins: number }> = {};
        trades.forEach(t => {
            const key = new Date(t.date).toDateString();
            if (!dateTradeMap[key]) dateTradeMap[key] = { count: 0, pnl: 0, wins: 0 };
            dateTradeMap[key].count++;
            dateTradeMap[key].pnl += t.pnl;
            if (t.pnl > 0) dateTradeMap[key].wins++;
        });
        const dayEntries = Object.values(dateTradeMap);
        const lowDays = dayEntries.filter(d => d.count <= 3);
        const highDays = dayEntries.filter(d => d.count > 3);
        const lowDayWR = lowDays.length > 0 ? Math.round(lowDays.reduce((s, d) => s + d.wins, 0) / lowDays.reduce((s, d) => s + d.count, 0) * 100) : 0;
        const highDayWR = highDays.length > 0 ? Math.round(highDays.reduce((s, d) => s + d.wins, 0) / highDays.reduce((s, d) => s + d.count, 0) * 100) : 0;
        const lowDayAvgPnl = lowDays.length > 0 ? Math.round(lowDays.reduce((s, d) => s + d.pnl, 0) / lowDays.length) : 0;
        const highDayAvgPnl = highDays.length > 0 ? Math.round(highDays.reduce((s, d) => s + d.pnl, 0) / highDays.length) : 0;

        // 4️⃣ Sequential Patterns — performance after N consecutive losses
        const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const afterLossStreak: Record<number, { wins: number; count: number }> = {};
        let lossStreak = 0;
        for (const t of sortedTrades) {
            if (lossStreak >= 2) {
                if (!afterLossStreak[lossStreak]) afterLossStreak[lossStreak] = { wins: 0, count: 0 };
                afterLossStreak[lossStreak].count++;
                if (t.pnl > 0) afterLossStreak[lossStreak].wins++;
            }
            if (t.pnl <= 0) lossStreak++;
            else lossStreak = 0;
        }

        // 5️⃣ What-If: cut all losses at the average loss size
        const avgLoss = losses.length > 0 ? Math.round(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
        const whatIfCutLoss = trades.reduce((s, t) => s + (t.pnl < avgLoss ? avgLoss : t.pnl), 0);
        // What-If: skip trades with confidence < 3
        const confAbove3 = trades.filter(t => (t.entryConfidence || 3) >= 3);
        const whatIfHighConf = confAbove3.reduce((s, t) => s + t.pnl, 0);

        // 6️⃣ Trade Duration (entry to exit time)
        const durations: { mins: number; pnl: number; win: boolean }[] = [];
        trades.forEach(t => {
            if (t.entryTime && t.exitTime) {
                const [eh, em] = t.entryTime.split(":").map(Number);
                const [xh, xm] = t.exitTime.split(":").map(Number);
                let mins = (xh * 60 + xm) - (eh * 60 + em);
                if (mins < 0) mins += 1440; // Handle overnight trades (assume next day)
                if (mins > 0) durations.push({ mins, pnl: t.pnl, win: t.pnl > 0 });
            }
        });
        const shortTrades = durations.filter(d => d.mins <= 60);
        const longTrades = durations.filter(d => d.mins > 60);
        const shortWR = shortTrades.length > 0 ? Math.round(shortTrades.filter(d => d.win).length / shortTrades.length * 100) : 0;
        const longWR = longTrades.length > 0 ? Math.round(longTrades.filter(d => d.win).length / longTrades.length * 100) : 0;

        // 7️⃣ Satisfaction/Emotional Trend (last 20 trades)
        const last20 = sortedTrades.slice(-20);
        const first10 = last20.slice(0, 10);
        const second10 = last20.slice(-10);
        const avgSatFirst = first10.length > 0 ? Math.round(first10.reduce((s, t) => s + (t.satisfaction || 3), 0) / first10.length * 10) / 10 : 0;
        const avgSatSecond = second10.length > 0 ? Math.round(second10.reduce((s, t) => s + (t.satisfaction || 3), 0) / second10.length * 10) / 10 : 0;
        const avgConfFirst = first10.length > 0 ? Math.round(first10.reduce((s, t) => s + (t.entryConfidence || 3), 0) / first10.length * 10) / 10 : 0;
        const avgConfSecond = second10.length > 0 ? Math.round(second10.reduce((s, t) => s + (t.entryConfidence || 3), 0) / second10.length * 10) / 10 : 0;

        // 8️⃣ Risk Metrics
        const pnlArray = sortedTrades.map(t => t.pnl);
        const cumPnl: number[] = [];
        let running = 0;
        let maxVal = 0;
        let maxDrawdown = 0;
        pnlArray.forEach(p => {
            running += p;
            cumPnl.push(running);
            if (running > maxVal) maxVal = running;
            const dd = maxVal - running;
            if (dd > maxDrawdown) maxDrawdown = dd;
        });

        const mean = totalPnl / trades.length;
        const variance = trades.reduce((s, t) => s + Math.pow(t.pnl - mean, 2), 0) / trades.length;
        const stdDev = Math.sqrt(variance);
        const sharpe = stdDev > 0 ? Math.round((mean / stdDev) * 100) / 100 : 0;

        // 9️⃣ Mistakes frequency
        const mistakeMap: Record<string, number> = {};
        trades.forEach(t => {
            (t.mistakes || []).forEach((m: string) => {
                mistakeMap[m] = (mistakeMap[m] || 0) + 1;
            });
        });

        // ── Build data context for AI ──
        const lines: string[] = [];
        lines.push("=== TRADER PERFORMANCE DATA ===");
        lines.push("Total trades: " + trades.length);
        lines.push("Total PnL: Rs" + Math.round(totalPnl));
        lines.push("Win rate: " + winRate + "% (" + winCount + "W / " + lossCount + "L)");
        lines.push("Avg PnL per trade: Rs" + avgPnl);
        lines.push("Biggest win: Rs" + biggestWin + " | Biggest loss: Rs" + biggestLoss);
        lines.push("Current streak: " + currentStreak + " " + streakType + "s");
        lines.push("");

        lines.push("=== THIS MONTH (" + now.toLocaleString("en-IN", { month: "long" }) + ") ===");
        lines.push("Trades: " + thisMonth.length + " | PnL: Rs" + Math.round(thisMonth.reduce((s, t) => s + t.pnl, 0)));
        lines.push("Last month: " + lastMonth.length + " trades | Rs" + Math.round(lastMonth.reduce((s, t) => s + t.pnl, 0)));
        lines.push("");

        lines.push("=== STRATEGY BREAKDOWN ===");
        Object.entries(stratMap).forEach(([s, d]) => {
            lines.push("- " + s + ": Rs" + Math.round(d.pnl) + " (" + d.count + " trades, " + Math.round((d.wins / d.count) * 100) + "% WR)");
        });
        lines.push("");

        lines.push("=== DAY OF WEEK ===");
        Object.entries(dayMap).forEach(([d, v]) => {
            lines.push("- " + d + ": Rs" + Math.round(v.pnl) + " (" + v.count + " trades, " + Math.round((v.wins / v.count) * 100) + "% WR)");
        });
        lines.push("");

        lines.push("=== EMOTIONAL STATE ===");
        Object.entries(emotionMap).forEach(([e, v]) => {
            lines.push("- " + e + ": Rs" + Math.round(v.pnl) + " (" + v.count + " trades, " + Math.round((v.wins / v.count) * 100) + "% WR)");
        });
        lines.push("");

        lines.push("=== CONFIDENCE CALIBRATION ===");
        Object.entries(confMap).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([c, d]) => {
            lines.push("- Confidence " + c + "/5: " + d.count + " trades, " + Math.round((d.wins / d.count) * 100) + "% WR, Rs" + Math.round(d.pnl) + " total");
        });
        lines.push("");

        lines.push("=== LOSS RECOVERY ===");
        lines.push("Avg loss threshold: Rs" + Math.round(bigLossThreshold));
        lines.push("Avg trades to recover from big loss: " + avgRecoveryTrades);
        lines.push("Recovery instances tracked: " + recoveryData.length);
        lines.push("");

        lines.push("=== OVERTRADING ANALYSIS ===");
        lines.push("Days with 1-3 trades: " + lowDays.length + " days, WR: " + lowDayWR + "%, Avg PnL/day: Rs" + lowDayAvgPnl);
        lines.push("Days with 4+ trades: " + highDays.length + " days, WR: " + highDayWR + "%, Avg PnL/day: Rs" + highDayAvgPnl);
        lines.push("");

        lines.push("=== SEQUENTIAL PATTERNS ===");
        Object.entries(afterLossStreak).forEach(([streak, d]) => {
            lines.push("- After " + streak + " consecutive losses: " + d.count + " trades, " + Math.round((d.wins / d.count) * 100) + "% WR");
        });
        if (Object.keys(afterLossStreak).length === 0) lines.push("- No significant loss streaks found");
        lines.push("");

        lines.push("=== WHAT-IF SCENARIOS ===");
        lines.push("Actual total PnL: Rs" + Math.round(totalPnl));
        lines.push("If losses capped at avg loss (Rs" + avgLoss + "): Rs" + Math.round(whatIfCutLoss));
        lines.push("If only traded confidence >= 3: Rs" + Math.round(whatIfHighConf) + " from " + confAbove3.length + " trades");
        lines.push("");

        lines.push("=== TRADE DURATION ===");
        lines.push("Trades with timing data: " + durations.length);
        lines.push("Short trades (<=1hr): " + shortTrades.length + " trades, " + shortWR + "% WR");
        lines.push("Long trades (>1hr): " + longTrades.length + " trades, " + longWR + "% WR");
        lines.push("");

        lines.push("=== EMOTIONAL TREND (last 20 trades) ===");
        lines.push("Satisfaction earlier 10: " + avgSatFirst + "/5 -> recent 10: " + avgSatSecond + "/5");
        lines.push("Confidence earlier 10: " + avgConfFirst + "/5 -> recent 10: " + avgConfSecond + "/5");
        lines.push("");

        lines.push("=== RISK METRICS ===");
        lines.push("Max drawdown: Rs" + Math.round(maxDrawdown));
        lines.push("Sharpe ratio: " + sharpe);
        lines.push("Std deviation of PnL: Rs" + Math.round(stdDev));
        lines.push("");

        lines.push("=== COMMON MISTAKES ===");
        Object.entries(mistakeMap).sort((a, b) => b[1] - a[1]).forEach(([m, c]) => {
            lines.push("- " + m + ": " + c + " times");
        });
        lines.push("");

        lines.push("=== RECENT 10 TRADES ===");
        trades.slice(0, 10).forEach(t => {
            let line = "- " + new Date(t.date).toLocaleDateString("en-IN") + " | " + t.symbol + " " + t.type + " | Rs" + t.pnl + " | " + t.strategy + " | conf:" + (t.entryConfidence || "?") + " | " + (t.emotionalState || "?");
            if (t.entryTime) line += " | " + t.entryTime + "-" + (t.exitTime || "?");
            if (t.mistakes && t.mistakes.length > 0) line += " | mistakes: " + t.mistakes.join(", ");
            lines.push(line);
        });

        const tradeDataContext = lines.join("\n");

        // ── JSON structure for AI response ──
        const jsonStructure = JSON.stringify({
            overallSummary: "2-3 sentence performance summary, motivational but honest, mention numbers",
            strengths: ["strength 1", "strength 2", "strength 3"],
            weaknesses: ["weakness 1", "weakness 2", "weakness 3"],
            patterns: {
                bestSetup: "Best strategy with data (1 sentence)",
                worstSetup: "Worst strategy with data (1 sentence)",
                bestDay: "Best day with data (1 sentence)",
                emotionalInsight: "How emotions affect trading (1 sentence)",
                streakAnalysis: "Current streak analysis (1 sentence)",
            },
            confidenceCalibration: {
                finding: "Key finding about confidence vs actual performance (1-2 sentences with numbers)",
                optimalConfidence: "Which confidence level produces best results",
                overconfidenceBias: true,
            },
            lossRecovery: {
                finding: "How the trader recovers from losses (1-2 sentences with numbers)",
                avgTradesToRecover: 0,
                advice: "Specific advice for faster recovery (1 sentence)",
            },
            overtradingAnalysis: {
                finding: "Analysis of trade frequency vs performance (1-2 sentences with numbers)",
                optimalTradesPerDay: "Recommended number of trades per day",
                isOvertrading: false,
            },
            sequentialPatterns: {
                finding: "What happens after consecutive losses (1-2 sentences with numbers)",
                tiltRisk: "low | medium | high",
                advice: "What to do after N losses in a row (1 sentence)",
            },
            whatIfScenarios: [
                { scenario: "Description of what-if scenario", currentPnl: 0, projectedPnl: 0, difference: 0, advice: "1 sentence" },
                { scenario: "Second what-if scenario", currentPnl: 0, projectedPnl: 0, difference: 0, advice: "1 sentence" },
            ],
            tradeDuration: {
                finding: "How trade duration affects performance (1-2 sentences with numbers)",
                optimalDuration: "Best holding time range",
                advice: "1 sentence",
            },
            personalizedRules: [
                "Rule 1 specific to this trader with numbers",
                "Rule 2 specific to this trader with numbers",
                "Rule 3 specific to this trader with numbers",
                "Rule 4 specific to this trader with numbers",
                "Rule 5 specific to this trader with numbers",
            ],
            performanceForecast: {
                projection: "At current trajectory, monthly projection (1-2 sentences with specific Rs amount)",
                monthEndTarget: 0,
                confidence: "low | medium | high",
            },
            emotionalTrend: {
                finding: "How satisfaction/confidence is trending (1-2 sentences with numbers)",
                trend: "improving | declining | stable",
                burnoutRisk: "low | medium | high",
                advice: "1 sentence",
            },
            riskScore: {
                overall: 0,
                maxDrawdown: 0,
                sharpeRatio: 0,
                assessment: "1-2 sentence risk assessment",
                advice: "1 sentence risk advice",
            },
            actionItems: [
                "Specific action 1", "Specific action 2", "Specific action 3",
            ],
            traderLevel: "beginner | intermediate | advanced | expert",
            confidenceScore: "0-100 number",
        }, null, 2);

        const prompt = "You are an elite trading performance analyst. Analyze this trader's comprehensive data and return deep, data-driven insights. Be specific — mention exact numbers, percentages, and Rs amounts. Do NOT be generic.\n\n" +
            tradeDataContext +
            "\n\nReturn ONLY valid JSON (no markdown, no code blocks) matching this structure:\n" +
            jsonStructure;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        let parsed;
        try {
            const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            parsed = JSON.parse(cleaned);
        } catch {
            return NextResponse.json({
                ready: true,
                summary: responseText,
                parseError: true,
            });
        }

        return NextResponse.json({
            ready: true,
            ...parsed,
        });
    } catch (error: any) {
        console.error("AI Insights error:", error);
        return NextResponse.json(
            { error: "Failed to generate AI insights", details: error.message },
            { status: 500 }
        );
    }
}
