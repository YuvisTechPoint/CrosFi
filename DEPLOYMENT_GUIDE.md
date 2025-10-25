# 🚀 CeloYield Deployment Guide

Complete guide to deploy the real Celo DeFi platform to production.

## 📋 Prerequisites

### Required Accounts & Services
- **Celo Alfajores Testnet** - For smart contract deployment
- **Railway/Render** - For backend API and database hosting
- **Vercel/Netlify** - For frontend hosting
- **MetaMask** - For wallet connection
- **GitHub** - For code repository

### Required Tokens
- **CELO** - For gas fees (get from [Celo Faucet](https://faucet.celo.org/alfajores))
- **cUSD** - For testing deposits (get from [Celo Faucet](https://faucet.celo.org/alfajores))
- **USDC** - For testing deposits (get from [Celo Faucet](https://faucet.celo.org/alfajores))

## 🏗️ Phase 1: Smart Contract Deployment

### 1.1 Prepare Environment

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Update `.env` with your private key:
```env
PRIVATE_KEY=your_private_key_here
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
```

### 1.2 Deploy Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Alfajores testnet
npx hardhat run scripts/deploy-real.js --network alfajores

# Extract ABIs
node scripts/saveAbis.js
```

### 1.3 Verify Contracts (Optional)

```bash
# Verify on Celoscan
npx hardhat verify --network alfajores <VAULT_ADDRESS> "CeloYield Multi-Token Vault" "CYV"
npx hardhat verify --network alfajores <STRATEGY_ADDRESS> "0x0000000000000000000000000000000000000000" "0x0000000000000000000000000000000000000000"
```

### 1.4 Update Contract Addresses

After deployment, update `lib/contracts/addresses.json`:
```json
{
  "network": "alfajores",
  "vault": "0x...", // Your deployed vault address
  "strategy": "0x...", // Your deployed strategy address
  "tokens": {
    "cUSD": "0x874069Fa1Ee493706DbeE6Cf34ff9829832e6A00",
    "USDC": "0x62b8B11039Ff5064145D0D87D32c658Da4CC2Dc1",
    "CELO": "0x0000000000000000000000000000000000000000"
  }
}
```

## 🗄️ Phase 2: Backend Deployment

### 2.1 Supabase Setup (Recommended)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose organization and project name
   - Select region closest to your users
   - Set database password (save it securely)

3. **Setup Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `backend/supabase-schema.sql`
   - Click "Run" to create all tables and indexes

4. **Get API Keys**
   - Go to Settings → API
   - Copy your Project URL and anon/public key
   - Note: You'll need the service_role key for backend operations

### 2.2 Backend Deployment (Railway/Render)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New" → "GitHub Repo"
   - Select your repo
   - Set root directory to `backend`
   - Add environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
VAULT_ADDRESS=0x... # Your deployed vault address
STRATEGY_ADDRESS=0x... # Your deployed strategy address
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### 2.3 Alternative: Render Deployment

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Set root directory to `backend`
   - Add environment variables (same as Railway with Supabase)

## 🌐 Phase 3: Frontend Deployment

### 3.1 Vercel Deployment (Recommended)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Set framework to "Next.js"

3. **Configure Environment Variables**
```env
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_VAULT_ADDRESS=0x... # Your deployed vault address
NEXT_PUBLIC_STRATEGY_ADDRESS=0x... # Your deployed strategy address
NEXT_PUBLIC_NETWORK=alfajores
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com/ws
```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### 3.2 Alternative: Netlify Deployment

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy Site**
   - Click "New site from Git"
   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`

3. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add the same variables as Vercel

## 🧪 Phase 4: Testing & Verification

### 4.1 Test Smart Contracts

```bash
# Run integration tests
npx hardhat test test/Integration.test.js --network alfajores
```

### 4.2 Test Backend API

```bash
# Test health endpoint
curl https://your-backend-domain.com/health

# Test vault stats
curl https://your-backend-domain.com/api/vault/stats

# Test WebSocket
wscat -c wss://your-backend-domain.com/ws
```

### 4.3 Test Frontend

1. **Connect Wallet**
   - Open your deployed frontend
   - Connect MetaMask to Celo Alfajores testnet
   - Ensure you have testnet tokens

2. **Test Deposit Flow**
   - Select a token (cUSD, USDC, or CELO)
   - Approve the vault to spend tokens
   - Deposit tokens into the vault
   - Verify transaction on [Celoscan](https://alfajores.celoscan.io)

3. **Test Withdrawal Flow**
   - Withdraw tokens from the vault
   - Verify you receive tokens + yield
   - Check transaction history

### 4.4 Test Real-Time Features

1. **WebSocket Connection**
   - Open browser dev tools
   - Check WebSocket connection in Network tab
   - Verify real-time updates

2. **Transaction History**
   - Make a deposit/withdrawal
   - Check if it appears in transaction history
   - Verify backend indexing

## 📊 Phase 5: Monitoring & Maintenance

### 5.1 Set Up Monitoring

**Railway/Render:**
- Monitor CPU, memory, and disk usage
- Set up alerts for high resource usage
- Monitor database connections

**Vercel/Netlify:**
- Monitor build status and deployments
- Set up uptime monitoring
- Monitor API response times

### 5.2 Database Maintenance

```bash
# Connect to production database
npx prisma studio

# Run database migrations
npx prisma migrate deploy

# Backup database
pg_dump $DATABASE_URL > backup.sql
```

### 5.3 Smart Contract Monitoring

- Monitor contract events on Celoscan
- Set up alerts for large transactions
- Monitor gas usage and costs

## 🔧 Troubleshooting

### Common Issues

**1. Contract Deployment Fails**
```bash
# Check gas price
npx hardhat run scripts/deploy-real.js --network alfajores --verbose

# Increase gas limit in hardhat.config.js
gas: 8000000
```

**2. Backend Connection Issues**
```bash
# Check environment variables
echo $DATABASE_URL

# Test database connection
npx prisma db push
```

**3. Frontend Build Fails**
```bash
# Check for TypeScript errors
npm run build

# Check environment variables
echo $NEXT_PUBLIC_VAULT_ADDRESS
```

**4. WebSocket Connection Issues**
```bash
# Check WebSocket server status
curl https://your-backend-domain.com/ws/status

# Check CORS configuration
# Ensure WebSocket URL is correct in frontend
```

### Performance Optimization

**Backend:**
- Enable database connection pooling
- Add Redis for caching
- Implement rate limiting

**Frontend:**
- Enable Next.js image optimization
- Add service worker for caching
- Implement lazy loading

**Smart Contracts:**
- Optimize gas usage
- Implement batch operations
- Add emergency pause functionality

## 🚀 Going to Mainnet

When ready for mainnet deployment:

1. **Update Token Addresses**
   - Use real Celo mainnet token addresses
   - Update Mento protocol addresses

2. **Security Audit**
   - Get smart contracts audited
   - Test with small amounts first

3. **Update Environment Variables**
   - Change network to `celo`
   - Update RPC URLs to mainnet

4. **Deploy to Mainnet**
   ```bash
   npx hardhat run scripts/deploy-real.js --network celo
   ```

## 📞 Support

- **Documentation**: Check README files
- **Issues**: Create GitHub issues
- **Community**: Join Celo Discord
- **Email**: Contact development team

---

## ✅ Deployment Checklist

- [ ] Smart contracts deployed to Alfajores
- [ ] Contract addresses updated in frontend
- [ ] Backend deployed with database
- [ ] Frontend deployed and accessible
- [ ] WebSocket connection working
- [ ] Test deposits/withdrawals successful
- [ ] Transaction history working
- [ ] Real-time updates functioning
- [ ] Monitoring set up
- [ ] Documentation updated

**🎉 Congratulations! Your real Celo DeFi platform is now live!**
