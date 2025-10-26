// Import ABIs
import LendingPoolABI from '../lib/contracts/abis/LendingPool.json';
import CollateralManagerABI from '../lib/contracts/abis/CollateralManager.json';
import DebtTokenABI from '../lib/contracts/abis/DebtToken.json';
import InterestModelABI from '../lib/contracts/abis/InterestModel.json';
import OracleAdapterABI from '../lib/contracts/abis/OracleAdapter.json';
import { ethers } from 'ethers';

// Contract addresses from environment variables
export const CONTRACTS = {
  lendingPool: {
    address: process.env.NEXT_PUBLIC_LENDING_POOL!,
    abi: LendingPoolABI,
  },
  collateralManager: {
    address: process.env.NEXT_PUBLIC_COLLATERAL_MANAGER!,
    abi: CollateralManagerABI,
  },
  interestModel: {
    address: process.env.NEXT_PUBLIC_INTEREST_MODEL!,
    abi: InterestModelABI,
  },
  oracleAdapter: {
    address: process.env.NEXT_PUBLIC_ORACLE_ADAPTER!,
    abi: OracleAdapterABI,
  },
  debtTokens: {
    cUSD: {
      address: process.env.NEXT_PUBLIC_DEBT_TOKEN_CUSD!,
      abi: DebtTokenABI,
    },
    USDC: {
      address: process.env.NEXT_PUBLIC_DEBT_TOKEN_USDC!,
      abi: DebtTokenABI,
    },
    CELO: {
      address: process.env.NEXT_PUBLIC_DEBT_TOKEN_CELO!,
      abi: DebtTokenABI,
    },
  },
} as const;

// Token configurations
export const TOKENS = {
  cUSD: {
    address: process.env.NEXT_PUBLIC_TOKEN_CUSD!,
    symbol: 'cUSD',
    decimals: 18,
    name: 'Celo Dollar',
  },
  USDC: {
    address: process.env.NEXT_PUBLIC_TOKEN_USDC!,
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
  },
  CELO: {
    address: '0x0000000000000000000000000000000000000000', // Native token
    symbol: 'CELO',
    decimals: 18,
    name: 'Celo',
  },
} as const;

// Network configuration
export const NETWORKS = {
  alfajores: {
    chainId: 44787,
    name: 'Celo Alfajores',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    blockExplorer: 'https://alfajores.celoscan.io',
  },
  hardhat: {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '#',
  },
} as const;

// Admin addresses
export const ADMIN_ADDRESSES = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES?.split(',') || [];

// Helper functions
export function getTokenByAddress(address: string) {
  return Object.values(TOKENS).find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
}

export function getDebtTokenByAddress(address: string) {
  return Object.values(CONTRACTS.debtTokens).find(debtToken => 
    debtToken.address.toLowerCase() === address.toLowerCase()
  );
}

export function isAdminAddress(address: string): boolean {
  return ADMIN_ADDRESSES.some(admin => 
    admin.toLowerCase() === address.toLowerCase()
  );
}

export function getContractAddress(contractName: keyof typeof CONTRACTS): string {
  return CONTRACTS[contractName].address;
}

export function getContractABI(contractName: keyof typeof CONTRACTS): any {
  return CONTRACTS[contractName].abi;
}

// Contract event filters
export const EVENT_FILTERS = {
  deposit: {
    address: CONTRACTS.lendingPool.address,
    topics: [ethers.id('Deposit(address,address,uint256)')],
  },
  withdraw: {
    address: CONTRACTS.lendingPool.address,
    topics: [ethers.id('Withdraw(address,address,uint256)')],
  },
  borrow: {
    address: CONTRACTS.lendingPool.address,
    topics: [ethers.id('Borrow(address,address,address,uint256,uint256)')],
  },
  repay: {
    address: CONTRACTS.lendingPool.address,
    topics: [ethers.id('Repay(address,address,uint256)')],
  },
  rateUpdated: {
    address: CONTRACTS.lendingPool.address,
    topics: [ethers.id('RateUpdated(address,uint256,uint256)')],
  },
  liquidationExecuted: {
    address: CONTRACTS.lendingPool.address,
    topics: [ethers.id('LiquidationExecuted(address,address,address,uint256)')],
  },
} as const;
