
import { Maximize2 } from "lucide-react";
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartModal } from "./chart-modal";

interface ChartCardProps {
    title: string;
    children: ReactNode;
    height?: string; // e.g., "h-[300px]"
}

export function ChartCard({ title, children, height = "h-[300px]" }: ChartCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <Card className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{title}</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsExpanded(true)}
                        title="Maximize Chart"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className={`w-full ${height}`}>{children}</div>
            </Card>

            <ChartModal
                title={title}
                isOpen={isExpanded}
                onClose={() => setIsExpanded(false)}
            >
                {children}
            </ChartModal>
        </>
    );
}
