-- ============================================================================
-- FBA Complete Database Schema Setup Script
-- Purpose: Create all tables for Financial Behavior Analysis
-- Created: 2026-07-05
-- Usage: Execute this script in TablePlus or pgAdmin to create schema
-- ============================================================================

-- Create financial_profiles table
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

CREATE INDEX IF NOT EXISTS idx_financial_profiles_created_at ON financial_profiles(created_at);

-- Create spending_categories table
CREATE TYPE spending_category_type AS ENUM ('DAILY_TIME_BASED', 'USAGE_BASED', 'FIXED_ONE_TIME');

CREATE TABLE IF NOT EXISTS spending_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type spending_category_type NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_spending_categories_display_order ON spending_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_spending_categories_active ON spending_categories(active);
CREATE INDEX IF NOT EXISTS idx_spending_categories_type ON spending_categories(type);
CREATE INDEX IF NOT EXISTS idx_spending_categories_created_at ON spending_categories(created_at);

-- Create transactions table
CREATE TYPE transaction_type AS ENUM ('EXPENSE', 'INCOME');

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES spending_categories(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount_cents BIGINT NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    source VARCHAR(50),
    merchant VARCHAR(255),
    notes TEXT,
    linked_fixed_expense_payment_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (linked_fixed_expense_payment_id) REFERENCES fixed_expense_payments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);

-- Create spending_logs table
CREATE TABLE IF NOT EXISTS spending_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES spending_categories(id) ON DELETE CASCADE,
    amount_spent_cents BIGINT NOT NULL,
    log_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_spending_logs_category_id ON spending_logs(category_id);
CREATE INDEX IF NOT EXISTS idx_spending_logs_log_date ON spending_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_spending_logs_created_at ON spending_logs(created_at);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- SEED DATA: Insert initial profile and categories
-- ============================================================================

-- Insert financial profile
INSERT INTO financial_profiles (
    id, currency, expected_salary_cents, opening_balance_cents, 
    current_balance_cents, salary_cycle_start_date, next_payday
) VALUES (
    gen_random_uuid(),
    'RM',
    600000,  -- RM6000
    165200,  -- RM1652
    165200,  -- RM1652
    CURRENT_DATE - INTERVAL '(EXTRACT(day FROM CURRENT_DATE) - 5) days',  -- 5th of current month
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '4 days'  -- 5th of next month
) ON CONFLICT DO NOTHING;

-- Insert spending categories
INSERT INTO spending_categories (
    id, name, type, allocated_amount_cents, preferred_daily_amount_cents, 
    display_order, active
) VALUES 
-- DAILY_TIME_BASED
(gen_random_uuid(), 'Husby food', 'DAILY_TIME_BASED', 60000, 2000, 0, TRUE),
(gen_random_uuid(), 'Shampoo (Husby)', 'DAILY_TIME_BASED', 2500, 83, 1, TRUE),
(gen_random_uuid(), 'Shower soap (Husby)', 'DAILY_TIME_BASED', 2500, 83, 2, TRUE),
-- USAGE_BASED
(gen_random_uuid(), 'Petrol (Husby)', 'USAGE_BASED', 20000, NULL, 3, TRUE),
(gen_random_uuid(), 'Parking fee (Husby)', 'USAGE_BASED', 14000, NULL, 4, TRUE),
-- FIXED_ONE_TIME
(gen_random_uuid(), 'Phone bill (Husby)', 'FIXED_ONE_TIME', 16000, NULL, 5, TRUE),
(gen_random_uuid(), 'Electricity bill', 'FIXED_ONE_TIME', 15000, NULL, 6, TRUE),
(gen_random_uuid(), 'Water bill', 'FIXED_ONE_TIME', 4000, NULL, 7, TRUE),
(gen_random_uuid(), 'Toll (Husby)', 'FIXED_ONE_TIME', 15000, NULL, 8, TRUE),
(gen_random_uuid(), 'Road tax', 'FIXED_ONE_TIME', 6667, NULL, 9, TRUE),
(gen_random_uuid(), 'Haircut (Husby)', 'FIXED_ONE_TIME', 2000, NULL, 10, TRUE),
(gen_random_uuid(), 'Medical card (Husby)', 'FIXED_ONE_TIME', 15000, NULL, 11, TRUE),
(gen_random_uuid(), 'Religious class (Quran)', 'FIXED_ONE_TIME', 10000, NULL, 12, TRUE),
(gen_random_uuid(), 'Parents pocket money (Husby)', 'FIXED_ONE_TIME', 30000, NULL, 13, TRUE),
(gen_random_uuid(), 'EPF, SOCSO, EIS, PCB (Husby)', 'FIXED_ONE_TIME', 96800, NULL, 14, TRUE),
-- USAGE_BASED - Emergency
(gen_random_uuid(), 'Car service (Husby)', 'USAGE_BASED', 30000, NULL, 15, TRUE),
(gen_random_uuid(), 'Car tyre (Emergency)', 'USAGE_BASED', 50000, NULL, 16, TRUE),
(gen_random_uuid(), 'Car battery (Emergency)', 'USAGE_BASED', 30000, NULL, 17, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%profiles%' OR table_name LIKE '%categor%'
ORDER BY table_name;

-- Verify data inserted
SELECT COUNT(*) as profile_count FROM financial_profiles;
SELECT COUNT(*) as category_count FROM spending_categories;
SELECT COUNT(*) as transaction_count FROM transactions;

-- Show financial_profiles structure
\d financial_profiles

-- Show spending_categories structure
\d spending_categories

-- Show all data from financial_profiles
SELECT * FROM financial_profiles LIMIT 1;

-- Show all categories ordered by display_order
SELECT id, name, type, allocated_amount_cents, display_order FROM spending_categories ORDER BY display_order;
