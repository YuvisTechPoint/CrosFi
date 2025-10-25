"use client"

import { useState } from "react"
import { Currency } from "@/lib/types"
import { CURRENCIES, getCurrencyPair } from "@/lib/currency-config"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CurrencyPairSelectorProps {
  collateralCurrency: Currency | null
  borrowCurrency: Currency | null
  onCollateralChange: (currency: Currency) => void
  onBorrowChange: (currency: Currency) => void
  disabledPairs?: string[]
  showBalance?: boolean
  showAPR?: boolean
  className?: string
}

export function CurrencyPairSelector({
  collateralCurrency,
  borrowCurrency,
  onCollateralChange,
  onBorrowChange,
  disabledPairs = [],
  showBalance = true,
  showAPR = true,
  className = ''
}: CurrencyPairSelectorProps) {
  const [collateralOpen, setCollateralOpen] = useState(false)
  const [borrowOpen, setBorrowOpen] = useState(false)

  const availableCurrencies: Currency[] = Object.keys(CURRENCIES) as Currency[]
  
  const getAvailableBorrowCurrencies = () => {
    if (!collateralCurrency) return availableCurrencies
    return availableCurrencies.filter(currency => currency !== collateralCurrency)
  }

  const getPairInfo = () => {
    if (!collateralCurrency || !borrowCurrency) return null
    return getCurrencyPair(collateralCurrency, borrowCurrency)
  }

  const pairInfo = getPairInfo()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Collateral Currency Selector */}
      <div className="relative">
        <label className="block text-sm font-medium mb-2">Collateral Currency</label>
        <Button
          variant="outline"
          onClick={() => setCollateralOpen(!collateralOpen)}
          className="w-full justify-between h-12"
        >
          <div className="flex items-center gap-3">
            {collateralCurrency ? (
              <>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: CURRENCIES[collateralCurrency].color }}
                >
                  {CURRENCIES[collateralCurrency].flag}
                </div>
                <div className="text-left">
                  <div className="font-medium">{CURRENCIES[collateralCurrency].symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {CURRENCIES[collateralCurrency].name}
                  </div>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">Select collateral</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>

        {collateralOpen && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 p-2">
            <div className="space-y-1">
              {availableCurrencies.map((currency) => {
                const info = CURRENCIES[currency]
                const isSelected = collateralCurrency === currency
                
                return (
                  <Button
                    key={currency}
                    variant="ghost"
                    onClick={() => {
                      onCollateralChange(currency)
                      setCollateralOpen(false)
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

      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Borrow Currency Selector */}
      <div className="relative">
        <label className="block text-sm font-medium mb-2">Borrow Currency</label>
        <Button
          variant="outline"
          onClick={() => setBorrowOpen(!borrowOpen)}
          disabled={!collateralCurrency}
          className="w-full justify-between h-12"
        >
          <div className="flex items-center gap-3">
            {borrowCurrency ? (
              <>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: CURRENCIES[borrowCurrency].color }}
                >
                  {CURRENCIES[borrowCurrency].flag}
                </div>
                <div className="text-left">
                  <div className="font-medium">{CURRENCIES[borrowCurrency].symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {CURRENCIES[borrowCurrency].name}
                  </div>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">
                {collateralCurrency ? "Select borrow currency" : "Select collateral first"}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>

        {borrowOpen && collateralCurrency && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 p-2">
            <div className="space-y-1">
              {getAvailableBorrowCurrencies().map((currency) => {
                const info = CURRENCIES[currency]
                const isSelected = borrowCurrency === currency
                const pairKey = `${collateralCurrency}-${currency}`
                const isDisabled = disabledPairs.includes(pairKey)
                
                return (
                  <Button
                    key={currency}
                    variant="ghost"
                    onClick={() => {
                      if (!isDisabled) {
                        onBorrowChange(currency)
                        setBorrowOpen(false)
                      }
                    }}
                    disabled={isDisabled}
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      isSelected && "bg-primary/10",
                      isDisabled && "opacity-50 cursor-not-allowed"
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
                        {showAPR && pairInfo && (
                          <div className="text-xs text-primary font-medium">
                            APR: {pairInfo.apr}%
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

      {/* Pair Information */}
      {pairInfo && (
        <Card className="p-4 bg-muted/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">APR</div>
              <div className="font-medium">{pairInfo.apr}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Max LTV</div>
              <div className="font-medium">{pairInfo.maxLtv}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Utilization</div>
              <div className="font-medium">{pairInfo.utilization}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Liquidity</div>
              <div className="font-medium">${(pairInfo.liquidity / 1000).toFixed(0)}K</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
