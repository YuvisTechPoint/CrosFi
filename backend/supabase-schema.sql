-- CeloYield Supabase Database Schema
-- Run this SQL in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW')),
    token TEXT NOT NULL,
    amount TEXT NOT NULL,
    shares TEXT,
    tx_hash TEXT UNIQUE NOT NULL,
    block_number BIGINT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    gas_used TEXT,
    gas_price TEXT
);

-- Positions table
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    shares TEXT NOT NULL,
    asset_value TEXT NOT NULL,
    apy DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- APY History table
CREATE TABLE apy_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL,
    apy DECIMAL(10,4) NOT NULL,
    tvl TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault Stats table
CREATE TABLE vault_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT UNIQUE NOT NULL,
    total_assets TEXT NOT NULL,
    total_shares TEXT NOT NULL,
    total_users INTEGER NOT NULL DEFAULT 0,
    apy DECIMAL(10,4) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Volume table
CREATE TABLE daily_volume (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    token TEXT NOT NULL,
    volume TEXT NOT NULL,
    deposits TEXT NOT NULL,
    withdrawals TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, token)
);

-- Create indexes for better performance
CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_token ON positions(token);
CREATE INDEX idx_apy_history_token ON apy_history(token);
CREATE INDEX idx_apy_history_timestamp ON apy_history(timestamp);
CREATE INDEX idx_vault_stats_token ON vault_stats(token);
CREATE INDEX idx_daily_volume_date ON daily_volume(date);
CREATE INDEX idx_daily_volume_token ON daily_volume(token);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial vault stats for supported tokens
INSERT INTO vault_stats (token, total_assets, total_shares, total_users, apy) VALUES
('cUSD', '0', '0', 0, 8.0),
('USDC', '0', '0', 0, 8.0),
('CELO', '0', '0', 0, 8.0);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE apy_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_volume ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON positions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON apy_history FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON vault_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON daily_volume FOR SELECT USING (true);

-- Allow service role to insert/update/delete (for backend operations)
CREATE POLICY "Allow service role full access" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON positions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON apy_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON vault_stats FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON daily_volume FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
