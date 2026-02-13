import Link from "next/link"
import { ArrowRight, BarChart3, Calendar, Brain, TrendingUp, Shield, Zap, Sparkles, CheckCircle2, Clock, LineChart, Image, BookOpen, Target, Flame, Gift, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden selection:bg-primary/30 font-sans transition-colors duration-300">

      {/* Ambient Background Effects (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none dark:block hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[40%] rounded-full bg-blue-500/5 blur-[150px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-primary-foreground shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Hisaab</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Button asChild className="bg-foreground text-background hover:bg-muted-foreground/90 rounded-full px-6">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative px-4 py-24 sm:px-6 sm:py-32 lg:px-8 z-10">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            New: AI-Powered Psychology Analysis
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance leading-tight">
            Master Your Trading with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
              Data-Driven Insights
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Track every trade, analyze your psychology, and uncover patterns that separate winning traders from the
            rest. Your personal trading journal, supercharged.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="h-14 px-8 text-base rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105" asChild>
              <Link href="/dashboard">
                Start Trading Journal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-border bg-card/5 hover:bg-card/10 text-foreground backdrop-blur-sm" asChild>
              <Link href="#features">See Features</Link>
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-2 shadow-2xl">
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none rounded-b-2xl"></div>
            <div className="rounded-xl border border-border overflow-hidden">
              <img
                src="/heroImg.png"
                alt="Hisaab Trading Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════ */}
      <section className="border-y border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8 relative z-10 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "10K+", label: "Active Traders" },
            { value: "2M+", label: "Trades Logged" },
            { value: "67%", label: "Win Rate Improvement" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-3xl font-bold text-foreground sm:text-4xl group-hover:text-primary transition-colors">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════ */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
              FEATURES
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">Everything You Need to Trade Better</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              Comprehensive tools designed by traders, for traders. Every feature built to give you an edge.
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Deep dive into your performance with P&L breakdowns, win rates, profit factor, expectancy, and custom date range filters.",
                highlights: ["Equity Curve", "Monthly P&L", "Symbol Breakdown"],
                color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
              },
              {
                icon: Brain,
                title: "Psychology Tracking",
                description: "Log your emotional state, confidence levels, and satisfaction. Discover which mental states lead to your best trades.",
                highlights: ["Emotion Analysis", "Confidence vs P&L", "Mistake Tracking"],
                color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
              },
              {
                icon: Calendar,
                title: "Trading Calendar",
                description: "Visualize your trading activity with a color-coded calendar heatmap showing daily P&L at a glance.",
                highlights: ["Daily Heatmap", "Monthly View", "Quick Navigation"],
                color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
              },
              {
                icon: TrendingUp,
                title: "Strategy Analysis",
                description: "Compare performance across different strategies. See win rates, total P&L, and trade counts per strategy.",
                highlights: ["Strategy P&L", "Win Rate Comparison", "Long vs Short"],
                color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Track max drawdown, position sizing, stop losses, and risk-reward ratios. Stay disciplined, always.",
                highlights: ["Drawdown Chart", "Position Sizing", "Risk per Trade"],
                color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
              },
              {
                icon: Zap,
                title: "Quick Trade Entry",
                description: "Log trades in seconds with our streamlined modal. Auto-fill quantities, rich text notes, and image uploads.",
                highlights: ["Smart Defaults", "Chart Screenshots", "Rich Notes"],
                color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
              },
              {
                icon: LineChart,
                title: "Expandable Charts",
                description: "Click any chart to expand it fullscreen with contextual filters. Slice data by symbol, direction, or time.",
                highlights: ["Fullscreen View", "Per-Chart Filters", "Export Ready"],
                color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
              },
              {
                icon: Image,
                title: "Chart Screenshots",
                description: "Attach chart screenshots to every trade. Review your setups visually with a built-in lightbox viewer.",
                highlights: ["Image Upload", "Lightbox View", "Multi-Image"],
                color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
              },
              {
                icon: Clock,
                title: "Time & Day Analysis",
                description: "Discover your best trading hours and days. Find out when you perform best and when to avoid trading.",
                highlights: ["Hourly Breakdown", "Day-of-Week", "Session Timing"],
                color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card/40 p-8 transition-all hover:bg-card/60 hover:border-border hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/5"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {feature.highlights.map((h) => (
                    <span key={h} className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="relative px-4 py-24 sm:px-6 lg:px-8 z-10 overflow-hidden">
        <div className="absolute inset-0 bg-muted/30 -skew-y-2 transform origin-top-left scale-110"></div>

        <div className="mx-auto max-w-5xl relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">From Trade to Transformation</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              Three simple steps to transform your trading journey. It takes less than 2 minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-0 md:grid-cols-3 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-[2px] bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30"></div>

            {[
              {
                step: "01",
                title: "Log Your Trades",
                description: "Enter trade details — symbol, entry/exit prices, strategy, and your psychological state. Takes under 30 seconds per trade.",
                icon: BookOpen,
                details: ["Auto-fill quantities", "Rich text analysis notes", "Attach chart screenshots"],
              },
              {
                step: "02",
                title: "Analyze Patterns",
                description: "Our analytics engine reveals your best setups, worst mistakes, emotional triggers, and performance trends across every dimension.",
                icon: Target,
                details: ["12+ chart types", "Per-chart deep-dive filters", "Psychology correlations"],
              },
              {
                step: "03",
                title: "Improve & Profit",
                description: "Apply what you learn. Track improvements over time. Watch your win rate, consistency, and P&L trajectory improve month by month.",
                icon: TrendingUp,
                details: ["Monthly P&L tracking", "Win streak monitoring", "Equity curve growth"],
              },
            ].map((item) => (
              <div key={item.step} className="text-center relative px-6 py-8 group">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10 mb-6 relative group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {item.details.map((d) => (
                    <li key={d} className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING SECTION
      ═══════════════════════════════════════ */}
      <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 mb-4 animate-pulse">
              <Gift className="h-3.5 w-3.5" />
              LIMITED TIME — COMPLETELY FREE
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">Grab It While It&apos;s Free</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              We&apos;re currently in early access. All features are <span className="text-foreground font-semibold">100% free</span> right now.
              Once we launch subscriptions, early users keep their benefits.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan (Current) */}
            <div className="relative rounded-2xl border-2 border-primary p-8 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-lg">
                  <Flame className="h-3.5 w-3.5" />
                  AVAILABLE NOW
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-2xl font-bold text-foreground">Early Access</h3>
                <p className="text-sm text-muted-foreground mt-1">All features, no limits, no credit card</p>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-foreground">₹0</span>
                <span className="text-muted-foreground text-sm line-through">₹999/mo</span>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">100% OFF</span>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  "Unlimited trade entries",
                  "Full analytics & reports",
                  "Psychology tracking & analysis",
                  "Risk management dashboard",
                  "Chart screenshot uploads",
                  "Rich text trade notes",
                  "Expandable charts with filters",
                  "Calendar heatmap view",
                  "All 12+ chart types",
                  "Day & time-of-day analysis",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button size="lg" className="w-full mt-8 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-base font-semibold transition-all hover:scale-[1.02]" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Future Pro Plan */}
            <div className="relative rounded-2xl border border-border p-8 bg-card/30 backdrop-blur-sm opacity-60">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-4 py-1.5 text-xs font-bold text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  COMING SOON
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-2xl font-bold text-foreground">Pro Plan</h3>
                <p className="text-sm text-muted-foreground mt-1">For serious traders who want more</p>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-muted-foreground">₹999</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  "Everything in Early Access",
                  "AI-powered trade suggestions",
                  "Advanced pattern recognition",
                  "Custom strategy templates",
                  "Export reports as PDF",
                  "Priority support",
                  "Multi-account tracking",
                  "Broker integration",
                  "Community access",
                  "And much more...",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button size="lg" variant="outline" disabled className="w-full mt-8 h-12 rounded-xl text-base font-semibold">
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Urgency Banner */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold text-foreground">Early birds get to keep free access forever</span>
              </div>
              <span className="text-xs text-muted-foreground">Sign up now before we switch to paid subscriptions</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════ */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center sm:px-16 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Trade Smarter?</h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-100">
              Join thousands of traders who have improved their win rate and consistency using Hisaab. It&apos;s free — no catches.
            </p>
            <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 text-base bg-white text-indigo-600 hover:bg-gray-100 border-none shadow-xl" asChild>
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-background relative z-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              H
            </div>
            <span className="font-semibold text-foreground">Hisaab</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Hisaab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
