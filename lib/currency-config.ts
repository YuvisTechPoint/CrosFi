// Real currency configuration for CeloYield
export interface CurrencyInfo {
  symbol: string
  name: string
  flag: string
  color: string
  decimals: number
  address: string
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  change24h: number
  lastUpdated: number
  source: string
}

// Real Celo Alfajores testnet token addresses
export const CURRENCIES: Record<string, CurrencyInfo> = {
  cUSD: {
    symbol: 'cUSD',
    name: 'Celo Dollar',
    flag: '🇺🇸',
    color: '#4285F4',
    decimals: 18,
    address: '0x874069Fa1Ee493706DbeE6Cf34ff9829832e6A00'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    flag: '🇺🇸',
    color: '#2775CA',
    decimals: 6,
    address: '0x62b8B11039Ff5064145D0D87D32c658Da4CC2Dc1'
  },
  CELO: {
    symbol: 'CELO',
    name: 'Celo',
    flag: '🌱',
    color: '#35D07F',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000' // Native token
  }
}

// Helper functions
export const getCurrencyInfo = (currency: string): CurrencyInfo | null => {
  return CURRENCIES[currency] || null
}

export const getExchangeRate = (from: string, to: string): ExchangeRate | null => {
  // This would be replaced with real API calls to get exchange rates
  // For now, return null to indicate no mock data
  return null
}

export const formatCurrency = (amount: number, currency: string, decimals: number = 2): string => {
  const info = getCurrencyInfo(currency)
  if (!info) return `${amount.toFixed(decimals)} ${currency}`
  return `${amount.toFixed(decimals)} ${info.symbol}`
}

export const formatCurrencyWithFlag = (amount: number, currency: string, decimals: number = 2): string => {
  const info = getCurrencyInfo(currency)
  if (!info) return `${amount.toFixed(decimals)} ${currency}`
  return `${info.flag} ${amount.toFixed(decimals)} ${info.symbol}`
}

// Health factor calculation (for position components)
export const calculateHealthFactor = (collateralValue: number, borrowedValue: number, liquidationThreshold: number): number => {
  if (borrowedValue === 0) return Infinity
  return (collateralValue / borrowedValue) * 100
}

export const getHealthFactorStatus = (healthFactor: number): { status: 'safe' | 'warning' | 'danger', message: string } => {
  if (healthFactor >= 150) {
    return { status: 'safe', message: 'Position is safe' }
  } else if (healthFactor >= 125) {
    return { status: 'warning', message: 'Position approaching liquidation threshold' }
  } else {
    return { status: 'danger', message: 'Position at risk of liquidation' }
  }
}

// Currency pair information for lending
export interface CurrencyPair {
  collateral: string
  borrow: string
  apr: number
  maxLtv: number
  liquidationThreshold: number
  liquidity: number
  utilization: number
}

export const getCurrencyPair = (collateral: string, borrow: string): CurrencyPair | null => {
  // For now, return a mock currency pair
  // This would be replaced with real API calls to get pair information
  if (!CURRENCIES[collateral] || !CURRENCIES[borrow]) {
    return null
  }
  
  return {
    collateral,
    borrow,
    apr: 8.5, // Mock APR
    maxLtv: 75, // Mock max LTV
    liquidationThreshold: 80, // Mock liquidation threshold
    liquidity: 50000, // Mock liquidity
    utilization: 45 // Mock utilization
  }
}
