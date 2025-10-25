"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface HealthFactorGaugeProps {
  currentRatio: number
  liquidationRatio: number
  safeRatio: number
  warningThreshold: number
  className?: string
}

export function HealthFactorGauge({
  currentRatio,
  liquidationRatio,
  safeRatio,
  warningThreshold,
  className = ''
}: HealthFactorGaugeProps) {
  const getHealthStatus = () => {
    if (currentRatio >= safeRatio) {
      return {
        status: 'safe' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: ShieldCheck,
        label: 'Safe',
        description: 'Position is well-collateralized'
      }
    } else if (currentRatio >= warningThreshold) {
      return {
        status: 'warning' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: AlertTriangle,
        label: 'Warning',
        description: 'Consider adding collateral'
      }
    } else {
      return {
        status: 'danger' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        label: 'Danger',
        description: 'At risk of liquidation'
      }
    }
  }

  const healthInfo = getHealthStatus()
  const Icon = healthInfo.icon

  // Calculate progress percentage (0-100)
  const maxRatio = Math.max(currentRatio, safeRatio) * 1.2
  const progressPercentage = Math.min((currentRatio / maxRatio) * 100, 100)

  // Calculate liquidation progress
  const liquidationProgress = Math.min((liquidationRatio / maxRatio) * 100, 100)
  const warningProgress = Math.min((warningThreshold / maxRatio) * 100, 100)

  return (
    <Card className={cn(
      "p-6 border-l-4",
      healthInfo.bgColor,
      healthInfo.borderColor,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className={cn("w-6 h-6", healthInfo.color)} />
          <div>
            <h3 className="font-semibold text-foreground">Health Factor</h3>
            <p className="text-sm text-muted-foreground">{healthInfo.description}</p>
          </div>
        </div>
        
        <Badge 
          variant="secondary" 
          className={cn(
            "text-sm font-medium",
            healthInfo.color,
            healthInfo.bgColor
          )}
        >
          {healthInfo.label}
        </Badge>
      </div>

      {/* Current Ratio Display */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-foreground mb-1">
          {currentRatio.toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground">
          Collateralization Ratio
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          
          {/* Liquidation threshold marker */}
          <div 
            className="absolute top-0 w-0.5 h-3 bg-red-500"
            style={{ left: `${liquidationProgress}%` }}
          />
          
          {/* Warning threshold marker */}
          <div 
            className="absolute top-0 w-0.5 h-3 bg-yellow-500"
            style={{ left: `${warningProgress}%` }}
          />
        </div>

        {/* Threshold Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <div className="flex flex-col items-start">
            <span className="font-medium text-red-600">Liquidation</span>
            <span>{liquidationRatio}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium text-yellow-600">Warning</span>
            <span>{warningThreshold}%</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-medium text-green-600">Safe</span>
            <span>{safeRatio}%</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Current</div>
            <div className="font-medium">{currentRatio.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Liquidation Price</div>
            <div className="font-medium text-red-600">
              {((currentRatio / liquidationRatio) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
