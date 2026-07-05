/**
 * Migration: Create Initial FBA Schema
 * Purpose: Create all initial tables for Financial Behavior Analysis
 * Created: 2026-07-05
 */

exports.up = async function(knex) {
  // Create financial_profiles table
  await knex.schema.createTable('financial_profiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('currency', 3).notNullable().defaultTo('RM');
    table.bigInteger('expected_salary_cents').nullable();
    table.bigInteger('opening_balance_cents').nullable();
    table.bigInteger('current_balance_cents').notNullable();
    table.date('salary_cycle_start_date').nullable();
    table.date('next_payday').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    table.index(['created_at']);
  });

  // Create spending_categories table
  await knex.schema.createTable('spending_categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.enum('type', ['DAILY_TIME_BASED', 'USAGE_BASED', 'FIXED_ONE_TIME']).notNullable();
    table.bigInteger('allocated_amount_cents').notNullable();
    table.bigInteger('preferred_daily_amount_cents').nullable();
    table.bigInteger('expected_amount_cents').nullable();
    table.date('due_date').nullable();
    table.boolean('recurring').defaultTo(false);
    table.boolean('protected').defaultTo(false);
    table.integer('display_order').notNullable().defaultTo(0);
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    table.index(['display_order']);
    table.index(['active']);
    table.index(['type']);
    table.index(['created_at']);
  });

  // Create transactions table
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('category_id').notNullable();
    table.enum('type', ['EXPENSE', 'INCOME']).notNullable();
    table.bigInteger('amount_cents').notNullable();
    table.text('description').nullable();
    table.date('transaction_date').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    table.foreign('category_id').references('id').inTable('spending_categories').onDelete('CASCADE');
    table.index(['category_id']);
    table.index(['transaction_date']);
    table.index(['type']);
    table.index(['created_at']);
  });

  // Create spending_logs table (for tracking daily spending)
  await knex.schema.createTable('spending_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('category_id').notNullable();
    table.bigInteger('amount_spent_cents').notNullable();
    table.date('log_date').notNullable();
    table.text('notes').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    table.foreign('category_id').references('id').inTable('spending_categories').onDelete('CASCADE');
    table.index(['category_id']);
    table.index(['log_date']);
    table.index(['created_at']);
    table.unique(['category_id', 'log_date']); // One entry per category per day
  });

  // Create audit_logs table (for tracking changes)
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('action', 50).notNullable(); // CREATE, UPDATE, DELETE
    table.string('entity_type', 100).notNullable(); // financial_profile, spending_category, etc.
    table.uuid('entity_id').notNullable();
    table.json('old_values').nullable();
    table.json('new_values').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    table.index(['entity_type']);
    table.index(['entity_id']);
    table.index(['action']);
    table.index(['created_at']);
  });

  console.log('✅ Created all initial tables for FBA');
};

exports.down = async function(knex) {
  // Drop tables in reverse order (respecting foreign key dependencies)
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('spending_logs');
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('spending_categories');
  await knex.schema.dropTableIfExists('financial_profiles');
  
  console.log('✅ Dropped all initial tables for FBA');
};
