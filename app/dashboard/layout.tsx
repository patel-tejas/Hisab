
"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AddTradeModal } from "@/components/add-trade-modal"
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context"
import { AuthProvider } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false)
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-indigo-500/30 font-sans transition-colors duration-300">

      {/* Ambient Background Effects (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden dark:block hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[100px] animate-pulse"></div>
      </div>

      <Sidebar />

      <div className={cn(
        "relative z-10 pr-6 py-4 min-h-screen flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "pl-[104px]" : "pl-72"
      )}>
        <Header onNewTrade={() => setIsAddTradeOpen(true)} />

        <main className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>

      <AddTradeModal open={isAddTradeOpen} onOpenChange={setIsAddTradeOpen} />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </AuthProvider>
  )
}
