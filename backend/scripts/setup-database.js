#!/usr/bin/env node

/**
 * CeloYield Database Setup Script
 * 
 * This script helps you set up your Supabase database for the first time
 * Run with: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  console.error('');
  console.error('To get these values:');
  console.error('1. Go to https://supabase.com');
  console.error('2. Create a new project');
  console.error('3. Go to Settings > API');
  console.error('4. Copy the URL and anon key');
  console.error('5. Add them to your backend/.env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up CeloYield Database');
  console.log('================================\n');
  
  // Step 1: Test connection
  console.log('1️⃣ Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error && !error.message.includes('relation "users" does not exist')) {
      throw error;
    }
    
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('');
    console.error('Please check:');
    console.error('- Your Supabase URL is correct');
    console.error('- Your API key is correct');
    console.error('- Your Supabase project is active');
    process.exit(1);
  }
  
  // Step 2: Check if tables exist
  console.log('\n2️⃣ Checking existing tables...');
  const tables = ['users', 'transactions', 'positions', 'apy_history', 'vault_stats', 'daily_volume'];
  const existingTables = [];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (!error) {
        existingTables.push(table);
        console.log(`   ✅ ${table} exists`);
      }
    } catch (error) {
      console.log(`   ❌ ${table} does not exist`);
    }
  }
  
  if (existingTables.length === tables.length) {
    console.log('\n🎉 All tables already exist! Your database is ready.');
    console.log('You can now start your backend server with: npm run dev');
    return;
  }
  
  // Step 3: Create tables
  console.log('\n3️⃣ Creating database tables...');
  console.log('This will create the following tables:');
  tables.forEach(table => {
    if (!existingTables.includes(table)) {
      console.log(`   📝 ${table}`);
    }
  });
  
  console.log('\n⚠️  IMPORTANT: You need to run the SQL schema manually in Supabase:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy the contents of backend/supabase-schema.sql');
  console.log('4. Paste and execute the SQL');
  console.log('');
  console.log('Alternatively, you can use the migration script:');
  console.log('   npm run db:init');
  
  // Step 4: Verify setup
  console.log('\n4️⃣ Verifying setup...');
  try {
    const { data, error } = await supabase
      .from('vault_stats')
      .select('*');
    
    if (!error && data && data.length > 0) {
      console.log('✅ Initial vault stats found');
      data.forEach(stat => {
        console.log(`   ${stat.token}: ${stat.apy}% APY`);
      });
    } else {
      console.log('⚠️  No initial vault stats found');
      console.log('   This is normal if you just created the tables');
    }
  } catch (error) {
    console.log('⚠️  Could not verify vault stats (tables may not exist yet)');
  }
  
  // Step 5: Next steps
  console.log('\n📋 Next Steps:');
  console.log('==============');
  console.log('1. Run the SQL schema in Supabase dashboard');
  console.log('2. Start your backend: npm run dev');
  console.log('3. Test the API: curl http://localhost:3001/health');
  console.log('4. Check database health: npm run db:health');
  console.log('');
  console.log('📚 For more information, see:');
  console.log('   - SUPABASE_DATABASE_MAINTENANCE.md');
  console.log('   - DEPLOYMENT_GUIDE.md');
}

// Run the setup
if (require.main === module) {
  setupDatabase().catch(error => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupDatabase };
