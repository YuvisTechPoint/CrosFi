# 🚀 Celo Alfajores Testnet Setup Guide

## Prerequisites

1. **Get Testnet Tokens**: Visit [Celo Faucet](https://celo.org/developers/faucet) to get testnet CELO and cUSD
2. **Create Wallet**: Use MetaMask or any Web3 wallet
3. **Add Alfajores Network**: Add Celo Alfajores testnet to your wallet

## Step 1: Create Environment File

Create a `.env` file in the root directory with the following content:

```env
# Your private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
CELO_RPC_URL=https://forno.celo.org

# Backend configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Admin addresses (comma-separated)
NEXT_PUBLIC_ADMIN_ADDRESSES=your_admin_address_here

# Network configuration
NEXT_PUBLIC_RPC=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CHAIN_ID=44787
```

## Step 2: Get Testnet Tokens

1. Go to [Celo Faucet](https://celo.org/developers/faucet)
2. Enter your wallet address
3. Request testnet CELO and cUSD
4. Wait for tokens to arrive (usually within minutes)

## Step 3: Deploy Contracts

```bash
npx hardhat run scripts/deploy-alfajores.js --network alfajores
```

## Step 4: Update Frontend

The deployment script will automatically update `lib/contracts/addresses.json` with the deployed contract addresses.

## Step 5: Start the Application

```bash
# Start backend
cd backend && npm run dev

# Start frontend (in another terminal)
npm run dev
```

## Step 6: Connect Wallet

1. Open your frontend at http://localhost:3000
2. Connect MetaMask
3. Switch to Celo Alfajores testnet
4. Start using the application with real testnet tokens!

## Network Details

- **Network Name**: Celo Alfajores Testnet
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Chain ID**: 44787
- **Currency Symbol**: CELO
- **Block Explorer**: https://alfajores.celoscan.io

## Token Addresses

- **cUSD**: 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
- **USDC**: 0x41f4C5E67e9Ecf8C2c53d9B25C4c5B4f8C26b6e8
- **CELO**: Native token (0x0000000000000000000000000000000000000000)

## Troubleshooting

1. **Low Balance**: Make sure you have enough CELO for gas fees
2. **Network Issues**: Verify you're connected to Alfajores testnet
3. **Contract Errors**: Check that all contracts deployed successfully
4. **Frontend Issues**: Clear browser cache and refresh

## Next Steps

After successful deployment:
1. Test all functionality with testnet tokens
2. Verify contracts on CeloScan
3. Share your deployed application with others
4. Consider upgrading to Celo mainnet for production use
