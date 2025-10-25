# 🗄️ Complete Supabase Setup Guide for CeloYield

This guide will walk you through setting up the entire CeloYield platform with Supabase as the backend database.

## 📋 Prerequisites

- GitHub account
- MetaMask wallet
- Celo Alfajores testnet tokens (get from [Celo Faucet](https://faucet.celo.org/alfajores))

## 🚀 Step 1: Create Supabase Project

### 1.1 Sign Up for Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with your GitHub account
4. Create a new organization (or use existing)

### 1.2 Create New Project
1. Click "New Project"
2. **Organization**: Select your organization
3. **Name**: `celoyield-backend`
4. **Database Password**: Generate a strong password (save it securely!)
5. **Region**: Choose closest to your users (e.g., `us-east-1` for US)
6. **Pricing Plan**: Free tier is sufficient for development
7. Click "Create new project"

### 1.3 Wait for Setup
- Project setup takes 2-3 minutes
- You'll see a progress indicator
- Don't close the browser tab during setup

## 🗃️ Step 2: Setup Database Schema

### 2.1 Access SQL Editor
1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"

### 2.2 Create Database Schema
1. Copy the entire contents of `backend/supabase-schema.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the schema

**Expected Output:**
```
Success. No rows returned
```

### 2.3 Verify Tables Created
1. Go to "Table Editor" in the left sidebar
2. You should see these tables:
   - `users`
   - `transactions`
   - `positions`
   - `apy_history`
   - `vault_stats`
   - `daily_volume`

## 🔑 Step 3: Get API Keys

### 3.1 Access API Settings
1. Go to "Settings" → "API" in the left sidebar
2. You'll see your project details

### 3.2 Copy Required Keys
Copy these values (you'll need them later):

```env
# Project URL
SUPABASE_URL=https://your-project-id.supabase.co

# Anon/Public Key (for client-side operations)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (for backend operations - keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Step 4: Deploy Backend to Railway

### 4.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign up with GitHub
3. Authorize Railway to access your repositories

### 4.2 Deploy Backend
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your CeloYield repository
4. Select the `backend` folder as the root directory

### 4.3 Configure Environment Variables
In Railway dashboard, go to your service → Variables tab and add:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
VAULT_ADDRESS=0x0000000000000000000000000000000000000000
STRATEGY_ADDRESS=0x0000000000000000000000000000000000000000
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 4.4 Deploy
1. Click "Deploy" 
2. Wait for deployment to complete (2-3 minutes)
3. Note your backend URL (e.g., `https://celoyield-backend.railway.app`)

## 🌐 Step 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your CeloYield repository

### 5.2 Configure Project
1. **Framework Preset**: Next.js
2. **Root Directory**: `./` (root of repository)
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`

### 5.3 Add Environment Variables
In Vercel dashboard → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_BACKEND_API_URL=https://celoyield-backend.railway.app
NEXT_PUBLIC_VAULT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_STRATEGY_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_NETWORK=alfajores
NEXT_PUBLIC_WS_URL=wss://celoyield-backend.railway.app/ws
```

### 5.4 Deploy
1. Click "Deploy"
2. Wait for deployment (3-5 minutes)
3. Note your frontend URL (e.g., `https://celoyield.vercel.app`)

## 📜 Step 6: Deploy Smart Contracts

### 6.1 Prepare Environment
1. In your local project, create `.env` file:
```env
PRIVATE_KEY=your_private_key_here
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
```

### 6.2 Deploy Contracts
```bash
# Compile contracts
npx hardhat compile

# Deploy to Alfajores testnet
npx hardhat run scripts/deploy-real.js --network alfajores

# Extract ABIs
node scripts/saveAbis.js
```

### 6.3 Update Contract Addresses
After deployment, update these files with the deployed addresses:

**`lib/contracts/addresses.json`:**
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

### 6.4 Update Environment Variables
Update your Railway backend environment variables:
```env
VAULT_ADDRESS=0x... # Your deployed vault address
STRATEGY_ADDRESS=0x... # Your deployed strategy address
```

Update your Vercel frontend environment variables:
```env
NEXT_PUBLIC_VAULT_ADDRESS=0x... # Your deployed vault address
NEXT_PUBLIC_STRATEGY_ADDRESS=0x... # Your deployed strategy address
```

## 🧪 Step 7: Test the Complete Setup

### 7.1 Test Backend API
```bash
# Test health endpoint
curl https://celoyield-backend.railway.app/health

# Test vault stats
curl https://celoyield-backend.railway.app/api/vault/stats

# Test WebSocket
wscat -c wss://celoyield-backend.railway.app/ws
```

### 7.2 Test Frontend
1. Open your Vercel frontend URL
2. Connect MetaMask to Celo Alfajores testnet
3. Get testnet tokens from [Celo Faucet](https://faucet.celo.org/alfajores)
4. Test deposit/withdraw functionality

### 7.3 Test Database
1. Go to Supabase dashboard → Table Editor
2. Check that data is being inserted when you make transactions
3. Verify real-time updates in the database

## 🔧 Step 8: Configure Real-Time Features

### 8.1 Enable Real-Time in Supabase
1. Go to Supabase dashboard → Database → Replication
2. Enable replication for these tables:
   - `transactions`
   - `positions`
   - `vault_stats`
   - `apy_history`

### 8.2 Test Real-Time Updates
1. Make a transaction in the frontend
2. Check Supabase dashboard → Table Editor
3. Verify data appears in real-time

## 📊 Step 9: Monitor and Maintain

### 9.1 Supabase Monitoring
1. **Dashboard**: Monitor database usage and performance
2. **Logs**: Check API logs for errors
3. **Metrics**: Monitor query performance and storage usage

### 9.2 Railway Monitoring
1. **Deployments**: Monitor backend deployments
2. **Logs**: Check application logs
3. **Metrics**: Monitor CPU, memory, and network usage

### 9.3 Vercel Monitoring
1. **Analytics**: Monitor frontend performance
2. **Functions**: Check serverless function logs
3. **Deployments**: Monitor frontend deployments

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check Supabase URL and keys
curl -H "apikey: YOUR_ANON_KEY" https://your-project.supabase.co/rest/v1/
```

**2. Backend Deployment Issues**
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure Supabase keys are correct

**3. Frontend Build Errors**
- Check Vercel build logs
- Verify environment variables
- Ensure contract addresses are correct

**4. Smart Contract Issues**
- Verify you have CELO for gas fees
- Check contract addresses in addresses.json
- Ensure contracts are verified on Celoscan

### Getting Help

1. **Supabase**: Check [Supabase Docs](https://supabase.com/docs)
2. **Railway**: Check [Railway Docs](https://docs.railway.app)
3. **Vercel**: Check [Vercel Docs](https://vercel.com/docs)
4. **Celo**: Check [Celo Docs](https://docs.celo.org)

## ✅ Verification Checklist

- [ ] Supabase project created and database schema deployed
- [ ] Backend deployed to Railway with correct environment variables
- [ ] Frontend deployed to Vercel with correct environment variables
- [ ] Smart contracts deployed to Alfajores testnet
- [ ] Contract addresses updated in all configuration files
- [ ] Backend API endpoints responding correctly
- [ ] Frontend connecting to backend successfully
- [ ] Database receiving transaction data
- [ ] Real-time updates working
- [ ] Complete deposit/withdraw flow tested

## 🎉 Success!

Once all steps are completed, you'll have:

- ✅ **Managed Database**: Supabase PostgreSQL with real-time capabilities
- ✅ **Scalable Backend**: Railway-hosted API with automatic scaling
- ✅ **Global Frontend**: Vercel-hosted Next.js app with CDN
- ✅ **Real Smart Contracts**: Deployed on Celo Alfajores testnet
- ✅ **Real-Time Updates**: WebSocket connections for live data
- ✅ **Production Ready**: Complete DeFi platform ready for users

**🌱 Your CeloYield platform is now live and ready for users! 🚀**

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the logs in each platform's dashboard
3. Verify all environment variables are correct
4. Ensure you have sufficient testnet tokens for gas fees

The platform is now a complete, production-ready DeFi application with real blockchain integration, managed database, and scalable infrastructure!
