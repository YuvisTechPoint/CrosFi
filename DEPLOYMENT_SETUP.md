# CeloYield Smart Contract Deployment Setup

## 🚀 Quick Deployment Guide

### 1. **Set Up Environment Variables**

Create a `.env` file in the root directory with your private key:

```bash
# Create .env file
touch .env
```

Add the following to your `.env` file:

```env
# Celo Alfajores Testnet Deployment
PRIVATE_KEY=your_private_key_here
CELOSCAN_API_KEY=your_celoscan_api_key_here

# Optional: For contract verification
ETHERSCAN_API_KEY=your_celoscan_api_key_here
```

### 2. **Get Testnet CELO**

You need CELO tokens to deploy contracts. Get them from the Celo faucet:

1. Go to [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)
2. Connect your wallet (MetaMask)
3. Request testnet CELO tokens
4. You'll need at least 0.1 CELO for deployment

### 3. **Deploy Contracts**

Run the deployment script:

```bash
# Deploy to Celo Alfajores testnet
npx hardhat run scripts/deploy-real.js --network alfajores
```

### 4. **Verify Contracts (Optional)**

After deployment, verify contracts on Celoscan:

```bash
# Verify MultiTokenVault
npx hardhat verify --network alfajores <VAULT_ADDRESS> "CeloYield Multi-Token Vault" "CYV" <STRATEGY_ADDRESS>

# Verify MentoYieldStrategy
npx hardhat verify --network alfajores <STRATEGY_ADDRESS>
```

## 🔧 Environment Setup Details

### **Private Key Setup**

1. **Export from MetaMask:**
   - Open MetaMask
   - Click on account details
   - Click "Export Private Key"
   - Copy the private key (without 0x prefix)

2. **Add to .env file:**
   ```env
   PRIVATE_KEY=your_private_key_without_0x_prefix
   ```

### **Network Configuration**

The Hardhat config is already set up for:
- **Alfajores Testnet**: `https://alfajores-forno.celo-testnet.org`
- **Chain ID**: 44787
- **Currency**: CELO

### **Token Addresses (Alfajores)**

The contracts are configured with these testnet addresses:
- **cUSD**: `0x874069Fa1Ee493706DbeE6Cf34ff9829832e6A00`
- **USDC**: `0x62b8B11039Ff5064145D0D87D32c658Da4CC2Dc1`
- **CELO**: `0x0000000000000000000000000000000000000000` (native)

## 📋 Deployment Checklist

- [ ] Private key added to `.env` file
- [ ] Testnet CELO obtained from faucet
- [ ] Contracts compiled successfully
- [ ] Deployment script ready
- [ ] Backend environment configured
- [ ] Frontend environment configured

## 🎯 What Gets Deployed

1. **MentoYieldStrategy** - Yield generation strategy
2. **MultiTokenVault** - Multi-token vault contract
3. **Contract addresses** saved to `lib/contracts/addresses.json`

## 🔗 Post-Deployment

After successful deployment:

1. **Update Backend Environment:**
   ```env
   VAULT_ADDRESS=deployed_vault_address
   STRATEGY_ADDRESS=deployed_strategy_address
   ```

2. **Update Frontend Environment:**
   ```env
   NEXT_PUBLIC_VAULT_ADDRESS=deployed_vault_address
   NEXT_PUBLIC_STRATEGY_ADDRESS=deployed_strategy_address
   ```

3. **Test the Integration:**
   - Connect wallet to Alfajores
   - Try depositing testnet tokens
   - Verify transactions on Celoscan

## 🚨 Security Notes

- **Never commit private keys** to version control
- **Use testnet only** for development
- **Keep private keys secure** and never share them
- **Use environment variables** for all sensitive data

## 📞 Support

If you encounter issues:

1. **Check network connection** to Alfajores
2. **Verify sufficient CELO balance** for gas
3. **Ensure private key is correct** format
4. **Check contract compilation** before deployment

---

**Ready to deploy?** Run: `npx hardhat run scripts/deploy-real.js --network alfajores`
