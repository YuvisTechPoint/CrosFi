"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PositionList } from "@/components/position/PositionList"
import { MultiCurrencyBalance } from "@/components/currency/MultiCurrencyBalance"
import { MentoOracleStatus } from "@/components/exchange-rate/MentoOracleStatus"
import { MOCK_POSITIONS } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { InfoTooltip } from "@/components/ui/info-tooltip"

export default function Dashboard() {
  const handleCreateNew = () => {
    // Navigate to lending page
    window.location.href = '/lend'
  }

  const handleRepay = (position: any) => {
    console.log('Repay position:', position.id)
    // Open repay modal
  }

  const handleAddCollateral = (position: any) => {
    console.log('Add collateral to position:', position.id)
    // Open add collateral modal
  }

  const handleClose = (position: any) => {
    console.log('Close position:', position.id)
    // Open close position modal
  }

  const handleDetails = (position: any) => {
    console.log('View position details:', position.id)
    // Open position details modal
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your cross-currency lending positions and monitor your portfolio.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">$2,340</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Total Collateral</span>
                    <InfoTooltip content="Total value of all your collateral across all currency pairs, converted to USD equivalent." />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">$1,520</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Total Borrowed</span>
                    <InfoTooltip content="Total amount you have borrowed across all positions, converted to USD equivalent." />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">154%</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Health Factor</span>
                    <InfoTooltip content="Overall health factor across all positions. Higher values indicate safer positions." />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">3</div>
                  <div className="text-sm text-muted-foreground">Active Positions</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <PositionList
                positions={MOCK_POSITIONS}
                onRepay={handleRepay}
                onAddCollateral={handleAddCollateral}
                onClose={handleClose}
                onDetails={handleDetails}
                onCreateNew={handleCreateNew}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet Balances */}
              <MultiCurrencyBalance />

              {/* Oracle Status */}
              <MentoOracleStatus />

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={handleCreateNew}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Position
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/markets'}
                  >
                    View Markets
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/rates'}
                  >
                    Check Exchange Rates
                  </Button>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Borrowed 350 cUSD</div>
                      <div className="text-muted-foreground">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Added 100 cEUR collateral</div>
                      <div className="text-muted-foreground">1 day ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Created cREAL → cUSD position</div>
                      <div className="text-muted-foreground">3 days ago</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
