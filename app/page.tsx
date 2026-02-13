import Link from "next/link"
import { ArrowRight, BarChart3, Calendar, Brain, TrendingUp, Shield, Zap, Sparkles, CheckCircle2 } from "lucide-react"
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
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Hisab</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Button asChild className="bg-foreground text-background hover:bg-muted-foreground/90 rounded-full px-6">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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

          {/* Dashboard Preview / Abstract visual */}
          <div className="mt-20 relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-2 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-40 bottom-0 top-auto"></div>
            <div className="rounded-xl border border-border bg-background overflow-hidden aspect-[16/9] md:aspect-[21/9] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
              <div className="text-center space-y-4 relative z-10">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full blur-[64px] opacity-40"></div>
                <h3 className="text-2xl font-bold text-foreground">Interactive Dashboard Preview</h3>
                <p className="text-muted-foreground">Sign up to see your data come to life.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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

      {/* Features Grid */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Everything You Need to Trade Better</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Comprehensive tools designed by traders, for traders.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Deep dive into your performance with detailed P&L breakdowns, win rates, and risk/reward analysis.",
                color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
              },
              {
                icon: Brain,
                title: "Psychology Tracking",
                description:
                  "Log your emotional state, confidence levels, and identify patterns that affect your trading decisions.",
                color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
              },
              {
                icon: Calendar,
                title: "Trade Calendar",
                description:
                  "Visualize your trading activity with a color-coded calendar showing daily P&L at a glance.",
                color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
              },
              {
                icon: TrendingUp,
                title: "Strategy Analysis",
                description: "Compare performance across different strategies to understand what works best for you.",
                color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Track stop losses, targets, and position sizing to maintain disciplined trading habits.",
                color: "text-rose-500 bg-rose-500/10 border-rose-500/20"
              },
              {
                icon: Zap,
                title: "Quick Entry",
                description:
                  "Log trades in seconds with our streamlined form. No more friction between trading and journaling.",
                color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card/40 p-8 transition-all hover:bg-card/60 hover:border-border hover:translate-y-[-2px]"
              >
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl border ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative px-4 py-24 sm:px-6 lg:px-8 z-10 overflow-hidden">
        <div className="absolute inset-0 bg-muted/30 -skew-y-3 transform origin-top-left scale-110"></div>

        <div className="mx-auto max-w-5xl relative">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Three simple steps to transform your trading journey.
            </p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Log Your Trades",
                description:
                  "Enter trade details including entry, exit, strategy, and your psychological state during the trade.",
              },
              {
                step: "02",
                title: "Analyze Patterns",
                description:
                  "Our analytics engine reveals insights about your best setups, common mistakes, and emotional triggers.",
              },
              {
                step: "03",
                title: "Improve & Profit",
                description:
                  "Apply your learnings, refine your strategy, and watch your trading performance improve over time.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary border border-primary/20 shadow-lg shadow-primary/10 mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center sm:px-16 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Trade Smarter?</h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-100">
              Join thousands of traders who have improved their win rate and consistency using Hisab.
            </p>
            <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 text-base bg-white text-indigo-600 hover:bg-gray-100 border-none shadow-xl" asChild>
              <Link href="/dashboard">
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
            <span className="font-semibold text-foreground">Hisab</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Hisab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
