/**
 * Import Database from SQL Dump
 * 
 * This script reads the SQL dump file and executes it
 * Useful for importing into production
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import knex from 'knex';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use production database for import
const isProd = process.env.NODE_ENV === 'production';
const envFile = isProd ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, '..', envFile) });

console.log(`🚀 Importing Database from SQL Dump (${isProd ? 'PRODUCTION' : 'DEVELOPMENT'})\n`);

const db = knex({
  client: 'pg',
  connection: isProd 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'financial-behavior-analysis',
        port: process.env.DB_PORT || 5432,
      },
});

async function findLatestSqlDump() {
  const dir = path.join(__dirname, '..');
  const files = fs.readdirSync(dir);
  const sqlFiles = files
    .filter(f => f.startsWith('fba-backup-') && f.endsWith('.sql'))
    .sort()
    .reverse();

  if (sqlFiles.length === 0) {
    throw new Error('No SQL backup files found. Run: node scripts/create-backup.js');
  }

  return path.join(dir, sqlFiles[0]);
}

async function importSqlDump() {
  try {
    console.log('🔗 Connecting to database...');
    await db.raw('SELECT 1');
    console.log('✅ Connected\n');

    // Find latest SQL dump
    const sqlFile = await findLatestSqlDump();
    console.log(`📂 Using SQL dump: ${path.basename(sqlFile)}\n`);

    // Read SQL content
    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

    // Parse SQL statements (simple approach - split by ;)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📥 Executing ${statements.length} SQL statements...\n`);

    let executed = 0;
    const errors = [];

    for (const statement of statements) {
      try {
        await db.raw(statement);
        executed++;
      } catch (error) {
        // Some statements might fail (like if data already exists)
        // This is expected, so just log and continue
        errors.push({
          statement: statement.substring(0, 50) + '...',
          error: error.message,
        });
      }
    }

    console.log(`✅ Executed ${executed} statements successfully\n`);

    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} statements had warnings (this is normal if data already exists):`);
      errors.slice(0, 5).forEach(e => {
        console.log(`   - ${e.error.substring(0, 60)}...`);
      });
      if (errors.length > 5) console.log(`   ... and ${errors.length - 5} more\n`);
    }

    // Count final rows
    console.log('📊 Data Summary:\n');
    const tables = [
      'spending_categories',
      'transactions',
      'financial_profiles',
      'balance_adjustments',
      'fixed_expense_payments',
      'spending_logs',
      'audit_logs',
    ];

    let totalRows = 0;
    for (const table of tables) {
      try {
        const result = await db(table).count('*').first();
        const count = parseInt(result.count || 0, 10);
        console.log(`   ${table}: ${count} rows`);
        totalRows += count;
      } catch (error) {
        console.log(`   ${table}: Error reading count`);
      }
    }

    console.log(`\n✅ Import complete! Total rows: ${totalRows}\n`);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

importSqlDump();
