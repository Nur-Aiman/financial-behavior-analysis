# Production Database Migration Guide

## Overview

This guide explains the database migration process from development to production for the Financial Behavior Analysis backend.

**Current Status:**
- ✅ Development database: Local PostgreSQL at `localhost:5432`
- ✅ Production database: Render managed PostgreSQL (shared database)
- ✅ Migration scripts created and ready

---

## Database Configuration

### Development Database (.env)
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=financial-behavior-analysis
DB_PORT=5432
USE_REAL_DB=true
```

### Production Database (.env.production)
```
DATABASE_URL=postgresql://murajaah_tracker_db_user:w6GCWLnwk5V1XTlfMejPl6SGcD8iwre7@dpg-d5jq6sqli9vc73bkqug0-a/murajaah_tracker_db?sslmode=require
NODE_ENV=production
USE_REAL_DB=true
```

---

## FBA Tables Created

The migration process creates the following tables in production:

1. **spending_categories** - User spending categories with allocations and rules
2. **transactions** - Income and expense transactions
3. **financial_profiles** - User financial profile (salary, balance, payday)
4. **balance_adjustments** - History of balance changes
5. **fixed_expense_payments** - Fixed expense tracking (utilities, subscriptions)
6. **spending_logs** - Daily spending logs by category
7. **audit_logs** - Audit trail of all changes

### Safe Migration Design

✅ All tables use `CREATE TABLE IF NOT EXISTS` pattern
✅ No DROP operations - existing tables in shared database are preserved
✅ UUID primary keys with proper indexing
✅ Foreign key relationships maintained
✅ Unique constraints on category + date combinations

---

## Migration Approaches

### Option 1: Automatic Migration (Recommended for Render)

**When deploying to Render, the migration runs automatically:**

1. Update `.env.production` with production DATABASE_URL
2. Commit all code changes
3. Push to Render (or manually trigger deployment)
4. Render automatically:
   - Runs `release: node scripts/migrate-db.js` (Procfile)
   - Then starts `web: node src/server.js`
5. ✅ Tables are created in production database
6. ✅ API starts with production database

**Timeline:**
- Migration: ~2-5 seconds (first run) or instant (if tables exist)
- Startup: ~3-5 seconds
- Total deployment time: ~1 minute

### Option 2: Manual SQL Migration (For Direct DB Access)

If you need to run SQL directly:

**Step 1: Connect to production database**
```bash
# Using psql or similar tool
psql postgresql://murajaah_tracker_db_user:PASSWORD@HOST/murajaah_tracker_db
```

**Step 2: Execute migration SQL**
```bash
# Run the SQL migration file
\i migrations/000_fba_production_migration.sql
```

Or copy-paste the SQL from `migrations/000_fba_production_migration.sql` into your database client.

### Option 3: Node.js Migration Script (For Local Testing)

```bash
# Test against production
NODE_ENV=production node scripts/migrate-db.js
```

---

## Verification

After migration, verify tables were created:

```bash
# Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

# Count rows in each FBA table
SELECT 'spending_categories' as table_name, COUNT(*) as row_count FROM spending_categories
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

---

## API Endpoints Requiring Production DB

Once migration is complete, these API endpoints work with production data:

- `GET /api/categories` - List spending categories
- `GET /api/transactions` - List transactions
- `GET /api/dashboard/summary` - Dashboard with financial summary
- `GET /api/balance` - Current balance
- `POST /api/transactions` - Create transaction
- `POST /api/balance/adjust` - Adjust balance
- And all other CRUD endpoints...

---

## Rollback/Recovery

If needed to rollback:

```sql
-- Drop FBA tables (only if needed)
DROP TABLE IF EXISTS spending_logs;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS fixed_expense_payments;
DROP TABLE IF EXISTS balance_adjustments;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS financial_profiles;
DROP TABLE IF EXISTS spending_categories;

-- Other application tables remain untouched
```

---

## Configuration Files

### Updated Files:

1. **Procfile** - Added `release` phase for auto-migration:
   ```
   release: node scripts/migrate-db.js
   web: node src/server.js
   ```

2. **scripts/migrate-db.js** - New migration runner
   - Checks if tables exist before creating
   - Works with both development and production databases
   - Uses environment variable for connection selection

3. **migrations/000_fba_production_migration.sql** - SQL migration script
   - Raw SQL version for manual execution if needed
   - Can be run directly on Render PostgreSQL console

4. **.env.production** - Production environment (already exists)
   - Contains DATABASE_URL for Render PostgreSQL

---

## Deployment Steps (Render)

### First Time Setup:

1. **Ensure .env.production exists** with correct DATABASE_URL
2. **Verify scripts/migrate-db.js exists** in repository
3. **Check Procfile** has the release phase
4. **Deploy to Render:**
   ```bash
   git add .
   git commit -m "Add production database migration"
   git push render main
   ```
5. **Monitor deployment logs:**
   - Look for "✅ All FBA tables ready in database!"
   - Confirm web process starts successfully

### Subsequent Deployments:

1. Just push code - migrations only run if tables don't exist
2. If tables exist, migration is skipped (takes <1 second)
3. No impact on running production data

---

## Troubleshooting

### Issue: "Connection refused" during migration

**Cause:** DATABASE_URL not set or incorrect
**Fix:** 
- Verify DATABASE_URL in .env.production is correct
- Check Render PostgreSQL is running
- Try connecting with psql directly to test

### Issue: "Invalid enum" error

**Cause:** Enum values changed between migrations
**Fix:**
- This shouldn't happen with our approach (all enums predefined)
- If it does, you may need to recreate tables
- Contact support

### Issue: "Relation already exists"

**Cause:** Table already exists but migration tries to create
**Fix:** This is handled by `IF NOT EXISTS` - migration skips and continues

---

## Monitoring Production

After deployment, monitor:

```bash
# Check database size
SELECT pg_size_pretty(pg_database_size('murajaah_tracker_db'));

# Monitor table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename LIKE 'spending_%' OR tablename LIKE 'financial_%' OR tablename LIKE 'transaction%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Summary

**Status:** ✅ Ready for Production Migration

**Files Created:**
- ✅ `FBA_BE/scripts/migrate-db.js` - Node.js migration runner
- ✅ `FBA_BE/migrations/000_fba_production_migration.sql` - SQL migration
- ✅ `FBA_BE/Procfile` - Updated with release phase

**Next Steps:**
1. Verify `.env.production` has correct DATABASE_URL
2. Deploy to Render (migrations run automatically)
3. Verify tables appear in production database
4. Test API endpoints

**No existing data lost:** ✅ Migration uses `IF NOT EXISTS` pattern
**No conflicts with other apps:** ✅ Only creates FBA tables, preserves others
**Automatic fallback:** ✅ If production DB unreachable, development DB used locally

---

## Support

For issues with the migration:
1. Check Render deployment logs
2. Verify DATABASE_URL is correct
3. Test local migration with `.env.production`: `NODE_ENV=production node scripts/migrate-db.js`
4. Check database size and table count after migration
