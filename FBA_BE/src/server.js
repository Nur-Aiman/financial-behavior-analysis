/**
 * Server Entry Point
 * Handles auto-migrations on startup and database initialization
 */

import 'dotenv/config';
import app from './app.js';
import { seedData} from './storage/seed-data.js';
import { store} from './storage/in-memory.store.js';
import { dateToIsoString} from './utils/date.utils.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

// Run migrations on startup
async function runMigrations() {
  if (!USE_REAL_DB) {
    console.log('Skipping migrations - using in-memory database');
    return;}

  try {
    console.log('ðŸ”§ Running database migrations...');
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
    
    const knex = require('knex');
    const knexfile = require('../config/knexfile');
    const env = process.env.NODE_ENV || 'development';
    
    console.log(`   Knex config: Using '${env}' configuration`);
    const db = knex(knexfile[env]);

    // Test connection first
    console.log('   Testing database connection...');
    await db.raw('SELECT 1');
    console.log('   âœ… Database connection successful');

    // Run migrations
    const [batchNo, logs] = await db.migrate.latest();
    console.log(`âœ… Migrations completed. Batch: ${batchNo}, Changes: ${logs.length}`);
    if (logs.length > 0) {
      logs.forEach((log) => console.log(`  - ${log}`));} else {
      console.log('   No new migrations to run');}
    
    await db.destroy();} catch (error) {
    console.error('âŒ Migration error:', error.message);
    console.error('Stack:', error.stack);
    // Don't fail startup, but log the error clearly
    console.warn('âš ï¸  Migrations failed - database tables may not be created!');}}

// Initialize database
async function initializeDatabase() {
  if (USE_REAL_DB) {
    try {
      console.log('ðŸ“¦ Loading data from PostgreSQL...');
      const knex = require('knex');
      const knexfile = require('../config/knexfile');
      const env = process.env.NODE_ENV || 'development';
      console.log(`   Using environment: ${env}`);
      const db = knex(knexfile[env]);
      
      // Load categories from PostgreSQL
      const categories = await db.select('*').from('spending_categories').orderBy('display_order', 'asc');
      categories.forEach((cat) => {
        store.addCategory({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          allocatedAmountCents: parseInt(cat.allocated_amount_cents),
          preferredDailyAmountCents: cat.preferred_daily_amount_cents ? parseInt(cat.preferred_daily_amount_cents) : undefined,
          expectedAmountCents: cat.expected_amount_cents ? parseInt(cat.expected_amount_cents) : undefined,
          dueDate: cat.due_date,
          recurring: cat.recurring,
          protected: cat.protected,
          displayOrder: cat.display_order,
          active: cat.active,
          createdAt: cat.created_at,
          updatedAt: cat.updated_at,});});
      
      console.log(`âœ… Loaded ${categories.length} categories from PostgreSQL`);
      
      // Load financial profile from PostgreSQL
      const profiles = await db.select('*').from('financial_profiles').limit(1);
      if (profiles.length > 0) {
        const profile = profiles[0];
        // Convert date fields to ISO string format, handling both Date objects and strings
        const convertToIsoDate = (dateValue) => {
          if (!dateValue) return dateToIsoString(new Date()); // fallback to today if null
          if (typeof dateValue === 'string') {
            return dateValue.includes('T') ? dateValue.split('T')[0] : dateValue;
          }
          return dateToIsoString(new Date(dateValue));
        };
        
        store.addProfile({
          id: profile.id,
          currency: profile.currency,
          expectedSalaryCents: parseInt(profile.expected_salary_cents),
          openingBalanceCents: parseInt(profile.opening_balance_cents),
          currentBalanceCents: parseInt(profile.current_balance_cents),
          salaryCycleStartDate: convertToIsoDate(profile.salary_cycle_start_date),
          nextPayday: convertToIsoDate(profile.next_payday),
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,});
        console.log(`âœ… Loaded financial profile from PostgreSQL`);}
      
      // Load transactions from PostgreSQL
      const transactions = await db.select('*').from('transactions').orderBy('created_at', 'desc');
      transactions.forEach((tx) => {
        // Convert PostgreSQL date objects to ISO string format
        const transactionDate = typeof tx.transaction_date === 'string' 
          ? tx.transaction_date 
          : dateToIsoString(new Date(tx.transaction_date));
        
        store.addTransaction({
          id: tx.id,
          categoryId: tx.category_id,
          type: tx.type,
          amountCents: parseInt(tx.amount_cents),
          transactionDate,
          merchant: tx.merchant,
          description: tx.description,
          notes: tx.notes,
          source: tx.source,
          linkedFixedExpensePaymentId: tx.linked_fixed_expense_payment_id,
          createdAt: tx.created_at,
          updatedAt: tx.updated_at,});});
      console.log(`âœ… Loaded ${transactions.length} transactions from PostgreSQL`);
      
      // Load balance adjustments from PostgreSQL
      const adjustments = await db.select('*').from('balance_adjustments').orderBy('created_at', 'desc');
      adjustments.forEach((adj) => {
        store.addBalanceAdjustment({
          id: adj.id,
          previousBalanceCents: parseInt(adj.previous_balance_cents),
          newBalanceCents: parseInt(adj.new_balance_cents),
          adjustmentAmountCents: parseInt(adj.adjustment_amount_cents),
          reason: adj.reason,
          createdAt: adj.created_at,});});
      console.log(`âœ… Loaded ${adjustments.length} balance adjustments from PostgreSQL`);
      
      // Load fixed expense payments from PostgreSQL
      const fixedExpenses = await db.select('*').from('fixed_expense_payments').orderBy('created_at', 'desc');
      fixedExpenses.forEach((fp) => {
        // Convert PostgreSQL date objects to ISO string format
        const dueDate = typeof fp.due_date === 'string' 
          ? fp.due_date 
          : dateToIsoString(new Date(fp.due_date));
        
        const paymentDate = fp.payment_date 
          ? (typeof fp.payment_date === 'string' 
            ? fp.payment_date 
            : dateToIsoString(new Date(fp.payment_date)))
          : undefined;
        
        store.addFixedExpensePayment({
          id: fp.id,
          categoryId: fp.category_id,
          expectedAmountCents: parseInt(fp.expected_amount_cents),
          actualAmountCents: fp.actual_amount_cents ? parseInt(fp.actual_amount_cents) : undefined,
          dueDate,
          paymentDate,
          status: fp.status,
          transactionId: fp.transaction_id,
          createdAt: fp.created_at,
          updatedAt: fp.updated_at,});});
      console.log(`✅ Loaded ${fixedExpenses.length} fixed expense payments from PostgreSQL`);
      
      await db.destroy();
    } catch (err) {
      console.error('❌ Error loading from PostgreSQL:', err.message);
      console.log('Falling back to in-memory storage');
    }
  } else {
    console.log('Loading seed data for in-memory storage...');
    seedData();
  }
  
  console.log('Seed data loaded successfully');
}

// Initialize and start server
let server;

(async () => {
  try {
    // Run migrations first if using real database
    await runMigrations();
    
    // Then initialize database
    await initializeDatabase();

    // Start server
    server = app.listen(PORT, () => {
      console.log(`\nâœ… Server running on http://localhost:${PORT}`);
      console.log(`ðŸ“Š API Base URL: http://localhost:${PORT}/api`);
      console.log(`ðŸ¥ Health Check: http://localhost:${PORT}/health`);
      if (!USE_REAL_DB) {
        console.log('ðŸ’¾ Using in-memory storage (data will reset on restart)');
        console.log(`ðŸ”§ Dev endpoints available at http://localhost:${PORT}/api/dev`);}
      console.log('');});

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\nSIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);});});

    process.on('SIGINT', () => {
      console.log('\nSIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);});});

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);});

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);});} catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);}})();

export default server;




