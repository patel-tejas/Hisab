"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/stats-cards";
import { ConfidenceIndex } from "@/components/confidence-index";
import { CumulativePnlChart } from "@/components/cumulative-pnl-chart";
import { TopTrades } from "@/components/top-trades";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/sign-in";
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        if (data) setData(data);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <StatsCards
        highestPnl={data.highestPnl}
        winRate={data.winRate}
        avgRiskReward={data.avgRiskReward}
        tradesThisMonth={data.tradesThisMonth}
      />

      <ConfidenceIndex value={data.confidenceIndex} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CumulativePnlChart data={data.cumulativePnl} />
        </div>
        <TopTrades trades={data.topTrades} />
      </div>
    </div>
  );
}
