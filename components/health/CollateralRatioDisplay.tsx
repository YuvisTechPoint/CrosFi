"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollateralRatioDisplayProps {
  currentRatio: number
  safeRatio: number
  liquidationRatio: number
  collateralValue: number
  borrowedValue: number
  className?: string
}

export function CollateralRatioDisplay({
  currentRatio,
  safeRatio,
  liquidationRatio,
  collateralValue,
  borrowedValue,
  className = ''
}: CollateralRatioDisplayProps) {
  const getRatioStatus = () => {
    if (currentRatio >= safeRatio) {
      return {
        status: 'safe' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    } else if (currentRatio >= liquidationRatio * 1.2) {
      return {
        status: 'warning' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      }
    } else {
      return {
        status: 'danger' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    }
  }

  const ratioStatus = getRatioStatus()

  // Calculate progress for the safe zone
  const maxRatio = Math.max(currentRatio, safeRatio) * 1.2
  const progressPercentage = Math.min((currentRatio / maxRatio) * 100, 100)
  const safeProgress = Math.min((safeRatio / maxRatio) * 100, 100)
  const liquidationProgress = Math.min((liquidationRatio / maxRatio) * 100, 100)

  return (
    <Card className={cn(
      "p-4",
      ratioStatus.bgColor,
      ratioStatus.borderColor,
      "border-l-4",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Collateralization Ratio</h3>
        <Badge 
          variant="secondary" 
          className={cn(
            "text-xs",
            ratioStatus.color,
            ratioStatus.bgColor
          )}
        >
          {ratioStatus.status.toUpperCase()}
        </Badge>
      </div>

      {/* Current Ratio */}
      <div className="text-2xl font-bold text-foreground mb-2">
        {currentRatio.toFixed(1)}%
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          
          {/* Safe zone marker */}
          <div 
            className="absolute top-0 w-0.5 h-2 bg-green-500"
            style={{ left: `${safeProgress}%` }}
          />
          
          {/* Liquidation marker */}
          <div 
            className="absolute top-0 w-0.5 h-2 bg-red-500"
            style={{ left: `${liquidationProgress}%` }}
          />
        </div>

        {/* Zone Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Liquidation ({liquidationRatio}%)</span>
          <span>Safe ({safeRatio}%)</span>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Collateral Value</div>
          <div className="font-medium">${collateralValue.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Borrowed Value</div>
          <div className="font-medium">${borrowedValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Info Tooltip */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Collateralization ratio = (Collateral Value ÷ Borrowed Value) × 100. 
            Keep above {safeRatio}% to maintain a safe position.
          </span>
        </div>
      </div>
    </Card>
  )
}
