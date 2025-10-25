# CeloYield Supabase Database Maintenance Guide

## 🗄️ Database Overview

Your CeloYield application uses **Supabase** as the backend database, which provides:
- **PostgreSQL** database with real-time capabilities
- **Row Level Security (RLS)** for data protection
- **Automatic API generation** from your schema
- **Real-time subscriptions** for live updates

## 📊 Database Schema

### Core Tables

#### 1. **Users Table**
```sql
- id: UUID (Primary Key)
- address: TEXT (Unique wallet address)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. **Transactions Table**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to Users)
- type: TEXT (DEPOSIT, WITHDRAW)
- token: TEXT (cUSD, USDC, CELO)
- amount: TEXT (BigNumber string)
- shares: TEXT (Optional)
- tx_hash: TEXT (Unique blockchain transaction hash)
- block_number: BIGINT (Optional)
- timestamp: TIMESTAMP
- status: TEXT (PENDING, SUCCESS, FAILED)
- gas_used: TEXT (Optional)
- gas_price: TEXT (Optional)
```

#### 3. **Positions Table**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to Users)
- token: TEXT (cUSD, USDC, CELO)
- shares: TEXT (User's vault shares)
- asset_value: TEXT (Current asset value)
- apy: DECIMAL(10,4) (Current APY)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE(user_id, token)
```

#### 4. **APY History Table**
```sql
- id: UUID (Primary Key)
- token: TEXT (cUSD, USDC, CELO)
- apy: DECIMAL(10,4) (Historical APY)
- tvl: TEXT (Total Value Locked)
- timestamp: TIMESTAMP
```

#### 5. **Vault Stats Table**
```sql
- id: UUID (Primary Key)
- token: TEXT (Unique - cUSD, USDC, CELO)
- total_assets: TEXT (Total assets in vault)
- total_shares: TEXT (Total shares issued)
- total_users: INTEGER (Number of users)
- apy: DECIMAL(10,4) (Current APY)
- last_updated: TIMESTAMP
```

#### 6. **Daily Volume Table**
```sql
- id: UUID (Primary Key)
- date: DATE (Daily date)
- token: TEXT (cUSD, USDC, CELO)
- volume: TEXT (Daily volume)
- deposits: TEXT (Daily deposits)
- withdrawals: TEXT (Daily withdrawals)
- created_at: TIMESTAMP
- UNIQUE(date, token)
```

## 🔧 Database Maintenance Tasks

### 1. **Initial Setup**

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

#### Step 2: Run Database Schema
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `backend/supabase-schema.sql`
4. Execute the SQL to create all tables, indexes, and policies

#### Step 3: Configure Environment Variables
1. Copy `backend/env.template` to `backend/.env`
2. Fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 2. **Regular Maintenance**

#### Daily Tasks
- **Monitor database performance** in Supabase dashboard
- **Check error logs** for any failed transactions
- **Verify data integrity** by running health checks

#### Weekly Tasks
- **Review APY history** for accuracy
- **Clean up old transaction data** (optional)
- **Update vault statistics** if needed
- **Check database storage usage**

#### Monthly Tasks
- **Analyze user growth** and transaction patterns
- **Review and optimize** database indexes
- **Update security policies** if needed
- **Backup verification** (Supabase handles this automatically)

### 3. **Data Management**

#### Adding New Tokens
1. Update `vault_stats` table:
   ```sql
   INSERT INTO vault_stats (token, total_assets, total_shares, total_users, apy) 
   VALUES ('NEW_TOKEN', '0', '0', 0, 8.0);
   ```

2. Update your backend configuration
3. Deploy updated smart contracts

#### Updating APY Rates
```sql
UPDATE vault_stats 
SET apy = 9.5, last_updated = NOW() 
WHERE token = 'cUSD';
```

#### User Data Management
- **Users are automatically created** when they first interact with the vault
- **Positions are updated** in real-time via blockchain events
- **Transactions are indexed** automatically by the event listener

### 4. **Monitoring & Alerts**

#### Key Metrics to Monitor
- **Database connection health**
- **Transaction processing success rate**
- **APY calculation accuracy**
- **User activity levels**
- **Storage usage**

#### Setting Up Alerts
1. In Supabase dashboard, go to **Settings > Alerts**
2. Set up alerts for:
   - High error rates
   - Database connection issues
   - Unusual transaction patterns

### 5. **Backup & Recovery**

#### Automatic Backups
- Supabase provides **automatic daily backups**
- **Point-in-time recovery** available
- **Backup retention**: 7 days (free), 30 days (pro)

#### Manual Backup
```sql
-- Export specific data
SELECT * FROM users WHERE created_at > '2024-01-01';
SELECT * FROM transactions WHERE status = 'SUCCESS';
```

### 6. **Performance Optimization**

#### Indexes (Already Created)
- `idx_users_address` - Fast user lookups
- `idx_transactions_user_id` - User transaction queries
- `idx_transactions_tx_hash` - Transaction hash lookups
- `idx_positions_user_id` - User position queries
- `idx_apy_history_token` - APY history queries

#### Query Optimization
- Use **LIMIT** for large result sets
- **Filter by timestamp** for historical data
- **Use indexes** for frequently queried columns

### 7. **Security Management**

#### Row Level Security (RLS)
- **Enabled on all tables** for data protection
- **Public read access** for analytics data
- **Service role access** for backend operations

#### API Security
- **Use service role key** for backend operations
- **Use anon key** for public read operations
- **Implement rate limiting** in your backend

### 8. **Troubleshooting**

#### Common Issues

**1. Connection Errors**
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: $SUPABASE_ANON_KEY" $SUPABASE_URL/rest/v1/users
```

**2. Transaction Failures**
- Check blockchain transaction status
- Verify contract addresses
- Review event listener logs

**3. APY Calculation Issues**
- Verify Mento protocol integration
- Check exchange rate feeds
- Review APY calculator service

#### Health Check Endpoints
- **Backend Health**: `GET /health`
- **Database Health**: `GET /api/vault/stats`
- **WebSocket Status**: `GET /ws/status`

### 9. **Scaling Considerations**

#### As Your App Grows
- **Monitor query performance**
- **Consider read replicas** for heavy analytics
- **Implement caching** for frequently accessed data
- **Optimize batch operations** for large datasets

#### Supabase Limits
- **Free Tier**: 500MB database, 2GB bandwidth
- **Pro Tier**: 8GB database, 250GB bandwidth
- **Enterprise**: Custom limits

### 10. **Development vs Production**

#### Development Environment
- Use **separate Supabase project** for development
- **Test all database operations** before production
- **Use development API keys**

#### Production Environment
- **Use production Supabase project**
- **Enable all security features**
- **Monitor performance closely**
- **Set up proper alerting**

## 🚀 Quick Start Commands

### Start Backend with Database
```bash
cd backend
cp env.template .env
# Edit .env with your Supabase credentials
npm install
npm run dev
```

### Test Database Connection
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/vault/stats
```

### View Database in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. View and manage your data

## 📞 Support

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **CeloYield Backend**: Check `backend/src/services/database.ts`
- **Database Schema**: See `backend/supabase-schema.sql`

---

**Last Updated**: January 2025
**Version**: 1.0.0
