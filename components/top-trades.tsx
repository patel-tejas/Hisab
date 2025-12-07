import { Card } from "@/components/ui/card"
import Link from "next/link"

interface TradeItem {
  symbol: string
  pnl: number
  pnlPercent: number
  entryPrice?: number
  direction?: string
  date?: string
}

interface TopTradesProps {
  trades: TradeItem[]
}

export function TopTrades({ trades }: TopTradesProps) {
  // --- SORTING ---
  const sortedTrades = [...trades].sort((a, b) => {
    // Both profits → highest first
    if (a.pnl >= 0 && b.pnl >= 0) return b.pnl - a.pnl
    // Both losses → most negative first
    if (a.pnl < 0 && b.pnl < 0) return a.pnl - b.pnl
    // Profits first, then losses
    return b.pnl - a.pnl
  })

  // Format P&L color
  const getColor = (pnl: number) => {
    if (pnl > 0) return "text-green-600"
    if (pnl < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  // Date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Top Trades</h3>
        <Link href="/dashboard/trades" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {sortedTrades.slice(0, 3).map((trade, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{trade.symbol}</p>
              <p className="text-xs text-muted-foreground">
                {trade.direction ? trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1) : "Trade"}
                {" • "}
                {trade.date ? formatDate(trade.date) : ""}
              </p>
            </div>

            <div className="text-right">
              <p className={`font-medium ${getColor(trade.pnl)}`}>
                {trade.pnl > 0 ? "+" : ""}
                ₹{trade.pnl.toLocaleString("en-IN")} ({trade.pnlPercent.toFixed(2)}%)
              </p>

              {trade.entryPrice && (
                <p className="text-xs text-muted-foreground">
                  Entry: ₹{trade.entryPrice}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
