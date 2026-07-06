/**
 * Migration: Add Use Calculated Balance Field
 * Purpose: Add use_calculated_balance column to financial_profiles table
 * This allows users to toggle between current balance and calculated balance (salary - spent)
 * Created: 2026-07-07
 */

exports.up = async function(knex) {
  // Add use_calculated_balance column to financial_profiles table
  await knex.schema.alterTable('financial_profiles', (table) => {
    table.boolean('use_calculated_balance').defaultTo(false).nullable();
  });

  console.log('✅ Added use_calculated_balance column to financial_profiles table');
};

exports.down = async function(knex) {
  // Drop the column
  await knex.schema.alterTable('financial_profiles', (table) => {
    table.dropColumn('use_calculated_balance');
  });

  console.log('✅ Rolled back use_calculated_balance column from financial_profiles table');
};
