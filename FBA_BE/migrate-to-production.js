/**
 * Migration Script: Migrate FBA Tables to Production Database
 * 
 * This script:
 * 1. Reads production database connection from .env.production
 * 2. Connects to the production database
 * 3. Runs migrations to create FBA tables (safely, checking for existing tables)
 * 4. Does NOT impact other application tables
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import knex from 'knex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load production environment
dotenv.config({ path: path.join(__dirname, '.env.production') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.production');
  process.exit(1);
}

console.log('🚀 Starting production database migration...');
console.log(`📍 Target Database: ${process.env.DATABASE_URL.split('@')[1].split('/')[1] || 'production'}`);

// Create Knex instance for production
const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * Migration Up: Create FBA Tables in Shared Database
 */
async function migrateUp() {
  try {
    console.log('\n📝 Running migrations...\n');

    // Check if tables already exist to avoid errors
    const hasSpendingCategories = await db.schema.hasTable('spending_categories');
    
    if (!hasSpendingCategories) {
      console.log('📊 Creating spending_categories table...');
      await db.schema.createTable('spending_categories', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.string('name', 255).notNullable();
        table.enum('type', [
          'DAILY_TIME_BASED',
          'USAGE_BASED',
          'FIXED_ONE_TIME',
        ]).notNullable();
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
      console.log('   ✅ spending_categories created');
    } else {
      console.log('   ⏭️  spending_categories already exists, skipping...');
    }

    const hasTransactions = await db.schema.hasTable('transactions');
    if (!hasTransactions) {
      console.log('📊 Creating transactions table...');
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
      console.log('   ✅ transactions created');
    } else {
      console.log('   ⏭️  transactions already exists, skipping...');
    }

    const hasFinancialProfiles = await db.schema.hasTable('financial_profiles');
    if (!hasFinancialProfiles) {
      console.log('📊 Creating financial_profiles table...');
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
      console.log('   ✅ financial_profiles created');
    } else {
      console.log('   ⏭️  financial_profiles already exists, skipping...');
    }

    const hasBalanceAdjustments = await db.schema.hasTable('balance_adjustments');
    if (!hasBalanceAdjustments) {
      console.log('📊 Creating balance_adjustments table...');
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
        table.index(['created_at']);
      });
      console.log('   ✅ balance_adjustments created');
    } else {
      console.log('   ⏭️  balance_adjustments already exists, skipping...');
    }

    const hasFixedExpensePayments = await db.schema.hasTable('fixed_expense_payments');
    if (!hasFixedExpensePayments) {
      console.log('📊 Creating fixed_expense_payments table...');
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
      console.log('   ✅ fixed_expense_payments created');
    } else {
      console.log('   ⏭️  fixed_expense_payments already exists, skipping...');
    }

    const hasAuditLogs = await db.schema.hasTable('audit_logs');
    if (!hasAuditLogs) {
      console.log('📊 Creating audit_logs table...');
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
      console.log('   ✅ audit_logs created');
    } else {
      console.log('   ⏭️  audit_logs already exists, skipping...');
    }

    const hasSpendingLogs = await db.schema.hasTable('spending_logs');
    if (!hasSpendingLogs) {
      console.log('📊 Creating spending_logs table...');
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
      console.log('   ✅ spending_logs created');
    } else {
      console.log('   ⏭️  spending_logs already exists, skipping...');
    }

    console.log('\n✅ All FBA tables created successfully in production database!');
    console.log('\n📊 Production Database Tables:');
    console.log('   - spending_categories');
    console.log('   - transactions');
    console.log('   - financial_profiles');
    console.log('   - balance_adjustments');
    console.log('   - fixed_expense_payments');
    console.log('   - audit_logs');
    console.log('   - spending_logs');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run migration
migrateUp();
