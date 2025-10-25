"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface MentoOracleStatusProps {
  status?: 'active' | 'warning' | 'error' | 'updating'
  lastUpdate?: number
  className?: string
}

export function MentoOracleStatus({
  status = 'active',
  lastUpdate = Date.now() - 30000,
  className = ''
}: MentoOracleStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          label: 'Active',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'warning':
        return {
          icon: AlertCircle,
          label: 'Warning',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'error':
        return {
          icon: XCircle,
          label: 'Error',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'updating':
        return {
          icon: Clock,
          label: 'Updating',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
    }
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

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  return (
    <Card className={cn(
      "p-4 border-l-4",
      statusInfo.bgColor,
      statusInfo.borderColor,
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={cn("w-5 h-5", statusInfo.color)} />
          <div>
            <div className="font-medium text-foreground">Mento Oracle</div>
            <div className="text-sm text-muted-foreground">
              Last updated: {formatTimeAgo(lastUpdate)}
            </div>
          </div>
        </div>
        
        <Badge 
          variant="secondary" 
          className={cn(
            "text-xs",
            statusInfo.color,
            statusInfo.bgColor
          )}
        >
          {statusInfo.label}
        </Badge>
      </div>
      
      {status === 'warning' && (
        <div className="mt-3 text-sm text-yellow-700">
          Oracle data may be delayed. Please check multiple sources.
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-3 text-sm text-red-700">
          Oracle connection failed. Rates may be outdated.
        </div>
      )}
    </Card>
  )
}
