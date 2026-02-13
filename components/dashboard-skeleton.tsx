import { Card } from "@/components/ui/card"

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Row 1: Hero + Quick Actions + Psychology */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="md:col-span-2">
                    <Card className="p-6 glass-card h-40">
                        <div className="space-y-4 animate-pulse">
                            <div className="h-3 w-32 bg-secondary/50 rounded"></div>
                            <div className="h-10 w-48 bg-secondary/50 rounded"></div>
                            <div className="flex gap-6 mt-4">
                                <div className="h-6 w-16 bg-secondary/50 rounded"></div>
                                <div className="h-6 w-16 bg-secondary/50 rounded"></div>
                            </div>
                        </div>
                    </Card>
                </div>
                <Card className="p-6 glass-card h-40 animate-pulse">
                    <div className="space-y-4">
                        <div className="h-3 w-24 bg-secondary/50 rounded"></div>
                        <div className="h-10 w-full bg-secondary/50 rounded mt-4"></div>
                        <div className="h-10 w-full bg-secondary/50 rounded"></div>
                    </div>
                </Card>
                <Card className="p-6 glass-card h-40 animate-pulse">
                    <div className="space-y-4">
                        <div className="h-3 w-28 bg-secondary/50 rounded"></div>
                        <div className="h-6 w-16 bg-secondary/50 rounded"></div>
                        <div className="h-2 w-full bg-secondary/50 rounded mt-6"></div>
                    </div>
                </Card>
            </div>

            {/* Row 2: Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-5 glass-card animate-pulse">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-secondary/50 rounded"></div>
                                <div className="h-7 w-24 bg-secondary/50 rounded"></div>
                                <div className="h-2 w-28 bg-secondary/50 rounded"></div>
                            </div>
                            <div className="h-10 w-10 bg-secondary/50 rounded-xl"></div>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-secondary/50 rounded-full"></div>
                    </Card>
                ))}
            </div>

            {/* Row 3: Chart + Donut + Heatmap */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="md:col-span-2 p-6 glass-card h-80 animate-pulse">
                    <div className="h-3 w-24 bg-secondary/50 rounded mb-4"></div>
                    <div className="h-full bg-secondary/20 rounded-xl"></div>
                </Card>
                <Card className="p-6 glass-card h-80 animate-pulse">
                    <div className="h-3 w-20 bg-secondary/50 rounded mb-4"></div>
                    <div className="h-40 w-40 mx-auto bg-secondary/20 rounded-full mt-6"></div>
                </Card>
                <Card className="p-6 glass-card h-80 animate-pulse">
                    <div className="h-3 w-28 bg-secondary/50 rounded mb-4"></div>
                    <div className="grid grid-cols-12 gap-1 mt-6">
                        {Array.from({ length: 84 }).map((_, i) => (
                            <div key={i} className="h-3 w-3 bg-secondary/30 rounded-sm"></div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Row 4: Trades + Activity */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6 glass-card h-64 animate-pulse">
                    <div className="h-3 w-28 bg-secondary/50 rounded mb-6"></div>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-secondary/30 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-24 bg-secondary/50 rounded"></div>
                                    <div className="h-2 w-16 bg-secondary/30 rounded"></div>
                                </div>
                                <div className="h-4 w-16 bg-secondary/50 rounded"></div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="p-6 glass-card h-64 animate-pulse">
                    <div className="h-3 w-28 bg-secondary/50 rounded mb-6"></div>
                    <div className="space-y-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="h-8 w-8 bg-secondary/30 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 bg-secondary/50 rounded"></div>
                                    <div className="h-2 w-20 bg-secondary/30 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
