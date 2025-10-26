"use client"

import { LendingPosition } from "@/lib/types"
import { CURRENCIES } from "@/lib/currency-config"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Shield, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PositionSummaryProps {
  positions: LendingPosition[]
  className?: string
}

export function PositionSummary({
  positions,
  className = ''
}: PositionSummaryProps) {
  const activePositions = positions.filter(p => p.status === 'active')
  
  const totalCollateralValue = activePositions.reduce((total, position) => {
    // Mock conversion to USD for total calculation
    const rates = {
      cUSD: 1,
      cEUR: 0.92,
      cREAL: 5.12,
      eXOF: 612
    }
    return total + (position.collateralAmount / rates[position.collateralCurrency])
  }, 0)

  const totalBorrowedValue = activePositions.reduce((total, position) => {
    const rates = {
      cUSD: 1,
      cEUR: 0.92,
      cREAL: 5.12,
      eXOF: 612
    }
    return total + (position.borrowedAmount / rates[position.borrowCurrency])
  }, 0)

  const overallHealthFactor = totalBorrowedValue > 0 
    ? (totalCollateralValue / totalBorrowedValue) * 100 
    : Infinity

  const getOverallStatus = () => {
    if (overallHealthFactor >= 150) {
      return {
        status: 'safe' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: Shield,
        label: 'Safe'
      }
    } else if (overallHealthFactor >= 125) {
      return {
        status: 'warning' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: AlertTriangle,
        label: 'Warning'
      }
    } else {
      return {
        status: 'danger' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        label: 'Danger'
      }
    }
  }

  const overallStatus = getOverallStatus()
  const StatusIcon = overallStatus.icon

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className={cn(
      "p-6 border-l-4",
      overallStatus.bgColor,
      overallStatus.borderColor,
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Portfolio Overview</h2>
        <Badge 
          variant="secondary" 
          className={cn(
            "text-sm font-medium",
            overallStatus.color,
            overallStatus.bgColor
          )}
        >
          <StatusIcon className="w-4 h-4 mr-1" />
          {overallStatus.label}
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {formatCurrency(totalCollateralValue)}
          </div>
          <div className="text-sm text-muted-foreground">Total Collateral</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {formatCurrency(totalBorrowedValue)}
          </div>
          <div className="text-sm text-muted-foreground">Total Borrowed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {overallHealthFactor === Infinity ? '∞' : `${overallHealthFactor.toFixed(1)}%`}
          </div>
          <div className="text-sm text-muted-foreground">Health Factor</div>
        </div>
      </div>

      {/* Position Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Active Positions</span>
        <span className="font-medium">{activePositions.length}</span>
      </div>

      {/* Currency Breakdown */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <h3 className="text-sm font-medium text-foreground mb-3">Currency Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(CURRENCIES).map(([currency, info]) => {
            const collateralPositions = activePositions.filter(p => p.collateralCurrency === currency)
            const borrowPositions = activePositions.filter(p => p.borrowCurrency === currency)
            
            if (collateralPositions.length === 0 && borrowPositions.length === 0) {
              return null
            }

            const totalCollateral = collateralPositions.reduce((sum, p) => sum + p.collateralAmount, 0)
            const totalBorrowed = borrowPositions.reduce((sum, p) => sum + p.borrowedAmount, 0)

            return (
              <div key={currency} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: info.color }}
                  >
                    {info.flag}
                  </div>
                  <span className="font-medium">{info.symbol}</span>
                </div>
                <div className="text-right">
                  {totalCollateral > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Collateral: {totalCollateral.toFixed(2)}
                    </div>
                  )}
                  {totalBorrowed > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Borrowed: {totalBorrowed.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
