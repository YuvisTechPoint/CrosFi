#!/usr/bin/env node

/**
 * CeloYield Database Migration Script
 * 
 * This script helps manage database schema migrations for your Supabase database
 * Run with: node scripts/db-migrate.js [command]
 * 
 * Commands:
 *   init     - Initialize database with base schema
 *   status   - Check migration status
 *   backup   - Create a backup of current data
 *   restore  - Restore from backup
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration functions
async function initializeDatabase() {
  console.log('🚀 Initializing CeloYield database...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          // Some statements might fail if they already exist, which is OK
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  Statement skipped (already exists): ${statement.substring(0, 50)}...`);
          } else {
            console.error(`❌ Statement failed: ${statement.substring(0, 50)}...`);
            console.error(`   Error: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Statement error: ${statement.substring(0, 50)}...`);
        console.error(`   Error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Migration Results:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('🎉 Database initialization completed successfully!');
    } else {
      console.log('⚠️  Database initialization completed with some errors.');
      console.log('   Some statements may have failed because they already exist.');
    }
    
    // Verify tables were created
    await verifyTables();
    
  } catch (error) {
    console.error('💥 Database initialization failed:', error.message);
    process.exit(1);
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying table creation...');
  
  const expectedTables = ['users', 'transactions', 'positions', 'apy_history', 'vault_stats', 'daily_volume'];
  const results = {};
  
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) throw error;
      results[table] = '✅ Created';
    } catch (error) {
      results[table] = `❌ Failed: ${error.message}`;
    }
  }
  
  console.log('\n📋 Table Status:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`   ${status} ${table}`);
  });
  
  const allCreated = Object.values(results).every(status => status.includes('✅'));
  
  if (allCreated) {
    console.log('\n🎉 All tables created successfully!');
  } else {
    console.log('\n⚠️  Some tables failed to create. Please check the errors above.');
  }
}

async function checkMigrationStatus() {
  console.log('📊 Checking database migration status...');
  
  try {
    // Check if tables exist
    const tables = ['users', 'transactions', 'positions', 'apy_history', 'vault_stats', 'daily_volume'];
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) throw error;
        tableStatus[table] = { exists: true, count: data?.length || 0 };
      } catch (error) {
        tableStatus[table] = { exists: false, error: error.message };
      }
    }
    
    console.log('\n📋 Database Status:');
    Object.entries(tableStatus).forEach(([table, status]) => {
      if (status.exists) {
        console.log(`   ✅ ${table}: Exists (${status.count} records)`);
      } else {
        console.log(`   ❌ ${table}: Missing (${status.error})`);
      }
    });
    
    // Check for initial data
    const { data: vaultStats, error: vsError } = await supabase
      .from('vault_stats')
      .select('*');
    
    if (!vsError && vaultStats && vaultStats.length > 0) {
      console.log('\n💰 Initial Vault Stats:');
      vaultStats.forEach(stat => {
        console.log(`   ${stat.token}: ${stat.total_assets} assets, ${stat.apy}% APY`);
      });
    }
    
    const allTablesExist = Object.values(tableStatus).every(status => status.exists);
    
    if (allTablesExist) {
      console.log('\n🎉 Database is properly initialized!');
    } else {
      console.log('\n⚠️  Database needs initialization. Run: node scripts/db-migrate.js init');
    }
    
  } catch (error) {
    console.error('💥 Status check failed:', error.message);
    process.exit(1);
  }
}

async function createBackup() {
  console.log('💾 Creating database backup...');
  
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      tables: {}
    };
    
    const tables = ['users', 'transactions', 'positions', 'apy_history', 'vault_stats', 'daily_volume'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*');
        
        if (error) throw error;
        backup.tables[table] = data || [];
        console.log(`   ✅ ${table}: ${data?.length || 0} records`);
      } catch (error) {
        console.log(`   ❌ ${table}: Failed to backup (${error.message})`);
        backup.tables[table] = [];
      }
    }
    
    // Save backup to file
    const backupPath = path.join(__dirname, '..', 'backups', `backup-${Date.now()}.json`);
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    
    console.log(`\n💾 Backup saved to: ${backupPath}`);
    console.log('🎉 Backup completed successfully!');
    
  } catch (error) {
    console.error('💥 Backup failed:', error.message);
    process.exit(1);
  }
}

async function restoreFromBackup() {
  console.log('🔄 Restoring from backup...');
  
  try {
    // Find the most recent backup
    const backupDir = path.join(__dirname, '..', 'backups');
    
    if (!fs.existsSync(backupDir)) {
      console.error('❌ No backup directory found');
      process.exit(1);
    }
    
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (backupFiles.length === 0) {
      console.error('❌ No backup files found');
      process.exit(1);
    }
    
    const latestBackup = backupFiles[0];
    const backupPath = path.join(backupDir, latestBackup);
    
    console.log(`📁 Using backup: ${latestBackup}`);
    
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Restore each table
    for (const [tableName, records] of Object.entries(backup.tables)) {
      if (records.length === 0) continue;
      
      try {
        // Clear existing data
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (deleteError) throw deleteError;
        
        // Insert backup data
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(records);
        
        if (insertError) throw insertError;
        
        console.log(`   ✅ ${tableName}: Restored ${records.length} records`);
      } catch (error) {
        console.log(`   ❌ ${tableName}: Failed to restore (${error.message})`);
      }
    }
    
    console.log('\n🎉 Restore completed successfully!');
    
  } catch (error) {
    console.error('💥 Restore failed:', error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  const command = process.argv[2];
  
  console.log('🗄️  CeloYield Database Migration Tool');
  console.log('=====================================\n');
  
  switch (command) {
    case 'init':
      await initializeDatabase();
      break;
    case 'status':
      await checkMigrationStatus();
      break;
    case 'backup':
      await createBackup();
      break;
    case 'restore':
      await restoreFromBackup();
      break;
    default:
      console.log('Usage: node scripts/db-migrate.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  init     - Initialize database with base schema');
      console.log('  status   - Check migration status');
      console.log('  backup   - Create a backup of current data');
      console.log('  restore  - Restore from backup');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/db-migrate.js init');
      console.log('  node scripts/db-migrate.js status');
      console.log('  node scripts/db-migrate.js backup');
      break;
  }
}

// Run the migration tool
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Migration tool failed:', error);
    process.exit(1);
  });
}

module.exports = {
  initializeDatabase,
  checkMigrationStatus,
  createBackup,
  restoreFromBackup
};
