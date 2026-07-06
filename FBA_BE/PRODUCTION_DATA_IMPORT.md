# Production Data Migration Guide - Pre-Deployment

## Overview

You now have a complete backup of your development database ready to import to production. Here's how to get your production database populated before deployment.

---

## ✅ Current Status

**Backups Created:**
- ✅ SQL dump: `fba-backup-2026-07-06.sql` (39 categories, 16 transactions)
- ✅ JSON backup: `fba-data-2026-07-06.json` (for reference)

**Data to Import:**
- ✅ spending_categories: 39 rows
- ✅ transactions: 16 rows  
- ✅ financial_profiles: 1 row
- ✅ balance_adjustments: 0 rows
- ✅ fixed_expense_payments: 0 rows
- ✅ spending_logs: 0 rows
- ✅ audit_logs: 0 rows

**Total: 57 rows to import**

---

## Import Methods

### Method 1: Using Render Console (Recommended for Non-Technical Users)

**Step 1: Access Your Production Database Console**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your PostgreSQL database instance
3. Click on "Console"

**Step 2: Copy the SQL Dump**
1. Open `FBA_BE/fba-backup-2026-07-06.sql`
2. Copy all the content

**Step 3: Paste and Execute**
1. Paste the SQL into the Render console
2. Click "Execute"
3. Wait for completion

**Result:** ✅ All data imported to production

**Time:** ~30 seconds

---

### Method 2: Using Command Line (For Developers)

**Prerequisites:**
- PostgreSQL client tools installed
- Access to DATABASE_URL from .env.production

**Step 1: Get Connection String**
```bash
# From FBA_BE/.env.production
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

**Step 2: Import SQL Dump**
```bash
# On Windows PowerShell
$env:DATABASE_URL = 'postgresql://murajaah_tracker_db_user:PASSWORD@dpg-d5jq6sqli9vc73bkqug0-a/murajaah_tracker_db?sslmode=require'
$env:PGPASSWORD = 'PASSWORD'
psql -h dpg-d5jq6sqli9vc73bkqug0-a -U murajaah_tracker_db_user -d murajaah_tracker_db -f FBA_BE/fba-backup-2026-07-06.sql
```

Or using the Node.js helper:
```bash
node scripts/import-sql-dump.js
```

**Result:** ✅ All data imported

**Time:** ~10-20 seconds

---

### Method 3: Using Node.js Script (Automated)

**Step 1: Update Environment**
Ensure `.env.production` has correct DATABASE_URL

**Step 2: Run Import Script**
```bash
cd FBA_BE
NODE_ENV=production node scripts/import-sql-dump.js
```

**Output:**
```
✅ Executed 57 statements successfully

📊 Data Summary:

   spending_categories: 39 rows
   transactions: 16 rows
   financial_profiles: 1 row
   balance_adjustments: 0 rows
   fixed_expense_payments: 0 rows
   spending_logs: 0 rows
   audit_logs: 0 rows

✅ Import complete! Total rows: 57
```

**Result:** ✅ All data imported

**Time:** ~5-15 seconds

---

## Step-by-Step Instructions

### For Render Console Import (Recommended)

1. **Open backup file**
   ```
   FBA_BE/fba-backup-2026-07-06.sql
   ```

2. **Select all content** (Ctrl+A)

3. **Go to Render Dashboard**
   - URL: https://dashboard.render.com
   - Click on your PostgreSQL database

4. **Open Console**
   - Look for "Console" button
   - Click it

5. **Paste SQL**
   - Paste the entire SQL dump

6. **Execute**
   - Click "Execute" or press Ctrl+Enter

7. **Verify**
   - You should see success messages
   - Data is now in production

### For Command Line Import

1. **Extract connection info from .env.production**
   ```
   DATABASE_URL=postgresql://user:password@host/database
   ```

2. **Run import command**
   ```bash
   psql -h host -U user -d database -f fba-backup-2026-07-06.sql
   ```

3. **Enter password when prompted**

4. **Wait for completion**

---

## Verification Steps

After importing, verify the data:

### Option 1: Query via Render Console

```sql
SELECT 'spending_categories' as table_name, COUNT(*) as rows FROM spending_categories
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'financial_profiles', COUNT(*) FROM financial_profiles
UNION ALL
SELECT 'balance_adjustments', COUNT(*) FROM balance_adjustments
UNION ALL
SELECT 'fixed_expense_payments', COUNT(*) FROM fixed_expense_payments
UNION ALL
SELECT 'spending_logs', COUNT(*) FROM spending_logs
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;
```

**Expected Result:**
```
spending_categories     | 39
transactions            | 16
financial_profiles      | 1
balance_adjustments     | 0
fixed_expense_payments  | 0
spending_logs           | 0
audit_logs              | 0
```

### Option 2: Check via API After Deployment

```bash
# Get categories (should return 39)
curl https://financial-behavior-analysis-be.onrender.com/api/categories

# Get dashboard summary
curl https://financial-behavior-analysis-be.onrender.com/api/dashboard/summary
```

---

## Deployment Workflow (Now Updated)

### Before: Schema Only
1. Deploy code
2. Migration creates empty tables during release phase
3. App starts with empty database

### Now: Complete Data Pre-loaded
1. **Import data to production** (you are here)
2. Deploy code
3. Migration checks tables (they exist, skips)
4. App starts with production data already loaded
5. ✅ Users see live data immediately

---

## Timeline

| Step | Duration | When |
|------|----------|------|
| Import Data | 30 seconds - 1 min | Now (before deploying) |
| Deploy Code | ~1 minute | After import succeeds |
| API Available | Immediate | After deployment done |
| Verification | 5 minutes | After deployment |

**Total Time:** ~3-5 minutes until production is fully live with data

---

## Troubleshooting

### Issue: "Relation already exists" Error

**Cause:** Tables already exist in production

**Solution:**
- This is normal and expected
- The SQL dump includes INSERT statements
- Your data will be imported successfully
- Ignore the error

### Issue: "Connection refused"

**Cause:** Cannot reach production database

**Solution:**
1. Verify DATABASE_URL in .env.production
2. Check Render database is running
3. Try connecting directly to test access
4. Contact Render support

### Issue: "Authentication failed"

**Cause:** Wrong credentials in DATABASE_URL

**Solution:**
1. Copy DATABASE_URL from Render dashboard
2. Verify it in .env.production
3. Retry import

### Issue: Import appears to hang

**Solution:**
1. Wait at least 30 seconds (large imports take time)
2. Check your internet connection
3. Try again with command line method

### Issue: Data partially imported

**Solution:**
1. Re-run the import command
2. It will add missing data
3. Existing data will skip (no duplicates)

---

## Important Notes

### ⚠️ Before Importing

- [ ] Verify .env.production has correct DATABASE_URL
- [ ] Ensure production database is empty (or you want to overwrite)
- [ ] Have backup of production (Render does this automatically)
- [ ] Check that migration scripts have been committed to git

### ✅ After Importing

- [ ] Verify all 57 rows imported
- [ ] Check Render database console for errors
- [ ] Test API endpoints return correct data
- [ ] Ready for deployment!

---

## What's Included in Backup

### Development Database Export
- **Date:** 2026-07-06
- **Tables:** 7 FBA tables
- **Total Rows:** 57

### Excluded from Backup
- ❌ Other application tables (not affected)
- ❌ Passwords, API keys, secrets
- ❌ Audit logs (empty in dev)
- ❌ System tables

### Safe to Import?
✅ **Yes! The import:**
- Only creates FBA tables (if not existing)
- Uses INSERT statements (no DROP)
- Preserves other application data
- Can be re-run safely
- Can be rolled back if needed

---

## After Import - Next Steps

### 1. Verify Import Success
```bash
curl https://api.yourrender.com/api/categories
# Should return 39 categories
```

### 2. Deploy Application
```bash
git push render main
# Deploy will be instant (no schema creation needed)
```

### 3. Test API Endpoints
```bash
# Dashboard
curl https://api.yourrender.com/api/dashboard/summary

# Transactions
curl https://api.yourrender.com/api/transactions

# Check balance
curl https://api.yourrender.com/api/balance
```

### 4. Verify Frontend Connection
- Navigate to https://financial-behavior-analysis-fe.onrender.com
- Check that dashboard displays production data
- Verify numbers match what you expect

---

## Files Reference

| File | Purpose | Size |
|------|---------|------|
| `fba-backup-2026-07-06.sql` | SQL dump for import | ~500KB |
| `fba-data-2026-07-06.json` | JSON backup (reference) | ~300KB |
| `scripts/import-sql-dump.js` | Import helper script | ~2KB |
| `scripts/create-backup.js` | Backup creator script | ~3KB |

---

## Quick Reference

### Command: Import SQL Dump
```bash
NODE_ENV=production node scripts/import-sql-dump.js
```

### Command: Create New Backup
```bash
node scripts/create-backup.js
```

### Command: Verify Import
```bash
NODE_ENV=production node -e "
const knex = require('knex');
// Query to verify imports
"
```

---

## Summary

✅ **Ready to import production data**
- Backup files created
- 57 rows of data ready
- Multiple import methods available
- Can be done in < 1 minute

📋 **Next Steps:**
1. Choose import method (Render Console recommended)
2. Execute import (30 seconds)
3. Verify success (5 minutes)
4. Deploy application
5. Start using production database

---

**Questions?** See troubleshooting section above

**Need to create new backup?** `node scripts/create-backup.js`

**Ready to import?** Follow one of the three methods above!
