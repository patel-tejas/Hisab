import Link from "next/link"
import { ArrowRight, BarChart3, Calendar, Brain, TrendingUp, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              H
            </div>
            <span className="text-xl font-bold text-foreground">Hisab</span>
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(37,99,235,0.08),transparent)]" />
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Master Your Trading with <span className="text-primary">Data-Driven Insights</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Track every trade, analyze your psychology, and uncover patterns that separate winning traders from the
            rest. Your personal trading journal, supercharged.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/dashboard">
                Start Trading Journal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent" asChild>
              <Link href="#features">See Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "10K+", label: "Active Traders" },
            { value: "2M+", label: "Trades Logged" },
            { value: "67%", label: "Avg Win Rate Improvement" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Everything You Need to Trade Better</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Comprehensive tools designed by traders, for traders.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Deep dive into your performance with detailed P&L breakdowns, win rates, and risk/reward analysis.",
              },
              {
                icon: Brain,
                title: "Psychology Tracking",
                description:
                  "Log your emotional state, confidence levels, and identify patterns that affect your trading decisions.",
              },
              {
                icon: Calendar,
                title: "Trade Calendar",
                description:
                  "Visualize your trading activity with a color-coded calendar showing daily P&L at a glance.",
              },
              {
                icon: TrendingUp,
                title: "Strategy Analysis",
                description: "Compare performance across different strategies to understand what works best for you.",
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Track stop losses, targets, and position sizing to maintain disciplined trading habits.",
              },
              {
                icon: Zap,
                title: "Quick Entry",
                description:
                  "Log trades in seconds with our streamlined form. No more friction between trading and journaling.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
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
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">Ready to Trade Smarter?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join thousands of traders who have improved their win rate and consistency using Hisab.
          </p>
          <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 text-base" asChild>
            <Link href="/dashboard">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
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
