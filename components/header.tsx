
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Sun, ChevronDown, Plus, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  onNewTrade?: () => void;
}

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  percent: number;
  valid: boolean;
  source?: string;
  name?: string;
}

export function Header({ onNewTrade }: HeaderProps) {
  const [ticker, setTicker] = useState<TickerItem[]>([]);
  const [tickerLoading, setTickerLoading] = useState(false);
  const { user, logout } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  // Mock Data & Helpers
  const formatSymbol = (symbol: string) => symbol.split(":").pop() || symbol;

  const loadTicker = useCallback(async () => {
    setTickerLoading(true);
    try {
      const res = await fetch("/api/market-ticker");
      const data = await res.json();
      if (data.success && data.data) {
        const items = data.data.filter((i: any) => i.valid).map((i: any) => ({ ...i, name: formatSymbol(i.symbol) }));
        setTicker(items.length ? items : fallbackTickers);
      } else {
        setTicker(fallbackTickers);
      }
    } catch (e) {
      setTicker(fallbackTickers);
    } finally {
      setTickerLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTicker();
  }, [loadTicker]);

  // Auto-scroll logic 
  useEffect(() => {
    const scroll = () => {
      if (scrollRef.current) {
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 1;
        }
        animationRef.current = requestAnimationFrame(scroll);
      }
    }
    if (ticker.length > 0) animationRef.current = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [ticker]);


  const fallbackTickers = [
    { symbol: "NIFTY", name: "NIFTY", price: 22500.50, change: 120.50, percent: 0.54, valid: true },
    { symbol: "BANKNIFTY", name: "BANKNIFTY", price: 48000.20, change: -150.10, percent: -0.31, valid: true },
    { symbol: "SENSEX", name: "SENSEX", price: 74000.80, change: 200.25, percent: 0.27, valid: true },
    { symbol: "GOLD", name: "GOLD", price: 62250.00, change: 150.00, percent: 0.24, valid: true },
    { symbol: "BTC", name: "BTC", price: 68000.45, change: 1250.30, percent: 1.85, valid: true },
  ];

  return (
    <header className="sticky top-4 z-30 mx-4 h-16 rounded-2xl glass flex items-center justify-between px-6 shadow-2xl mb-6 ring-1 ring-border/50">

      {/* Market Ticker */}
      <div className="flex-1 overflow-hidden relative mr-8 group flex items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mr-4 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Live Market</span>
        </div>

        <div className="absolute left-[110px] top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10"></div>

        <div
          ref={scrollRef}
          className="flex items-center gap-8 overflow-hidden whitespace-nowrap mask-image-linear-gradient"
          style={{ width: '100%' }}
        >
          {[...ticker, ...ticker].map((item, i) => ( // Duplicate for infinite scroll
            <div key={i} className="flex items-center gap-3 text-xs font-medium opacity-90 hover:opacity-100 transition-opacity cursor-default bg-card/40 px-3 py-1.5 rounded-lg border border-border/50">
              <span className="text-foreground font-semibold">{item.name}</span>
              <div className="h-3 w-px bg-border"></div>
              <span className={item.change >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}>
                {item.price.toLocaleString()}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.change >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                {item.change >= 0 ? "+" : ""}{item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>


        <Button
          onClick={onNewTrade}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 border-0 h-9 px-4 hidden md:flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          New Trade
        </Button>

        <div className="h-8 w-px bg-border mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-1 pr-1 gap-3 rounded-full hover:bg-muted/50 p-1">
              <div className="relative h-9 w-9 rounded-full ring-2 ring-border overflow-hidden">
                {/* Avatar Placeholder / Image */}
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.initials || "U"}
                </div>
              </div>
              <div className="flex flex-col items-start text-xs text-left hidden sm:flex mr-1">
                <span className="font-medium text-foreground">{user?.username || "Trader"}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground mr-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass border-border text-foreground rounded-xl p-2">
            <DropdownMenuLabel className="text-muted-foreground text-xs">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" /> {loggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}