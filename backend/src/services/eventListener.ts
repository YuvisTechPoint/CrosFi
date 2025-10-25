import { ethers } from 'ethers';
import { db } from './database';
import cron from 'node-cron';

// Contract ABIs (simplified for demo)
const VAULT_ABI = [
  "event Deposit(address indexed user, address indexed token, uint256 amount, uint256 shares)",
  "event Withdraw(address indexed user, address indexed token, uint256 shares, uint256 amount)"
];

const STRATEGY_ABI = [
  "event YieldGenerated(address indexed token, uint256 yieldAmount)"
];

class EventListener {
  private provider: ethers.JsonRpcProvider;
  private vaultContract: ethers.Contract;
  private strategyContract: ethers.Contract;
  private isListening = false;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.CELO_RPC_URL);
    
    if (process.env.VAULT_ADDRESS && process.env.STRATEGY_ADDRESS) {
      this.vaultContract = new ethers.Contract(
        process.env.VAULT_ADDRESS,
        VAULT_ABI,
        this.provider
      );
      
      this.strategyContract = new ethers.Contract(
        process.env.STRATEGY_ADDRESS,
        STRATEGY_ABI,
        this.provider
      );
    }
  }

  async startListening() {
    if (this.isListening) {
      console.log('Event listener already running');
      return;
    }

    if (!process.env.VAULT_ADDRESS || !process.env.STRATEGY_ADDRESS) {
      console.log('Contract addresses not set, skipping event listener');
      return;
    }

    console.log('🎧 Starting blockchain event listener...');
    this.isListening = true;

    // Listen to vault events
    this.vaultContract.on('Deposit', async (user, token, amount, shares, event) => {
      await this.handleDepositEvent(user, token, amount, shares, event);
    });

    this.vaultContract.on('Withdraw', async (user, token, shares, amount, event) => {
      await this.handleWithdrawEvent(user, token, shares, amount, event);
    });

    // Listen to strategy events
    this.strategyContract.on('YieldGenerated', async (token, yieldAmount, event) => {
      await this.handleYieldEvent(token, yieldAmount, event);
    });

    // Schedule APY calculations every hour
    cron.schedule('0 * * * *', async () => {
      await this.calculateAndStoreAPY();
    });

    console.log('✅ Event listener started successfully');
  }

  private async handleDepositEvent(
    user: string,
    token: string,
    amount: bigint,
    shares: bigint,
    event: any
  ) {
    try {
      console.log(`📥 Deposit event: ${user} deposited ${amount.toString()} of ${token}`);

      // Find or create user
      const dbUser = await db.getOrCreateUser(user);

      // Create transaction record
      await db.createTransaction({
        user_id: dbUser.id,
        type: 'DEPOSIT',
        token,
        amount: amount.toString(),
        shares: shares.toString(),
        tx_hash: event.transactionHash,
        block_number: event.blockNumber,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      });

      // Update or create position
      const currentShares = await this.getCurrentShares(dbUser.id, token);
      await db.upsertPosition({
        user_id: dbUser.id,
        token,
        shares: (currentShares + shares).toString(),
        asset_value: amount.toString(),
        apy: 8.0 // Default APY, will be updated by APY calculator
      });

      // Update vault stats
      await this.updateVaultStats(token, amount, 'deposit');

    } catch (error) {
      console.error('Error handling deposit event:', error);
    }
  }

  private async handleWithdrawEvent(
    user: string,
    token: string,
    shares: bigint,
    amount: bigint,
    event: any
  ) {
    try {
      console.log(`📤 Withdraw event: ${user} withdrew ${amount.toString()} of ${token}`);

      // Find user
      const dbUser = await db.getUserByAddress(user);

      if (!dbUser) {
        console.error('User not found for withdrawal:', user);
        return;
      }

      // Create transaction record
      await db.createTransaction({
        user_id: dbUser.id,
        type: 'WITHDRAW',
        token,
        amount: amount.toString(),
        shares: shares.toString(),
        tx_hash: event.transactionHash,
        block_number: event.blockNumber,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      });

      // Update position
      const currentShares = await this.getCurrentShares(dbUser.id, token);
      const newShares = currentShares - shares;

      if (newShares <= 0) {
        // Remove position if no shares left
        await db.deletePosition(dbUser.id, token);
      } else {
        // Update position
        const currentAssetValue = await this.getCurrentAssetValue(dbUser.id, token);
        await db.upsertPosition({
          user_id: dbUser.id,
          token,
          shares: newShares.toString(),
          asset_value: (BigInt(currentAssetValue) - amount).toString(),
          apy: 8.0 // Default APY
        });
      }

      // Update vault stats
      await this.updateVaultStats(token, amount, 'withdraw');

    } catch (error) {
      console.error('Error handling withdraw event:', error);
    }
  }

  private async handleYieldEvent(token: string, yieldAmount: bigint, event: any) {
    try {
      console.log(`💰 Yield generated: ${yieldAmount.toString()} of ${token}`);

      // Update vault stats with new yield
      await this.updateVaultStats(token, yieldAmount, 'yield');

    } catch (error) {
      console.error('Error handling yield event:', error);
    }
  }

  private async getCurrentShares(userId: string, token: string): Promise<bigint> {
    const positions = await db.getUserPositions(userId);
    const position = positions.find(p => p.token === token);
    return position ? BigInt(position.shares) : BigInt(0);
  }

  private async getCurrentAssetValue(userId: string, token: string): Promise<string> {
    const positions = await db.getUserPositions(userId);
    const position = positions.find(p => p.token === token);
    return position ? position.asset_value : '0';
  }

  private async updateVaultStats(token: string, amount: bigint, operation: 'deposit' | 'withdraw' | 'yield') {
    try {
      const currentStats = await db.getVaultStatsByToken(token);

      if (!currentStats) {
        // Create new vault stats
        await db.upsertVaultStats({
          token,
          total_assets: amount.toString(),
          total_shares: amount.toString(), // Simplified for demo
          total_users: 1,
          apy: 8.0
        });
      } else {
        // Update existing stats
        let newTotalAssets = BigInt(currentStats.total_assets);
        
        if (operation === 'deposit' || operation === 'yield') {
          newTotalAssets += amount;
        } else if (operation === 'withdraw') {
          newTotalAssets -= amount;
        }

        await db.upsertVaultStats({
          token,
          total_assets: newTotalAssets.toString(),
          total_shares: currentStats.total_shares,
          total_users: currentStats.total_users,
          apy: currentStats.apy
        });
      }
    } catch (error) {
      console.error('Error updating vault stats:', error);
    }
  }

  private async calculateAndStoreAPY() {
    try {
      console.log('📊 Calculating and storing APY...');

      const supportedTokens = ['cUSD', 'USDC', 'CELO'];
      
      for (const token of supportedTokens) {
        // In a real implementation, this would:
        // 1. Fetch current Mento exchange rates
        // 2. Calculate actual yield from strategy
        // 3. Store historical APY data
        
        const apy = 8.0; // Placeholder APY
        
        await db.createAPYHistory({
          token,
          apy,
          tvl: '0', // Would be calculated from vault stats
          timestamp: new Date().toISOString()
        });
      }

      console.log('✅ APY calculation completed');
    } catch (error) {
      console.error('Error calculating APY:', error);
    }
  }

  async stopListening() {
    if (!this.isListening) {
      return;
    }

    console.log('🛑 Stopping event listener...');
    
    if (this.vaultContract) {
      this.vaultContract.removeAllListeners();
    }
    
    if (this.strategyContract) {
      this.strategyContract.removeAllListeners();
    }

    this.isListening = false;
    console.log('✅ Event listener stopped');
  }
}

export default EventListener;
