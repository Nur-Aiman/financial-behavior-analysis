/**
 * Migration: Create Balance Adjustments and Fixed Expense Payments Tables
 * Purpose: Add balance_adjustments and fixed_expense_payments tables
 * Created: 2026-07-05
 */

exports.up = async function(knex) {
  // Create balance_adjustments table
  await knex.schema.createTable('balance_adjustments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('profile_id').notNullable();
    table.bigInteger('previous_balance_cents').notNullable();
    table.bigInteger('new_balance_cents').notNullable();
    table.bigInteger('adjustment_amount_cents').notNullable();
    table.string('reason', 255).nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    table.foreign('profile_id').references('id').inTable('financial_profiles').onDelete('CASCADE');
    table.index(['profile_id']);
    table.index(['created_at']);
  });

  // Create fixed_expense_payments table
  await knex.schema.createTable('fixed_expense_payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('category_id').notNullable();
    table.bigInteger('expected_amount_cents').notNullable();
    table.bigInteger('actual_amount_cents').nullable();
    table.date('due_date').notNullable();
    table.date('payment_date').nullable();
    table.enum('status', ['UNPAID', 'PAID']).notNullable().defaultTo('UNPAID');
    table.uuid('transaction_id').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    table.foreign('category_id').references('id').inTable('spending_categories').onDelete('CASCADE');
    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('SET NULL');
    table.index(['category_id']);
    table.index(['status']);
    table.index(['due_date']);
    table.index(['created_at']);
  });

  console.log('✅ Created balance_adjustments and fixed_expense_payments tables');
};

exports.down = async function(knex) {
  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('fixed_expense_payments');
  await knex.schema.dropTableIfExists('balance_adjustments');

  console.log('✅ Rolled back balance_adjustments and fixed_expense_payments tables');
};
