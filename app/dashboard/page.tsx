"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PositionList } from "@/components/position/PositionList"
import { MultiCurrencyBalance } from "@/components/currency/MultiCurrencyBalance"
import { MentoOracleStatus } from "@/components/exchange-rate/MentoOracleStatus"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { useWallet } from "@/contexts/WalletContext"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { address, isConnected } = useWallet()
  const [positions, setPositions] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        const [positionsData, statsData] = await Promise.all([
          apiClient.getUserPositions(address),
          apiClient.getUserStats(address)
        ])
        setPositions(positionsData)
        setUserStats(statsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isConnected, address, apiClient])

  const handleCreateNew = () => {
    // Navigate to vault page for yield farming
    window.location.href = '/vault'
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
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? '...' : `$${userStats?.totalDeposited || '0'}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Total Deposited</span>
                    <InfoTooltip content="Total amount you have deposited into the vault across all tokens." />
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
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? '...' : `$${userStats?.totalEarned || '0'}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Total Earned</span>
                    <InfoTooltip content="Total yield earned from your vault positions." />
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
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? '...' : `${userStats?.currentPositions || 0}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Active Positions</span>
                    <InfoTooltip content="Number of active vault positions across all tokens." />
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
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? '...' : `$${userStats?.totalWithdrawn || '0'}`}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Withdrawn</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <PositionList
                positions={positions}
                onRepay={handleRepay}
                onAddCollateral={handleAddCollateral}
                onClose={handleClose}
                onDetails={handleDetails}
                onCreateNew={handleCreateNew}
                loading={loading}
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
                    Start Yield Farming
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/vault'}
                  >
                    View Vault
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/rates'}
                  >
                    Check APY Rates
                  </Button>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {!isConnected ? (
                    <div className="text-center text-muted-foreground py-4">
                      Connect your wallet to view activity
                    </div>
                  ) : loading ? (
                    <div className="text-center text-muted-foreground py-4">
                      Loading activity...
                    </div>
                  ) : positions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No positions yet. Start yield farming!
                    </div>
                  ) : (
                    positions.slice(0, 3).map((position, index) => (
                      <div key={position.id} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {position.token} Position
                          </div>
                          <div className="text-muted-foreground">
                            {position.shares} shares
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
