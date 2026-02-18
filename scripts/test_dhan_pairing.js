
// Mock data based on the user's screenshot and hypothesis
const mockRawTrades = [
    // 25700 CALL - Total Profit ~1358.5
    // Scenario: Scalping.
    // Trade 1: Buy 100 @ 10, Sell 100 @ 20.4 (Profit 1040)
    {
        tradingSymbol: "NIFTY-Feb2026-25700-CE",
        exchangeSegment: "NSE_FNO",
        transactionType: "BUY",
        tradedQuantity: 100,
        tradedPrice: 10,
        createTime: "2026-02-17T09:15:00",
        orderId: "1",
    },
    {
        tradingSymbol: "NIFTY-Feb2026-25700-CE",
        exchangeSegment: "NSE_FNO",
        transactionType: "SELL",
        tradedQuantity: 100,
        tradedPrice: 20.4,
        createTime: "2026-02-17T09:30:00",
        orderId: "2",
    },
    // Trade 2: Buy 50 @ 10, Sell 50 @ 16.37 (Profit 318.5)
    {
        tradingSymbol: "NIFTY-Feb2026-25700-CE",
        exchangeSegment: "NSE_FNO",
        transactionType: "BUY",
        tradedQuantity: 50,
        tradedPrice: 10,
        createTime: "2026-02-17T10:00:00",
        orderId: "3",
    },
    {
        tradingSymbol: "NIFTY-Feb2026-25700-CE",
        exchangeSegment: "NSE_FNO",
        transactionType: "SELL",
        tradedQuantity: 50,
        tradedPrice: 16.37,
        createTime: "2026-02-17T10:15:00",
        orderId: "4",
    },

    // Test Partial Fill Scenario (Failure in current logic?)
    // Buy 100 (Filled as 50 + 50)
    {
        tradingSymbol: "NIFTY-Feb2026-25550-CE",
        exchangeSegment: "NSE_FNO",
        transactionType: "BUY",
        tradedQuantity: 50,
        tradedPrice: 100,
        createTime: "2026-02-17T11:00:00",
        orderId: "5",
    },
    {
        tradingSymbol: "NIFTY-Feb2026-25550-CE",
        exchangeSegment: "NSE_FNO",
        transactionType: "BUY",
        tradedQuantity: 50,
        tradedPrice: 100,
        createTime: "2026-02-17T11:00:01",
        orderId: "6",
    },
    // Sell 100 (Single fill)
    {
        tradingSymbol: "NIFTY-Feb2026-25550-CE",
        exchangeSegment: "NSE_FNO",
        transactionType: "SELL",
        tradedQuantity: 100,
        tradedPrice: 110,
        createTime: "2026-02-17T11:30:00",
        orderId: "7",
    }
];

function pairTrades(rawTrades) {
    // Group by symbol
    const bySymbol = new Map();

    for (const t of rawTrades) {
        const key = `${t.tradingSymbol}_${t.exchangeSegment}`;
        if (!bySymbol.has(key)) bySymbol.set(key, []);
        bySymbol.get(key).push(t);
    }

    const paired = [];

    for (const [key, trades] of bySymbol) {
        // Sort by time
        trades.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());

        const openLegs = []; // Queue of { trade, type, remainingQty }

        for (const t of trades) {
            let remainingQty = t.tradedQuantity;

            // Try to match with open legs if opposite direction
            while (remainingQty > 0 && openLegs.length > 0) {
                const head = openLegs[0];

                // If same direction, break and add to open (e.g. accumulating)
                if (head.type === t.transactionType) break;

                // Opposite direction -> Match
                const matchQty = Math.min(remainingQty, head.remainingQty);

                // Determine Entry and Exit
                // If head was Buy and t is Sell -> Long Trade
                // If head was Sell and t is Buy -> Short Trade
                const isLong = head.type === "BUY";
                const entry = head.trade;
                const exit = t;

                const entryPrice = entry.tradedPrice;
                const exitPrice = exit.tradedPrice;

                const pnl = isLong
                    ? (exitPrice - entryPrice) * matchQty
                    : (entryPrice - exitPrice) * matchQty;

                paired.push({
                    symbol: entry.tradingSymbol,
                    qty: matchQty,
                    pnl: pnl,
                    entryTime: entry.createTime,
                    exitTime: exit.createTime,
                    type: isLong ? "long" : "short",
                    orderId: entry.orderId // attribution to entry order
                });

                // Update remainders
                remainingQty -= matchQty;
                head.remainingQty -= matchQty;

                // If head fully consumed, remove from queue
                if (head.remainingQty <= 0) {
                    openLegs.shift();
                }
            }

            // If any quantity remains, add to open legs
            if (remainingQty > 0) {
                openLegs.push({
                    trade: t,
                    type: t.transactionType,
                    remainingQty: remainingQty
                });
            }
        }
    }
    return paired;
}

const result = pairTrades(mockRawTrades);
console.log("Paired Trades:", JSON.stringify(result, null, 2));
console.log("Total Count:", result.length);
