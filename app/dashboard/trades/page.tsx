"use client";

import { useEffect, useState } from "react";
import { Filter, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TradeSummaryModal } from "@/components/trade-summary-modal";
import { cn } from "@/lib/utils";

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any | null>(null);

  // Fetch trades from DB
  useEffect(() => {
    fetch("/api/trades")
      .then((res) => res.json())
      .then(setTrades);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getOutcomeBadge = (outcome: string) => {
    const styles: Record<string, string> = {
      success: "bg-green-500 hover:bg-green-500 text-white",
      mistake: "bg-red-500 hover:bg-red-500 text-white",
      breakeven: "bg-gray-500 hover:bg-gray-500 text-white",
      "followed_plan": "bg-yellow-500 hover:bg-yellow-500 text-white",
      partial: "bg-blue-500 hover:bg-blue-500 text-white",
    };

    const labels: Record<string, string> = {
      success: "Full Success",
      mistake: "Mistake",
      breakeven: "Breakeven",
      followed_plan: "Followed Plan",
      partial: "Partial",
    };

    return (
      <Badge className={cn("font-medium", styles[outcome] || "bg-gray-500 text-white")}>
        {labels[outcome] || outcome}
      </Badge>
    );
  };

  const calculateRiskReward = (t: any) => {
    if (!t.stopLoss || !t.target) return "N/A";

    const risk = Math.abs(t.entryPrice - t.stopLoss);
    const reward = Math.abs(t.target - t.entryPrice);

    if (risk === 0) return "N/A";
    return `1:${(reward / risk).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Trade History</h1>

        <div className="flex items-center gap-3">
          <Select defaultValue="default">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="date-desc">Date (Newest)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest)</SelectItem>
              <SelectItem value="pnl-high">P&L (High)</SelectItem>
              <SelectItem value="pnl-low">P&L (Low)</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter Trades
          </Button>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Trade
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>DATE</TableHead>
              <TableHead>SYMBOL</TableHead>
              <TableHead>DIRECTION</TableHead>
              <TableHead>ENTRY/EXIT</TableHead>
              <TableHead>P/L (₹ / %)</TableHead>
              <TableHead>RISK/REWARD</TableHead>
              <TableHead>STRATEGY</TableHead>
              <TableHead>OUTCOME</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {trades.map((trade) => (
              <TableRow
                key={trade._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedTrade(trade)}
              >
                <TableCell>{formatDate(trade.date)}</TableCell>

                <TableCell className="font-medium">{trade.symbol}</TableCell>

                <TableCell>
                  <Badge
                    className={cn(
                      "font-medium",
                      trade.type === "long"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    )}
                  >
                    {trade.type === "long" ? "Long" : "Short"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    <div>{trade.entryPrice}</div>
                    <div>{trade.exitPrice}</div>
                  </div>
                </TableCell>

                <TableCell>
                  <div
                    className={cn(
                      "font-medium",
                      trade.pnl >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {trade.pnl >= 0 ? "+" : ""}
                    {trade.pnl.toLocaleString("en-IN")}
                  </div>

                  <div
                    className={cn(
                      "text-xs",
                      trade.pnl >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {trade.pnl >= 0 ? "+" : ""}
                    {trade.pnlPercent.toFixed(2)}%
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className="font-mono bg-primary/10 text-primary hover:bg-primary/10"
                  >
                    {calculateRiskReward(trade)}
                  </Badge>
                </TableCell>

                <TableCell>{trade.strategy}</TableCell>

                <TableCell>{getOutcomeBadge(trade.outcome)}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="text-primary">
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-center text-sm text-muted-foreground">
        Showing {trades.length} trades
      </div>

      {/* Trade Summary Modal */}
      <TradeSummaryModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={() => setSelectedTrade(null)}
      />
    </div>
  );
}
