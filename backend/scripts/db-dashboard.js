#!/usr/bin/env node

/**
 * CeloYield Database Dashboard
 * 
 * This script provides a comprehensive overview of your database status
 * Run with: node scripts/db-dashboard.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Utility functions
function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}

// Dashboard functions
async function showOverview() {
  console.log('📊 CeloYield Database Overview');
  console.log('==============================\n');
  
  try {
    // Get basic counts
    const [users, transactions, positions, apyHistory, vaultStats] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('id', { count: 'exact', head: true }),
      supabase.from('positions').select('id', { count: 'exact', head: true }),
      supabase.from('apy_history').select('id', { count: 'exact', head: true }),
      supabase.from('vault_stats').select('*')
    ]);
    
    console.log('📈 Database Statistics:');
    console.log(`   👥 Total Users: ${formatNumber(users.count || 0)}`);
    console.log(`   💸 Total Transactions: ${formatNumber(transactions.count || 0)}`);
    console.log(`   📍 Active Positions: ${formatNumber(positions.count || 0)}`);
    console.log(`   📊 APY Records: ${formatNumber(apyHistory.count || 0)}`);
    
    if (vaultStats.data && vaultStats.data.length > 0) {
      console.log('\n💰 Vault Statistics:');
      vaultStats.data.forEach(stat => {
        const tvl = parseFloat(stat.total_assets);
        console.log(`   ${stat.token}: ${tvl > 0 ? formatNumber(tvl) : '0'} assets, ${stat.apy}% APY, ${stat.total_users} users`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching overview:', error.message);
  }
}

async function showRecentActivity() {
  console.log('\n🕒 Recent Activity (Last 24 Hours)');
  console.log('===================================\n');
  
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Recent transactions
    const { data: recentTxs, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .gte('timestamp', yesterday)
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (txError) throw txError;
    
    // Recent users
    const { data: recentUsers, error: userError } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (userError) throw userError;
    
    console.log(`📊 Activity Summary:`);
    console.log(`   💸 Transactions: ${recentTxs?.length || 0}`);
    console.log(`   👥 New Users: ${recentUsers?.length || 0}`);
    
    if (recentTxs && recentTxs.length > 0) {
      console.log('\n💸 Recent Transactions:');
      recentTxs.slice(0, 5).forEach(tx => {
        const status = tx.status === 'SUCCESS' ? '✅' : tx.status === 'PENDING' ? '⏳' : '❌';
        const time = new Date(tx.timestamp).toLocaleTimeString();
        console.log(`   ${status} ${tx.type} ${tx.amount} ${tx.token} at ${time}`);
      });
    }
    
    if (recentUsers && recentUsers.length > 0) {
      console.log('\n👥 Recent Users:');
      recentUsers.slice(0, 3).forEach(user => {
        const time = new Date(user.created_at).toLocaleTimeString();
        console.log(`   🆕 ${user.address.substring(0, 10)}... at ${time}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error.message);
  }
}

async function showAPYTrends() {
  console.log('\n📈 APY Trends (Last 7 Days)');
  console.log('============================\n');
  
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: apyData, error } = await supabase
      .from('apy_history')
      .select('*')
      .gte('timestamp', weekAgo)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    if (!apyData || apyData.length === 0) {
      console.log('📊 No APY history data available');
      return;
    }
    
    // Group by token
    const tokenData = {};
    apyData.forEach(record => {
      if (!tokenData[record.token]) {
        tokenData[record.token] = [];
      }
      tokenData[record.token].push(record);
    });
    
    console.log('📊 APY Trends by Token:');
    Object.entries(tokenData).forEach(([token, records]) => {
      const latest = records[0];
      const oldest = records[records.length - 1];
      const change = latest.apy - oldest.apy;
      const changeIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      const changeText = change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
      
      console.log(`   ${token}: ${latest.apy}% ${changeIcon} (${changeText}%)`);
      console.log(`      Latest: ${formatDate(latest.timestamp)}`);
      console.log(`      Records: ${records.length} updates`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching APY trends:', error.message);
  }
}

async function showTransactionStats() {
  console.log('\n💸 Transaction Statistics');
  console.log('=========================\n');
  
  try {
    // Transaction types
    const { data: txTypes, error: typeError } = await supabase
      .from('transactions')
      .select('type, status')
      .eq('status', 'SUCCESS');
    
    if (typeError) throw typeError;
    
    if (txTypes && txTypes.length > 0) {
      const deposits = txTypes.filter(tx => tx.type === 'DEPOSIT').length;
      const withdrawals = txTypes.filter(tx => tx.type === 'WITHDRAW').length;
      
      console.log('📊 Transaction Types:');
      console.log(`   💰 Deposits: ${formatNumber(deposits)}`);
      console.log(`   💸 Withdrawals: ${formatNumber(withdrawals)}`);
      console.log(`   📈 Total: ${formatNumber(deposits + withdrawals)}`);
    }
    
    // Token distribution
    const { data: tokenTxs, error: tokenError } = await supabase
      .from('transactions')
      .select('token, amount')
      .eq('status', 'SUCCESS');
    
    if (tokenError) throw tokenError;
    
    if (tokenTxs && tokenTxs.length > 0) {
      const tokenStats = {};
      tokenTxs.forEach(tx => {
        if (!tokenStats[tx.token]) {
          tokenStats[tx.token] = { count: 0, volume: 0 };
        }
        tokenStats[tx.token].count++;
        tokenStats[tx.token].volume += parseFloat(tx.amount);
      });
      
      console.log('\n🪙 Token Distribution:');
      Object.entries(tokenStats).forEach(([token, stats]) => {
        console.log(`   ${token}: ${formatNumber(stats.count)} txs, ${formatNumber(stats.volume)} volume`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching transaction stats:', error.message);
  }
}

async function showSystemHealth() {
  console.log('\n🏥 System Health');
  console.log('================\n');
  
  try {
    // Check connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Database Connection: Healthy');
    
    // Check for data consistency
    const { data: orphanedTxs, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .is('user_id', null);
    
    if (txError) throw txError;
    
    const { data: orphanedPos, error: posError } = await supabase
      .from('positions')
      .select('id')
      .is('user_id', null);
    
    if (posError) throw posError;
    
    const orphanedCount = (orphanedTxs?.length || 0) + (orphanedPos?.length || 0);
    
    if (orphanedCount === 0) {
      console.log('✅ Data Integrity: Healthy');
    } else {
      console.log(`⚠️  Data Integrity: ${orphanedCount} orphaned records found`);
    }
    
    // Check vault stats freshness
    const { data: vaultStats, error: vsError } = await supabase
      .from('vault_stats')
      .select('last_updated')
      .order('last_updated', { ascending: false })
      .limit(1);
    
    if (!vsError && vaultStats && vaultStats.length > 0) {
      const lastUpdate = new Date(vaultStats[0].last_updated);
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 24) {
        console.log('✅ Vault Stats: Fresh');
      } else {
        console.log(`⚠️  Vault Stats: Last updated ${hoursSinceUpdate.toFixed(1)} hours ago`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking system health:', error.message);
  }
}

async function showQuickActions() {
  console.log('\n⚡ Quick Actions');
  console.log('================\n');
  
  console.log('🔧 Database Management:');
  console.log('   npm run db:health     - Run health check');
  console.log('   npm run db:status     - Check migration status');
  console.log('   npm run db:backup     - Create backup');
  console.log('   npm run db:restore    - Restore from backup');
  console.log('');
  console.log('🚀 Development:');
  console.log('   npm run dev           - Start backend server');
  console.log('   npm run build         - Build for production');
  console.log('');
  console.log('📊 Monitoring:');
  console.log('   curl localhost:3001/health        - API health check');
  console.log('   curl localhost:3001/api/vault/stats - Vault statistics');
  console.log('   curl localhost:3001/ws/status     - WebSocket status');
}

// Main dashboard function
async function showDashboard() {
  console.clear();
  console.log('🗄️  CeloYield Database Dashboard');
  console.log('==================================\n');
  
  await showOverview();
  await showRecentActivity();
  await showAPYTrends();
  await showTransactionStats();
  await showSystemHealth();
  await showQuickActions();
  
  console.log('\n📚 For more information, see:');
  console.log('   - SUPABASE_DATABASE_MAINTENANCE.md');
  console.log('   - DEPLOYMENT_GUIDE.md');
  console.log('');
  console.log('🔄 Run this dashboard again: npm run db:dashboard');
}

// Run the dashboard
if (require.main === module) {
  showDashboard().catch(error => {
    console.error('💥 Dashboard failed:', error);
    process.exit(1);
  });
}

module.exports = { showDashboard };
