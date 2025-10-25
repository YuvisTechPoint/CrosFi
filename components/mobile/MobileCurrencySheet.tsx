"use client"

import { useState } from "react"
import { Currency } from "@/lib/types"
import { CURRENCIES } from "@/lib/currency-config"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileCurrencySheetProps {
  selectedCurrency: Currency | null
  onCurrencySelect: (currency: Currency) => void
  availableCurrencies?: Currency[]
  title?: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MobileCurrencySheet({
  selectedCurrency,
  onCurrencySelect,
  availableCurrencies = Object.keys(CURRENCIES) as Currency[],
  title = "Select Currency",
  trigger,
  open,
  onOpenChange
}: MobileCurrencySheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const getBalance = (currency: Currency) => {
    // In a real implementation, this would fetch from wallet or API
    return 0
  }

  const handleCurrencySelect = (currency: Currency) => {
    onCurrencySelect(currency)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3">
          {availableCurrencies.map((currency) => {
            const info = CURRENCIES[currency]
            const balance = getBalance(currency)
            const isSelected = selectedCurrency === currency
            
            return (
              <Button
                key={currency}
                variant="ghost"
                onClick={() => handleCurrencySelect(currency)}
                className={cn(
                  "w-full justify-start h-auto p-4",
                  isSelected && "bg-primary/10"
                )}
              >
                <div className="flex items-center gap-4 w-full">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: info.color }}
                  >
                    {info.flag}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-lg">{info.symbol}</div>
                    <div className="text-sm text-muted-foreground">{info.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Balance: {balance.toFixed(2)}
                    </div>
                  </div>
                  {isSelected && <Check className="w-6 h-6 text-primary" />}
                </div>
              </Button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
