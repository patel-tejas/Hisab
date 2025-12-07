"use client"

import { useState } from "react"
import { Info, FileText, ImageIcon, Tag, Shield, Trophy, Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Trade } from "@/lib/types"

interface TradeSummaryModalProps {
  trade: Trade | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Tab = "general" | "journal" | "media"

export function TradeSummaryModal({ trade, open, onOpenChange }: TradeSummaryModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("general")

  if (!trade) return null

  const calculateRiskRewardPercent = () => {
    const risk = Math.abs(trade.entryPrice - trade.stopLoss)
    const reward = Math.abs(trade.target - trade.entryPrice)
    const riskPercent = (risk / trade.entryPrice) * 100
    const rewardPercent = (reward / trade.entryPrice) * 100
    return `${riskPercent.toFixed(0)}% / -${rewardPercent.toFixed(0)}%`
  }

  const formatDuration = () => {
    return "2 days 4 hours"
  }

  const expectedRiskReward = () => {
    const risk = Math.abs(trade.entryPrice - trade.stopLoss)
    const reward = Math.abs(trade.target - trade.entryPrice)
    return `1:${(reward / risk).toFixed(0)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Trade Summary</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "general"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("general")}
          >
            <Info className="h-4 w-4" />
            General
          </button>
          <button
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "journal"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("journal")}
          >
            <FileText className="h-4 w-4" />
            Journal
          </button>
          <button
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "media"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("media")}
          >
            <ImageIcon className="h-4 w-4" />
            Media
          </button>
        </div>

        {/* General Tab Content */}
        {activeTab === "general" && (
          <div className="grid grid-cols-2 gap-8 py-4">
            {/* Left Column - Trade Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Tag className="h-4 w-4" />
                Trade Overview
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol</span>
                  <span className="font-medium">{trade.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direction</span>
                  <span className={cn("font-medium", trade.direction === "long" ? "text-green-600" : "text-red-600")}>
                    {trade.direction === "long" ? "Long" : "Short"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Price</span>
                  <span className="font-medium">{trade.entryPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exit Price</span>
                  <span className="font-medium">{trade.exitPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trade Session</span>
                  <span className="font-medium">{formatDuration()}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Risk Management */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Shield className="h-4 w-4" />
                Risk Management
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position Size</span>
                  <span className="font-medium">{trade.quantity} Qty</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stop Loss</span>
                  <span className="font-medium text-red-600">{trade.stopLoss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-medium text-green-600">{trade.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Risk/Reward</span>
                  <span className="font-medium">{expectedRiskReward()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk/Reward %</span>
                  <span className="font-medium">{calculateRiskRewardPercent()}</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Trophy className="h-4 w-4" />
                Performance
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P&L</span>
                  <span className={cn("font-medium", trade.pnl >= 0 ? "text-green-600" : "text-red-600")}>
                    {trade.pnl >= 0 ? "+" : ""}
                    {trade.pnl.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P&L %</span>
                  <span className={cn("font-medium", trade.pnl >= 0 ? "text-green-600" : "text-red-600")}>
                    {trade.pnlPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Risk/Reward</span>
                  <span className="font-medium">{trade.riskReward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trade Outcome</span>
                  <span className="font-medium">
                    {trade.outcome === "full-success"
                      ? "Full Success"
                      : trade.outcome.charAt(0).toUpperCase() + trade.outcome.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trade Evaluation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Star className="h-4 w-4" />
                Trade Evaluation
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Entry Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${trade.entryConfidence * 10}%` }}
                      />
                    </div>
                    <span className="font-medium w-4">{trade.entryConfidence}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Satisfaction</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${trade.satisfaction * 10}%` }}
                      />
                    </div>
                    <span className="font-medium w-4">{trade.satisfaction}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emotional State</span>
                  <span className="font-medium capitalize">{trade.emotionalState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Strategy</span>
                  <span className="font-medium">{trade.strategy}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Journal Tab Content */}
        {activeTab === "journal" && (
          <div className="py-4 space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Trade Analysis</h4>
              <p className="text-muted-foreground">{trade.tradeAnalysis}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Lessons Learned</h4>
              <p className="text-muted-foreground">{trade.lessonsLearned || "No lessons recorded."}</p>
            </div>
            {trade.mistakes.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Mistakes Made</h4>
                <ul className="list-disc list-inside text-muted-foreground">
                  {trade.mistakes.map((mistake, index) => (
                    <li key={index}>{mistake}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Media Tab Content */}
        {activeTab === "media" && (
          <div className="py-4">
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
              <p>No media attached to this trade.</p>
              <Button variant="outline" className="mt-4 bg-transparent">
                Add Screenshot
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
