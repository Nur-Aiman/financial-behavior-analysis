-- ============================================================================
-- FINANCIAL BEHAVIOR ANALYSIS (FBA) - MANUAL DATABASE IMPORT FOR TABLEPLUS
-- ============================================================================
-- Purpose: Create all FBA tables and insert seed data into production database
-- Usage: Copy entire script and paste into TablePlus → Run All
-- Database: murajaah_tracker_db (Production on Render)
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP EXISTING TABLES (if re-importing)
-- ============================================================================
-- Uncomment the lines below ONLY if you want to delete existing FBA data
-- DROP TABLE IF EXISTS fixed_expense_payments;
-- DROP TABLE IF EXISTS balance_adjustments;
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TABLE IF EXISTS spending_logs;
-- DROP TABLE IF EXISTS transactions;
-- DROP TABLE IF EXISTS spending_categories;
-- DROP TABLE IF EXISTS financial_profiles;

-- ============================================================================
-- STEP 2: CREATE ALL TABLES
-- ============================================================================

-- Table 1: financial_profiles
CREATE TABLE IF NOT EXISTS financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency VARCHAR(3) NOT NULL DEFAULT 'RM',
  expected_salary_cents BIGINT,
  opening_balance_cents BIGINT,
  current_balance_cents BIGINT NOT NULL,
  salary_cycle_start_date DATE,
  next_payday DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_financial_profiles_created_at ON financial_profiles(created_at);

-- Table 2: spending_categories
CREATE TABLE IF NOT EXISTS spending_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('DAILY_TIME_BASED', 'USAGE_BASED', 'FIXED_ONE_TIME')),
  allocated_amount_cents BIGINT NOT NULL,
  preferred_daily_amount_cents BIGINT,
  expected_amount_cents BIGINT,
  due_date DATE,
  recurring BOOLEAN DEFAULT FALSE,
  protected BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_spending_categories_display_order ON spending_categories(display_order);
CREATE INDEX idx_spending_categories_active ON spending_categories(active);
CREATE INDEX idx_spending_categories_type ON spending_categories(type);
CREATE INDEX idx_spending_categories_created_at ON spending_categories(created_at);

-- Table 3: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
  amount_cents BIGINT NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES spending_categories(id) ON DELETE CASCADE
);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Table 4: spending_logs
CREATE TABLE IF NOT EXISTS spending_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL,
  amount_spent_cents BIGINT NOT NULL,
  log_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES spending_categories(id) ON DELETE CASCADE,
  UNIQUE(category_id, log_date)
);
CREATE INDEX idx_spending_logs_category_id ON spending_logs(category_id);
CREATE INDEX idx_spending_logs_log_date ON spending_logs(log_date);
CREATE INDEX idx_spending_logs_created_at ON spending_logs(created_at);

-- Table 5: balance_adjustments
CREATE TABLE IF NOT EXISTS balance_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  previous_balance_cents BIGINT NOT NULL,
  new_balance_cents BIGINT NOT NULL,
  adjustment_amount_cents BIGINT NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES financial_profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_balance_adjustments_profile_id ON balance_adjustments(profile_id);
CREATE INDEX idx_balance_adjustments_created_at ON balance_adjustments(created_at);

-- Table 6: fixed_expense_payments
CREATE TABLE IF NOT EXISTS fixed_expense_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL,
  expected_amount_cents BIGINT NOT NULL,
  actual_amount_cents BIGINT,
  due_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID')),
  transaction_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES spending_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);
CREATE INDEX idx_fixed_expense_payments_category_id ON fixed_expense_payments(category_id);
CREATE INDEX idx_fixed_expense_payments_status ON fixed_expense_payments(status);
CREATE INDEX idx_fixed_expense_payments_due_date ON fixed_expense_payments(due_date);
CREATE INDEX idx_fixed_expense_payments_created_at ON fixed_expense_payments(created_at);

-- Table 7: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- STEP 3: INSERT SEED DATA
-- ============================================================================

-- Insert Financial Profile
INSERT INTO financial_profiles (id, currency, expected_salary_cents, opening_balance_cents, current_balance_cents, salary_cycle_start_date, next_payday, created_at, updated_at)
VALUES (
  'd1a5e7f0-1234-4567-8901-234567890abc',
  'RM',
  600000,      -- RM 6,000
  165200,      -- RM 1,652
  165200,      -- RM 1,652
  '2026-07-05',
  '2026-08-05',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Insert Spending Categories (19 total)
INSERT INTO spending_categories (id, name, type, allocated_amount_cents, preferred_daily_amount_cents, expected_amount_cents, due_date, recurring, protected, display_order, active, created_at, updated_at)
VALUES
-- DAILY_TIME_BASED (0-3)
('c1a5e7f0-1234-4567-8901-234567890001', 'Husby food', 'DAILY_TIME_BASED', 60000, 2000, NULL, NULL, FALSE, FALSE, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890002', 'Shampoo (Husby)', 'DAILY_TIME_BASED', 2500, 83, NULL, NULL, FALSE, FALSE, 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890003', 'Shower soap (Husby)', 'DAILY_TIME_BASED', 2500, 83, NULL, NULL, FALSE, FALSE, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- USAGE_BASED (3-5)
('c1a5e7f0-1234-4567-8901-234567890004', 'Petrol (Husby)', 'USAGE_BASED', 20000, NULL, NULL, NULL, FALSE, TRUE, 3, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890005', 'Parking fee (Husby)', 'USAGE_BASED', 14000, NULL, NULL, NULL, FALSE, FALSE, 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- FIXED_ONE_TIME (5-18)
('c1a5e7f0-1234-4567-8901-234567890006', 'Phone bill (Husby)', 'FIXED_ONE_TIME', 16000, NULL, 16000, '2026-07-11', TRUE, FALSE, 5, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890007', 'Electricity bill', 'FIXED_ONE_TIME', 15000, NULL, 15000, '2026-07-16', TRUE, FALSE, 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890008', 'Water bill', 'FIXED_ONE_TIME', 4000, NULL, 4000, '2026-07-16', TRUE, FALSE, 7, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890009', 'Toll (Husby)', 'FIXED_ONE_TIME', 15000, NULL, 15000, '2026-07-21', TRUE, FALSE, 8, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890010', 'Road tax', 'FIXED_ONE_TIME', 6667, NULL, 6667, '2026-07-26', TRUE, FALSE, 9, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890011', 'Haircut (Husby)', 'FIXED_ONE_TIME', 2000, NULL, 2000, '2026-08-05', TRUE, FALSE, 10, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890012', 'Medical card (Husby)', 'FIXED_ONE_TIME', 15000, NULL, 15000, '2026-07-21', TRUE, FALSE, 11, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890013', 'Religious class (Quran)', 'FIXED_ONE_TIME', 10000, NULL, 10000, '2026-07-07', TRUE, FALSE, 12, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890014', 'Parents pocket money (Husby)', 'FIXED_ONE_TIME', 30000, NULL, 30000, '2026-07-07', TRUE, FALSE, 13, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890015', 'EPF, SOCSO, EIS, PCB (Husby)', 'FIXED_ONE_TIME', 96800, NULL, 96800, '2026-07-07', TRUE, FALSE, 14, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- USAGE_BASED - Emergency (15-17)
('c1a5e7f0-1234-4567-8901-234567890016', 'Car service (Husby)', 'USAGE_BASED', 30000, NULL, NULL, NULL, FALSE, FALSE, 15, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890017', 'Car tyre (Emergency)', 'USAGE_BASED', 50000, NULL, NULL, NULL, FALSE, FALSE, 16, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1a5e7f0-1234-4567-8901-234567890018', 'Car battery (Emergency)', 'USAGE_BASED', 30000, NULL, NULL, NULL, FALSE, FALSE, 17, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Insert Sample Transaction
INSERT INTO transactions (id, category_id, type, amount_cents, description, transaction_date, created_at, updated_at)
VALUES (
  't1a5e7f0-1234-4567-8901-234567890001',
  'c1a5e7f0-1234-4567-8901-234567890001',  -- Husby food
  'EXPENSE',
  20000,  -- RM 200
  'Food expenses',
  CURRENT_DATE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after import to verify data)
-- ============================================================================

-- Query 1: Count tables and rows
SELECT 'financial_profiles' as table_name, COUNT(*) as row_count FROM financial_profiles
UNION ALL
SELECT 'spending_categories', COUNT(*) FROM spending_categories
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'spending_logs', COUNT(*) FROM spending_logs
UNION ALL
SELECT 'balance_adjustments', COUNT(*) FROM balance_adjustments
UNION ALL
SELECT 'fixed_expense_payments', COUNT(*) FROM fixed_expense_payments
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- Query 2: Show financial profile
SELECT * FROM financial_profiles;

-- Query 3: Show all categories
SELECT id, name, type, allocated_amount_cents, display_order FROM spending_categories ORDER BY display_order;

-- Query 4: Show all transactions
SELECT t.*, sc.name as category_name FROM transactions t LEFT JOIN spending_categories sc ON t.category_id = sc.id;

-- ============================================================================
-- NOTES FOR TABLEPLUS IMPORT
-- ============================================================================
-- 1. Copy the entire script above
-- 2. Open TablePlus and connect to your production database (murajaah_tracker_db)
-- 3. Click on "Query" → "New Query" (or Cmd+K)
-- 4. Paste the entire script
-- 5. Click "Run All" (or Cmd+Enter)
-- 6. Tables will be created if they don't exist
-- 7. Seed data will be inserted if not already present
-- 8. Run the VERIFICATION QUERIES to confirm success
-- 
-- IMPORTANT: IF YOU WANT TO DELETE EXISTING DATA AND START FRESH:
-- 1. Uncomment the DROP TABLE statements at the top
-- 2. Re-run the entire script
-- 3. This will delete ALL existing FBA data - use with caution!
-- ============================================================================
