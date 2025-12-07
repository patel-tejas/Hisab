"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart2,
  Brain,
  Shield,
  FileText,
  ChevronDown,
  Trophy,
  Calendar,
  TrendingUp,
  PieChart,
  Heart,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  PieChart as RePie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type Tab = "performance" | "psychology" | "risk" | "journal";

interface Trade {
  date: string;
  pnl: number;
  pnlPercent: number;
  symbol: string;
  strategy: string;
  emotionalState: string;
  mistakes: string[];
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  notes: string;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("performance");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [range, setRange] = useState("30"); // days

  // Fetch trade data
  useEffect(() => {
    fetch("/api/trades")
      .then((res) => res.json())
      .then((data) => setTrades(data));
  }, []);

  // ===============================
  // 📌 FILTER TRADES BY RANGE
  // ===============================
  const filteredTrades = useMemo(() => {
    const days = Number(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return trades.filter((t) => new Date(t.date) >= cutoff);
  }, [trades, range]);

  // ===============================
  // 📌 PERFORMANCE CALCULATIONS
  // ===============================
  const performance = useMemo(() => {
    if (filteredTrades.length === 0) {
      return {
        wins: 0,
        losses: 0,
        breakeven: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        expectancy: 0,
        dailyStats: [],
        bestDay: 0,
        worstDay: 0,
      };
    }

    const wins = filteredTrades.filter((t) => t.pnl > 0).length;
    const losses = filteredTrades.filter((t) => t.pnl < 0).length;
    const breakeven = filteredTrades.filter((t) => t.pnl === 0).length;

    const avgWinTrades = filteredTrades.filter((t) => t.pnl > 0);
    const avgLossTrades = filteredTrades.filter((t) => t.pnl < 0);

    const avgWin =
      avgWinTrades.reduce((s, t) => s + t.pnl, 0) / (avgWinTrades.length || 1);
    const avgLoss =
      avgLossTrades.reduce((s, t) => s + t.pnl, 0) / (avgLossTrades.length || 1);

    const winRate = Math.round((wins / filteredTrades.length) * 100);

    const expectancy = winRate / 100 * avgWin + (1 - winRate / 100) * avgLoss;

    // Daily performance grouping
    const dailyMap: Record<string, number[]> = {};
    filteredTrades.forEach((t) => {
      const d = t.date.slice(0, 10);
      if (!dailyMap[d]) dailyMap[d] = [];
      dailyMap[d].push(t.pnl);
    });

    const dailyStats = Object.entries(dailyMap).map(([date, arr]) => ({
      date,
      pnl: arr.reduce((s, t) => s + t, 0),
    }));

    const bestDay = Math.max(...dailyStats.map((x) => x.pnl));
    const worstDay = Math.min(...dailyStats.map((x) => x.pnl));

    return {
      wins,
      losses,
      breakeven,
      winRate,
      avgWin,
      avgLoss,
      expectancy,
      dailyStats,
      bestDay,
      worstDay,
    };
  }, [filteredTrades]);

  // ===============================
  // 📌 STRATEGY PNL
  // ===============================
  const strategyStats = useMemo(() => {
    const map: Record<string, number> = {};

    filteredTrades.forEach((t) => {
      if (!map[t.strategy]) map[t.strategy] = 0;
      map[t.strategy] += t.pnl;
    });

    return Object.entries(map).map(([strategy, pnl]) => ({
      strategy,
      pnl,
    }));
  }, [filteredTrades]);

  // ===============================
  // 📌 WIN/LOSS DISTRIBUTION
  // ===============================
  const winLossData = [
    { name: "Wins", value: performance.wins, color: "#22c55e" },
    { name: "Losses", value: performance.losses, color: "#ef4444" },
  ];

  // ===============================
  // 📌 MISTAKES DATA
  // ===============================
  const mistakeCount = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach((t) => {
      t.mistakes.forEach((m) => {
        if (!map[m]) map[m] = 0;
        map[m] += 1;
      });
    });

    return Object.entries(map)
      .filter(([k]) => k !== "No Mistakes")
      .map(([mistake, count]) => ({ mistake, count }));
  }, [filteredTrades]);

  // ===============================
  // 📌 EMOTIONAL STATE STATS
  // ===============================
  const emotionStats = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach((t) => {
      if (!map[t.emotionalState]) map[t.emotionalState] = 0;
      map[t.emotionalState] += 1;
    });

    return Object.entries(map).map(([state, count]) => ({
      state,
      percentage: Math.round((count / filteredTrades.length) * 100),
    }));
  }, [filteredTrades]);

  // ===============================
  // 📌 JOURNAL ENTRIES
  // ===============================
  const journalEntries = filteredTrades
    .map((t) => ({
      date: t.date,
      symbol: t.symbol,
      notes: t.notes,
      pnl: t.pnl,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // ------------------------------------------
  // ✔ Everything below is UI (using the dynamic data above)
  // ------------------------------------------

  const tabs = [
    { id: "performance" as Tab, label: "Performance", icon: BarChart2 },
    { id: "psychology" as Tab, label: "Psychology", icon: Brain },
    { id: "risk" as Tab, label: "Risk", icon: Shield },
    { id: "journal" as Tab, label: "Journal", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Last {range} Days <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRange("7")}>Last 7 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRange("30")}>Last 30 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRange("90")}>Last 90 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRange("365")}>This Year</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ===============================
          PERFORMANCE TAB
      =============================== */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* TOP ROW CARDS */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* TRADE PERFORMANCE */}
            <Card className="p-5">
              <h3 className="font-semibold mb-2">Trade Performance</h3>

              <div className="text-3xl font-bold">
                <span className="text-green-600">{performance.wins}</span> /{" "}
                <span className="text-red-600">{performance.losses}</span> /{" "}
                <span className="text-muted-foreground">{performance.breakeven}</span>
              </div>

              <p className="text-sm text-muted-foreground">Win / Loss / BE</p>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Win</p>
                  <p className="text-green-600 font-semibold">₹{performance.avgWin.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Avg Loss</p>
                  <p className="text-red-600 font-semibold">₹{performance.avgLoss.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="font-semibold">{performance.winRate}%</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Expectancy</p>
                  <p className="font-semibold">₹{performance.expectancy.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            {/* DAILY PERFORMANCE */}
            <Card className="p-5">
              <h3 className="font-semibold mb-2">Daily Performance</h3>
              <p className="text-sm text-muted-foreground">Best / Worst Day</p>

              <div className="text-lg font-semibold mt-2">
                Best: <span className="text-green-600">₹{performance.bestDay}</span>
              </div>
              <div className="text-lg font-semibold">
                Worst: <span className="text-red-600">₹{performance.worstDay}</span>
              </div>

              <div className="h-[200px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performance.dailyStats}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pnl">
                      {performance.dailyStats.map((entry, i) => (
                        <Cell key={i} fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* EXECUTION */}
            <Card className="p-5">
              <h3 className="font-semibold mb-2">Execution</h3>

              <p>Total Trades: {filteredTrades.length}</p>
              <p>
                Avg Position Size: ₹
                {(
                  filteredTrades.reduce((s, t) => s + t.entryPrice * t.quantity, 0) /
                  filteredTrades.length
                ).toFixed(0)}
              </p>
              <p>Most Used Strategy: {strategyStats[0]?.strategy || "-"}</p>
            </Card>
          </div>

          {/* WIN/LOSS PIE */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Win/Loss Distribution</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePie>
                    <Pie data={winLossData} dataKey="value" innerRadius={60} outerRadius={100}>
                      {winLossData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePie>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* STRATEGY PNL */}
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Strategy vs P&L</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyStats}>
                    <XAxis dataKey="strategy" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pnl" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* COMMON MISTAKES */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Most Common Mistakes</h3>

            {mistakeCount.map((m) => (
              <div key={m.mistake} className="mb-2">
                <p>{m.mistake}</p>
                <div
                  className="bg-red-500 rounded h-3 mt-1"
                  style={{ width: `${(m.count / filteredTrades.length) * 100}%` }}
                />
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ===============================
          PSYCHOLOGY TAB
      =============================== */}
      {activeTab === "psychology" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* EMOTIONAL STATES */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Emotional State Breakdown</h3>
            {emotionStats.map((e) => (
              <div key={e.state} className="flex justify-between">
                <span>{e.state}</span>
                <span>{e.percentage}%</span>
              </div>
            ))}
          </Card>

          {/* RR by emotional state */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Avg R:R by Emotional State</h3>
            {emotionStats.map((e) => (
              <div key={e.state} className="flex justify-between">
                <span>{e.state}</span>
                <span>
                  1:
                  {(
                    filteredTrades
                      .filter((t) => t.emotionalState === e.state)
                      .reduce((s, t) => s + t.pnl / (t.entryPrice * t.quantity), 0) || 0
                  ).toFixed(2)}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ===============================
          JOURNAL TAB
      =============================== */}
      {activeTab === "journal" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold mb-4">Journal</h3>

          {journalEntries.map((entry, i) => (
            <div key={i} className="border-l-4 pl-4 py-2">
              <p className="text-sm text-muted-foreground">
                {entry.date.slice(0, 10)} - {entry.symbol}
              </p>
              <p className="mt-1">{entry.notes || "No notes added"}</p>
              <p
                className={cn(
                  "mt-1 font-semibold",
                  entry.pnl >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                P&L: ₹{entry.pnl}
              </p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
