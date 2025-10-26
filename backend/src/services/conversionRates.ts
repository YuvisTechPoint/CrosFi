import { ethers } from 'ethers';

// Celo Alfajores testnet token addresses
const TOKEN_ADDRESSES = {
  CUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  USDC: '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
  CELO: '0x0000000000000000000000000000000000000000' // Native token
};

// ERC20 ABI for balance checking
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Mock conversion rates (in a real implementation, these would come from Mento oracles)
const MOCK_RATES = {
  'CELO': { USD: 0.25, EUR: 0.23, BRL: 1.25 },
  'cUSD': { USD: 1.0, EUR: 0.92, BRL: 5.0 },
  'USDC': { USD: 1.0, EUR: 0.92, BRL: 5.0 }
};

export interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
  source: string;
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  balanceFormatted: string;
  usdValue: number;
  conversionRate: number;
}

class ConversionRateService {
  private provider: ethers.JsonRpcProvider;
  private rates: Map<string, ConversionRate> = new Map();

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.CELO_RPC_URL);
    this.initializeRates();
  }

  private initializeRates() {
    // Initialize with mock rates
    Object.entries(MOCK_RATES).forEach(([token, rates]) => {
      Object.entries(rates).forEach(([currency, rate]) => {
        const key = `${token}-${currency}`;
        this.rates.set(key, {
          from: token,
          to: currency,
          rate,
          lastUpdated: new Date().toISOString(),
          source: 'mock'
        });
      });
    });
  }

  // Get conversion rate between two tokens/currencies
  public getConversionRate(from: string, to: string): ConversionRate | null {
    const key = `${from}-${to}`;
    return this.rates.get(key) || null;
  }

  // Get all available conversion rates
  public getAllRates(): ConversionRate[] {
    return Array.from(this.rates.values());
  }

  // Get token balances for an address
  public async getTokenBalances(address: string): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = [];

    try {
      // Get CELO balance (native token)
      const celoBalance = await this.provider.getBalance(address);
      const celoRate = this.getConversionRate('CELO', 'USD');
      
      balances.push({
        symbol: 'CELO',
        balance: celoBalance.toString(),
        balanceFormatted: ethers.formatEther(celoBalance),
        usdValue: parseFloat(ethers.formatEther(celoBalance)) * (celoRate?.rate || 0),
        conversionRate: celoRate?.rate || 0
      });

      // Get ERC20 token balances
      for (const [symbol, tokenAddress] of Object.entries(TOKEN_ADDRESSES)) {
        if (symbol === 'CELO') continue; // Skip CELO as it's handled above

        try {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
          const balance = await contract.balanceOf(address);
          const decimals = await contract.decimals();
          const rate = this.getConversionRate(symbol, 'USD');
          
          const formattedBalance = ethers.formatUnits(balance, decimals);
          
          balances.push({
            symbol,
            balance: balance.toString(),
            balanceFormatted: formattedBalance,
            usdValue: parseFloat(formattedBalance) * (rate?.rate || 0),
            conversionRate: rate?.rate || 0
          });
        } catch (error) {
          console.error(`Error getting balance for ${symbol}:`, error);
        }
      }
    } catch (error) {
      console.error('Error getting token balances:', error);
    }

    return balances;
  }

  // Update conversion rates (in a real implementation, this would fetch from Mento oracles)
  public async updateRates(): Promise<void> {
    try {
      console.log('🔄 Updating conversion rates...');
      
      // In a real implementation, you would:
      // 1. Connect to Mento oracle contracts
      // 2. Fetch current exchange rates
      // 3. Update the rates map
      
      // For now, we'll just update the timestamp
      const now = new Date().toISOString();
      this.rates.forEach((rate) => {
        rate.lastUpdated = now;
      });
      
      console.log('✅ Conversion rates updated');
    } catch (error) {
      console.error('Error updating conversion rates:', error);
    }
  }

  // Get total portfolio value in USD
  public async getPortfolioValue(address: string): Promise<number> {
    const balances = await this.getTokenBalances(address);
    return balances.reduce((total, balance) => total + balance.usdValue, 0);
  }

  // Convert amount from one token to another
  public convertAmount(amount: number, from: string, to: string): number | null {
    const rate = this.getConversionRate(from, to);
    if (!rate) return null;
    return amount * rate.rate;
  }

  // Get supported tokens
  public getSupportedTokens(): string[] {
    return Object.keys(TOKEN_ADDRESSES);
  }

  // Get supported currencies
  public getSupportedCurrencies(): string[] {
    const currencies = new Set<string>();
    this.rates.forEach(rate => currencies.add(rate.to));
    return Array.from(currencies);
  }
}

export const conversionRateService = new ConversionRateService();
