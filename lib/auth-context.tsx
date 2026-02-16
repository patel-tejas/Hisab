"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

interface User {
    id: string
    name: string
    email: string
    username?: string
    initials?: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    refreshUser: () => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user", { cache: "no-store" })
            const data = await res.json()
            if (data.success && data.user) {
                setUser(data.user)
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error("Failed to fetch user", error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const logout = async () => {
        try {
            const res = await fetch("/api/logout", { method: "POST" })
            if (res.ok) {
                setUser(null)
                window.location.href = "/sign-in"
            } else {
                toast.error("Failed to logout")
            }
        } catch {
            toast.error("Failed to logout")
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
