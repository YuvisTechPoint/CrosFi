"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ExchangeRateCard } from "@/components/exchange-rate/ExchangeRateCard"
import { MentoOracleStatus } from "@/components/exchange-rate/MentoOracleStatus"
import { EXCHANGE_RATES, CURRENCIES, MOCK_VOLUME_DATA } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, RefreshCw, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Rates() {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h")
  const [sortBy, setSortBy] = useState<"rate" | "change" | "volume">("change")

  const sortedRates = [...(EXCHANGE_RATES || [])].sort((a, b) => {
    switch (sortBy) {
      case "rate":
        return (b.rate || 0) - (a.rate || 0)
      case "change":
        return Math.abs(b.change24h || 0) - Math.abs(a.change24h || 0)
      case "volume":
        const aVolume = MOCK_VOLUME_DATA.find(v => v.pair === `${a.from}-${a.to}`)?.volume24h || 0
        const bVolume = MOCK_VOLUME_DATA.find(v => v.pair === `${b.from}-${b.to}`)?.volume24h || 0
        return bVolume - aVolume
      default:
        return 0
    }
  })

  const formatVolume = (volume: number | undefined) => {
    if (!volume || isNaN(volume)) return '$0'
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(0)}K`
    }
    return `$${volume.toFixed(0)}`
  }

  const getVolumeForPair = (from: string, to: string) => {
    const volumeData = (MOCK_VOLUME_DATA || []).find(v => v.pair === `${from}-${to}`)
    return volumeData?.volume24h || 0
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Exchange Rates</h1>
              <p className="text-muted-foreground">
                Real-time exchange rates for all Celo stablecoin pairs via Mento Protocol.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Charts
              </Button>
            </div>
          </div>

          {/* Oracle Status */}
          <MentoOracleStatus className="mb-8" />

          {/* Controls */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex gap-4">
                <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="change">Change %</SelectItem>
                    <SelectItem value="rate">Exchange Rate</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1" />
              
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </Card>

          {/* Exchange Rates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedRates.map((rate, index) => {
              const fromInfo = CURRENCIES[rate.from]
              const toInfo = CURRENCIES[rate.to]
              const volume = getVolumeForPair(rate.from, rate.to)
              const isPositive = (rate.change24h || 0) >= 0
              
              if (!fromInfo || !toInfo) return null
              
              return (
                <ExchangeRateCard
                  key={index}
                  fromCurrency={rate.from}
                  toCurrency={rate.to}
                  rate={rate.rate || 0}
                  change24h={rate.change24h || 0}
                  source="Mento"
                  lastUpdated={rate.lastUpdated || Date.now()}
                  showChart={true}
                  onClick={() => {
                    // Open detailed chart view
                    console.log('View chart for', rate.from, 'to', rate.to)
                  }}
                />
              )
            })}
          </div>

          {/* Volume Statistics */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-6">Trading Volume (24h)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(MOCK_VOLUME_DATA || []).map((volumeData, index) => {
                if (!volumeData || !volumeData.pair) return null
                
                const [from, to] = volumeData.pair.split('-')
                const fromInfo = CURRENCIES[from as keyof typeof CURRENCIES]
                const toInfo = CURRENCIES[to as keyof typeof CURRENCIES]
                
                if (!fromInfo || !toInfo) return null
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: fromInfo.color }}
                      >
                        {fromInfo.flag}
                      </div>
                      <span className="font-medium">{fromInfo.symbol}</span>
                      <span className="text-muted-foreground">/</span>
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: toInfo.color }}
                      >
                        {toInfo.flag}
                      </div>
                      <span className="font-medium">{toInfo.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatVolume(volumeData.volume24h || 0)}</div>
                      <div className="text-xs text-muted-foreground">24h volume</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Rate Changes Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Gainers (24h)</h3>
              <div className="space-y-3">
                {sortedRates
                  .filter(rate => (rate.change24h || 0) > 0)
                  .slice(0, 3)
                  .map((rate, index) => {
                    const fromInfo = CURRENCIES[rate.from]
                    const toInfo = CURRENCIES[rate.to]
                    
                    if (!fromInfo || !toInfo) return null
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: fromInfo.color }}
                          >
                            {fromInfo.flag}
                          </div>
                          <span className="font-medium">{rate.from}/{rate.to}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium">+{(rate.change24h || 0).toFixed(2)}%</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Losers (24h)</h3>
              <div className="space-y-3">
                {sortedRates
                  .filter(rate => (rate.change24h || 0) < 0)
                  .slice(0, 3)
                  .map((rate, index) => {
                    const fromInfo = CURRENCIES[rate.from]
                    const toInfo = CURRENCIES[rate.to]
                    
                    if (!fromInfo || !toInfo) return null
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: fromInfo.color }}
                          >
                            {fromInfo.flag}
                          </div>
                          <span className="font-medium">{rate.from}/{rate.to}</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600">
                          <TrendingDown className="w-4 h-4" />
                          <span className="font-medium">{(rate.change24h || 0).toFixed(2)}%</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </Card>
          </div>

          {/* Information */}
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">About Exchange Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Mento Protocol</h4>
                <p>
                  Exchange rates are provided by Mento Protocol, a decentralized stablecoin exchange 
                  on Celo. Rates are updated in real-time based on market conditions and oracle feeds.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Rate Updates</h4>
                <p>
                  Rates are updated continuously as new transactions occur. The displayed rates 
                  represent the current market price for exchanging between different Celo stablecoins.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  )
}
