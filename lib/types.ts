export interface Trade {
  id: string
  symbol: string
  date: string
  entryPrice: number
  exitPrice: number
  quantity: number
  direction: "long" | "short"
  stopLoss: number
  target: number
  strategy: string
  outcome: "full-success" | "partial" | "breakeven" | "followed-plan" | "mistake"
  pnl: number
  pnlPercent: number
  riskReward: string
  tradeAnalysis: string

  // Psychology fields
  entryConfidence: number
  satisfaction: number
  emotionalState: "calm" | "overconfident" | "impatient" | "frustrated" | "anxious"
  mistakes: string[]
  lessonsLearned: string
}

export interface DashboardStats {
  highestPnl: number
  winRate: number
  avgRiskReward: string
  tradesThisMonth: number
  confidenceIndex: number
}

export interface TradeFormData {
  symbol: string
  date: string
  entryPrice: number
  exitPrice: number
  quantity: number
  direction: "long" | "short"
  stopLoss: number
  target: number
  strategy: string
  outcome: string
  tradeAnalysis: string
  entryConfidence: number
  satisfaction: number
  emotionalState: string
  mistakes: string[]
  lessonsLearned: string
}
