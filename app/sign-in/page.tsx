
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles, FlaskConical, Zap } from "lucide-react";

const DEMO_USERNAME = "demo_test";
const DEMO_PASSWORD = "test@123";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function fillDemoCredentials() {
    setUsername(DEMO_USERNAME);
    setPassword(DEMO_PASSWORD);
    toast.success("Demo credentials filled!");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      toast.success("Signed in successfully!");
      window.location.href = "/dashboard";
    } else {
      toast.error("Invalid username or password");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background relative overflow-hidden font-sans">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[130px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-500/10 blur-[130px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Sign In Card */}
        <div className="border border-border/30 rounded-2xl p-8 glass-card shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
              <Sparkles className="h-6 w-6 fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-2">Sign in to continue to Hisaab</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-foreground">Username</Label>
              <Input
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:ring-indigo-500/20"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:ring-indigo-500/20 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 h-10" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Card */}
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-2xl p-5 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Try the Demo Account
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded-full">
                  Free
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Explore Hisaab with a pre-filled account — no sign-up needed.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                <span>
                  User: <span className="text-foreground font-semibold">{DEMO_USERNAME}</span>
                </span>
                <span>
                  Pass: <span className="text-foreground font-semibold">{DEMO_PASSWORD}</span>
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={fillDemoCredentials}
                className="mt-3 h-8 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all hover:scale-105"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Use Demo Credentials
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

