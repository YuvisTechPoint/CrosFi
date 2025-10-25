"use client"

import { Currency } from "@/lib/types"
import { getExchangeRate, CURRENCIES } from "@/lib/currency-config"
import { TrendingUp, TrendingDown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExchangeRateDisplayProps {
  fromCurrency: Currency
  toCurrency: Currency
  rate?: number
  change24h?: number
  source?: string
  lastUpdated?: number
  showChart?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ExchangeRateDisplay({
  fromCurrency,
  toCurrency,
  rate,
  change24h,
  source = 'Mento',
  lastUpdated,
  showChart = false,
  size = 'md',
  className = ''
}: ExchangeRateDisplayProps) {
  const exchangeRate = rate || getExchangeRate(fromCurrency, toCurrency)
  
  if (!exchangeRate) {
    return (
      <div className={cn("text-muted-foreground", className)}>
        Rate not available
      </div>
    )
  }

  const fromInfo = CURRENCIES[fromCurrency]
  const toInfo = CURRENCIES[toCurrency]
  const isPositive = exchangeRate.change24h >= 0
  const changePercent = change24h || exchangeRate.change24h

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

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
    <div className={cn("space-y-2", className)}>
      {/* Rate Display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: fromInfo.color }}
          >
            {fromInfo.flag}
          </div>
          <span className="font-medium">{fromInfo.symbol}</span>
        </div>
        
        <span className="text-muted-foreground">→</span>
        
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: toInfo.color }}
          >
            {toInfo.flag}
          </div>
          <span className="font-medium">{toInfo.symbol}</span>
        </div>
      </div>

      {/* Rate Value */}
      <div className={cn("font-mono font-semibold", sizeClasses[size])}>
        1 {fromInfo.symbol} = {exchangeRate.rate.toFixed(4)} {toInfo.symbol}
      </div>

      {/* Change Indicator */}
      <div className="flex items-center gap-2">
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
        
        <span className="text-xs text-muted-foreground">24h</span>
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
        <div className="h-8 bg-muted rounded flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Chart placeholder</span>
        </div>
      )}
    </div>
  )
}
