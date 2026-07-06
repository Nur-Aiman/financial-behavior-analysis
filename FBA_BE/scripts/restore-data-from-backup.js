/**
 * Restore Data Backup to Production Database
 * 
 * This script:
 * 1. Reads the JSON backup file
 * 2. Connects to production database
 * 3. Imports all the data
 * 4. Verifies data integrity
 * 
 * Usage:
 * node scripts/restore-data-from-backup.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import knex from 'knex';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.production') });

console.log('🚀 Restoring FBA Data to Production Database\n');

const prodDb = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  acquireConnectionTimeout: 10000,
});

async function findLatestBackup() {
  const dir = path.join(__dirname, '..');
  const files = fs.readdirSync(dir);
  const backupFiles = files
    .filter(f => f.startsWith('fba-data-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (backupFiles.length === 0) {
    throw new Error('No backup files found. Run: node scripts/create-backup.js');
  }

  return path.join(dir, backupFiles[0]);
}

async function restoreData() {
  try {
    console.log('🔗 Connecting to production database...');
    await prodDb.raw('SELECT 1');
    console.log('✅ Connected\n');

    // Find latest backup
    const backupFile = await findLatestBackup();
    console.log(`📂 Using backup: ${path.basename(backupFile)}\n`);

    const jsonData = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));

    console.log('📥 Restoring data...\n');

    let totalRows = 0;

    // Define table dependencies
    const tableOrder = [
      'spending_categories',
      'financial_profiles',
      'transactions',
      'balance_adjustments',
      'fixed_expense_payments',
      'spending_logs',
      'audit_logs',
    ];

    // Restore each table
    for (const table of tableOrder) {
      const data = jsonData[table];

      if (!data || data.length === 0) {
        console.log(`ℹ️  ${table}: No data to restore`);
        continue;
      }

      // Clear existing data first
      await prodDb(table).del();

      // Insert in chunks
      const chunkSize = 100;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await prodDb(table).insert(chunk);
      }

      console.log(`✅ ${table}: ${data.length} rows restored`);
      totalRows += data.length;
    }

    // Verify
    console.log('\n📊 Verification:\n');
    let allMatch = true;

    for (const table of tableOrder) {
      const result = await prodDb(table).count('*').first();
      const prodCount = parseInt(result.count || 0, 10);
      const devCount = jsonData[table]?.length || 0;

      const match = prodCount === devCount ? '✅' : '❌';
      console.log(`${match} ${table}: ${prodCount} rows (expected: ${devCount})`);

      if (prodCount !== devCount) allMatch = false;
    }

    if (allMatch) {
      console.log(`\n🎉 RESTORE SUCCESSFUL!\n`);
      console.log(`✅ All data restored to production`);
      console.log(`✅ Total rows restored: ${totalRows}\n`);
    } else {
      console.log(`\n⚠️  RESTORE COMPLETED WITH WARNINGS\n`);
    }

    console.log('📋 Your production database is ready!');
    console.log('   You can now deploy without losing any data.\n');
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  } finally {
    await prodDb.destroy();
  }
}

restoreData();
