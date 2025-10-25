import { 
  Currency, 
  CurrencyInfo, 
  ExchangeRate, 
  CurrencyPair, 
  LendingPosition, 
  MarketData, 
  Transaction, 
  UserBalance,
  RateHistory,
  VolumeData
} from './types'

// Currency Information
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  cUSD: {
    symbol: 'cUSD',
    name: 'Celo Dollar',
    flag: '🇺🇸',
    color: '#4285F4',
    decimals: 18,
    address: '0x765DE816845861e75A25fCA122bb6898B8B1282a'
  },
  cEUR: {
    symbol: 'cEUR',
    name: 'Celo Euro',
    flag: '🇪🇺',
    color: '#7B61FF',
    decimals: 18,
    address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'
  },
  cREAL: {
    symbol: 'cREAL',
    name: 'Celo Real',
    flag: '🇧🇷',
    color: '#00C853',
    decimals: 18,
    address: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787'
  },
  eXOF: {
    symbol: 'eXOF',
    name: 'eXOF',
    flag: '🇸🇳',
    color: '#FF9800',
    decimals: 18,
    address: '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4'
  }
}

// Mock Exchange Rates (via Mento)
export const EXCHANGE_RATES: ExchangeRate[] = [
  {
    from: 'cUSD',
    to: 'cEUR',
    rate: 0.9234,
    change24h: 0.12,
    lastUpdated: Date.now() - 30000,
    source: 'Mento'
  },
  {
    from: 'cUSD',
    to: 'cREAL',
    rate: 5.1234,
    change24h: -0.08,
    lastUpdated: Date.now() - 25000,
    source: 'Mento'
  },
  {
    from: 'cUSD',
    to: 'eXOF',
    rate: 612.45,
    change24h: 0.03,
    lastUpdated: Date.now() - 20000,
    source: 'Mento'
  },
  {
    from: 'cEUR',
    to: 'cREAL',
    rate: 5.5512,
    change24h: 0.05,
    lastUpdated: Date.now() - 15000,
    source: 'Mento'
  },
  {
    from: 'cEUR',
    to: 'eXOF',
    rate: 663.78,
    change24h: -0.02,
    lastUpdated: Date.now() - 10000,
    source: 'Mento'
  },
  {
    from: 'cREAL',
    to: 'eXOF',
    rate: 119.56,
    change24h: 0.01,
    lastUpdated: Date.now() - 5000,
    source: 'Mento'
  }
]

// Mock Currency Pairs for Lending
export const CURRENCY_PAIRS: CurrencyPair[] = [
  {
    collateral: 'cUSD',
    borrow: 'cEUR',
    apr: 5.2,
    utilization: 68,
    liquidity: 1200000,
    maxLtv: 75,
    liquidationThreshold: 80,
    isActive: true
  },
  {
    collateral: 'cEUR',
    borrow: 'cUSD',
    apr: 4.8,
    utilization: 72,
    liquidity: 890000,
    maxLtv: 75,
    liquidationThreshold: 80,
    isActive: true
  },
  {
    collateral: 'cREAL',
    borrow: 'cUSD',
    apr: 6.1,
    utilization: 54,
    liquidity: 450000,
    maxLtv: 70,
    liquidationThreshold: 85,
    isActive: true
  },
  {
    collateral: 'cUSD',
    borrow: 'cREAL',
    apr: 5.9,
    utilization: 61,
    liquidity: 380000,
    maxLtv: 70,
    liquidationThreshold: 85,
    isActive: true
  },
  {
    collateral: 'cEUR',
    borrow: 'cREAL',
    apr: 6.5,
    utilization: 48,
    liquidity: 290000,
    maxLtv: 70,
    liquidationThreshold: 85,
    isActive: true
  },
  {
    collateral: 'eXOF',
    borrow: 'cUSD',
    apr: 7.2,
    utilization: 43,
    liquidity: 150000,
    maxLtv: 65,
    liquidationThreshold: 90,
    isActive: true
  },
  {
    collateral: 'cUSD',
    borrow: 'eXOF',
    apr: 6.8,
    utilization: 38,
    liquidity: 120000,
    maxLtv: 65,
    liquidationThreshold: 90,
    isActive: true
  },
  {
    collateral: 'cREAL',
    borrow: 'cEUR',
    apr: 6.3,
    utilization: 52,
    liquidity: 220000,
    maxLtv: 70,
    liquidationThreshold: 85,
    isActive: true
  }
]

// Mock User Positions
export const MOCK_POSITIONS: LendingPosition[] = [
  {
    id: 'pos-1',
    collateralCurrency: 'cREAL',
    borrowCurrency: 'cUSD',
    collateralAmount: 1000,
    borrowedAmount: 650,
    collateralizationRatio: 185,
    healthFactor: 1.85,
    apr: 6.1,
    accruedInterest: 12.45,
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    lastUpdated: Date.now() - 3600000, // 1 hour ago
    status: 'active'
  },
  {
    id: 'pos-2',
    collateralCurrency: 'cEUR',
    borrowCurrency: 'cUSD',
    collateralAmount: 500,
    borrowedAmount: 350,
    collateralizationRatio: 165,
    healthFactor: 1.65,
    apr: 4.8,
    accruedInterest: 8.23,
    createdAt: Date.now() - 86400000 * 14, // 14 days ago
    lastUpdated: Date.now() - 1800000, // 30 minutes ago
    status: 'active'
  },
  {
    id: 'pos-3',
    collateralCurrency: 'cUSD',
    borrowCurrency: 'cEUR',
    collateralAmount: 800,
    borrowedAmount: 520,
    collateralizationRatio: 200,
    healthFactor: 2.0,
    apr: 5.2,
    accruedInterest: 15.67,
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    lastUpdated: Date.now() - 900000, // 15 minutes ago
    status: 'active'
  }
]

// Mock Market Data
export const MOCK_MARKET_DATA: MarketData = {
  totalLiquidity: 3500000,
  totalBorrowed: 2100000,
  totalCollateral: 2800000,
  averageApr: 5.8,
  activePositions: 1247,
  currencyPairs: CURRENCY_PAIRS
}

// Mock User Balances
export const MOCK_BALANCES: UserBalance[] = [
  {
    currency: 'cUSD',
    balance: 1250.50,
    available: 1250.50,
    inUse: 0
  },
  {
    currency: 'cEUR',
    balance: 890.30,
    available: 890.30,
    inUse: 0
  },
  {
    currency: 'cREAL',
    balance: 2100.75,
    available: 2100.75,
    inUse: 0
  },
  {
    currency: 'eXOF',
    balance: 45000,
    available: 45000,
    inUse: 0
  }
]

// Mock Transactions
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'borrow',
    collateralCurrency: 'cREAL',
    borrowCurrency: 'cUSD',
    amount: 650,
    exchangeRate: 5.1234,
    timestamp: Date.now() - 86400000 * 7,
    txHash: '0x1234567890abcdef...',
    status: 'confirmed'
  },
  {
    id: 'tx-2',
    type: 'supply',
    collateralCurrency: 'cREAL',
    amount: 1000,
    timestamp: Date.now() - 86400000 * 7,
    txHash: '0xabcdef1234567890...',
    status: 'confirmed'
  },
  {
    id: 'tx-3',
    type: 'borrow',
    collateralCurrency: 'cEUR',
    borrowCurrency: 'cUSD',
    amount: 350,
    exchangeRate: 0.9234,
    timestamp: Date.now() - 86400000 * 14,
    txHash: '0x9876543210fedcba...',
    status: 'confirmed'
  },
  {
    id: 'tx-4',
    type: 'supply',
    collateralCurrency: 'cEUR',
    amount: 500,
    timestamp: Date.now() - 86400000 * 14,
    txHash: '0xfedcba0987654321...',
    status: 'confirmed'
  }
]

// Mock Rate History for Charts
export const MOCK_RATE_HISTORY: Record<string, RateHistory[]> = {
  'cUSD-cEUR': Array.from({ length: 24 }, (_, i) => ({
    timestamp: Date.now() - (23 - i) * 3600000, // Last 24 hours
    rate: 0.9234 + (Math.random() - 0.5) * 0.02
  })),
  'cUSD-cREAL': Array.from({ length: 24 }, (_, i) => ({
    timestamp: Date.now() - (23 - i) * 3600000,
    rate: 5.1234 + (Math.random() - 0.5) * 0.1
  })),
  'cUSD-eXOF': Array.from({ length: 24 }, (_, i) => ({
    timestamp: Date.now() - (23 - i) * 3600000,
    rate: 612.45 + (Math.random() - 0.5) * 10
  }))
}

// Mock Volume Data
export const MOCK_VOLUME_DATA: VolumeData[] = [
  {
    pair: 'cUSD-cEUR',
    volume24h: 125000,
    volume7d: 890000,
    volume30d: 3200000
  },
  {
    pair: 'cUSD-cREAL',
    volume24h: 98000,
    volume7d: 650000,
    volume30d: 2400000
  },
  {
    pair: 'cUSD-eXOF',
    volume24h: 45000,
    volume7d: 320000,
    volume30d: 1200000
  }
]

// Helper Functions
export const getCurrencyInfo = (currency: Currency): CurrencyInfo => {
  return CURRENCIES[currency]
}

export const getExchangeRate = (from: Currency, to: Currency): ExchangeRate | null => {
  return EXCHANGE_RATES.find(rate => rate.from === from && rate.to === to) || null
}

export const getCurrencyPair = (collateral: Currency, borrow: Currency): CurrencyPair | null => {
  return CURRENCY_PAIRS.find(pair => pair.collateral === collateral && pair.borrow === borrow) || null
}

export const formatCurrency = (amount: number, currency: Currency, decimals: number = 2): string => {
  const info = getCurrencyInfo(currency)
  return `${amount.toFixed(decimals)} ${info.symbol}`
}

export const formatCurrencyWithFlag = (amount: number, currency: Currency, decimals: number = 2): string => {
  const info = getCurrencyInfo(currency)
  return `${info.flag} ${amount.toFixed(decimals)} ${info.symbol}`
}

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
