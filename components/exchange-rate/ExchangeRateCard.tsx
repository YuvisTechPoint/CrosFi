"use client"

import { Currency } from "@/lib/types"
import { getExchangeRate, CURRENCIES } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExchangeRateCardProps {
  fromCurrency: Currency
  toCurrency: Currency
  rate?: number
  change24h?: number
  source?: string
  lastUpdated?: number
  showChart?: boolean
  className?: string
  onClick?: () => void
}

export function ExchangeRateCard({
  fromCurrency,
  toCurrency,
  rate,
  change24h,
  source = 'Mento',
  lastUpdated,
  showChart = false,
  className = '',
  onClick
}: ExchangeRateCardProps) {
  const exchangeRate = rate ? { rate, change24h: change24h || 0, lastUpdated: lastUpdated || Date.now() } : getExchangeRate(fromCurrency, toCurrency)
  
  if (!exchangeRate) {
    return (
      <Card className={cn("p-4 text-muted-foreground", className)}>
        Rate not available
      </Card>
    )
  }

  const fromInfo = CURRENCIES[fromCurrency]
  const toInfo = CURRENCIES[toCurrency]
  
  if (!fromInfo || !toInfo) {
    return (
      <Card className={cn("p-4 text-muted-foreground", className)}>
        Currency info not available
      </Card>
    )
  }
  
  const isPositive = (exchangeRate.change24h || 0) >= 0
  const changePercent = change24h || exchangeRate.change24h || 0

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-md transition-shadow",
        onClick && "cursor-pointer hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      {/* Header with currencies */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: fromInfo.color }}
          >
            {fromInfo.flag}
          </div>
          <span className="font-medium">{fromInfo.symbol}</span>
          <span className="text-muted-foreground">/</span>
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: toInfo.color }}
          >
            {toInfo.flag}
          </div>
          <span className="font-medium">{toInfo.symbol}</span>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {Math.abs(changePercent).toFixed(2)}%
        </div>
      </div>

      {/* Rate Value */}
      <div className="text-2xl font-mono font-bold mb-2">
        {(exchangeRate.rate || 0).toFixed(4)}
      </div>

      {/* Source and Last Updated */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>via {source}</span>
        {lastUpdated && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(lastUpdated)}
          </div>
        )}
      </div>

      {/* Mini Chart Placeholder */}
      {showChart && (
        <div className="mt-3 h-12 bg-muted rounded flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Chart placeholder</span>
        </div>
      )}
    </Card>
  )
}
