-- ============================================================================
-- ADD MISSING TRANSACTION COLUMNS TO PRODUCTION DATABASE
-- ============================================================================
-- Purpose: Add source, merchant, notes, and linked_fixed_expense_payment_id 
--          columns to transactions table
-- Database: murajaah_tracker_db (Production on Render)
-- Usage: Copy entire script and paste into TablePlus → Run All
-- ============================================================================

-- Step 1: Add missing columns to transactions table
ALTER TABLE transactions
ADD COLUMN source VARCHAR(50),
ADD COLUMN merchant VARCHAR(255),
ADD COLUMN notes TEXT,
ADD COLUMN linked_fixed_expense_payment_id UUID;

-- Step 2: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);

-- Step 3: Add foreign key for linked_fixed_expense_payment_id
-- (this assumes fixed_expense_payments table exists)
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_fixed_expense_payment 
  FOREIGN KEY (linked_fixed_expense_payment_id) 
  REFERENCES fixed_expense_payments(id) 
  ON DELETE SET NULL;

-- Step 4: Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the columns were added:
-- SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'source';
-- SELECT * FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position;
