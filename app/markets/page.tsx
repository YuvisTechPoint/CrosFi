"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CURRENCY_PAIRS, CURRENCIES, MOCK_MARKET_DATA } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, TrendingUp, TrendingDown, Filter, Search } from "lucide-react"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { cn } from "@/lib/utils"

export default function Markets() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"apr" | "liquidity" | "utilization">("apr")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterCollateral, setFilterCollateral] = useState<string>("all")
  const [filterBorrow, setFilterBorrow] = useState<string>("all")

  const filteredPairs = CURRENCY_PAIRS
    .filter(pair => {
      const matchesSearch = searchTerm === "" || 
        pair.collateral.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pair.borrow.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCollateral = filterCollateral === "all" || pair.collateral === filterCollateral
      const matchesBorrow = filterBorrow === "all" || pair.borrow === filterBorrow
      
      return matchesSearch && matchesCollateral && matchesBorrow
    })
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case "apr":
          aValue = a.apr
          bValue = b.apr
          break
        case "liquidity":
          aValue = a.liquidity
          bValue = b.liquidity
          break
        case "utilization":
          aValue = a.utilization
          bValue = b.utilization
          break
        default:
          aValue = a.apr
          bValue = b.apr
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-red-600 bg-red-50"
    if (utilization >= 60) return "text-yellow-600 bg-yellow-50"
    return "text-green-600 bg-green-50"
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Currency Markets</h1>
            <p className="text-muted-foreground">
              Explore all available cross-currency lending pairs and their current rates.
            </p>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(MOCK_MARKET_DATA.totalLiquidity)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Liquidity</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(MOCK_MARKET_DATA.totalBorrowed)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Borrowed</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {MOCK_MARKET_DATA.averageApr}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average APR</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {MOCK_MARKET_DATA.activePositions}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Positions</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search currency pairs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Select value={filterCollateral} onValueChange={setFilterCollateral}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Collateral" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Collateral</SelectItem>
                    {Object.keys(CURRENCIES).map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterBorrow} onValueChange={setFilterBorrow}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Borrow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Borrow</SelectItem>
                    {Object.keys(CURRENCIES).map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apr">APR</SelectItem>
                    <SelectItem value="liquidity">Liquidity</SelectItem>
                    <SelectItem value="utilization">Utilization</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Markets Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">Currency Pair</th>
                    <th className="text-right py-4 px-6 font-semibold">
                      <div className="flex items-center justify-end gap-1">
                        APR
                        <InfoTooltip content="Annual Percentage Rate - the interest rate you'll pay on borrowed funds." />
                      </div>
                    </th>
                    <th className="text-right py-4 px-6 font-semibold">
                      <div className="flex items-center justify-end gap-1">
                        Utilization
                        <InfoTooltip content="Percentage of available liquidity currently being used. Higher utilization may indicate higher demand." />
                      </div>
                    </th>
                    <th className="text-right py-4 px-6 font-semibold">
                      <div className="flex items-center justify-end gap-1">
                        Liquidity
                        <InfoTooltip content="Total amount available for borrowing in this currency pair." />
                      </div>
                    </th>
                    <th className="text-right py-4 px-6 font-semibold">
                      <div className="flex items-center justify-end gap-1">
                        Max LTV
                        <InfoTooltip content="Maximum Loan-to-Value ratio - the highest percentage of collateral value you can borrow." />
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPairs.map((pair, index) => {
                    const collateralInfo = CURRENCIES[pair.collateral]
                    const borrowInfo = CURRENCIES[pair.borrow]
                    
                    return (
                      <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: collateralInfo.color }}
                            >
                              {collateralInfo.flag}
                            </div>
                            <span className="font-medium">{pair.collateral}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: borrowInfo.color }}
                            >
                              {borrowInfo.flag}
                            </div>
                            <span className="font-medium">{pair.borrow}</span>
                          </div>
                        </td>
                        
                        <td className="text-right py-4 px-6">
                          <span className="font-semibold text-primary">{pair.apr}%</span>
                        </td>
                        
                        <td className="text-right py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">{pair.utilization}%</span>
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", getUtilizationColor(pair.utilization))}
                            >
                              {pair.utilization >= 80 ? "High" : pair.utilization >= 60 ? "Medium" : "Low"}
                            </Badge>
                          </div>
                        </td>
                        
                        <td className="text-right py-4 px-6">
                          <span className="font-medium">{formatCurrency(pair.liquidity)}</span>
                        </td>
                        
                        <td className="text-right py-4 px-6">
                          <span className="font-medium">{pair.maxLtv}%</span>
                        </td>
                        
                        <td className="text-center py-4 px-6">
                          <Button 
                            size="sm"
                            onClick={() => window.location.href = `/lend?collateral=${pair.collateral}&borrow=${pair.borrow}`}
                          >
                            Lend
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* No Results */}
          {filteredPairs.length === 0 && (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">No markets found</h3>
                <p className="text-sm">
                  Try adjusting your search criteria or filters to find currency pairs.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
