"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface LiquidationWarningProps {
  healthFactor: number
  liquidationThreshold: number
  onAddCollateral?: () => void
  onRepay?: () => void
  className?: string
}

export function LiquidationWarning({
  healthFactor,
  liquidationThreshold,
  onAddCollateral,
  onRepay,
  className = ''
}: LiquidationWarningProps) {
  const getWarningLevel = () => {
    if (healthFactor < liquidationThreshold * 1.1) {
      return {
        level: 'critical' as const,
        title: 'Critical: Liquidation Risk',
        description: 'Your position is at immediate risk of liquidation. Add collateral or repay immediately.',
        color: 'border-red-500 bg-red-50',
        textColor: 'text-red-800',
        iconColor: 'text-red-600'
      }
    } else if (healthFactor < liquidationThreshold * 1.3) {
      return {
        level: 'high' as const,
        title: 'High Risk: Near Liquidation',
        description: 'Your position is approaching liquidation threshold. Consider adding collateral or repaying.',
        color: 'border-orange-500 bg-orange-50',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600'
      }
    } else if (healthFactor < liquidationThreshold * 1.5) {
      return {
        level: 'medium' as const,
        title: 'Medium Risk: Monitor Position',
        description: 'Your position is getting close to liquidation. Monitor exchange rates and consider adding collateral.',
        color: 'border-yellow-500 bg-yellow-50',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600'
      }
    } else {
      return null // No warning needed
    }
  }

  const warning = getWarningLevel()

  if (!warning) {
    return null
  }

  return (
    <Alert className={cn(
      "border-l-4",
      warning.color,
      className
    )}>
      <AlertTriangle className={cn("h-4 w-4", warning.iconColor)} />
      <AlertDescription className={cn("space-y-3", warning.textColor)}>
        <div>
          <div className="font-semibold mb-1">{warning.title}</div>
          <div className="text-sm">{warning.description}</div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" />
          <span>Health Factor: {healthFactor.toFixed(1)}%</span>
          <span className="text-muted-foreground">•</span>
          <span>Liquidation: {liquidationThreshold}%</span>
        </div>

        {(onAddCollateral || onRepay) && (
          <div className="flex gap-2 pt-2">
            {onAddCollateral && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onAddCollateral}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Collateral
              </Button>
            )}
            {onRepay && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onRepay}
                className="text-xs"
              >
                Repay Loan
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
