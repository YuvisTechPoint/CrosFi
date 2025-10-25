# ⚡ Quick Setup Checklist - CeloYield on Supabase

## 🎯 **5-Minute Quick Start**

### **Step 1: Supabase (2 minutes)**
- [ ] Create account at [supabase.com](https://supabase.com)
- [ ] Create new project: `celoyield-backend`
- [ ] Copy SQL from `backend/supabase-schema.sql` → Run in SQL Editor
- [ ] Copy API keys from Settings → API

### **Step 2: Railway Backend (2 minutes)**
- [ ] Sign up at [railway.app](https://railway.app)
- [ ] Deploy from GitHub → Select `backend` folder
- [ ] Add environment variables:
  ```env
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your-anon-key
  CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
  VAULT_ADDRESS=0x0000000000000000000000000000000000000000
  STRATEGY_ADDRESS=0x0000000000000000000000000000000000000000
  PORT=3001
  NODE_ENV=production
  ```

### **Step 3: Vercel Frontend (1 minute)**
- [ ] Sign up at [vercel.com](https://vercel.com)
- [ ] Import GitHub repo → Deploy
- [ ] Add environment variables:
  ```env
  NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.railway.app
  NEXT_PUBLIC_VAULT_ADDRESS=0x0000000000000000000000000000000000000000
  NEXT_PUBLIC_STRATEGY_ADDRESS=0x0000000000000000000000000000000000000000
  NEXT_PUBLIC_NETWORK=alfajores
  ```

## 🔑 **Required Keys & URLs**

### **Supabase**
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Railway Backend**
```env
BACKEND_URL=https://celoyield-backend.railway.app
```

### **Vercel Frontend**
```env
FRONTEND_URL=https://celoyield.vercel.app
```

## 🧪 **Quick Test**

### **1. Test Backend**
```bash
curl https://your-backend.railway.app/health
# Expected: {"status":"ok","timestamp":"...","version":"1.0.0"}
```

### **2. Test Database**
- Go to Supabase → Table Editor
- Should see: `users`, `transactions`, `positions`, `vault_stats`, `apy_history`, `daily_volume`

### **3. Test Frontend**
- Open your Vercel URL
- Connect MetaMask to Celo Alfajores
- Get testnet tokens from [Celo Faucet](https://faucet.celo.org/alfajores)

## 🚨 **Common Issues**

| Issue | Solution |
|-------|----------|
| Database connection error | Check Supabase URL and keys |
| Backend deployment fails | Verify all environment variables |
| Frontend build error | Check contract addresses |
| No data in database | Ensure event listener is running |

## 📋 **Deployment Order**

1. **Supabase** → Database setup
2. **Railway** → Backend deployment  
3. **Vercel** → Frontend deployment
4. **Local** → Smart contract deployment
5. **Update** → Contract addresses in all platforms

## ✅ **Success Indicators**

- [ ] Backend health check returns 200
- [ ] Database tables created successfully
- [ ] Frontend loads without errors
- [ ] MetaMask connects to Celo Alfajores
- [ ] Test transactions appear in database

## 🎉 **You're Live!**

Once all checkboxes are marked, your CeloYield platform is:
- ✅ **Database**: Managed PostgreSQL with real-time
- ✅ **Backend**: Scalable API with auto-scaling
- ✅ **Frontend**: Global CDN with instant updates
- ✅ **Blockchain**: Real smart contracts on Celo
- ✅ **Production**: Ready for real users

**🌱 CeloYield is now a complete DeFi platform! 🚀**
