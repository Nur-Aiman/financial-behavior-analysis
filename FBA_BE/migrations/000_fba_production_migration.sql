-- Financial Behavior Analysis - Production Database Migration
-- This SQL script creates all necessary FBA tables in the shared murajaah_tracker_db database
-- Safe to run: It checks if tables exist before creating them
-- No impact on existing tables used by other applications
--
-- Created: 2026-07-06
-- Target: Production Database (murajaah_tracker_db on Render)

-- ============================================================================
-- 1. Create spending_categories table
-- ============================================================================
CREATE TABLE IF NOT EXISTS spending_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DAILY_TIME_BASED', 'USAGE_BASED', 'FIXED_ONE_TIME')),
    allocated_amount_cents BIGINT NOT NULL DEFAULT 0,
    preferred_daily_amount_cents BIGINT,
    expected_amount_cents BIGINT,
    due_date DATE,
    recurring BOOLEAN DEFAULT false,
    protected BOOLEAN DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spending_categories_display_order ON spending_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_spending_categories_active ON spending_categories(active);
CREATE INDEX IF NOT EXISTS idx_spending_categories_type ON spending_categories(type);
CREATE INDEX IF NOT EXISTS idx_spending_categories_created_at ON spending_categories(created_at);

-- ============================================================================
-- 2. Create financial_profiles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(3) NOT NULL DEFAULT 'MYR',
    expected_salary_cents BIGINT,
    opening_balance_cents BIGINT,
    current_balance_cents BIGINT NOT NULL DEFAULT 0,
    salary_cycle_start_date DATE,
    next_payday DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_financial_profiles_created_at ON financial_profiles(created_at);

-- ============================================================================
-- 3. Create transactions table
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID,
    transaction_date DATE NOT NULL,
    description VARCHAR(500),
    type VARCHAR(50) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    source VARCHAR(100),
    amount_cents BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- ============================================================================
-- 4. Create balance_adjustments table
-- ============================================================================
CREATE TABLE IF NOT EXISTS balance_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    previous_balance_cents BIGINT NOT NULL,
    new_balance_cents BIGINT NOT NULL,
    adjustment_amount_cents BIGINT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_balance_adjustments_profile_id ON balance_adjustments(profile_id);
CREATE INDEX IF NOT EXISTS idx_balance_adjustments_created_at ON balance_adjustments(created_at);

-- ============================================================================
-- 5. Create fixed_expense_payments table
-- ============================================================================
CREATE TABLE IF NOT EXISTS fixed_expense_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    expected_amount_cents BIGINT NOT NULL,
    actual_amount_cents BIGINT,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'OVERDUE')),
    transaction_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fixed_expense_payments_category_id ON fixed_expense_payments(category_id);
CREATE INDEX IF NOT EXISTS idx_fixed_expense_payments_status ON fixed_expense_payments(status);
CREATE INDEX IF NOT EXISTS idx_fixed_expense_payments_due_date ON fixed_expense_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_fixed_expense_payments_created_at ON fixed_expense_payments(created_at);

-- ============================================================================
-- 6. Create spending_logs table
-- ============================================================================
CREATE TABLE IF NOT EXISTS spending_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    amount_spent_cents BIGINT NOT NULL,
    log_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_spending_logs_category_id ON spending_logs(category_id);
CREATE INDEX IF NOT EXISTS idx_spending_logs_log_date ON spending_logs(log_date);

-- ============================================================================
-- 7. Create audit_logs table
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- Verification
-- ============================================================================

-- List all created tables
SELECT '\n✅ Migration Complete! Created FBA tables:' AS status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'spending_categories',
    'transactions', 
    'financial_profiles',
    'balance_adjustments',
    'fixed_expense_payments',
    'spending_logs',
    'audit_logs'
)
ORDER BY table_name;

SELECT '\n📊 FBA Tables created successfully!' AS result;
