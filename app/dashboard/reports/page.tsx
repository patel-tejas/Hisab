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
  AreaChart,
  Area,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ChartCard } from "@/components/reports/chart-card";

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
  totalAmount: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded shadow-lg text-sm">
        <p className="font-semibold">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("performance");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [range, setRange] = useState("365"); // Default expanded range

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

    // Sort by date ascending
    return trades
      .filter((t) => new Date(t.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trades, range]);

  // ===============================
  // 📌 CUMULATIVE PNL
  // ===============================
  const cumulativeData = useMemo(() => {
    let runningTotal = 0;
    return filteredTrades.map((t) => {
      runningTotal += t.pnl;
      return {
        date: new Date(t.date).toLocaleDateString(),
        pnl: runningTotal,
        dailyPnl: t.pnl,
      };
    });
  }, [filteredTrades]);

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
        profitFactor: 0,
        totalPnl: 0,
      };
    }

    const wins = filteredTrades.filter((t) => t.pnl > 0).length;
    const losses = filteredTrades.filter((t) => t.pnl < 0).length;
    const breakeven = filteredTrades.filter((t) => t.pnl === 0).length;

    const avgWinTrades = filteredTrades.filter((t) => t.pnl > 0);
    const avgLossTrades = filteredTrades.filter((t) => t.pnl < 0);

    const totalWinAmount = avgWinTrades.reduce((s, t) => s + t.pnl, 0);
    const totalLossAmount = Math.abs(avgLossTrades.reduce((s, t) => s + t.pnl, 0));

    const avgWin = totalWinAmount / (avgWinTrades.length || 1);
    const avgLoss = (totalLossAmount * -1) / (avgLossTrades.length || 1); // keep negative

    const winRate = Math.round((wins / filteredTrades.length) * 100);

    // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss) - using absolute avgLoss here
    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * Math.abs(avgLoss);

    const profitFactor = totalLossAmount === 0 ? totalWinAmount : totalWinAmount / totalLossAmount;

    // Daily performance grouping
    const dailyMap: Record<string, number[]> = {};
    filteredTrades.forEach((t) => {
      const d = new Date(t.date).toLocaleDateString();
      if (!dailyMap[d]) dailyMap[d] = [];
      dailyMap[d].push(t.pnl);
    });

    const dailyStats = Object.entries(dailyMap).map(([date, arr]) => ({
      date,
      pnl: arr.reduce((s, t) => s + t, 0),
    }));

    const bestDay = dailyStats.length ? Math.max(...dailyStats.map((x) => x.pnl)) : 0;
    const worstDay = dailyStats.length ? Math.min(...dailyStats.map((x) => x.pnl)) : 0;
    const totalPnl = totalWinAmount - totalLossAmount;

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
      profitFactor,
      totalPnl,
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

    return Object.entries(map)
      .map(([strategy, pnl]) => ({
        strategy,
        pnl,
      }))
      .sort((a, b) => b.pnl - a.pnl);
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
      t.mistakes?.forEach((m) => {
        if (!map[m]) map[m] = 0;
        map[m] += 1;
      });
    });

    return Object.entries(map)
      .filter(([k]) => k !== "No Mistakes")
      .map(([mistake, count]) => ({ mistake, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTrades]);

  // ===============================
  // 📌 EMOTIONAL STATE STATS
  // ===============================
  const emotionStats = useMemo(() => {
    const map: Record<string, number> = {};
    const pnlMap: Record<string, number> = {};

    filteredTrades.forEach((t) => {
      const state = t.emotionalState || "Unknown";
      if (!map[state]) {
        map[state] = 0;
        pnlMap[state] = 0;
      }
      map[state] += 1;
      pnlMap[state] += t.pnl;
    });

    return Object.entries(map).map(([state, count]) => ({
      state,
      count,
      percentage: Math.round((count / filteredTrades.length) * 100),
      avgPnl: pnlMap[state] / count
    })).sort((a, b) => b.count - a.count);
  }, [filteredTrades]);

  // ===============================
  // 📌 JOURNAL ENTRIES
  // ===============================
  const journalEntries = [...filteredTrades]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tabs = [
    { id: "performance" as Tab, label: "Performance", icon: BarChart2 },
    { id: "psychology" as Tab, label: "Psychology", icon: Brain },
    { id: "risk" as Tab, label: "Risk", icon: Shield },
    { id: "journal" as Tab, label: "Journal", icon: FileText },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>

        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
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
      </div>

      {/* ===============================
          PERFORMANCE TAB
      =============================== */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* TOP STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
              <p className={cn("text-2xl font-bold", performance.totalPnl >= 0 ? "text-green-600" : "text-red-600")}>
                ₹{performance.totalPnl.toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">{performance.winRate}%</p>
              <p className="text-xs text-muted-foreground">Out of {filteredTrades.length} trades</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Profit Factor</p>
              <p className="text-2xl font-bold">{performance.profitFactor.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Expectancy</p>
              <p className="text-2xl font-bold">₹{performance.expectancy.toFixed(2)}</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* CUMULATIVE PNL CHART */}
            <ChartCard title="Equity Curve (Cumulative PnL)">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData}>
                  <defs>
                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" hide />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="pnl" stroke="#22c55e" fillOpacity={1} fill="url(#colorPnl)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* DAILY PNL BAR CHART */}
            <ChartCard title="Daily P&L">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pnl">
                    {performance.dailyStats.map((entry, i) => (
                      <Cell key={i} fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* WIN/LOSS PIE */}
            <ChartCard title="Win/Loss Ratio" height="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePie>
                  <Pie data={winLossData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {winLossData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </RePie>
              </ResponsiveContainer>
            </ChartCard>

            {/* STRATEGY PNL */}
            <div className="lg:col-span-2">
              <ChartCard title="Strategy Performance" height="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" />
                    <YAxis dataKey="strategy" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="pnl" fill="#8b5cf6">
                      {strategyStats.map((entry, i) => (
                        <Cell key={i} fill={entry.pnl >= 0 ? "#8b5cf6" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </div>
      )}

      {/* ===============================
          PSYCHOLOGY TAB
      =============================== */}
      {activeTab === "psychology" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* EMOTIONAL STATES */}
            <ChartCard title="Emotional State Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionStats}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="state" />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Avg PnL by Emotion */}
            <ChartCard title="Average P&L by Emotion">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionStats}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="state" />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="avgPnl">
                    {emotionStats.map((entry, i) => (
                      <Cell key={i} fill={entry.avgPnl >= 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <Card className="p-5">
            <h3 className="font-semibold mb-4">Common Mistakes Impact</h3>
            <div className="space-y-4">
              {mistakeCount.map((m) => (
                <div key={m.mistake} className="flex items-center gap-4">
                  <span className="w-32 text-sm">{m.mistake}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{ width: `${(m.count / filteredTrades.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{m.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ===============================
          JOURNAL TAB
      =============================== */}
      {activeTab === "journal" && (
        <Card className="p-0 overflow-hidden">
          <div className="bg-muted px-6 py-3 border-b flex font-medium text-sm text-muted-foreground">
            <div className="w-32">Date</div>
            <div className="w-24">Symbol</div>
            <div className="w-24 text-right">P&L</div>
            <div className="flex-1 px-4">Notes</div>
            <div className="w-32">Emotion</div>
          </div>
          <div className="divide-y max-h-[600px] overflow-auto">
            {journalEntries.map((entry, i) => (
              <div key={i} className="px-6 py-4 flex items-start text-sm hover:bg-muted/50 transition-colors">
                <div className="w-32 text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</div>
                <div className="w-24 font-medium">{entry.symbol}</div>
                <div className={cn("w-24 text-right font-medium", entry.pnl >= 0 ? "text-green-600" : "text-red-600")}>
                  ₹{entry.pnl.toLocaleString()}
                </div>
                <div className="flex-1 px-4 text-muted-foreground">{entry.notes || "-"}</div>
                <div className="w-32">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs dark:bg-blue-900 dark:text-blue-300">
                    {entry.emotionalState || "Neutral"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
