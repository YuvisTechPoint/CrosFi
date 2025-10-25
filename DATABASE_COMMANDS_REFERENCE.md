# CeloYield Database Commands Reference

## 🚀 Quick Start

### 1. Initial Setup
```bash
cd backend
cp env.template .env
# Edit .env with your Supabase credentials
npm run db:setup
```

### 2. Initialize Database
```bash
# Option 1: Use the setup script (recommended)
npm run db:setup

# Option 2: Manual SQL execution
# Go to Supabase dashboard > SQL Editor
# Copy and paste contents of backend/supabase-schema.sql
# Execute the SQL

# Option 3: Use migration script
npm run db:init
```

### 3. Start Backend
```bash
npm run dev
```

## 📊 Database Management Commands

### Health & Status
```bash
# Check database health
npm run db:health

# Check migration status
npm run db:status

# View comprehensive dashboard
npm run db:dashboard
```

### Backup & Restore
```bash
# Create backup
npm run db:backup

# Restore from backup
npm run db:restore
```

### Development
```bash
# Start backend server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔍 API Testing

### Health Checks
```bash
# Backend health
curl http://localhost:3001/health

# Database health
curl http://localhost:3001/api/vault/stats

# WebSocket status
curl http://localhost:3001/ws/status
```

### API Endpoints
```bash
# Get vault statistics
curl http://localhost:3001/api/vault/stats

# Get user positions
curl http://localhost:3001/api/user/0x123.../positions

# Get user transactions
curl http://localhost:3001/api/user/0x123.../transactions

# Get APY history
curl http://localhost:3001/api/analytics/apy-history/cUSD
```

## 🗄️ Database Schema

### Tables
- **users** - User wallet addresses
- **transactions** - Deposit/withdraw transactions
- **positions** - User vault positions
- **apy_history** - Historical APY data
- **vault_stats** - Current vault statistics
- **daily_volume** - Daily trading volume

### Key Fields
- **id** - UUID primary key
- **user_id** - Foreign key to users
- **token** - Token symbol (cUSD, USDC, CELO)
- **amount** - Transaction amount (BigNumber string)
- **shares** - Vault shares (BigNumber string)
- **apy** - Annual percentage yield
- **status** - Transaction status (PENDING, SUCCESS, FAILED)

## 🔧 Environment Variables

### Required
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Optional
```env
PORT=3001
WS_PORT=3002
FRONTEND_URL=http://localhost:3000
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
```

## 📈 Monitoring

### Key Metrics
- **Total Users** - Number of unique wallet addresses
- **Total Transactions** - Number of deposits/withdrawals
- **Active Positions** - Number of current vault positions
- **TVL** - Total Value Locked across all tokens
- **APY** - Current Annual Percentage Yield

### Health Indicators
- ✅ **Database Connection** - Can connect to Supabase
- ✅ **Data Integrity** - No orphaned records
- ✅ **Vault Stats Freshness** - Updated within 24 hours
- ✅ **Transaction Processing** - Success rate > 95%

## 🚨 Troubleshooting

### Common Issues

**1. Connection Errors**
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
npm run db:health
```

**2. Missing Tables**
```bash
# Check status
npm run db:status

# Initialize if needed
npm run db:init
```

**3. Data Issues**
```bash
# Check data integrity
npm run db:health

# Create backup before fixing
npm run db:backup
```

**4. API Errors**
```bash
# Check backend logs
npm run dev

# Test API endpoints
curl http://localhost:3001/health
```

## 📚 Documentation

- **Maintenance Guide**: `SUPABASE_DATABASE_MAINTENANCE.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Setup Guide**: `SUPABASE_SETUP_GUIDE.md`
- **Schema File**: `backend/supabase-schema.sql`

## 🆘 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Celo Docs**: [docs.celo.org](https://docs.celo.org)
- **Backend Code**: `backend/src/services/database.ts`

---

**Last Updated**: January 2025
**Version**: 1.0.0
