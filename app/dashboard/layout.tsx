"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AddTradeModal } from "@/components/add-trade-modal"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="pl-60">
        <Header onNewTrade={() => setIsAddTradeOpen(true)} />
        <main className="p-6">{children}</main>
      </div>
      <AddTradeModal open={isAddTradeOpen} onOpenChange={setIsAddTradeOpen} />
    </div>
  )
}
