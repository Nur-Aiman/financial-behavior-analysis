/**
 * Migration: Add Missing Transaction Columns
 * Purpose: Add merchant, notes, source, and linked_fixed_expense_payment_id columns to transactions table
 * Created: 2026-07-05
 */

exports.up = async function(knex) {
  // Add missing columns to transactions table
  await knex.schema.alterTable('transactions', (table) => {
    table.string('merchant', 255).nullable();
    table.text('notes').nullable();
    table.string('source', 50).nullable();
    table.uuid('linked_fixed_expense_payment_id').nullable();
  });

  console.log('✅ Added missing columns to transactions table');
};

exports.down = async function(knex) {
  // Drop added columns
  await knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('merchant');
    table.dropColumn('notes');
    table.dropColumn('source');
    table.dropColumn('linked_fixed_expense_payment_id');
  });

  console.log('✅ Rolled back missing columns from transactions table');
};
