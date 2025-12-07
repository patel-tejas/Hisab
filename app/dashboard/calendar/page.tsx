"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Trophy,
  Activity,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Types
interface DayData {
  pnl: number;
  trades: number;
  items: any[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrades, setSelectedTrades] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // FETCH REAL TRADES
  useEffect(() => {
    fetch("/api/trades")
      .then((res) => res.json())
      .then(setTrades);
  }, []);

  // === MONTHLY STATS ===
  const monthlyStats = useMemo(() => {
    const monthTrades = trades.filter((t) => {
      const tradeDate = new Date(t.date);
      return (
        tradeDate.getMonth() === currentDate.getMonth() &&
        tradeDate.getFullYear() === currentDate.getFullYear()
      );
    });

    const totalPnl = monthTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = monthTrades.filter((t) => t.pnl > 0).length;

    const winRate =
      monthTrades.length > 0
        ? Math.round((wins / monthTrades.length) * 100)
        : 0;

    return {
      totalPnl,
      winRate,
      totalTrades: monthTrades.length,
      avgRR: "1:2.4", // Simplified placeholder
    };
  }, [currentDate, trades]);

  // === DAY WISE DATA (CALENDAR) ===
  const calendarData = useMemo(() => {
    const data: Record<string, DayData> = {};

    trades.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      if (!data[key]) {
        data[key] = { pnl: 0, trades: 0, items: [] };
      }

      data[key].pnl += t.pnl;
      data[key].trades += 1;
      data[key].items.push(t);
    });

    return data;
  }, [trades]);

  // === WEEKLY SUMMARY ===
  const weeklySummary = useMemo(() => {
    const weekMap: Record<number, { pnl: number; trades: number }> = {};

    trades.forEach((t) => {
      const date = new Date(t.date);
      const weekNum = Math.ceil((date.getDate() - date.getDay()) / 7) + 1;

      if (!weekMap[weekNum]) {
        weekMap[weekNum] = { pnl: 0, trades: 0 };
      }

      weekMap[weekNum].pnl += t.pnl;
      weekMap[weekNum].trades += 1;
    });

    return weekMap;
  }, [trades]);

  // === CALENDAR GRID ===
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const days: (number | null)[] = [];

    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(d);

    return days;
  };

  const days = generateCalendar();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const openDateTrades = (day: number) => {
    const key = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayInfo = calendarData[key];

    if (dayInfo) {
      setSelectedTrades(dayInfo.items);
      setModalOpen(true);
    }
  };

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Monthly Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 fade-in">
          <p className="text-xs text-muted-foreground">TOTAL P&L</p>
          <h2
            className={cn(
              "text-2xl font-bold",
              monthlyStats.totalPnl >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {monthlyStats.totalPnl >= 0 ? "+" : "-"}
            ₹{Math.abs(monthlyStats.totalPnl).toLocaleString("en-IN")}
          </h2>
        </Card>

        <Card className="p-5 fade-in">
          <p className="text-xs text-muted-foreground">WIN RATE</p>
          <h2 className="text-2xl font-bold">{monthlyStats.winRate}%</h2>
        </Card>

        <Card className="p-5 fade-in">
          <p className="text-xs text-muted-foreground">TOTAL TRADES</p>
          <h2 className="text-2xl font-bold">{monthlyStats.totalTrades}</h2>
        </Card>

        <Card className="p-5 fade-in">
          <p className="text-xs text-muted-foreground">AVG. R:R</p>
          <h2 className="text-2xl font-bold">{monthlyStats.avgRR}</h2>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card className="p-6 fade-in">
        <h2 className="font-semibold mb-3">📊 Weekly Performance</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(weeklySummary).map(([week, data]) => (
            <Card key={week} className="p-4 bg-muted/50 shadow-sm scale-in">
              <h3 className="font-medium">Week {week}</h3>

              <p
                className={cn(
                  "font-bold",
                  data.pnl >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {data.pnl >= 0 ? "+" : "-"}₹
                {Math.abs(data.pnl).toLocaleString("en-IN")}
              </p>

              <p className="text-xs text-muted-foreground">
                {data.trades} trades
              </p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-6">
        <div className="flex justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft />
          </Button>
          <h2 className="text-lg font-semibold">{monthName}</h2>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight />
          </Button>
        </div>

        {/* Week Headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((w) => (
            <div key={w} className="text-center text-sm text-muted-foreground">
              {w}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            if (day === null) return <div key={idx} className="h-24" />;

            const key = `${currentDate.getFullYear()}-${String(
              currentDate.getMonth() + 1
            ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const dayInfo = calendarData[key];

            return (
              <div
                key={idx}
                onClick={() => openDateTrades(day)}
                className={cn(
                  "h-24 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-md",
                  dayInfo
                    ? dayInfo.pnl >= 0
                      ? "bg-green-50"
                      : "bg-red-50"
                    : "bg-muted/30"
                )}
              >
                <div className="text-sm font-medium text-muted-foreground">
                  {day}
                </div>

                {dayInfo && (
                  <div className="mt-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        dayInfo.pnl >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {dayInfo.pnl >= 0 ? "+" : "-"}₹
                      {Math.abs(dayInfo.pnl).toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {dayInfo.trades} trades
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* DATE TRADE MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Trades on this day</DialogTitle>
          </DialogHeader>

          {selectedTrades.length === 0 ? (
            <p className="text-muted-foreground">No trades on this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedTrades.map((trade, i) => (
                <Card key={i} className="p-3 border">
                  <div className="flex justify-between">
                    <p className="font-medium">{trade.symbol}</p>
                    <p
                      className={cn(
                        "font-semibold",
                        trade.pnl >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {trade.pnl >= 0 ? "+" : "-"}₹
                      {Math.abs(trade.pnl).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">Strategy: {trade.strategy}</p>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
