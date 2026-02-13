"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import {
    Sparkles, RefreshCw, TrendingUp, TrendingDown, AlertTriangle,
    Target, Brain, Shield, Loader2, Zap, Award, Eye, Flame,
    CheckCircle2, XCircle, Clock, BookOpen, Gauge, BarChart3,
    ArrowUpRight, ArrowDownRight, Minus, Activity, Heart,
} from "lucide-react"
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts"

/* ──────────────────────────────────── Types ──────────────────────────────────── */
interface AiInsightsData {
    ready: boolean; overallSummary?: string
    strengths?: string[]; weaknesses?: string[]
    patterns?: { bestSetup: string; worstSetup: string; bestDay: string; emotionalInsight: string; streakAnalysis: string }
    confidenceCalibration?: { finding: string; optimalConfidence: string; overconfidenceBias: boolean }
    lossRecovery?: { finding: string; avgTradesToRecover: number; advice: string }
    overtradingAnalysis?: { finding: string; optimalTradesPerDay: string; isOvertrading: boolean }
    sequentialPatterns?: { finding: string; tiltRisk: string; advice: string }
    whatIfScenarios?: { scenario: string; currentPnl: number; projectedPnl: number; difference: number; advice: string }[]
    tradeDuration?: { finding: string; optimalDuration: string; advice: string }
    personalizedRules?: string[]
    performanceForecast?: { projection: string; monthEndTarget: number; confidence: string }
    emotionalTrend?: { finding: string; trend: string; burnoutRisk: string; advice: string }
    riskScore?: { overall: number; maxDrawdown: number; sharpeRatio: number; assessment: string; advice: string }
    actionItems?: string[]
    traderLevel?: string; confidenceScore?: number
    summary?: string; parseError?: boolean
}

/* ──────────────────────────────────── Cache ──────────────────────────────────── */
const CACHE_KEY = "ai-insights-cache"
const CACHE_TTL = 1000 * 60 * 60 * 4

function getCached(): AiInsightsData | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const { data, timestamp } = JSON.parse(raw)
        if (Date.now() - timestamp > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null }
        return data
    } catch { return null }
}
function setCache(data: AiInsightsData) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

/* ──────────────────────────────────── Gauge SVG ──────────────────────────────────── */
function ConfidenceGauge({ score }: { score: number }) {
    const r = 72, sw = 10, circ = Math.PI * r, prog = (score / 100) * circ
    const clr = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444"
    return (
        <div className="flex flex-col items-center">
            <svg width="180" height="110" viewBox="0 0 180 110">
                <defs>
                    <linearGradient id="gg" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#ef4444" stopOpacity=".25" /><stop offset="50%" stopColor="#6366f1" stopOpacity=".25" /><stop offset="100%" stopColor="#10b981" stopOpacity=".25" /></linearGradient>
                    <filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <path d={`M ${90 - r} 95 A ${r} ${r} 0 0 1 ${90 + r} 95`} fill="none" stroke="url(#gg)" strokeWidth={sw} strokeLinecap="round" />
                <path d={`M ${90 - r} 95 A ${r} ${r} 0 0 1 ${90 + r} 95`} fill="none" stroke={clr} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${prog} ${circ}`} filter="url(#gl)" className="transition-all duration-1000" />
                <text x="90" y="72" textAnchor="middle" className="fill-foreground font-bold" fontSize="32">{score}</text>
                <text x="90" y="92" textAnchor="middle" className="fill-muted-foreground" fontSize="11">/ 100</text>
            </svg>
            <span className="text-xs font-medium text-muted-foreground -mt-1">AI Confidence</span>
        </div>
    )
}

/* ──────────────────────────────────── Trader Level ──────────────────────────────────── */
const lvlCfg: Record<string, { emoji: string; color: string }> = {
    beginner: { emoji: "🌱", color: "text-blue-400" },
    intermediate: { emoji: "⚡", color: "text-amber-400" },
    advanced: { emoji: "🔥", color: "text-indigo-400" },
    expert: { emoji: "👑", color: "text-emerald-400" },
}

function TraderLevel({ level }: { level: string }) {
    const cfg = lvlCfg[level] || lvlCfg.beginner
    const levels = ["beginner", "intermediate", "advanced", "expert"]
    const idx = levels.indexOf(level)
    return (
        <div>
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Trader Level</h4>
            <p className={cn("text-xl font-bold mb-3", cfg.color)}>{cfg.emoji} {level.charAt(0).toUpperCase() + level.slice(1)}</p>
            <div className="flex gap-1">
                {levels.map((l, i) => (
                    <div key={l} className="flex-1">
                        <div className={cn("h-1.5 rounded-full", i <= idx ? "bg-primary" : "bg-muted/30")} style={{ opacity: i <= idx ? 0.4 + (i / 4) * 0.6 : 1 }} />
                        <span className="text-[8px] text-muted-foreground capitalize block mt-0.5 text-center">{l}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ──────────────────────────────────── Skill Radar ──────────────────────────────────── */
function SkillRadar({ strengths, weaknesses }: { strengths: string[]; weaknesses: string[] }) {
    const kw = (arr: string[], ...words: string[]) => arr.some(s => words.some(w => s.toLowerCase().includes(w)))
    const data = [
        { s: "Strategy", v: kw(strengths, "strat", "setup") ? 85 : kw(weaknesses, "strat", "setup") ? 35 : 60 },
        { s: "Risk", v: kw(weaknesses, "risk", "loss", "stop") ? 35 : 70 },
        { s: "Psychology", v: kw(strengths, "emotion", "discip", "psych") ? 85 : kw(weaknesses, "emotion", "tilt") ? 35 : 55 },
        { s: "Consistency", v: kw(strengths, "consist") ? 85 : 55 },
        { s: "Timing", v: kw(weaknesses, "timing", "entry", "exit") ? 35 : 65 },
        { s: "Execution", v: strengths.length >= 3 ? 80 : 55 },
    ]
    return (
        <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={.15} />
                <PolarAngleAxis dataKey="s" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={.2} strokeWidth={2} />
            </RadarChart>
        </ResponsiveContainer>
    )
}

/* ──────────────────────────────────── Insight Card Shell ──────────────────────────────────── */
function InsightCard({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) {
    return (
        <Card className="glass-card p-5 relative overflow-hidden group hover:border-primary/20 transition-colors">
            <div className={cn("absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-[.07]", `bg-${color}-500`)} />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", `bg-${color}-500/10`)}>
                        <Icon className={cn("h-4 w-4", `text-${color}-400`)} />
                    </div>
                    <h4 className={cn("text-xs font-bold uppercase tracking-wider", `text-${color}-400`)}>{title}</h4>
                </div>
                {children}
            </div>
        </Card>
    )
}

/* ──────────────────────────────────── Trend Indicator ──────────────────────────────────── */
function TrendBadge({ trend }: { trend: string }) {
    const map: Record<string, { icon: any; color: string; label: string }> = {
        improving: { icon: ArrowUpRight, color: "text-emerald-400 bg-emerald-500/10", label: "Improving" },
        declining: { icon: ArrowDownRight, color: "text-rose-400 bg-rose-500/10", label: "Declining" },
        stable: { icon: Minus, color: "text-blue-400 bg-blue-500/10", label: "Stable" },
    }
    const cfg = map[trend] || map.stable
    return (
        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", cfg.color)}>
            <cfg.icon className="h-3 w-3" /> {cfg.label}
        </span>
    )
}

/* ──────────────────────────────────── Risk Badge ──────────────────────────────────── */
function RiskBadge({ level }: { level: string }) {
    const clr = level === "high" ? "text-rose-400 bg-rose-500/10" : level === "medium" ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10"
    return <span className={cn("inline-flex text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", clr)}>{level}</span>
}

/* ──────────────────────────────────── What-If Bar ──────────────────────────────────── */
function WhatIfChart({ scenarios }: { scenarios: { scenario: string; currentPnl: number; projectedPnl: number; difference: number; advice: string }[] }) {
    const data = scenarios.map((s, i) => ({
        name: "Scenario " + (i + 1),
        current: s.currentPnl,
        projected: s.projectedPnl,
        diff: s.difference,
        label: s.scenario,
        advice: s.advice,
    }))
    return (
        <div className="space-y-4">
            {data.map((d, i) => {
                const maxVal = Math.max(Math.abs(d.current), Math.abs(d.projected)) || 1
                const currentWidth = Math.abs(d.current) / maxVal * 100
                const projectedWidth = Math.abs(d.projected) / maxVal * 100
                const isPositive = d.diff > 0
                return (
                    <div key={i} className="space-y-2">
                        <p className="text-xs text-muted-foreground">{d.label}</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground w-14 shrink-0">Actual</span>
                                <div className="flex-1 h-5 bg-muted/20 rounded overflow-hidden">
                                    <div className={cn("h-full rounded transition-all duration-700", d.current >= 0 ? "bg-indigo-500/50" : "bg-rose-500/50")} style={{ width: currentWidth + "%" }} />
                                </div>
                                <span className="text-xs font-mono w-20 text-right">₹{d.current.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground w-14 shrink-0">If</span>
                                <div className="flex-1 h-5 bg-muted/20 rounded overflow-hidden">
                                    <div className={cn("h-full rounded transition-all duration-700", d.projected >= 0 ? "bg-emerald-500/50" : "bg-rose-500/50")} style={{ width: projectedWidth + "%" }} />
                                </div>
                                <span className="text-xs font-mono w-20 text-right">₹{d.projected.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] text-muted-foreground italic">{d.advice}</p>
                            <span className={cn("text-xs font-bold", isPositive ? "text-emerald-400" : "text-rose-400")}>
                                {isPositive ? "+" : ""}₹{d.diff.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

/* ──────────────────────────────────── Action Checklist ──────────────────────────────────── */
function ActionChecklist({ items }: { items: string[] }) {
    const [checked, setChecked] = useState<boolean[]>([])
    useEffect(() => {
        try { const s = localStorage.getItem("ai-action-checks"); setChecked(s ? JSON.parse(s) : items.map(() => false)) }
        catch { setChecked(items.map(() => false)) }
    }, [items])
    const toggle = (i: number) => {
        const next = [...checked]; next[i] = !next[i]; setChecked(next)
        localStorage.setItem("ai-action-checks", JSON.stringify(next))
    }
    const done = checked.filter(Boolean).length
    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <button key={i} onClick={() => toggle(i)} className={cn("w-full flex items-start gap-3 text-left p-3 rounded-xl transition-all border", checked[i] ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" : "bg-muted/20 border-transparent hover:border-indigo-500/20")}>
                    {checked[i] ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                    <span className={cn("text-sm", checked[i] && "line-through text-muted-foreground")}>{item}</span>
                </button>
            ))}
            {checked.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: (done / checked.length) * 100 + "%" }} /></div>
                    <span className="text-xs text-muted-foreground">{done}/{checked.length}</span>
                </div>
            )}
        </div>
    )
}

/* ════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════ */
export default function AiInsightsPage() {
    const [data, setData] = useState<AiInsightsData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => { const c = getCached(); if (c?.ready) setData(c) }, [])

    const fetchInsights = useCallback(async () => {
        setLoading(true); setError("")
        try {
            const res = await fetch("/api/ai-insights")
            if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.details || e.error || "Failed") }
            const json = await res.json()
            setData(json); if (json.ready) setCache(json)
        } catch (err: any) { setError(err.message || "Failed to load.") }
        finally { setLoading(false) }
    }, [])

    /* ─── Empty State ─── */
    if (!data && !loading && !error) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
                        <Brain className="h-8 w-8 text-violet-400" /> AI Trading Coach
                    </h1>
                    <p className="text-muted-foreground">Deep performance analysis powered by Gemini AI</p>
                </div>
                <Card className="glass-card relative overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-10 bg-violet-500 animate-pulse" />
                        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-10 bg-indigo-500 animate-pulse" style={{ animationDelay: "1s" }} />
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center border border-violet-500/20 mb-6">
                            <Sparkles className="h-10 w-10 text-violet-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">Deep Performance Analysis</h2>
                        <p className="text-muted-foreground max-w-lg mb-8 leading-relaxed">
                            10 deep insights including confidence calibration, loss recovery, what-if scenarios,
                            overtrading detection, tilt analysis, and your personalized trading rulebook.
                        </p>
                        <Button size="lg" onClick={fetchInsights} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20 px-8">
                            <Sparkles className="h-5 w-5 mr-2" /> Generate Deep Analysis
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">Takes 5-10 seconds • Cached for 4 hours</p>
                    </div>
                </Card>
            </div>
        )
    }

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div><h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3"><Brain className="h-8 w-8 text-violet-400" /> AI Trading Coach</h1></div>
                <Card className="glass-card relative overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-15 bg-violet-500 animate-pulse" />
                    <div className="relative z-10 flex flex-col items-center py-24">
                        <Loader2 className="h-10 w-10 text-violet-400 animate-spin mb-4" />
                        <p className="text-lg font-semibold text-foreground mb-1">Analyzing your trades...</p>
                        <p className="text-sm text-muted-foreground">Running 10 deep analytics on your data</p>
                        <div className="flex gap-1 mt-5">{[0, 1, 2, 3, 4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: i * .2 + "s" }} />)}</div>
                    </div>
                </Card>
            </div>
        )
    }

    /* ─── Error ─── */
    if (error) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div><h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3"><Brain className="h-8 w-8 text-violet-400" /> AI Trading Coach</h1></div>
                <Card className="glass-card p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Failed to generate insights</p>
                    <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">{error}</p>
                    <Button onClick={fetchInsights} variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Retry</Button>
                </Card>
            </div>
        )
    }

    if (!data?.ready) {
        return (
            <div className="space-y-6"><Card className="glass-card p-8 text-center"><Sparkles className="h-12 w-12 text-violet-400 mx-auto mb-4" /><p className="text-muted-foreground">{data?.summary}</p></Card></div>
        )
    }

    /* ═══════════════════════════════ Full Insights View ═══════════════════════════════ */
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-3">
                        <Brain className="h-8 w-8 text-violet-400" /> AI Trading Coach
                    </h1>
                    <p className="text-sm text-muted-foreground">Deep analysis based on {data.actionItems ? "your entire" : ""} trading history</p>
                </div>
                <Button variant="outline" onClick={fetchInsights} disabled={loading} className="gap-2">
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
                </Button>
            </div>

            {/* ──── ROW 1: Summary + Gauge + Level ──── */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass-card p-5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-[.07] bg-violet-500" />
                    <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Summary</h4>
                    <p className="text-sm text-foreground leading-relaxed">{data.overallSummary}</p>
                </Card>
                <Card className="glass-card p-5 flex flex-col items-center justify-center">
                    <ConfidenceGauge score={data.confidenceScore ?? 0} />
                </Card>
                <Card className="glass-card p-5">
                    <TraderLevel level={data.traderLevel || "beginner"} />
                    {data.performanceForecast && (
                        <div className="mt-4 pt-3 border-t border-border">
                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Forecast <RiskBadge level={data.performanceForecast.confidence} /></h4>
                            <p className="text-xs text-foreground leading-relaxed">{data.performanceForecast.projection}</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* ──── ROW 2: Radar + Strengths/Weaknesses ──── */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass-card p-5">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Eye className="h-3 w-3" /> Skill Breakdown</h4>
                    {data.strengths && data.weaknesses && <SkillRadar strengths={data.strengths} weaknesses={data.weaknesses} />}
                </Card>
                <Card className="glass-card p-5">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Strengths & Weaknesses</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {data.strengths && (
                            <div className="space-y-2">
                                {data.strengths.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-foreground">{s}</span></div>
                                ))}
                            </div>
                        )}
                        {data.weaknesses && (
                            <div className="space-y-2">
                                {data.weaknesses.map((w, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span className="text-foreground">{w}</span></div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* ──── ROW 3: Deep Insights Grid ──── */}
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 pt-2"><Zap className="h-4 w-4" /> Deep Insights</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* Confidence Calibration */}
                {data.confidenceCalibration && (
                    <InsightCard icon={Gauge} title="Confidence Calibration" color="indigo">
                        <p className="text-sm text-foreground leading-relaxed mb-2">{data.confidenceCalibration.finding}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Optimal: <strong className="text-indigo-400">{data.confidenceCalibration.optimalConfidence}</strong></span>
                            {data.confidenceCalibration.overconfidenceBias && (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">⚠ Overconfidence Bias</span>
                            )}
                        </div>
                    </InsightCard>
                )}

                {/* Loss Recovery */}
                {data.lossRecovery && (
                    <InsightCard icon={Activity} title="Loss Recovery" color="rose">
                        <p className="text-sm text-foreground leading-relaxed mb-2">{data.lossRecovery.finding}</p>
                        <div className="flex items-center gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-rose-400">{data.lossRecovery.avgTradesToRecover}</p>
                                <p className="text-[10px] text-muted-foreground">Avg trades to recover</p>
                            </div>
                            <p className="text-xs text-muted-foreground italic flex-1">{data.lossRecovery.advice}</p>
                        </div>
                    </InsightCard>
                )}

                {/* Overtrading */}
                {data.overtradingAnalysis && (
                    <InsightCard icon={Flame} title="Overtrading Analysis" color="orange">
                        <p className="text-sm text-foreground leading-relaxed mb-2">{data.overtradingAnalysis.finding}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Optimal: <strong className="text-orange-400">{data.overtradingAnalysis.optimalTradesPerDay}</strong>/day</span>
                            {data.overtradingAnalysis.isOvertrading && (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">🔴 Overtrading</span>
                            )}
                        </div>
                    </InsightCard>
                )}

                {/* Sequential Patterns */}
                {data.sequentialPatterns && (
                    <InsightCard icon={Zap} title="Tilt / Sequential Patterns" color="violet">
                        <p className="text-sm text-foreground leading-relaxed mb-2">{data.sequentialPatterns.finding}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Tilt risk: <RiskBadge level={data.sequentialPatterns.tiltRisk} /></span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mt-2">{data.sequentialPatterns.advice}</p>
                    </InsightCard>
                )}

                {/* Trade Duration */}
                {data.tradeDuration && (
                    <InsightCard icon={Clock} title="Trade Duration" color="blue">
                        <p className="text-sm text-foreground leading-relaxed mb-2">{data.tradeDuration.finding}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Best hold time: <strong className="text-blue-400">{data.tradeDuration.optimalDuration}</strong></span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mt-2">{data.tradeDuration.advice}</p>
                    </InsightCard>
                )}

                {/* Emotional Trend */}
                {data.emotionalTrend && (
                    <InsightCard icon={Heart} title="Emotional Trend" color="pink">
                        <p className="text-sm text-foreground leading-relaxed mb-2">{data.emotionalTrend.finding}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                            <TrendBadge trend={data.emotionalTrend.trend} />
                            <span className="text-xs text-muted-foreground">Burnout: <RiskBadge level={data.emotionalTrend.burnoutRisk} /></span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mt-2">{data.emotionalTrend.advice}</p>
                    </InsightCard>
                )}
            </div>

            {/* ──── ROW 4: What-If Scenarios ──── */}
            {data.whatIfScenarios && data.whatIfScenarios.length > 0 && (
                <Card className="glass-card p-5">
                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> What-If Scenarios</h4>
                    <WhatIfChart scenarios={data.whatIfScenarios} />
                </Card>
            )}

            {/* ──── ROW 5: Risk Score + Personalized Rules ──── */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Risk Score */}
                {data.riskScore && (
                    <Card className="glass-card p-5">
                        <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Risk Assessment</h4>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">{data.riskScore.overall}<span className="text-sm text-muted-foreground">/100</span></p>
                                <p className="text-[10px] text-muted-foreground">Risk Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">₹{data.riskScore.maxDrawdown.toLocaleString("en-IN")}</p>
                                <p className="text-[10px] text-muted-foreground">Max Drawdown</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">{data.riskScore.sharpeRatio}</p>
                                <p className="text-[10px] text-muted-foreground">Sharpe Ratio</p>
                            </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed mb-1">{data.riskScore.assessment}</p>
                        <p className="text-xs text-muted-foreground italic">{data.riskScore.advice}</p>
                    </Card>
                )}

                {/* Personalized Rules */}
                {data.personalizedRules && data.personalizedRules.length > 0 && (
                    <Card className="glass-card p-5">
                        <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Your Trading Rulebook</h4>
                        <div className="space-y-2">
                            {data.personalizedRules.map((rule, i) => (
                                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20 border border-transparent hover:border-amber-500/20 transition-colors">
                                    <span className="text-amber-400 font-bold text-sm shrink-0 mt-px">#{i + 1}</span>
                                    <p className="text-sm text-foreground">{rule}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* ──── ROW 6: Pattern Cards ──── */}
            {data.patterns && (
                <>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 pt-2"><Eye className="h-4 w-4" /> Trading Patterns</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <InsightCard icon={TrendingUp} title="Best Setup" color="emerald"><p className="text-sm text-foreground">{data.patterns.bestSetup}</p></InsightCard>
                        <InsightCard icon={TrendingDown} title="Worst Setup" color="amber"><p className="text-sm text-foreground">{data.patterns.worstSetup}</p></InsightCard>
                        <InsightCard icon={Clock} title="Best Day" color="blue"><p className="text-sm text-foreground">{data.patterns.bestDay}</p></InsightCard>
                        <InsightCard icon={Brain} title="Emotional Pattern" color="violet"><p className="text-sm text-foreground">{data.patterns.emotionalInsight}</p></InsightCard>
                        <InsightCard icon={Flame} title="Streak" color="orange"><p className="text-sm text-foreground">{data.patterns.streakAnalysis}</p></InsightCard>
                    </div>
                </>
            )}

            {/* ──── ROW 7: Action Items ──── */}
            {data.actionItems && data.actionItems.length > 0 && (
                <Card className="glass-card p-5">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Action Items</h4>
                    <ActionChecklist items={data.actionItems} />
                </Card>
            )}
        </div>
    )
}
