import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface User {
  id: string
  address: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: string // DEPOSIT, WITHDRAW
  token: string
  amount: string
  shares?: string
  tx_hash: string
  block_number?: number
  timestamp: string
  status: string // PENDING, SUCCESS, FAILED
  gas_used?: string
  gas_price?: string
}

export interface Position {
  id: string
  user_id: string
  token: string
  shares: string
  asset_value: string
  apy: number
  created_at: string
  updated_at: string
}

export interface APYHistory {
  id: string
  token: string
  apy: number
  tvl: string
  timestamp: string
}

export interface VaultStats {
  id: string
  token: string
  total_assets: string
  total_shares: string
  total_users: number
  apy: number
  last_updated: string
}

export interface DailyVolume {
  id: string
  date: string
  token: string
  volume: string
  deposits: string
  withdrawals: string
  created_at: string
}

// Database service class
export class DatabaseService {
  // User operations
  async createUser(address: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({ address })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserByAddress(address: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('address', address)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getOrCreateUser(address: string): Promise<User> {
    let user = await this.getUserByAddress(address)
    if (!user) {
      user = await this.createUser(address)
    }
    return user
  }

  // Transaction operations
  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserTransactions(userId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async getTransactionByHash(txHash: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('tx_hash', txHash)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Position operations
  async upsertPosition(position: Omit<Position, 'id' | 'created_at' | 'updated_at'>): Promise<Position> {
    const { data, error } = await supabase
      .from('positions')
      .upsert({
        ...position,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,token'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserPositions(userId: string): Promise<Position[]> {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  }

  async deletePosition(userId: string, token: string): Promise<void> {
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('user_id', userId)
      .eq('token', token)

    if (error) throw error
  }

  // APY History operations
  async createAPYHistory(apyHistory: Omit<APYHistory, 'id'>): Promise<APYHistory> {
    const { data, error } = await supabase
      .from('apy_history')
      .insert(apyHistory)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getAPYHistory(token: string, days: number = 30): Promise<APYHistory[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('apy_history')
      .select('*')
      .eq('token', token)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Vault Stats operations
  async upsertVaultStats(stats: Omit<VaultStats, 'id' | 'last_updated'>): Promise<VaultStats> {
    const { data, error } = await supabase
      .from('vault_stats')
      .upsert({
        ...stats,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'token'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getVaultStats(): Promise<VaultStats[]> {
    const { data, error } = await supabase
      .from('vault_stats')
      .select('*')

    if (error) throw error
    return data || []
  }

  async getVaultStatsByToken(token: string): Promise<VaultStats | null> {
    const { data, error } = await supabase
      .from('vault_stats')
      .select('*')
      .eq('token', token)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Daily Volume operations
  async upsertDailyVolume(volume: Omit<DailyVolume, 'id' | 'created_at'>): Promise<DailyVolume> {
    const { data, error } = await supabase
      .from('daily_volume')
      .upsert(volume, {
        onConflict: 'date,token'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    totalDeposited: string
    totalWithdrawn: string
    totalEarned: string
    currentPositions: number
  }> {
    const [deposits, withdrawals, positions] = await Promise.all([
      supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'DEPOSIT')
        .eq('status', 'SUCCESS'),
      supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'WITHDRAW')
        .eq('status', 'SUCCESS'),
      supabase
        .from('positions')
        .select('id')
        .eq('user_id', userId)
    ])

    if (deposits.error) throw deposits.error
    if (withdrawals.error) throw withdrawals.error
    if (positions.error) throw positions.error

    const totalDeposited = deposits.data?.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) || 0
    const totalWithdrawn = withdrawals.data?.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) || 0
    const totalEarned = totalDeposited - totalWithdrawn
    const currentPositions = positions.data?.length || 0

    return {
      totalDeposited: totalDeposited.toString(),
      totalWithdrawn: totalWithdrawn.toString(),
      totalEarned: totalEarned.toString(),
      currentPositions
    }
  }

  async getTotalUsers(): Promise<number> {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      return !error
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const db = new DatabaseService()
