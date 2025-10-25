"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PositionList } from "@/components/position/PositionList"
import { MOCK_POSITIONS } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Filter, Download, Eye } from "lucide-react"

export default function Positions() {
  const handleCreateNew = () => {
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

  const activePositions = MOCK_POSITIONS.filter(p => p.status === 'active')
  const totalCollateralValue = activePositions.reduce((sum, pos) => sum + pos.collateralAmount, 0)
  const totalBorrowedValue = activePositions.reduce((sum, pos) => sum + pos.borrowedAmount, 0)
  const averageHealthFactor = activePositions.length > 0 
    ? activePositions.reduce((sum, pos) => sum + pos.healthFactor, 0) / activePositions.length
    : 0

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Positions</h1>
              <p className="text-muted-foreground">
                Manage your cross-currency lending positions and monitor their performance.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                New Position
              </Button>
            </div>
          </div>

          {/* Position Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {activePositions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Positions</div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    ${totalCollateralValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Collateral</div>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 text-green-600">💰</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    ${totalBorrowedValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Borrowed</div>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 text-blue-600">📊</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {averageHealthFactor.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Health Factor</div>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 text-purple-600">❤️</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Health Factor Status */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Portfolio Health</h3>
              <Badge 
                variant="secondary" 
                className={
                  averageHealthFactor >= 150 
                    ? "text-green-600 bg-green-50" 
                    : averageHealthFactor >= 125 
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-red-600 bg-red-50"
                }
              >
                {averageHealthFactor >= 150 
                  ? "SAFE" 
                  : averageHealthFactor >= 125 
                  ? "WARNING"
                  : "DANGER"
                }
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {activePositions.filter(p => p.healthFactor >= 150).length}
                </div>
                <div className="text-sm text-muted-foreground">Safe Positions</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {activePositions.filter(p => p.healthFactor >= 125 && p.healthFactor < 150).length}
                </div>
                <div className="text-sm text-muted-foreground">Warning Positions</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {activePositions.filter(p => p.healthFactor < 125).length}
                </div>
                <div className="text-sm text-muted-foreground">Danger Positions</div>
              </div>
            </div>
          </Card>

          {/* Positions List */}
          <PositionList
            positions={MOCK_POSITIONS}
            onRepay={handleRepay}
            onAddCollateral={handleAddCollateral}
            onClose={handleClose}
            onDetails={handleDetails}
            onCreateNew={handleCreateNew}
          />

          {/* Risk Warning */}
          {activePositions.some(p => p.healthFactor < 150) && (
            <Card className="p-6 mt-8 border-yellow-200 bg-yellow-50">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 text-yellow-600 mt-0.5">⚠️</div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Risk Warning</h4>
                  <p className="text-sm text-yellow-700">
                    Some of your positions are approaching liquidation thresholds. 
                    Consider adding collateral or repaying loans to improve your health factors.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
