/**
 * Dhan Broker API Service
 * Docs: https://dhanhq.co/docs/v2/
 * Base URL: https://api.dhan.co/v2
 */

const DHAN_BASE = "https://api.dhan.co/v2";

/* ──────────────────── Raw Dhan types ──────────────────── */
export interface DhanRawTrade {
    dhanClientId: string;
    orderId: string;
    exchangeOrderId: string;
    transactionType: "BUY" | "SELL";
    exchangeSegment: string;
    productType: string;
    orderType: string;
    tradingSymbol: string;
    securityId: string;
    tradedQuantity: number;
    tradedPrice: number;
    createTime: string;
    updateTime: string;
    exchangeTime: string;
}

/* ──────────────────── Paired trade (our internal format) ──────────────────── */
export interface PairedTrade {
    symbol: string;
    date: Date;
    type: "long" | "short";
    quantity: number;
    entryPrice: number;
    exitPrice: number;
    entryTime: string;    // HH:mm
    exitTime: string;     // HH:mm
    pnl: number;
    pnlPercent: number;
    totalAmount: number;
    orderId: string;      // for dedup
    exchangeSegment: string;
    productType: string;
    brokerage: number;
}

/* ──────────────────── Fetch today's trades ──────────────────── */
export async function fetchDhanTrades(accessToken: string): Promise<DhanRawTrade[]> {
    const res = await fetch(`${DHAN_BASE}/trades`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": accessToken,
        },
    });

    if (!res.ok) {
        const body = await res.text();
        if (res.status === 401) throw new Error("Dhan access token expired or invalid. Please regenerate from web.dhan.co");
        throw new Error(`Dhan API error (${res.status}): ${body}`);
    }

    const data = await res.json();
    console.log("Dhan Raw Trades Response:", JSON.stringify(data, null, 2));
    return Array.isArray(data) ? data : [];
}

/* ──────────────────── Pair BUY+SELL into trades ──────────────────── */
export function pairTrades(rawTrades: DhanRawTrade[]): PairedTrade[] {
    // Group by symbol
    const bySymbol = new Map<string, { buys: DhanRawTrade[]; sells: DhanRawTrade[] }>();

    for (const t of rawTrades) {
        const key = `${t.tradingSymbol}_${t.exchangeSegment}`;
        if (!bySymbol.has(key)) bySymbol.set(key, { buys: [], sells: [] });
        const group = bySymbol.get(key)!;
        if (t.transactionType === "BUY") group.buys.push(t);
        else group.sells.push(t);
    }

    const paired: PairedTrade[] = [];

    for (const [, group] of bySymbol) {
        // Sort by time (earliest first)
        group.buys.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
        group.sells.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());

        // Match: If BUY came first → long trade, if SELL first → short trade
        const primary = group.buys.length >= group.sells.length ? "long" : "short";
        const entries = primary === "long" ? group.buys : group.sells;
        const exits = primary === "long" ? group.sells : group.buys;

        const usedExits = new Set<number>();

        for (const entry of entries) {
            // Find matching exit with same quantity
            let exitIdx = -1;
            for (let i = 0; i < exits.length; i++) {
                if (
                    !usedExits.has(i) &&
                    exits[i].tradedQuantity === entry.tradedQuantity &&
                    new Date(exits[i].createTime).getTime() > new Date(entry.createTime).getTime()
                ) {
                    exitIdx = i;
                    break;
                }
            }

            if (exitIdx === -1) {
                // No matching exit — could be open position, skip or create partial
                continue;
            }

            usedExits.add(exitIdx);
            const exit = exits[exitIdx];

            const entryPrice = entry.tradedPrice;
            const exitPrice = exit.tradedPrice;
            const qty = entry.tradedQuantity;
            const pnl = primary === "long"
                ? (exitPrice - entryPrice) * qty
                : (entryPrice - exitPrice) * qty;
            const totalAmount = entryPrice * qty;
            const pnlPercent = totalAmount > 0 ? (pnl / totalAmount) * 100 : 0;

            const entryDate = new Date(entry.createTime);
            const exitDate = new Date(exit.createTime);

            paired.push({
                symbol: entry.tradingSymbol,
                date: new Date(entryDate.toDateString()), // date only
                type: primary,
                quantity: qty,
                entryPrice,
                exitPrice,
                entryTime: entryDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
                exitTime: exitDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
                pnl: Math.round(pnl * 100) / 100,
                pnlPercent: Math.round(pnlPercent * 100) / 100,
                totalAmount: Math.round(totalAmount * 100) / 100,
                orderId: entry.orderId,
                exchangeSegment: entry.exchangeSegment,
                productType: entry.productType,
                brokerage: 47.5,
            });
        }
    }

    return paired;
}

/* ──────────────────── Convert paired trade → app trade shape ──────────────────── */
export function mapToAppTrade(paired: PairedTrade, userId: string) {
    return {
        user: userId,
        symbol: paired.symbol,
        date: paired.date,
        type: paired.type,
        quantity: paired.quantity,
        entryPrice: paired.entryPrice,
        exitPrice: paired.exitPrice,
        entryTime: paired.entryTime,
        exitTime: paired.exitTime,
        totalAmount: paired.totalAmount,
        pnl: paired.pnl,
        pnlPercent: paired.pnlPercent,
        strategy: "Dhan Import",
        outcome: paired.pnl >= 0 ? "success" : "failure",
        entryConfidence: 5,
        satisfaction: 5,
        emotionalState: "",
        mistakes: [],
        notes: `Auto-imported from Dhan (${paired.exchangeSegment}, ${paired.productType})`,
        lessonsLearned: "",
        images: [],
        source: "dhan",
        brokerOrderId: paired.orderId,
        brokerage: paired.brokerage,
    };
}
