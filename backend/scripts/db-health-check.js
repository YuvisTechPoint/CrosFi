#!/usr/bin/env node

/**
 * CeloYield Database Health Check Script
 * 
 * This script checks the health and status of your Supabase database
 * Run with: node scripts/db-health-check.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check functions
async function checkConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Database connection: OK');
    return true;
  } catch (error) {
    console.error('❌ Database connection: FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

async function checkTables() {
  const tables = ['users', 'transactions', 'positions', 'apy_history', 'vault_stats', 'daily_volume'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) throw error;
      results[table] = 'OK';
    } catch (error) {
      results[table] = `FAILED: ${error.message}`;
    }
  }
  
  console.log('\n📊 Table Status:');
  Object.entries(results).forEach(([table, status]) => {
    const icon = status === 'OK' ? '✅' : '❌';
    console.log(`${icon} ${table}: ${status}`);
  });
  
  return Object.values(results).every(status => status === 'OK');
}

async function checkDataIntegrity() {
  try {
    // Check for orphaned transactions
    const { data: orphanedTxs, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .is('user_id', null);
    
    if (txError) throw txError;
    
    // Check for orphaned positions
    const { data: orphanedPos, error: posError } = await supabase
      .from('positions')
      .select('id')
      .is('user_id', null);
    
    if (posError) throw posError;
    
    const orphanedCount = (orphanedTxs?.length || 0) + (orphanedPos?.length || 0);
    
    if (orphanedCount === 0) {
      console.log('✅ Data integrity: OK');
      return true;
    } else {
      console.log(`⚠️  Data integrity: ${orphanedCount} orphaned records found`);
      return false;
    }
  } catch (error) {
    console.error('❌ Data integrity check: FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

async function checkVaultStats() {
  try {
    const { data, error } = await supabase
      .from('vault_stats')
      .select('*');
    
    if (error) throw error;
    
    console.log('\n💰 Vault Statistics:');
    data.forEach(stat => {
      console.log(`  ${stat.token}: ${stat.total_assets} assets, ${stat.apy}% APY, ${stat.total_users} users`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Vault stats check: FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

async function checkRecentActivity() {
  try {
    // Check recent transactions
    const { data: recentTxs, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (txError) throw txError;
    
    // Check recent users
    const { data: recentUsers, error: userError } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (userError) throw userError;
    
    console.log('\n📈 Recent Activity (24h):');
    console.log(`  Transactions: ${recentTxs?.length || 0}`);
    console.log(`  New users: ${recentUsers?.length || 0}`);
    
    if (recentTxs && recentTxs.length > 0) {
      console.log('  Recent transactions:');
      recentTxs.slice(0, 3).forEach(tx => {
        console.log(`    ${tx.type} ${tx.amount} ${tx.token} - ${tx.status}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Recent activity check: FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

async function checkAPYHistory() {
  try {
    const { data, error } = await supabase
      .from('apy_history')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    console.log('\n📊 APY History (7 days):');
    const tokens = [...new Set(data?.map(item => item.token) || [])];
    
    tokens.forEach(token => {
      const tokenData = data?.filter(item => item.token === token) || [];
      const latest = tokenData[0];
      const oldest = tokenData[tokenData.length - 1];
      
      if (latest && oldest) {
        const change = latest.apy - oldest.apy;
        const changeIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        console.log(`  ${token}: ${latest.apy}% ${changeIcon} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ APY history check: FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

async function generateReport() {
  console.log('🔍 CeloYield Database Health Check');
  console.log('=====================================\n');
  
  const checks = [
    { name: 'Connection', fn: checkConnection },
    { name: 'Tables', fn: checkTables },
    { name: 'Data Integrity', fn: checkDataIntegrity },
    { name: 'Vault Stats', fn: checkVaultStats },
    { name: 'Recent Activity', fn: checkRecentActivity },
    { name: 'APY History', fn: checkAPYHistory }
  ];
  
  const results = [];
  
  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push({ name: check.name, status: result ? 'PASS' : 'FAIL' });
    } catch (error) {
      console.error(`❌ ${check.name} check failed:`, error.message);
      results.push({ name: check.name, status: 'ERROR' });
    }
  }
  
  // Summary
  console.log('\n📋 Health Check Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}: ${result.status}`);
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${errors} errors`);
  
  if (failed === 0 && errors === 0) {
    console.log('🎉 All checks passed! Your database is healthy.');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed. Please review the issues above.');
    process.exit(1);
  }
}

// Run the health check
if (require.main === module) {
  generateReport().catch(error => {
    console.error('💥 Health check failed:', error);
    process.exit(1);
  });
}

module.exports = {
  checkConnection,
  checkTables,
  checkDataIntegrity,
  checkVaultStats,
  checkRecentActivity,
  checkAPYHistory
};
