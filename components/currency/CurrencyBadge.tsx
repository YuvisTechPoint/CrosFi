"use client"

import { Currency } from "@/lib/types"
import { getCurrencyInfo } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface CurrencyBadgeProps {
  currency: Currency
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

const variantClasses = {
  default: 'text-white',
  outline: 'border-2 text-foreground',
  secondary: 'bg-muted text-muted-foreground'
}

export function CurrencyBadge({ 
  currency, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: CurrencyBadgeProps) {
  const info = getCurrencyInfo(currency)
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        variantClasses[variant],
        variant === 'default' && 'border-0',
        variant === 'outline' && 'bg-transparent',
        className
      )}
      style={variant === 'default' ? { backgroundColor: info.color } : { borderColor: info.color }}
    >
      <span className="text-sm">{info.flag}</span>
      {info.symbol}
    </span>
  )
}
