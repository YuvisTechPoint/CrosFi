"use client"

import { Currency } from "@/lib/types"
import { CURRENCIES } from "@/lib/currency-config"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { createContractService } from "@/lib/contracts"
import { useEffect, useState } from "react"

interface MultiCurrencyBalanceProps {
  balances?: Record<string, string>
  showConvertedTotal?: boolean
  baseCurrency?: string
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
  const { provider, signer, isConnected, address } = useWallet()
  const [userBalances, setUserBalances] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address || !provider || !signer) {
        setLoading(false)
        return
      }

      try {
        const contractService = createContractService(provider, signer)
        const tokens = contractService.getSupportedTokens()
        const balancePromises = tokens.map(async (token) => {
          const balance = await contractService.getTokenBalance(address, token.address)
          return { token: token.symbol, balance }
        })
        
        const balances = await Promise.all(balancePromises)
        const balanceMap = balances.reduce((acc, { token, balance }) => {
          acc[token] = balance
          return acc
        }, {} as Record<string, string>)
        
        setUserBalances(balanceMap)
      } catch (error) {
        console.error('Error fetching balances:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalances()
  }, [isConnected, address, provider, signer])

  const displayBalances = balances || userBalances

  const formatBalance = (amount: string | number, currency: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount)
  }

  const getTotalValue = () => {
    // Simplified total calculation - in a real app, you'd use real exchange rates
    return Object.entries(displayBalances).reduce((total, [currency, amount]) => {
      const numAmount = parseFloat(amount)
      return total + numAmount // Simplified: assume 1:1 for now
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
        {loading ? (
          <div className="text-center text-muted-foreground py-4">
            Loading balances...
          </div>
        ) : Object.keys(displayBalances).length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            {!isConnected ? 'Connect your wallet to view balances' : 'No balances found'}
          </div>
        ) : (
          Object.entries(displayBalances).map(([currency, amount]) => {
            const info = CURRENCIES[currency]
            if (!info) return null
            
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
                    {formatBalance(amount, currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currency === baseCurrency ? 'Base' : `≈ ${formatBalance(amount, baseCurrency)} ${baseCurrency}`}
                  </div>
                </div>
              </div>
            )
          })
        )}
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
