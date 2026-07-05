/**
 * Seed: Initial Financial Profile and Spending Categories
 * Purpose: Populate database with user's financial profile and 19 Husby spending categories
 * Created: 2026-07-05
 */

const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  // Clear existing data (in development only)
  await knex('audit_logs').del();
  await knex('spending_logs').del();
  await knex('transactions').del();
  await knex('spending_categories').del();
  await knex('financial_profiles').del();

  // 1. Create Financial Profile
  const profileId = uuidv4();
  const today = new Date();
  const salaryCycleStart = new Date(today);
  salaryCycleStart.setDate(5); // Start on 5th of month
  const nextPayday = new Date(today);
  nextPayday.setMonth(nextPayday.getMonth() + 1);
  nextPayday.setDate(5); // Next payday on 5th of next month

  const profile = {
    id: profileId,
    currency: 'RM',
    expected_salary_cents: 600000, // RM6000
    opening_balance_cents: 165200, // RM1652
    current_balance_cents: 165200, // RM1652
    salary_cycle_start_date: salaryCycleStart.toISOString().split('T')[0],
    next_payday: nextPayday.toISOString().split('T')[0],
    created_at: new Date(),
    updated_at: new Date(),
  };

  await knex('financial_profiles').insert(profile);
  console.log('✅ Created financial profile');

  // 2. Create Spending Categories (19 total)
  const categories = [
    // DAILY_TIME_BASED (0-3)
    {
      id: uuidv4(),
      name: 'Husby food',
      type: 'DAILY_TIME_BASED',
      allocated_amount_cents: 60000, // RM600
      preferred_daily_amount_cents: 2000, // ~RM20 per day
      display_order: 0,
    },
    {
      id: uuidv4(),
      name: 'Shampoo (Husby)',
      type: 'DAILY_TIME_BASED',
      allocated_amount_cents: 2500, // RM25
      preferred_daily_amount_cents: 83, // ~RM0.83 per day
      display_order: 1,
    },
    {
      id: uuidv4(),
      name: 'Shower soap (Husby)',
      type: 'DAILY_TIME_BASED',
      allocated_amount_cents: 2500, // RM25
      preferred_daily_amount_cents: 83, // ~RM0.83 per day
      display_order: 2,
    },
    // USAGE_BASED (3-5)
    {
      id: uuidv4(),
      name: 'Petrol (Husby)',
      type: 'USAGE_BASED',
      allocated_amount_cents: 20000, // RM200
      protected: true,
      display_order: 3,
    },
    {
      id: uuidv4(),
      name: 'Parking fee (Husby)',
      type: 'USAGE_BASED',
      allocated_amount_cents: 14000, // RM140
      display_order: 4,
    },
    // FIXED_ONE_TIME (5-18)
    {
      id: uuidv4(),
      name: 'Phone bill (Husby)',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 16000, // RM160
      expected_amount_cents: 16000,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 5,
    },
    {
      id: uuidv4(),
      name: 'Electricity bill',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 15000, // RM150
      expected_amount_cents: 15000,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 6,
    },
    {
      id: uuidv4(),
      name: 'Water bill',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 4000, // RM40
      expected_amount_cents: 4000,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 7,
    },
    {
      id: uuidv4(),
      name: 'Toll (Husby)',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 15000, // RM150
      expected_amount_cents: 15000,
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 8,
    },
    {
      id: uuidv4(),
      name: 'Road tax',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 6667, // RM66.67
      expected_amount_cents: 6667,
      due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 9,
    },
    {
      id: uuidv4(),
      name: 'Haircut (Husby)',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 2000, // RM20
      expected_amount_cents: 2000,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 10,
    },
    {
      id: uuidv4(),
      name: 'Medical card (Husby)',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 15000, // RM150
      expected_amount_cents: 15000,
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 11,
    },
    {
      id: uuidv4(),
      name: 'Religious class (Quran)',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 10000, // RM100
      expected_amount_cents: 10000,
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 12,
    },
    {
      id: uuidv4(),
      name: 'Parents pocket money (Husby)',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 30000, // RM300
      expected_amount_cents: 30000,
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 13,
    },
    {
      id: uuidv4(),
      name: 'EPF, SOCSO, EIS, PCB (Husby)',
      type: 'FIXED_ONE_TIME',
      allocated_amount_cents: 96800, // RM968
      expected_amount_cents: 96800,
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurring: true,
      display_order: 14,
    },
    // USAGE_BASED - Emergency (15-17)
    {
      id: uuidv4(),
      name: 'Car service (Husby)',
      type: 'USAGE_BASED',
      allocated_amount_cents: 30000, // RM300 estimated
      display_order: 15,
    },
    {
      id: uuidv4(),
      name: 'Car tyre (Emergency)',
      type: 'USAGE_BASED',
      allocated_amount_cents: 50000, // RM500 estimated
      display_order: 16,
    },
    {
      id: uuidv4(),
      name: 'Car battery (Emergency)',
      type: 'USAGE_BASED',
      allocated_amount_cents: 30000, // RM300 estimated
      display_order: 17,
    },
  ];

  // Add timestamps to all categories
  const categoriesWithTimestamps = categories.map(cat => ({
    ...cat,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await knex('spending_categories').insert(categoriesWithTimestamps);
  console.log(`✅ Created ${categoriesWithTimestamps.length} spending categories`);

  // 3. Create sample transaction for food category
  const foodCategoryId = categoriesWithTimestamps[0].id; // Husby food
  const transaction = {
    id: uuidv4(),
    category_id: foodCategoryId,
    type: 'EXPENSE',
    amount_cents: 20000, // RM200
    description: 'Food expenses',
    transaction_date: today.toISOString().split('T')[0],
    created_at: new Date(),
    updated_at: new Date(),
  };

  await knex('transactions').insert(transaction);
  console.log('✅ Created sample transaction');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`   - 1 Financial Profile created`);
  console.log(`   - 19 Spending Categories created`);
  console.log(`   - 1 Sample Transaction created`);
};
