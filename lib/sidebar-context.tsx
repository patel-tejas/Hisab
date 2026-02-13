"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SidebarContextType {
    collapsed: boolean
    setCollapsed: (value: boolean) => void
    toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
    collapsed: false,
    setCollapsed: () => { },
    toggle: () => { },
})

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem("sidebar-collapsed")
        if (stored !== null) setCollapsed(stored === "true")
    }, [])

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", String(collapsed))
    }, [collapsed])

    const toggle = () => setCollapsed((prev) => !prev)

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => useContext(SidebarContext)
