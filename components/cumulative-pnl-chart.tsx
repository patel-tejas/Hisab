
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { cn } from "@/lib/utils"

interface CumulativePnlChartProps {
  data: { date: string; pnl: number }[]
}

export function CumulativePnlChart({ data }: CumulativePnlChartProps) {
  const [period, setPeriod] = useState<"D" | "W" | "M">("D")

  return (
    <Card className="p-6 glass-card relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-50 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors pointer-events-none">
        {/* Background decoration */}
        <div className="w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl absolute -top-10 -right-10"></div>
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="font-semibold text-foreground text-lg">Equity Curve</h3>
          <p className="text-sm text-muted-foreground">Cumulative P&L Over Time</p>
        </div>
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
          {(["D", "W", "M"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 w-8 p-0 text-xs transition-all",
                period === p ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[250px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                backdropFilter: "blur(4px)",
                color: "#f8fafc"
              }}
              formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "P&L"]}
              labelStyle={{ color: "#94a3b8", marginBottom: "0.25rem" }}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#818cf8"
              strokeWidth={3}
              fill="url(#pnlGradient)"
              activeDot={{ fill: "#6366f1", stroke: "#fff", strokeWidth: 2, r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
