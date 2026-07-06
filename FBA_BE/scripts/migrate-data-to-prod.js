/**
 * Data Migration Script: Copy FBA Data from Dev to Production
 * 
 * This script:
 * 1. Connects to development database (localhost:5432)
 * 2. Extracts all FBA data
 * 3. Connects to production database (Render PostgreSQL)
 * 4. Creates tables if they don't exist
 * 5. Copies all data to production
 * 6. Verifies data integrity
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import knex from 'knex';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment files
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const prodEnvPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(prodEnvPath)) {
  dotenv.config({ path: prodEnvPath });
}

console.log('🚀 Starting FBA Data Migration from Dev to Production\n');

// Dev database connection
const devDb = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'financial-behavior-analysis',
    port: process.env.DB_PORT || 5432,
  },
});

// Production database connection
const prodDb = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  acquireConnectionTimeout: 10000,
});

async function ensureProductionTables() {
  console.log('📋 Ensuring production tables exist...\n');

  try {
    // Table: spending_categories
    const hasSpendingCategories = await prodDb.schema.hasTable('spending_categories');
    if (!hasSpendingCategories) {
      console.log('  Creating spending_categories...');
      await prodDb.schema.createTable('spending_categories', (table) => {
        table.uuid('id').primary().defaultTo(prodDb.raw('gen_random_uuid()'));
        table.string('name', 255).notNullable();
        table.enum('type', ['DAILY_TIME_BASED', 'USAGE_BASED', 'FIXED_ONE_TIME']).notNullable();
        table.bigInteger('allocated_amount_cents').notNullable().defaultTo(0);
        table.bigInteger('preferred_daily_amount_cents').nullable();
        table.bigInteger('expected_amount_cents').nullable();
        table.date('due_date').nullable();
        table.boolean('recurring').defaultTo(false);
        table.boolean('protected').defaultTo(false);
        table.integer('display_order').notNullable().defaultTo(0);
        table.boolean('active').defaultTo(true);
        table.timestamp('created_at').defaultTo(prodDb.fn.now());
        table.timestamp('updated_at').defaultTo(prodDb.fn.now());
        table.index(['display_order']);
        table.index(['active']);
        table.index(['type']);
      });
    }

    // Table: financial_profiles
    const hasFinancialProfiles = await prodDb.schema.hasTable('financial_profiles');
    if (!hasFinancialProfiles) {
      console.log('  Creating financial_profiles...');
      await prodDb.schema.createTable('financial_profiles', (table) => {
        table.uuid('id').primary().defaultTo(prodDb.raw('gen_random_uuid()'));
        table.string('currency', 3).notNullable().defaultTo('MYR');
        table.bigInteger('expected_salary_cents').nullable();
        table.bigInteger('opening_balance_cents').nullable();
        table.bigInteger('current_balance_cents').notNullable().defaultTo(0);
        table.date('salary_cycle_start_date').nullable();
        table.date('next_payday').nullable();
        table.timestamp('created_at').defaultTo(prodDb.fn.now());
        table.timestamp('updated_at').defaultTo(prodDb.fn.now());
        table.index(['created_at']);
      });
    }

    // Table: transactions
    const hasTransactions = await prodDb.schema.hasTable('transactions');
    if (!hasTransactions) {
      console.log('  Creating transactions...');
      await prodDb.schema.createTable('transactions', (table) => {
        table.uuid('id').primary().defaultTo(prodDb.raw('gen_random_uuid()'));
        table.uuid('category_id').nullable();
        table.date('transaction_date').notNullable();
        table.string('description', 500).nullable();
        table.enum('type', ['INCOME', 'EXPENSE']).notNullable().defaultTo('EXPENSE');
        table.string('source', 100).nullable();
        table.bigInteger('amount_cents').notNullable();
        table.timestamp('created_at').defaultTo(prodDb.fn.now());
        table.timestamp('updated_at').defaultTo(prodDb.fn.now());
        table.index('category_id');
        table.index('transaction_date');
        table.index('type');
      });
    }

    // Table: balance_adjustments
    const hasBalanceAdjustments = await prodDb.schema.hasTable('balance_adjustments');
    if (!hasBalanceAdjustments) {
      console.log('  Creating balance_adjustments...');
      await prodDb.schema.createTable('balance_adjustments', (table) => {
        table.uuid('id').primary().defaultTo(prodDb.raw('gen_random_uuid()'));
        table.uuid('profile_id').notNullable();
        table.bigInteger('previous_balance_cents').notNullable();
        table.bigInteger('new_balance_cents').notNullable();
        table.bigInteger('adjustment_amount_cents').notNullable();
        table.string('reason', 255).nullable();
        table.timestamp('created_at').defaultTo(prodDb.fn.now());
        table.timestamp('updated_at').defaultTo(prodDb.fn.now());
        table.index('profile_id');
      });
    }

    // Table: fixed_expense_payments
    const hasFixedExpensePayments = await prodDb.schema.hasTable('fixed_expense_payments');
    if (!hasFixedExpensePayments) {
      console.log('  Creating fixed_expense_payments...');
      await prodDb.schema.createTable('fixed_expense_payments', (table) => {
        table.uuid('id').primary().defaultTo(prodDb.raw('gen_random_uuid()'));
        table.uuid('category_id').notNullable();
        table.bigInteger('expected_amount_cents').notNullable();
        table.bigInteger('actual_amount_cents').nullable();
        table.date('due_date').notNullable();
        table.date('payment_date').nullable();
        table.enum('status', ['UNPAID', 'PAID', 'OVERDUE']).notNullable().defaultTo('UNPAID');
        table.uuid('transaction_id').nullable();
        table.timestamp('created_at').defaultTo(prodDb.fn.now());
        table.timestamp('updated_at').defaultTo(prodDb.fn.now());
        table.index('category_id');
        table.index('status');
        table.index('due_date');
      });
    }

    // Table: spending_logs
    const hasSpendingLogs = await prodDb.schema.hasTable('spending_logs');
    if (!hasSpendingLogs) {
      console.log('  Creating spending_logs...');
      await prodDb.schema.createTable('spending_logs', (table) => {
        table.uuid('id').primary().defaultTo(prodDb.raw('gen_random_uuid()'));
        table.uuid('category_id').notNullable();
        table.bigInteger('amount_spent_cents').notNullable();
        table.date('log_date').notNullable();
        table.text('notes').nullable();
        table.timestamp('created_at').defaultTo(prodDb.fn.now());
        table.timestamp('updated_at').defaultTo(prodDb.fn.now());
        table.index('category_id');
        table.index('log_date');
        table.unique(['category_id', 'log_date']);
      });
    }

    // Table: audit_logs
    const hasAuditLogs = await prodDb.schema.hasTable('audit_logs');
    if (!hasAuditLogs) {
      console.log('  Creating audit_logs...');
      await prodDb.schema.createTable('audit_logs', (table) => {
        table.uuid('id').primary().defaultTo(prodDb.raw('gen_random_uuid()'));
        table.string('action', 50).notNullable();
        table.string('entity_type', 100).notNullable();
        table.uuid('entity_id').notNullable();
        table.json('old_values').nullable();
        table.json('new_values').nullable();
        table.timestamp('created_at').defaultTo(prodDb.fn.now());
        table.index('entity_type');
        table.index('entity_id');
        table.index('action');
      });
    }

    console.log('✅ All production tables ready\n');
  } catch (error) {
    console.error('❌ Error ensuring production tables:', error.message);
    throw error;
  }
}

async function migrateTable(tableName, columns = null) {
  console.log(`📊 Migrating ${tableName}...`);

  try {
    // Get dev data
    let devData = await devDb.select('*').from(tableName);
    
    if (devData.length === 0) {
      console.log(`   ℹ️  No data to migrate (${tableName} is empty)`);
      return 0;
    }

    // Convert bigInteger columns if needed
    if (columns) {
      devData = devData.map(row => {
        const converted = { ...row };
        columns.forEach(col => {
          if (converted[col] !== null && typeof converted[col] === 'string') {
            converted[col] = parseInt(converted[col], 10);
          }
        });
        return converted;
      });
    }

    // Clear production table first
    await prodDb(tableName).del();

    // Insert data
    if (devData.length > 0) {
      // Insert in chunks to avoid overwhelming the database
      const chunkSize = 100;
      for (let i = 0; i < devData.length; i += chunkSize) {
        const chunk = devData.slice(i, i + chunkSize);
        await prodDb(tableName).insert(chunk);
      }
    }

    console.log(`   ✅ Migrated ${devData.length} rows`);
    return devData.length;
  } catch (error) {
    console.error(`   ❌ Error migrating ${tableName}:`, error.message);
    throw error;
  }
}

async function verifyMigration() {
  console.log('\n📈 Verifying Data Migration...\n');

  const tables = [
    'spending_categories',
    'transactions',
    'financial_profiles',
    'balance_adjustments',
    'fixed_expense_payments',
    'spending_logs',
    'audit_logs',
  ];

  const summary = [];

  for (const table of tables) {
    try {
      const devCount = await devDb(table).count('*').first();
      const prodCount = await prodDb(table).count('*').first();

      const devRows = parseInt(devCount.count || 0, 10);
      const prodRows = parseInt(prodCount.count || 0, 10);

      const status = devRows === prodRows ? '✅' : '⚠️ ';
      console.log(`${status} ${table}`);
      console.log(`    Dev:  ${devRows} rows`);
      console.log(`    Prod: ${prodRows} rows`);

      summary.push({
        table,
        devRows,
        prodRows,
        match: devRows === prodRows,
      });
    } catch (error) {
      console.log(`❌ ${table}: Error verifying`);
      summary.push({
        table,
        devRows: 0,
        prodRows: 0,
        match: false,
      });
    }
  }

  const allMatch = summary.every(s => s.match);
  return { summary, allMatch };
}

async function run() {
  try {
    console.log('🔗 Connecting to databases...');
    console.log(`   Dev:  localhost:5432/${process.env.DB_NAME || 'financial-behavior-analysis'}`);
    console.log(`   Prod: Render PostgreSQL\n`);

    // Test connections
    await devDb.raw('SELECT 1');
    console.log('   ✅ Connected to development database');

    await prodDb.raw('SELECT 1');
    console.log('   ✅ Connected to production database\n');

    // Ensure tables exist in production
    await ensureProductionTables();

    // Migrate data
    console.log('🔄 Starting Data Migration\n');

    const bigIntColumns = {
      transactions: ['amount_cents'],
      spending_categories: ['allocated_amount_cents', 'preferred_daily_amount_cents', 'expected_amount_cents'],
      financial_profiles: ['expected_salary_cents', 'opening_balance_cents', 'current_balance_cents'],
      balance_adjustments: ['previous_balance_cents', 'new_balance_cents', 'adjustment_amount_cents'],
      fixed_expense_payments: ['expected_amount_cents', 'actual_amount_cents'],
      spending_logs: ['amount_spent_cents'],
    };

    let totalRows = 0;

    // Migrate tables in dependency order
    totalRows += await migrateTable('spending_categories', bigIntColumns.spending_categories);
    totalRows += await migrateTable('financial_profiles', bigIntColumns.financial_profiles);
    totalRows += await migrateTable('transactions', bigIntColumns.transactions);
    totalRows += await migrateTable('balance_adjustments', bigIntColumns.balance_adjustments);
    totalRows += await migrateTable('fixed_expense_payments', bigIntColumns.fixed_expense_payments);
    totalRows += await migrateTable('spending_logs', bigIntColumns.spending_logs);
    totalRows += await migrateTable('audit_logs');

    // Verify migration
    const { summary, allMatch } = await verifyMigration();

    if (allMatch) {
      console.log('\n🎉 DATA MIGRATION SUCCESSFUL!\n');
      console.log('✅ All data copied from dev to production');
      console.log(`✅ Total rows migrated: ${totalRows}\n`);
      console.log('📋 Summary:');
      summary.forEach(s => {
        console.log(`   • ${s.table}: ${s.prodRows} rows`);
      });
    } else {
      console.log('\n⚠️  MIGRATION COMPLETED WITH WARNINGS\n');
      console.log('Some tables may not match. Please review above.');
    }

    console.log('\n✅ Production database is now ready for deployment!\n');
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await devDb.destroy();
    await prodDb.destroy();
  }
}

run();
