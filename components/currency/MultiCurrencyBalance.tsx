"use client"

import { Currency } from "@/lib/types"
import { CURRENCIES, MOCK_BALANCES } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft } from "lucide-react"

interface MultiCurrencyBalanceProps {
  balances?: Record<Currency, number>
  showConvertedTotal?: boolean
  baseCurrency?: Currency
  enableQuickSwap?: boolean
  className?: string
}

export function MultiCurrencyBalance({
  balances,
  showConvertedTotal = true,
  baseCurrency = 'cUSD',
  enableQuickSwap = true,
  className = ''
}: MultiCurrencyBalanceProps) {
  const userBalances = balances || MOCK_BALANCES.reduce((acc, balance) => {
    acc[balance.currency] = balance.balance
    return acc
  }, {} as Record<Currency, number>)

  const formatBalance = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getTotalValue = () => {
    // Mock conversion rates for total calculation
    const rates = {
      cUSD: 1,
      cEUR: 0.92,
      cREAL: 5.12,
      eXOF: 612
    }
    
    return Object.entries(userBalances).reduce((total, [currency, amount]) => {
      return total + (amount / rates[currency as Currency])
    }, 0)
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Wallet Balances</h3>
        {enableQuickSwap && (
          <Button variant="outline" size="sm">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Convert
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(userBalances).map(([currency, amount]) => {
          const info = CURRENCIES[currency as Currency]
          return (
            <div key={currency} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: info.color }}
                >
                  {info.flag}
                </div>
                <div>
                  <div className="font-medium">{info.symbol}</div>
                  <div className="text-xs text-muted-foreground">{info.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatBalance(amount, currency as Currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currency === baseCurrency ? 'Base' : `≈ ${formatBalance(amount / (currency === 'cEUR' ? 0.92 : currency === 'cREAL' ? 5.12 : 612), baseCurrency)} ${baseCurrency}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showConvertedTotal && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Value</span>
            <span className="font-semibold">
              {formatBalance(getTotalValue(), baseCurrency)} {baseCurrency}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}
