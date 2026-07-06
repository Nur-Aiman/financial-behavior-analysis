/**
 * Migration Runner for Production Database
 * 
 * Usage:
 * - Development: node scripts/migrate-db.js
 * - Production: DATABASE_URL=<prod_url> node scripts/migrate-db.js
 * 
 * This script runs all migrations safely:
 * - Checks for existing tables before creating
 * - Uses CREATE TABLE IF NOT EXISTS pattern
 * - No impact on existing tables
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import knex from 'knex';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment - try .env.production first, then .env
const prodEnvPath = path.join(__dirname, '..', '.env.production');
const devEnvPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(prodEnvPath) && process.env.NODE_ENV === 'production') {
  dotenv.config({ path: prodEnvPath });
  console.log('📂 Loaded .env.production');
} else {
  dotenv.config({ path: devEnvPath });
  console.log('📂 Loaded .env');
}

const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'financial-behavior-analysis'}`;

console.log('🚀 Starting database migration...');
console.log(`📍 Database: ${connectionString.includes('@') ? connectionString.split('@')[1] : 'local'}`);

// Create Knex instance
const db = knex({
  client: 'pg',
  connection: connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  acquireConnectionTimeout: 10000,
});

async function createTablesIfNotExist() {
  try {
    console.log('\n📝 Checking and creating tables...\n');

    // Table: spending_categories
    const hasSpendingCategories = await db.schema.hasTable('spending_categories');
    if (!hasSpendingCategories) {
      console.log('📊 Creating spending_categories...');
      await db.schema.createTable('spending_categories', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
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
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        table.index(['display_order']);
        table.index(['active']);
        table.index(['type']);
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️  Already exists');
    }

    // Table: financial_profiles
    const hasFinancialProfiles = await db.schema.hasTable('financial_profiles');
    if (!hasFinancialProfiles) {
      console.log('📊 Creating financial_profiles...');
      await db.schema.createTable('financial_profiles', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.string('currency', 3).notNullable().defaultTo('MYR');
        table.bigInteger('expected_salary_cents').nullable();
        table.bigInteger('opening_balance_cents').nullable();
        table.bigInteger('current_balance_cents').notNullable().defaultTo(0);
        table.date('salary_cycle_start_date').nullable();
        table.date('next_payday').nullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        table.index(['created_at']);
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️  Already exists');
    }

    // Table: transactions
    const hasTransactions = await db.schema.hasTable('transactions');
    if (!hasTransactions) {
      console.log('📊 Creating transactions...');
      await db.schema.createTable('transactions', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('category_id').nullable();
        table.date('transaction_date').notNullable();
        table.string('description', 500).nullable();
        table.enum('type', ['INCOME', 'EXPENSE']).notNullable().defaultTo('EXPENSE');
        table.string('source', 100).nullable();
        table.bigInteger('amount_cents').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        table.index('category_id');
        table.index('transaction_date');
        table.index('type');
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️  Already exists');
    }

    // Table: balance_adjustments
    const hasBalanceAdjustments = await db.schema.hasTable('balance_adjustments');
    if (!hasBalanceAdjustments) {
      console.log('📊 Creating balance_adjustments...');
      await db.schema.createTable('balance_adjustments', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('profile_id').notNullable();
        table.bigInteger('previous_balance_cents').notNullable();
        table.bigInteger('new_balance_cents').notNullable();
        table.bigInteger('adjustment_amount_cents').notNullable();
        table.string('reason', 255).nullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        table.index('profile_id');
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️  Already exists');
    }

    // Table: fixed_expense_payments
    const hasFixedExpensePayments = await db.schema.hasTable('fixed_expense_payments');
    if (!hasFixedExpensePayments) {
      console.log('📊 Creating fixed_expense_payments...');
      await db.schema.createTable('fixed_expense_payments', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('category_id').notNullable();
        table.bigInteger('expected_amount_cents').notNullable();
        table.bigInteger('actual_amount_cents').nullable();
        table.date('due_date').notNullable();
        table.date('payment_date').nullable();
        table.enum('status', ['UNPAID', 'PAID', 'OVERDUE']).notNullable().defaultTo('UNPAID');
        table.uuid('transaction_id').nullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        table.index('category_id');
        table.index('status');
        table.index('due_date');
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️  Already exists');
    }

    // Table: spending_logs
    const hasSpendingLogs = await db.schema.hasTable('spending_logs');
    if (!hasSpendingLogs) {
      console.log('📊 Creating spending_logs...');
      await db.schema.createTable('spending_logs', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.uuid('category_id').notNullable();
        table.bigInteger('amount_spent_cents').notNullable();
        table.date('log_date').notNullable();
        table.text('notes').nullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        table.index('category_id');
        table.index('log_date');
        table.unique(['category_id', 'log_date']);
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️  Already exists');
    }

    // Table: audit_logs
    const hasAuditLogs = await db.schema.hasTable('audit_logs');
    if (!hasAuditLogs) {
      console.log('📊 Creating audit_logs...');
      await db.schema.createTable('audit_logs', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.string('action', 50).notNullable();
        table.string('entity_type', 100).notNullable();
        table.uuid('entity_id').notNullable();
        table.json('old_values').nullable();
        table.json('new_values').nullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.index('entity_type');
        table.index('entity_id');
        table.index('action');
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️  Already exists');
    }

    console.log('\n✅ All FBA tables ready in database!');

  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    throw error;
  }
}

async function run() {
  try {
    await createTablesIfNotExist();
    console.log('\n🎉 Database migration completed successfully!\n');
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

run();
