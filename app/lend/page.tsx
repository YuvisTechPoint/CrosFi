"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CurrencyPairSelector } from "@/components/currency/CurrencyPairSelector"
import { ExchangeRateDisplay } from "@/components/exchange-rate/ExchangeRateDisplay"
import { HealthFactorGauge } from "@/components/health/HealthFactorGauge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Currency, getCurrencyPair, CURRENCIES } from "@/lib/mock-data"
import { ArrowLeft, ArrowRight, Calculator, Info } from "lucide-react"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { HelpSection } from "@/components/ui/help-section"

export default function Lend() {
  const [step, setStep] = useState(1)
  const [collateralCurrency, setCollateralCurrency] = useState<Currency | null>(null)
  const [borrowCurrency, setBorrowCurrency] = useState<Currency | null>(null)
  const [collateralAmount, setCollateralAmount] = useState(0)
  const [borrowAmount, setBorrowAmount] = useState(0)

  const pairInfo = collateralCurrency && borrowCurrency 
    ? getCurrencyPair(collateralCurrency, borrowCurrency)
    : null

  const maxBorrowAmount = pairInfo && collateralAmount > 0
    ? (collateralAmount * pairInfo.maxLtv) / 100
    : 0

  const collateralizationRatio = borrowAmount > 0
    ? (collateralAmount / borrowAmount) * 100
    : 0

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleCreatePosition = () => {
    console.log('Creating position:', {
      collateralCurrency,
      borrowCurrency,
      collateralAmount,
      borrowAmount
    })
    // Handle position creation
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-20 md:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Cross-Currency Position</h1>
            <p className="text-muted-foreground">
              Borrow in any currency using different currency collateral.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step >= stepNumber 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`
                      w-16 h-0.5 mx-2
                      ${step > stepNumber ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Select Collateral</span>
              <span>Choose Borrow</span>
              <span>Set Amount</span>
              <span>Review & Create</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Select Collateral Currency</h2>
                      <p className="text-muted-foreground mb-6">
                        Choose which currency you want to use as collateral for your loan.
                      </p>
                      <CurrencyPairSelector
                        collateralCurrency={collateralCurrency}
                        borrowCurrency={null}
                        onCollateralChange={setCollateralCurrency}
                        onBorrowChange={() => {}}
                        showBalance={true}
                        showAPR={false}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Choose Borrowing Currency</h2>
                      <p className="text-muted-foreground mb-6">
                        Select the currency you want to borrow. This must be different from your collateral.
                      </p>
                      <CurrencyPairSelector
                        collateralCurrency={collateralCurrency}
                        borrowCurrency={borrowCurrency}
                        onCollateralChange={setCollateralCurrency}
                        onBorrowChange={setBorrowCurrency}
                        showBalance={true}
                        showAPR={true}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Set Loan Amount</h2>
                      <p className="text-muted-foreground mb-6">
                        Enter the amount of collateral you want to deposit and how much you want to borrow.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label htmlFor="collateral-amount">Collateral Amount</Label>
                          <InfoTooltip content="The amount of currency you want to deposit as collateral for your loan. This determines how much you can borrow." />
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="collateral-amount"
                            type="number"
                            value={collateralAmount}
                            onChange={(e) => setCollateralAmount(Number(e.target.value))}
                            placeholder="0.00"
                          />
                          <Badge variant="outline" className="px-3 py-2">
                            {collateralCurrency}
                          </Badge>
                        </div>
                      </div>

                      {collateralAmount > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Label htmlFor="borrow-amount">Borrow Amount (Max: {maxBorrowAmount.toFixed(2)})</Label>
                            <InfoTooltip content="The amount you want to borrow. Maximum is determined by your collateral amount and the loan-to-value (LTV) ratio." />
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="borrow-amount"
                              type="number"
                              value={borrowAmount}
                              onChange={(e) => setBorrowAmount(Number(e.target.value))}
                              placeholder="0.00"
                              max={maxBorrowAmount}
                            />
                            <Badge variant="outline" className="px-3 py-2">
                              {borrowCurrency}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <Slider
                              value={[borrowAmount]}
                              onValueChange={([value]) => setBorrowAmount(value)}
                              max={maxBorrowAmount}
                              step={0.01}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Review Position</h2>
                      <p className="text-muted-foreground mb-6">
                        Review your position details before creating the loan.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Collateral</Label>
                          <div className="text-lg font-medium">
                            {collateralAmount} {collateralCurrency}
                          </div>
                        </div>
                        <div>
                          <Label>Borrowing</Label>
                          <div className="text-lg font-medium">
                            {borrowAmount} {borrowCurrency}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>APR</Label>
                          <div className="text-lg font-medium text-primary">
                            {pairInfo?.apr}%
                          </div>
                        </div>
                        <div>
                          <Label>Collateralization Ratio</Label>
                          <div className="text-lg font-medium">
                            {collateralizationRatio.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={step === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {step < 4 ? (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !collateralCurrency) ||
                        (step === 2 && !borrowCurrency) ||
                        (step === 3 && (!collateralAmount || !borrowAmount))
                      }
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleCreatePosition}>
                      Create Position
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Exchange Rate */}
              {collateralCurrency && borrowCurrency && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Exchange Rate</h3>
                  <ExchangeRateDisplay
                    fromCurrency={collateralCurrency}
                    toCurrency={borrowCurrency}
                    showChart={false}
                  />
                </Card>
              )}

              {/* Health Factor */}
              {collateralAmount > 0 && borrowAmount > 0 && (
                <HealthFactorGauge
                  currentRatio={collateralizationRatio}
                  liquidationRatio={pairInfo?.liquidationThreshold || 80}
                  safeRatio={150}
                  warningThreshold={120}
                />
              )}

              {/* Loan Calculator */}
              {pairInfo && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Loan Calculator</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max LTV</span>
                      <span className="font-medium">{pairInfo.maxLtv}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Liquidation Threshold</span>
                      <span className="font-medium">{pairInfo.liquidationThreshold}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current APR</span>
                      <span className="font-medium text-primary">{pairInfo.apr}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Liquidity</span>
                      <span className="font-medium">${(pairInfo.liquidity / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Help Section */}
              <HelpSection
                title="How Cross-Currency Lending Works"
                content="You can use any Celo stablecoin as collateral to borrow a different stablecoin. Exchange rates are provided by Mento Protocol for accurate conversions."
                links={[
                  { label: "Learn More", href: "/docs", external: false },
                  { label: "Mento Protocol", href: "https://mento.org", external: true }
                ]}
              />

              {/* Info */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Important Notes</h3>
                </div>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Exchange rates are provided by Mento Protocol oracles</p>
                  <p>• Your position can be liquidated if the collateralization ratio falls below the threshold</p>
                  <p>• Interest accrues continuously on borrowed amounts</p>
                  <p>• You can add more collateral or repay at any time</p>
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
