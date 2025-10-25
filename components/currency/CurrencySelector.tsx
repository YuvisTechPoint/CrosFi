"use client"

import { useState } from "react"
import { Currency } from "@/lib/types"
import { CURRENCIES, MOCK_BALANCES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CurrencySelectorProps {
  selectedCurrency: Currency | null
  onCurrencySelect: (currency: Currency) => void
  availableCurrencies?: Currency[]
  disabled?: boolean
  showBalance?: boolean
  className?: string
}

export function CurrencySelector({
  selectedCurrency,
  onCurrencySelect,
  availableCurrencies = ['cUSD', 'cEUR', 'cREAL', 'eXOF'],
  disabled = false,
  showBalance = true,
  className = ''
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getBalance = (currency: Currency) => {
    const balance = MOCK_BALANCES.find(b => b.currency === currency)
    return balance?.balance || 0
  }

  const selectedInfo = selectedCurrency ? CURRENCIES[selectedCurrency] : null

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between h-12"
      >
        <div className="flex items-center gap-3">
          {selectedInfo ? (
            <>
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: selectedInfo.color }}
              >
                {selectedInfo.flag}
              </div>
              <div className="text-left">
                <div className="font-medium">{selectedInfo.symbol}</div>
                {showBalance && (
                  <div className="text-xs text-muted-foreground">
                    {getBalance(selectedCurrency!).toFixed(2)}
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Select currency</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 p-2">
          <div className="space-y-1">
            {availableCurrencies.map((currency) => {
              const info = CURRENCIES[currency]
              const balance = getBalance(currency)
              const isSelected = selectedCurrency === currency
              
              return (
                <Button
                  key={currency}
                  variant="ghost"
                  onClick={() => {
                    onCurrencySelect(currency)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full justify-start h-auto p-3",
                    isSelected && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: info.color }}
                    >
                      {info.flag}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{info.symbol}</div>
                      <div className="text-xs text-muted-foreground">{info.name}</div>
                      {showBalance && (
                        <div className="text-xs text-muted-foreground">
                          Balance: {balance.toFixed(2)}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </Button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
