import { Card } from "@/components/ui/card"

interface ConfidenceIndexProps {
  value: number
}

export function ConfidenceIndex({ value }: ConfidenceIndexProps) {
  const getConfidenceLevel = (val: number) => {
    if (val >= 80) return "Very High Confidence"
    if (val >= 60) return "High Confidence"
    if (val >= 40) return "Moderate Confidence"
    if (val >= 20) return "Low Confidence"
    return "Very Low Confidence"
  }

  const getMessage = (val: number) => {
    if (val >= 80) return "You are trading with excellent discipline and emotional stability."
    if (val >= 60) return "Your trading discipline is good. Keep up the consistency."
    if (val >= 40) return "Room for improvement in your trading psychology."
    return "Consider reviewing your trading habits and emotional control."
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Confidence Index</h3>
        <span className="text-sm text-muted-foreground">Last 30 Days</span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-red-500">Low</span>
          <span className="text-green-500">High</span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
          <div
            className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-foreground border-2 border-background shadow-md transition-all"
            style={{ left: `calc(${value}% - 10px)` }}
          />
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{getConfidenceLevel(value)}</span> - {getMessage(value)}
      </p>
    </Card>
  )
}
