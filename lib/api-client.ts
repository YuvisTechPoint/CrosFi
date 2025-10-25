import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export interface TVLData {
  totalTVL: string
  breakdown: Array<{
    token: string
    tvl: string
    apy: number
  }>
}

export interface APYData {
  token: string
  apy: number
  lastUpdated: string
}

export interface APYHistoryData {
  id: string
  token: string
  apy: number
  tvl: string
  timestamp: string
}

export interface UserPosition {
  id: string
  userId: string
  token: string
  shares: string
  assetValue: string
  apy: number
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  type: string
  token: string
  amount: string
  shares?: string
  txHash: string
  blockNumber?: string
  timestamp: string
  status: string
  gasUsed?: string
  gasPrice?: string
}

export interface UserStats {
  totalDeposited: string
  totalWithdrawn: string
  totalEarned: string
  currentPositions: number
}

export interface VaultStats {
  totalUsers: number
  tokens: Array<{
    token: string
    totalAssets: string
    totalShares: string
    apy: number
    lastUpdated: string
  }>
}

export interface VaultToken {
  token: string
  totalAssets: string
  apy: number
  totalUsers: number
}

export class APIClient {
  // Analytics endpoints
  async getTVL(): Promise<TVLData> {
    const response = await apiClient.get('/api/analytics/tvl')
    return response.data
  }

  async getAPY(token: string): Promise<APYData> {
    const response = await apiClient.get(`/api/analytics/apy/${token}`)
    return response.data
  }

  async getAPYHistory(token: string, days: number = 30): Promise<APYHistoryData[]> {
    const response = await apiClient.get(`/api/analytics/apy-history/${token}?days=${days}`)
    return response.data
  }

  // User endpoints
  async getUserPositions(address: string): Promise<UserPosition[]> {
    const response = await apiClient.get(`/api/user/${address}/positions`)
    return response.data
  }

  async getUserTransactions(address: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const response = await apiClient.get(`/api/user/${address}/transactions?limit=${limit}&offset=${offset}`)
    return response.data
  }

  async getUserStats(address: string): Promise<UserStats> {
    const response = await apiClient.get(`/api/user/${address}/stats`)
    return response.data
  }

  // Vault endpoints
  async getVaultStats(): Promise<VaultStats> {
    const response = await apiClient.get('/api/vault/stats')
    return response.data
  }

  async getVaultTokens(): Promise<VaultToken[]> {
    const response = await apiClient.get('/api/vault/tokens')
    return response.data
  }

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await apiClient.get('/health')
    return response.data
  }

  // Utility methods
  async isBackendAvailable(): Promise<boolean> {
    try {
      await this.getHealth()
      return true
    } catch (error) {
      console.warn('Backend not available:', error)
      return false
    }
  }

  // Batch requests for better performance
  async getUserDashboard(address: string) {
    try {
      const [positions, transactions, stats] = await Promise.all([
        this.getUserPositions(address),
        this.getUserTransactions(address, 10), // Last 10 transactions
        this.getUserStats(address)
      ])

      return {
        positions,
        transactions,
        stats
      }
    } catch (error) {
      console.error('Error fetching user dashboard:', error)
      throw error
    }
  }

  async getVaultDashboard() {
    try {
      const [vaultStats, tvl, tokens] = await Promise.all([
        this.getVaultStats(),
        this.getTVL(),
        this.getVaultTokens()
      ])

      return {
        vaultStats,
        tvl,
        tokens
      }
    } catch (error) {
      console.error('Error fetching vault dashboard:', error)
      throw error
    }
  }
}

// Create singleton instance
export const apiClient = new APIClient()

// Export default instance
export default apiClient
