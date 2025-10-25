import { ethers } from 'ethers'
import addresses from './contracts/addresses.json'

// Contract ABIs
import MultiTokenVaultABI from './contracts/abis/MultiTokenVault.json'
import MentoYieldStrategyABI from './contracts/abis/MentoYieldStrategy.json'

// ERC20 ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
]

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  isNative: boolean
}

export interface VaultStats {
  totalAssets: string
  totalShares: string
  apy: number
}

export interface UserStats {
  userShares: string
  userAssetBalance: string
  assetBalance: string
}

export class ContractService {
  private provider: ethers.BrowserProvider
  private signer: ethers.JsonRpcSigner

  constructor(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider
    this.signer = signer
  }

  // Get contract instances
  get vaultContract() {
    return new ethers.Contract(addresses.vault, MultiTokenVaultABI, this.signer)
  }

  get strategyContract() {
    return new ethers.Contract(addresses.strategy, MentoYieldStrategyABI, this.signer)
  }

  // Get token contract instance
  getTokenContract(tokenAddress: string) {
    return new ethers.Contract(tokenAddress, ERC20_ABI, this.signer)
  }

  // Get supported tokens
  getSupportedTokens(): TokenInfo[] {
    return [
      {
        address: addresses.tokens.cUSD,
        symbol: 'cUSD',
        name: 'Celo Dollar',
        decimals: 18,
        isNative: false
      },
      {
        address: addresses.tokens.USDC,
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        isNative: false
      },
      {
        address: addresses.tokens.CELO,
        symbol: 'CELO',
        name: 'Celo',
        decimals: 18,
        isNative: true
      }
    ]
  }

  // Vault functions
  async deposit(tokenAddress: string, amount: string) {
    const tokenInfo = this.getSupportedTokens().find(t => t.address === tokenAddress)
    if (!tokenInfo) throw new Error('Unsupported token')

    const amountWei = tokenInfo.isNative 
      ? ethers.parseEther(amount)
      : ethers.parseUnits(amount, tokenInfo.decimals)

    if (tokenInfo.isNative) {
      // Native CELO deposit
      const tx = await this.vaultContract.deposit(tokenAddress, amountWei, { value: amountWei })
      return await tx.wait()
    } else {
      // ERC20 token deposit
      const tx = await this.vaultContract.deposit(tokenAddress, amountWei)
      return await tx.wait()
    }
  }

  async withdraw(tokenAddress: string, shares: string) {
    const sharesWei = ethers.parseEther(shares)
    const tx = await this.vaultContract.withdraw(tokenAddress, sharesWei)
    return await tx.wait()
  }

  async approveToken(tokenAddress: string, amount: string) {
    const tokenInfo = this.getSupportedTokens().find(t => t.address === tokenAddress)
    if (!tokenInfo) throw new Error('Unsupported token')
    if (tokenInfo.isNative) throw new Error('Cannot approve native token')

    const amountWei = ethers.parseUnits(amount, tokenInfo.decimals)
    const tokenContract = this.getTokenContract(tokenAddress)
    const tx = await tokenContract.approve(addresses.vault, amountWei)
    return await tx.wait()
  }

  // Read functions
  async getVaultStats(tokenAddress: string): Promise<VaultStats> {
    const [totalAssets, totalShares, apy] = await Promise.all([
      this.vaultContract.totalAssets(tokenAddress),
      this.vaultContract.totalShares(tokenAddress),
      this.vaultContract.getAPY(tokenAddress)
    ])

    const tokenInfo = this.getSupportedTokens().find(t => t.address === tokenAddress)
    const decimals = tokenInfo?.decimals || 18

    return {
      totalAssets: ethers.formatUnits(totalAssets, decimals),
      totalShares: ethers.formatEther(totalShares),
      apy: Number(apy) / 100 // Convert basis points to percentage
    }
  }

  async getAllVaultStats(): Promise<Record<string, VaultStats>> {
    const tokens = this.getSupportedTokens()
    const stats: Record<string, VaultStats> = {}

    for (const token of tokens) {
      try {
        stats[token.symbol] = await this.getVaultStats(token.address)
      } catch (error) {
        console.error(`Error fetching stats for ${token.symbol}:`, error)
        stats[token.symbol] = {
          totalAssets: '0',
          totalShares: '0',
          apy: 0
        }
      }
    }

    return stats
  }

  async getUserStats(userAddress: string, tokenAddress: string): Promise<UserStats> {
    const [userShares, userAssetBalance, assetBalance] = await Promise.all([
      this.vaultContract.userTokenSharesBalance(userAddress, tokenAddress),
      this.vaultContract.userAssetBalance(userAddress, tokenAddress),
      this.getTokenBalance(userAddress, tokenAddress)
    ])

    return {
      userShares: ethers.formatEther(userShares),
      userAssetBalance: ethers.formatUnits(userAssetBalance, this.getTokenDecimals(tokenAddress)),
      assetBalance: assetBalance
    }
  }

  async getAllUserStats(userAddress: string): Promise<Record<string, UserStats>> {
    const tokens = this.getSupportedTokens()
    const stats: Record<string, UserStats> = {}

    for (const token of tokens) {
      try {
        stats[token.symbol] = await this.getUserStats(userAddress, token.address)
      } catch (error) {
        console.error(`Error fetching user stats for ${token.symbol}:`, error)
        stats[token.symbol] = {
          userShares: '0',
          userAssetBalance: '0',
          assetBalance: '0'
        }
      }
    }

    return stats
  }

  // Token balance functions
  async getTokenBalance(userAddress: string, tokenAddress: string): Promise<string> {
    const tokenInfo = this.getSupportedTokens().find(t => t.address === tokenAddress)
    if (!tokenInfo) throw new Error('Unsupported token')

    if (tokenInfo.isNative) {
      // Get native CELO balance
      const balance = await this.provider.getBalance(userAddress)
      return ethers.formatEther(balance)
    } else {
      // Get ERC20 token balance
      const tokenContract = this.getTokenContract(tokenAddress)
      const balance = await tokenContract.balanceOf(userAddress)
      return ethers.formatUnits(balance, tokenInfo.decimals)
    }
  }

  async getTokenAllowance(userAddress: string, tokenAddress: string): Promise<string> {
    const tokenInfo = this.getSupportedTokens().find(t => t.address === tokenAddress)
    if (!tokenInfo) throw new Error('Unsupported token')
    if (tokenInfo.isNative) return '0' // Native tokens don't need approval

    const tokenContract = this.getTokenContract(tokenAddress)
    const allowance = await tokenContract.allowance(userAddress, addresses.vault)
    return ethers.formatUnits(allowance, tokenInfo.decimals)
  }

  // Utility functions
  private getTokenDecimals(tokenAddress: string): number {
    const tokenInfo = this.getSupportedTokens().find(t => t.address === tokenAddress)
    return tokenInfo?.decimals || 18
  }

  // Strategy functions
  async getStrategyStats(tokenAddress: string) {
    const [deposits, withdrawals, yield, tvl] = await this.strategyContract.getStrategyStats(tokenAddress)
    
    const tokenInfo = this.getSupportedTokens().find(t => t.address === tokenAddress)
    const decimals = tokenInfo?.decimals || 18

    return {
      deposits: ethers.formatUnits(deposits, decimals),
      withdrawals: ethers.formatUnits(withdrawals, decimals),
      yield: ethers.formatUnits(yield, decimals),
      tvl: ethers.formatUnits(tvl, decimals)
    }
  }

  async getStrategyAPY(tokenAddress: string): Promise<number> {
    const apy = await this.strategyContract.getAPY(tokenAddress)
    return Number(apy) / 100 // Convert basis points to percentage
  }
}

// Helper function to create contract service
export function createContractService(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
  return new ContractService(provider, signer)
}

