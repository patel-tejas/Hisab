"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUpDown, Search, ArrowUpRight, ArrowDownRight, ChevronDown, ImageIcon, CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TradeSummaryModal } from "@/components/trade-summary-modal";
import { AddTradeModal } from "@/components/add-trade-modal";
import { cn } from "@/lib/utils";

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any | null>(null);
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterDirection, setFilterDirection] = useState("all");
  const [filterOutcome, setFilterOutcome] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const LOAD_MORE_COUNT = 10;

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/trades")
      .then((res) => res.json())
      .then((data) => {
        setTrades(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const calculateRiskReward = (t: any) => {
    if (!t.stopLoss || !t.target) return "N/A";
    const risk = Math.abs(t.entryPrice - t.stopLoss);
    const reward = Math.abs(t.target - t.entryPrice);
    if (risk === 0) return "N/A";
    return `1:${(reward / risk).toFixed(2)}`;
  };

  // Filter and sort
  const filteredTrades = trades
    .filter((t) => {
      if (filterDirection !== "all" && t.type !== filterDirection) return false;
      if (filterOutcome !== "all" && t.outcome !== filterOutcome) return false;
      if (searchQuery && !t.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Date range filter
      if (dateFrom) {
        const tradeDate = new Date(t.date).setHours(0, 0, 0, 0);
        const from = new Date(dateFrom).setHours(0, 0, 0, 0);
        if (tradeDate < from) return false;
      }
      if (dateTo) {
        const tradeDate = new Date(t.date).setHours(0, 0, 0, 0);
        const to = new Date(dateTo).setHours(0, 0, 0, 0);
        if (tradeDate > to) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-asc": return +new Date(a.date) - +new Date(b.date);
        case "date-desc": return +new Date(b.date) - +new Date(a.date);
        case "pnl-high": return b.pnl - a.pnl;
        case "pnl-low": return a.pnl - b.pnl;
        default: return +new Date(b.date) - +new Date(a.date);
      }
    });

  const visibleTrades = filteredTrades.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTrades.length;

  // Summary stats
  const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
  const winCount = filteredTrades.filter((t) => t.pnl > 0).length;
  const lossCount = filteredTrades.filter((t) => t.pnl <= 0).length;

  const outcomeLabels: Record<string, string> = {
    success: "Success",
    mistake: "Mistake",
    breakeven: "Breakeven",
    followed_plan: "Followed Plan",
    partial: "Partial",
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trade History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredTrades.length} trades •
            <span className="text-emerald-500 ml-1">{winCount}W</span> /
            <span className="text-rose-500 ml-1">{lossCount}L</span> •
            <span className={cn("ml-1 font-medium", totalPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
              {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toLocaleString("en-IN")}
            </span>
          </p>
        </div>

        <Button
          onClick={() => { setTradeToEdit(null); setIsAddTradeOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 h-10 px-5 transition-all hover:scale-[1.02]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Trade
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 glass-card">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setVisibleCount(10); }}
                className="h-9 pl-8 pr-3 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                title="From date"
              />
            </div>
            <span className="text-muted-foreground text-xs">to</span>
            <div className="relative">
              <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setVisibleCount(10); }}
                className="h-9 pl-8 pr-3 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                title="To date"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { setDateFrom(""); setDateTo(""); }}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-9 rounded-lg bg-secondary/50 border-border text-sm">
                <ArrowUpDown className="h-3 w-3 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="pnl-high">P&L (High)</SelectItem>
                <SelectItem value="pnl-low">P&L (Low)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger className="w-28 h-9 rounded-lg bg-secondary/50 border-border text-sm">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterOutcome} onValueChange={setFilterOutcome}>
              <SelectTrigger className="w-32 h-9 rounded-lg bg-secondary/50 border-border text-sm">
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="mistake">Mistake</SelectItem>
                <SelectItem value="breakeven">Breakeven</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-20 bg-secondary/50 rounded"></div>
                  <div className="h-4 w-24 bg-secondary/50 rounded"></div>
                  <div className="h-4 w-16 bg-secondary/50 rounded"></div>
                  <div className="flex-1 h-4 bg-secondary/30 rounded"></div>
                  <div className="h-4 w-20 bg-secondary/50 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ArrowUpDown className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No trades found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new trade.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Symbol</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Direction</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Entry / Exit</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">P&L</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">R:R</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Strategy</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Outcome</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleTrades.map((trade) => (
                <TableRow
                  key={trade._id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50 group"
                  onClick={() => setSelectedTrade(trade)}
                >
                  <TableCell className="text-sm text-muted-foreground">{formatDate(trade.date)}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{trade.symbol}</span>
                      {trade.images && trade.images.length > 0 && (
                        <span title={`${trade.images.length} image(s)`}>
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold",
                      trade.type === "long"
                        ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400"
                        : "bg-orange-500/10 text-orange-500 dark:text-orange-400"
                    )}>
                      {trade.type === "long" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {trade.type === "long" ? "LONG" : "SHORT"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm space-y-0.5">
                      <div className="text-foreground font-medium">{trade.entryPrice}</div>
                      <div className="text-muted-foreground text-xs">{trade.exitPrice}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className={cn("font-semibold text-sm", trade.pnl >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")}>
                      {trade.pnl >= 0 ? "+" : ""}₹{trade.pnl.toLocaleString("en-IN")}
                    </div>
                    <div className={cn("text-[11px]", trade.pnl >= 0 ? "text-emerald-500/70" : "text-rose-500/70")}>
                      {trade.pnl >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                      {calculateRiskReward(trade)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">{trade.strategy}</span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={cn("font-medium text-[11px] rounded-md border-0", {
                        "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400": trade.outcome === "success",
                        "bg-rose-500/10 text-rose-500 dark:text-rose-400": trade.outcome === "mistake",
                        "bg-zinc-500/10 text-zinc-400": trade.outcome === "breakeven",
                        "bg-amber-500/10 text-amber-500 dark:text-amber-400": trade.outcome === "followed_plan",
                        "bg-blue-500/10 text-blue-500 dark:text-blue-400": trade.outcome === "partial",
                      })}
                    >
                      {outcomeLabels[trade.outcome] || trade.outcome}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTradeToEdit(trade);
                          setIsAddTradeOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Footer */}
      {!isLoading && filteredTrades.length > 0 && (
        <div className="flex flex-col items-center gap-3 py-2">
          <span className="text-sm text-muted-foreground">
            Showing {visibleTrades.length} of {filteredTrades.length} trades
          </span>
          {hasMore && (
            <Button
              variant="outline"
              className="rounded-xl px-8"
              onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
            >
              <Loader2 className="h-4 w-4 mr-2 hidden" />
              Load More
            </Button>
          )}
        </div>
      )}

      {/* Trade Summary Modal */}
      <TradeSummaryModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={() => setSelectedTrade(null)}
      />

      <AddTradeModal
        open={isAddTradeOpen}
        onOpenChange={setIsAddTradeOpen}
        tradeToEdit={tradeToEdit}
      />
    </div>
  );
}
