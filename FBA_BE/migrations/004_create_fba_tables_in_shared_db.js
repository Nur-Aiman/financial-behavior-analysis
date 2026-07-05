/**
 * Migration: Create FBA Tables in Shared Database
 * This migration creates all necessary tables for the Financial Behavior Analysis project
 * in the shared murajaah_tracker database
 */

exports.up = async (knex) => {
  // Check if tables already exist to avoid errors
  const hasSpendingCategories = await knex.schema.hasTable('spending_categories');
  
  if (!hasSpendingCategories) {
    console.log('Creating spending_categories table...');
    await knex.schema.createTable('spending_categories', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name', 255).notNullable();
      table.enum('type', [
        'DAILY_TIME_BASED',
        'MONTHLY_SUBSCRIPTION',
        'FIXED_ONE_TIME',
        'VARIABLE_USAGE',
      ]).notNullable();
      table.bigInteger('allocated_amount_cents').notNullable().defaultTo(0);
      table.bigInteger('preferred_daily_amount_cents').nullable();
      table.bigInteger('expected_amount_cents').nullable();
      table.date('due_date').nullable();
      table.boolean('recurring').defaultTo(false);
      table.boolean('protected').defaultTo(false);
      table.integer('display_order').notNullable().defaultTo(0);
      table.boolean('active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }

  const hasTransactions = await knex.schema.hasTable('transactions');
  if (!hasTransactions) {
    console.log('Creating transactions table...');
    await knex.schema.createTable('transactions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('category_id').notNullable().references('id').inTable('spending_categories').onDelete('CASCADE');
      table.date('transaction_date').notNullable();
      table.string('description', 500).nullable();
      table.enum('type', ['INCOME', 'EXPENSE', 'TRANSFER']).notNullable().defaultTo('EXPENSE');
      table.bigInteger('amount_cents').notNullable();
      table.string('payment_method', 100).nullable();
      table.string('notes', 500).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('category_id');
      table.index('transaction_date');
    });
  }

  const hasFinancialProfiles = await knex.schema.hasTable('financial_profiles');
  if (!hasFinancialProfiles) {
    console.log('Creating financial_profiles table...');
    await knex.schema.createTable('financial_profiles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('total_monthly_income_cents').notNullable().defaultTo(0);
      table.bigInteger('emergency_fund_target_cents').notNullable().defaultTo(0);
      table.bigInteger('emergency_fund_current_cents').notNullable().defaultTo(0);
      table.date('salary_cycle_start_date').nullable();
      table.date('next_payday').nullable();
      table.string('currency', 3).defaultTo('MYR');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }

  const hasBalanceAdjustments = await knex.schema.hasTable('balance_adjustments');
  if (!hasBalanceAdjustments) {
    console.log('Creating balance_adjustments table...');
    await knex.schema.createTable('balance_adjustments', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('profile_id').notNullable().references('id').inTable('financial_profiles').onDelete('CASCADE');
      table.string('adjustment_type', 100).notNullable();
      table.bigInteger('amount_cents').notNullable();
      table.string('reason', 500).nullable();
      table.timestamp('adjusted_at').defaultTo(knex.fn.now());
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index('profile_id');
    });
  }

  const hasFixedExpensePayments = await knex.schema.hasTable('fixed_expense_payments');
  if (!hasFixedExpensePayments) {
    console.log('Creating fixed_expense_payments table...');
    await knex.schema.createTable('fixed_expense_payments', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('category_id').notNullable().references('id').inTable('spending_categories').onDelete('CASCADE');
      table.date('payment_date').notNullable();
      table.bigInteger('amount_paid_cents').notNullable();
      table.string('payment_method', 100).nullable();
      table.string('notes', 500).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('category_id');
      table.index('payment_date');
    });
  }

  const hasAuditLogs = await knex.schema.hasTable('audit_logs');
  if (!hasAuditLogs) {
    console.log('Creating audit_logs table...');
    await knex.schema.createTable('audit_logs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('action', 100).notNullable();
      table.string('entity_type', 100).notNullable();
      table.uuid('entity_id').nullable();
      table.json('changes').nullable();
      table.string('user_id', 100).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index('entity_type');
      table.index('created_at');
    });
  }

  const hasSpendingLogs = await knex.schema.hasTable('spending_logs');
  if (!hasSpendingLogs) {
    console.log('Creating spending_logs table...');
    await knex.schema.createTable('spending_logs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('category_id').notNullable().references('id').inTable('spending_categories').onDelete('CASCADE');
      table.date('log_date').notNullable();
      table.bigInteger('amount_spent_cents').notNullable().defaultTo(0);
      table.bigInteger('amount_remaining_cents').notNullable().defaultTo(0);
      table.string('notes', 500).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('category_id');
      table.index('log_date');
    });
  }

  console.log('All FBA tables created successfully!');
};

exports.down = async (knex) => {
  // Drop tables in reverse order of creation (due to foreign key constraints)
  console.log('Rolling back FBA tables...');
  
  await knex.schema.dropTableIfExists('spending_logs');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('fixed_expense_payments');
  await knex.schema.dropTableIfExists('balance_adjustments');
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('financial_profiles');
  await knex.schema.dropTableIfExists('spending_categories');
  
  console.log('FBA tables rolled back successfully!');
};
