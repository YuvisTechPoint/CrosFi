"use client"

import { LendingPosition } from "@/lib/types"
import { CURRENCIES, getHealthFactorStatus } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface PositionCardProps {
  position: LendingPosition
  onRepay?: () => void
  onAddCollateral?: () => void
  onClose?: () => void
  onDetails?: () => void
  className?: string
}

export function PositionCard({
  position,
  onRepay,
  onAddCollateral,
  onClose,
  onDetails,
  className = ''
}: PositionCardProps) {
  const collateralInfo = CURRENCIES[position.collateralCurrency]
  const borrowInfo = CURRENCIES[position.borrowCurrency]
  const healthStatus = getHealthFactorStatus(position.healthFactor)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getStatusColor = () => {
    switch (healthStatus.status) {
      case 'safe':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'danger':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className={cn(
      "p-6 border-l-4 hover:shadow-md transition-shadow",
      getStatusColor(),
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: collateralInfo.color }}
          >
            {collateralInfo.flag}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: borrowInfo.color }}
          >
            {borrowInfo.flag}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={cn("text-xs", getStatusColor())}
          >
            {healthStatus.status.toUpperCase()}
          </Badge>
          {onDetails && (
            <Button variant="ghost" size="sm" onClick={onDetails}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Position Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Collateral</span>
          <span className="font-medium">
            {formatAmount(position.collateralAmount)} {position.collateralCurrency}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Borrowed</span>
          <span className="font-medium">
            {formatAmount(position.borrowedAmount)} {position.borrowCurrency}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Health Factor</span>
          <span className="font-medium">
            {position.healthFactor.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">APR</span>
          <span className="font-medium text-primary">
            {position.apr}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Accrued Interest</span>
          <span className="font-medium">
            {formatAmount(position.accruedInterest)} {position.borrowCurrency}
          </span>
        </div>
      </div>

      {/* Health Factor Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Collateralization Ratio</span>
          <span>{position.collateralizationRatio.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all",
              healthStatus.status === 'safe' && "bg-green-500",
              healthStatus.status === 'warning' && "bg-yellow-500",
              healthStatus.status === 'danger' && "bg-red-500"
            )}
            style={{ width: `${Math.min(position.collateralizationRatio / 2, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onRepay && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRepay}
            className="flex-1"
          >
            Repay
          </Button>
        )}
        {onAddCollateral && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddCollateral}
            className="flex-1"
          >
            Add Collateral
          </Button>
        )}
        {onClose && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
        )}
      </div>

      {/* Status Message */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {healthStatus.status === 'safe' && <TrendingUp className="w-3 h-3 text-green-600" />}
          {healthStatus.status === 'warning' && <TrendingDown className="w-3 h-3 text-yellow-600" />}
          {healthStatus.status === 'danger' && <TrendingDown className="w-3 h-3 text-red-600" />}
          <span>{healthStatus.message}</span>
        </div>
      </div>
    </Card>
  )
}
