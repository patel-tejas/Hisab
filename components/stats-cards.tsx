import { TrendingUp, Trophy, Target, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  highestPnl: number
  winRate: number
  avgRiskReward: string
  tradesThisMonth: number
}

export function StatsCards({ highestPnl, winRate, avgRiskReward, tradesThisMonth }: StatsCardsProps) {
  const stats = [
    {
      label: "Highest P&L",
      value: `₹${highestPnl.toLocaleString("en-IN")}`,
      change: "+287.5% vs last month",
      changeColor: "text-green-600",
      progressColor: "bg-green-500",
      progress: 100,
      icon: TrendingUp,
      iconBg: "bg-green-100 text-green-600",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      change: "+19.4% vs last month",
      changeColor: "text-green-600",
      progressColor: "bg-primary",
      progress: winRate,
      icon: Trophy,
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      label: "Avg. Risk/Reward",
      value: avgRiskReward,
      change: "+1.86% vs last month",
      changeColor: "text-green-600",
      progressColor: "bg-muted",
      progress: 50,
      icon: Target,
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      label: "Trades This Month",
      value: tradesThisMonth.toString(),
      change: "-1 vs last month",
      changeColor: "text-muted-foreground",
      progressColor: "bg-transparent",
      progress: 0,
      icon: Activity,
      iconBg: "bg-pink-100 text-pink-600",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={cn("text-xs", stat.changeColor)}>{stat.change}</p>
            </div>
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.iconBg)}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          {stat.progress > 0 && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", stat.progressColor)}
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
