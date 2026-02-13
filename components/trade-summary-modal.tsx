"use client"

import { useState } from "react"
import { Info, FileText, ImageIcon, Tag, Shield, Trophy, Star, X } from "lucide-react"
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!trade) return null

  const calculateRiskRewardPercent = () => {
    const risk = Math.abs(trade.entryPrice - trade.stopLoss)
    const reward = Math.abs(trade.target - trade.entryPrice)
    const riskPercent = (risk / trade.entryPrice) * 100
    const rewardPercent = (reward / trade.entryPrice) * 100
    return `${riskPercent.toFixed(0)}% / -${rewardPercent.toFixed(0)}%`
  }

  const formatDuration = () => {
    if (!trade.entryTime || !trade.exitTime) return "N/A"
    const [eh, em] = trade.entryTime.split(":").map(Number)
    const [xh, xm] = trade.exitTime.split(":").map(Number)
    let diffMins = (xh * 60 + xm) - (eh * 60 + em)
    if (diffMins < 0) diffMins += 24 * 60
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    if (hours === 0) return `${mins}m`
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const expectedRiskReward = () => {
    const risk = Math.abs(trade.entryPrice - trade.stopLoss)
    const reward = Math.abs(trade.target - trade.entryPrice)
    return `1:${(reward / risk).toFixed(0)}`
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Trade Summary</DialogTitle>
          </DialogHeader>

          {/* ... (rest of the modal content remains the same until lightbox) ... */}

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
                  {trade.entryTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Time</span>
                      <span className="font-medium">{trade.entryTime}</span>
                    </div>
                  )}
                  {trade.exitTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exit Time</span>
                      <span className="font-medium">{trade.exitTime}</span>
                    </div>
                  )}
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
                    <span className="font-medium">
                      {trade.stopLoss && trade.entryPrice
                        ? `1:${(Math.abs(trade.exitPrice - trade.entryPrice) / Math.abs(trade.entryPrice - trade.stopLoss)).toFixed(2)}`
                        : "N/A"}
                    </span>
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
                <div
                  className="text-muted-foreground prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: trade.tradeAnalysis }}
                />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Notes</h4>
                <p className="text-muted-foreground">{trade.notes || "No notes recorded."}</p>
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
              {trade.images && trade.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {trade.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Trade screenshot ${index + 1}`}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
                  <p>No media attached to this trade.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] bg-transparent border-none shadow-none p-0 flex items-center justify-center focus:outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={selectedImage || ""}
              alt="Full screen"
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
            />
            <button
              className="absolute -top-12 right-0 md:-right-4 md:top-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors backdrop-blur-sm z-50"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
