"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
    Sparkles,
    RefreshCw,
    TrendingUp,
    AlertTriangle,
    Target,
    Brain,
    Shield,
    Calendar,
    Loader2,
    ChevronDown,
    ChevronUp,
    Zap,
    Award,
} from "lucide-react"

interface AiInsightsData {
    ready: boolean
    overallSummary?: string
    strengths?: string[]
    weaknesses?: string[]
    patterns?: {
        bestSetup: string
        worstSetup: string
        bestDay: string
        emotionalInsight: string
        streakAnalysis: string
    }
    actionItems?: string[]
    riskManagement?: string
    psychologyTip?: string
    weeklyFocus?: string
    traderLevel?: string
    confidenceScore?: number
    summary?: string
    parseError?: boolean
}

const CACHE_KEY = "ai-insights-cache"
const CACHE_TTL = 1000 * 60 * 60 * 4 // 4 hours

function getCached(): AiInsightsData | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const { data, timestamp } = JSON.parse(raw)
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(CACHE_KEY)
            return null
        }
        return data
    } catch {
        return null
    }
}

function setCache(data: AiInsightsData) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

const levelColors: Record<string, string> = {
    beginner: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    advanced: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    expert: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
}

export function AiInsights() {
    const [data, setData] = useState<AiInsightsData | null>(null)
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const cached = getCached()
        if (cached) {
            setData(cached)
        }
    }, [])

    const fetchInsights = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await fetch("/api/ai-insights")
            if (!res.ok) throw new Error("Failed to fetch")
            const json = await res.json()
            setData(json)
            if (json.ready) setCache(json)
        } catch (err: any) {
            setError("Failed to load AI insights. Try again.")
        } finally {
            setLoading(false)
        }
    }

    // Not loaded yet — show CTA
    if (!data && !loading) {
        return (
            <Card className="p-6 glass-card relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-10 bg-violet-500" />
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center border border-violet-500/20">
                            <Sparkles className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-lg">AI Trading Coach</h3>
                            <p className="text-sm text-muted-foreground">
                                Get personalized insights powered by Groq Llama AI
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={fetchInsights}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20"
                    >
                        <Sparkles className="h-4 w-4 mr-2" /> Generate Insights
                    </Button>
                </div>
            </Card>
        )
    }

    // Loading state
    if (loading) {
        return (
            <Card className="p-8 glass-card relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-10 bg-violet-500 animate-pulse" />
                <div className="flex flex-col items-center justify-center gap-3 relative z-10">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-foreground">AI is analyzing your trades...</p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                </div>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="p-6 glass-card">
                <p className="text-sm text-rose-400">{error}</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={fetchInsights}>
                    Retry
                </Button>
            </Card>
        )
    }

    if (!data?.ready) {
        return (
            <Card className="p-6 glass-card">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-violet-400" />
                    <p className="text-sm text-muted-foreground">{data?.summary}</p>
                </div>
            </Card>
        )
    }

    const levelClass = levelColors[data.traderLevel || "beginner"] || levelColors.beginner

    return (
        <Card className="glass-card relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-5 bg-violet-500" />

            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center border border-violet-500/20">
                        <Sparkles className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground text-lg">AI Trading Coach</h3>
                            {data.traderLevel && (
                                <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", levelClass)}>
                                    {data.traderLevel}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Powered by Groq Llama AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {data.confidenceScore !== undefined && (
                        <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1">
                            <Award className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-sm font-bold text-foreground">{data.confidenceScore}</span>
                            <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground"
                        onClick={fetchInsights}
                        disabled={loading}
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="px-6 pb-4 relative z-10">
                <p className="text-sm text-foreground leading-relaxed">{data.overallSummary}</p>
            </div>

            {/* Quick Cards Row */}
            <div className="px-6 pb-4 grid gap-3 sm:grid-cols-2 relative z-10">
                {/* Weekly Focus */}
                {data.weeklyFocus && (
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Target className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="text-xs font-semibold text-indigo-400 uppercase">This Week&apos;s Focus</span>
                        </div>
                        <p className="text-sm text-foreground">{data.weeklyFocus}</p>
                    </div>
                )}

                {/* Psychology Tip */}
                {data.psychologyTip && (
                    <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Brain className="h-3.5 w-3.5 text-violet-400" />
                            <span className="text-xs font-semibold text-violet-400 uppercase">Psychology</span>
                        </div>
                        <p className="text-sm text-foreground">{data.psychologyTip}</p>
                    </div>
                )}
            </div>

            {/* Expandable Section */}
            <div className="px-6 pb-2 relative z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-3 w-3 mr-1" /> Hide detailed analysis
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-3 w-3 mr-1" /> Show detailed analysis
                        </>
                    )}
                </Button>
            </div>

            {expanded && (
                <div className="px-6 pb-5 space-y-4 relative z-10 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Strengths & Weaknesses */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        {data.strengths && data.strengths.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-emerald-400 uppercase flex items-center gap-1.5">
                                    <TrendingUp className="h-3 w-3" /> Strengths
                                </h4>
                                <ul className="space-y-1.5">
                                    {data.strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">✓</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {data.weaknesses && data.weaknesses.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-amber-400 uppercase flex items-center gap-1.5">
                                    <AlertTriangle className="h-3 w-3" /> Areas to Improve
                                </h4>
                                <ul className="space-y-1.5">
                                    {data.weaknesses.map((w, i) => (
                                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                            <span className="text-amber-500 mt-0.5">!</span> {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Patterns */}
                    {data.patterns && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-indigo-400 uppercase flex items-center gap-1.5">
                                <Zap className="h-3 w-3" /> Trading Patterns
                            </h4>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {Object.entries(data.patterns).map(([key, val]) => (
                                    <div key={key} className="bg-muted/30 rounded-lg px-3 py-2">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">
                                            {key.replace(/([A-Z])/g, " $1").trim()}
                                        </p>
                                        <p className="text-sm text-foreground">{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Items */}
                    {data.actionItems && data.actionItems.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-blue-400 uppercase flex items-center gap-1.5">
                                <Target className="h-3 w-3" /> Action Items
                            </h4>
                            <div className="space-y-1.5">
                                {data.actionItems.map((a, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-muted/20 rounded-lg px-3 py-2">
                                        <span className="text-blue-400 font-bold text-sm mt-px">{i + 1}.</span>
                                        <p className="text-sm text-foreground">{a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Risk Management */}
                    {data.riskManagement && (
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Shield className="h-3.5 w-3.5 text-rose-400" />
                                <span className="text-xs font-semibold text-rose-400 uppercase">Risk Management</span>
                            </div>
                            <p className="text-sm text-foreground">{data.riskManagement}</p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}
