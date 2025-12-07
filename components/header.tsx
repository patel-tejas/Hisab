"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Sun, ChevronDown, Plus, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

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

interface UserData {
  id: string;
  username: string;
  initials: string;
}

// Type for fallback data
interface FallbackTickerItem extends Omit<TickerItem, 'source'> {
  source: string;
}

export function Header({ onNewTrade }: HeaderProps) {
  const [ticker, setTicker] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);
  const router = useRouter();

  // Format symbol for display
  const formatSymbol = (symbol: string) => {
    const symbolMap: Record<string, string> = {
      "NSE:NIFTY": "NIFTY",
      "NSE:BANKNIFTY": "BANKNIFTY",
      "BSE:SENSEX": "SENSEX",
      "NSE:MIDCPNIFTY": "MIDCAP",
      "NSE:FINNIFTY": "FINNIFTY",
      "MCX:GOLD1!": "GOLD",
      "MCX:SILVER1!": "SILVER",
      "MCX:CRUDEOIL1!": "CRUDE",
      "CRYPTO:BTCUSD": "BTC",
      "CRYPTO:ETHUSD": "ETH",
      "CRYPTO:SOLUSD": "SOL",
    };
    return symbolMap[symbol] || symbol.split(":").pop() || symbol;
  };

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoadingUser(true);
      const res = await fetch("/api/user");
      
      if (!res.ok) {
        if (res.status === 401) {
          // Not authenticated, redirect to login
          router.push("/sign-in");
          return;
        }
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // On error, redirect to login
      router.push("/sign-in");
    } finally {
      setIsLoadingUser(false);
    }
  }, [router]);

  // Fetch market data
  const loadTicker = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const res = await fetch("/api/market-ticker");
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.data) {
        const validTickers: TickerItem[] = data.data
          .filter((item: TickerItem) => item.valid)
          .map((item: TickerItem) => ({
            ...item,
            name: formatSymbol(item.symbol),
          }));
        
        // Ensure all symbols are present
        const fallbackData: Record<string, FallbackTickerItem> = {
          "NSE:NIFTY": { symbol: "NSE:NIFTY", name: "NIFTY", price: 26186.45, change: 150.50, percent: 0.58, valid: true, source: "fallback" },
          "NSE:BANKNIFTY": { symbol: "NSE:BANKNIFTY", name: "BANKNIFTY", price: 59777.20, change: 350.75, percent: 0.59, valid: true, source: "fallback" },
          "BSE:SENSEX": { symbol: "BSE:SENSEX", name: "SENSEX", price: 86500.80, change: 500.25, percent: 0.58, valid: true, source: "fallback" },
          "NSE:MIDCPNIFTY": { symbol: "NSE:MIDCPNIFTY", name: "MIDCAP", price: 60594.60, change: 200.40, percent: 0.33, valid: true, source: "fallback" },
          "NSE:FINNIFTY": { symbol: "NSE:FINNIFTY", name: "FINNIFTY", price: 27881.90, change: 120.30, percent: 0.43, valid: true, source: "fallback" },
          "MCX:GOLD1!": { symbol: "MCX:GOLD1!", name: "GOLD", price: 62250.00, change: 150.00, percent: 0.24, valid: true, source: "fallback" },
          "MCX:SILVER1!": { symbol: "MCX:SILVER1!", name: "SILVER", price: 71500.00, change: 200.00, percent: 0.28, valid: true, source: "fallback" },
          "MCX:CRUDEOIL1!": { symbol: "MCX:CRUDEOIL1!", name: "CRUDE", price: 6500.00, change: -50.00, percent: -0.76, valid: true, source: "fallback" },
          "CRYPTO:BTCUSD": { symbol: "CRYPTO:BTCUSD", name: "BTC", price: 62000.45, change: 1250.30, percent: 2.05, valid: true, source: "fallback" },
          "CRYPTO:ETHUSD": { symbol: "CRYPTO:ETHUSD", name: "ETH", price: 3500.60, change: 85.40, percent: 2.50, valid: true, source: "fallback" },
          "CRYPTO:SOLUSD": { symbol: "CRYPTO:SOLUSD", name: "SOL", price: 180.25, change: 5.75, percent: 3.30, valid: true, source: "fallback" },
        };

        const requiredSymbols = [
          "NSE:NIFTY", "NSE:BANKNIFTY", "BSE:SENSEX", "NSE:MIDCPNIFTY", 
          "NSE:FINNIFTY", "MCX:GOLD1!", "MCX:SILVER1!", "MCX:CRUDEOIL1!",
          "CRYPTO:BTCUSD", "CRYPTO:ETHUSD", "CRYPTO:SOLUSD"
        ];

        const existingData = new Map(validTickers.map((item: TickerItem) => [item.symbol, item]));
        
        const completeTickers: TickerItem[] = requiredSymbols.map((symbol): TickerItem => {
          const existing = existingData.get(symbol);
          if (existing) return existing;
          
          const fallback = fallbackData[symbol];
          if (!fallback) {
            // Return a default ticker item if fallback data is missing
            return {
              symbol,
              name: symbol.split(":").pop() || symbol,
              price: 10000,
              change: 0,
              percent: 0,
              valid: true,
              source: "default"
            };
          }
          
          const variation = 1 + (Math.random() - 0.5) * 0.005;
          
          return {
            symbol: fallback.symbol,
            name: fallback.name,
            price: parseFloat((fallback.price * variation).toFixed(2)),
            change: parseFloat((fallback.change * variation).toFixed(2)),
            percent: parseFloat((fallback.percent * variation).toFixed(2)),
            valid: fallback.valid,
            source: fallback.source,
          };
        });

        setTicker(completeTickers);
      }
    } catch (err) {
      console.error("Ticker fetch failed", err);
      // Fallback data with explicit typing
      const fallbackTickers: TickerItem[] = [
        { symbol: "NSE:NIFTY", name: "NIFTY", price: 26186.45, change: 150.50, percent: 0.58, valid: true, source: "fallback" },
        { symbol: "NSE:BANKNIFTY", name: "BANKNIFTY", price: 59777.20, change: 350.75, percent: 0.59, valid: true, source: "fallback" },
        { symbol: "BSE:SENSEX", name: "SENSEX", price: 86500.80, change: 500.25, percent: 0.58, valid: true, source: "fallback" },
        { symbol: "NSE:MIDCPNIFTY", name: "MIDCAP", price: 60594.60, change: 200.40, percent: 0.33, valid: true, source: "fallback" },
        { symbol: "NSE:FINNIFTY", name: "FINNIFTY", price: 27881.90, change: 120.30, percent: 0.43, valid: true, source: "fallback" },
        { symbol: "MCX:GOLD1!", name: "GOLD", price: 62250.00, change: 150.00, percent: 0.24, valid: true, source: "fallback" },
        { symbol: "MCX:SILVER1!", name: "SILVER", price: 71500.00, change: 200.00, percent: 0.28, valid: true, source: "fallback" },
        { symbol: "MCX:CRUDEOIL1!", name: "CRUDE", price: 6500.00, change: -50.00, percent: -0.76, valid: true, source: "fallback" },
        { symbol: "CRYPTO:BTCUSD", name: "BTC", price: 62000.45, change: 1250.30, percent: 2.05, valid: true, source: "fallback" },
        { symbol: "CRYPTO:ETHUSD", name: "ETH", price: 3500.60, change: 85.40, percent: 2.50, valid: true, source: "fallback" },
        { symbol: "CRYPTO:SOLUSD", name: "SOL", price: 180.25, change: 5.75, percent: 3.30, valid: true, source: "fallback" },
      ];
      setTicker(fallbackTickers);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (res.ok) {
        // Clear user data from state
        setUserData(null);
        // Redirect to home page after successful logout
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Auto-scroll animation - ALWAYS ON
  const startAutoScroll = useCallback(() => {
    if (!scrollRef.current || ticker.length === 0) return;

    const container = scrollRef.current;
    
    // Stop any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    let animationId: number;
    let startTime: number | null = null;
    const duration = 15000;

    const animateScroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      
      if (maxScroll > 0) {
        container.scrollLeft = progress * maxScroll;
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animateScroll);
      } else {
        container.scrollLeft = 0;
        startTime = null;
        animationId = requestAnimationFrame(animateScroll);
      }
    };

    animationId = requestAnimationFrame(animateScroll);
    animationRef.current = animationId;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ticker.length]);

  // Initial load and start auto-scroll
  useEffect(() => {
    loadTicker();
    fetchUserData();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Restart auto-scroll when ticker data changes
  useEffect(() => {
    if (ticker.length > 0) {
      startAutoScroll();
    }
  }, [ticker, startAutoScroll]);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/50 bg-background">
      {/* Content Container */}
      <div className="flex h-full items-center justify-between px-4">
        {/* Left Section - Just Refresh Button */}
        <div className="flex items-center pr-4 border-r border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadTicker}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            title="Refresh market data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Auto-scrolling Ticker Container */}
        <div className="relative flex-1 overflow-hidden">
          {isLoading && ticker.length === 0 ? (
            <div className="flex items-center justify-center py-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading market data...
              </div>
            </div>
          ) : ticker.length > 0 ? (
            <>
              {/* Gradient fade effects */}
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background via-background to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background via-background to-transparent" />

              {/* Scrollable ticker */}
              <div
                ref={scrollRef}
                className="scrollbar-thin flex items-center gap-4 overflow-x-auto whitespace-nowrap py-1"
                style={{ 
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {/* All market indexes */}
                {ticker.map((item, index) => (
                  <div
                    key={`${item.symbol}-${index}`}
                    className="flex items-center gap-3 px-3 py-1.5 hover:bg-muted/30 transition-colors duration-150 flex-shrink-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                          item.percent >= 0 
                            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' 
                            : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'
                        }`}>
                          <span className={`text-xs font-bold ${
                            item.percent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.name?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col min-w-[120px]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">
                            {item.name}
                          </span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            item.percent >= 0 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-red-500/10 text-red-600'
                          }`}>
                            {item.percent >= 0 ? '↗' : '↘'} {Math.abs(item.percent).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {item.price < 1000 
                              ? item.price.toFixed(2)
                              : item.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })
                            }
                          </span>
                          <span className={`text-xs font-medium ${
                            item.change >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-1">
              <span className="text-sm text-muted-foreground">
                No market data available
              </span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 pl-4 border-l border-border/30">
          {/* Time Period Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <span className="text-xs">30 Days</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem>7 Days</DropdownMenuItem>
              <DropdownMenuItem>30 Days</DropdownMenuItem>
              <DropdownMenuItem>90 Days</DropdownMenuItem>
              <DropdownMenuItem>This Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New Trade Button */}
          <Button 
            onClick={onNewTrade} 
            className="h-8 px-3"
          >
            <Plus className="h-3 w-3 mr-1" />
            <span className="text-xs">New Trade</span>
          </Button>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
          >
            <Sun className="h-3 w-3" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 flex items-center gap-1.5 px-2"
              >
                {isLoadingUser ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : userData ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white">
                    {userData.initials}
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white">
                    U
                  </div>
                )}
                <span className="text-xs font-medium hidden sm:inline">
                  {isLoadingUser ? "Loading..." : userData?.username || "User"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem disabled>
                <div className="flex flex-col">
                  <span className="font-medium">Logged in as</span>
                  <span className="text-muted-foreground">{userData?.username || "User"}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-500 focus:text-red-500 flex items-center gap-2"
              >
                <LogOut className="h-3 w-3" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add CSS for thin scrollbar */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 1px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }

        @media (prefers-color-scheme: dark) {
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
          }
        }

        .scrollbar-thin::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-thin:hover::-webkit-scrollbar {
          display: block;
        }
      `}</style>
    </header>
  );
}