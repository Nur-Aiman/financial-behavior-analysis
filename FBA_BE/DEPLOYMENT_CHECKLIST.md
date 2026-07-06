# Production Deployment Checklist

## Pre-Deployment Verification

### Database Configuration
- [x] Development database configured in `.env`
- [x] Production database configured in `.env.production`
- [x] DATABASE_URL format: `postgresql://user:password@host/database?sslmode=require`
- [x] Production credentials stored securely (not in git)

### Application Code
- [x] All routes implemented and tested
- [x] All controllers working
- [x] All services implemented as object exports
- [x] All repositories implemented as object exports
- [x] Error handling middleware configured
- [x] CORS configured for production domain
- [x] Frontend API URL configured for production

### Migration Scripts
- [x] `scripts/migrate-db.js` created and tested
- [x] `migrations/000_fba_production_migration.sql` created
- [x] Procfile updated with `release` phase
- [x] Migrations use `IF NOT EXISTS` (no conflicts with existing tables)

---

## Deployment Steps

### Step 1: Pre-Deploy Checks
```bash
# Verify all FBA tables are created in development
npm run db:status  # (or manual check)

# Run tests
npm test

# Build if needed
npm run build
```

### Step 2: Code Commit
```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Production database migration setup"
```

### Step 3: Deploy to Render

**Option A: Via Git Push**
```bash
git push render main
```

**Option B: Via Render Dashboard**
1. Go to Render.com dashboard
2. Select "financial-behavior-analysis-be"
3. Click "Manual Deploy"
4. Select branch and click deploy

### Step 4: Monitor Deployment
1. Go to Render dashboard → Logs
2. Watch for messages:
   - ✅ "🚀 Starting database migration..." (release phase starts)
   - ✅ "📊 Creating [table_name]..." (tables being created)
   - ✅ "✅ All FBA tables ready in database!" (migration success)
   - ✅ "🎉 Database migration completed successfully!" (complete)
   - ✅ Web process starts (port 3001)

### Step 5: Verify Deployment
```bash
# Check API health
curl https://financial-behavior-analysis-be.onrender.com/api/health

# Expected response:
# {"success":true,"message":"API is healthy","status":"ok"}
```

---

## Post-Deployment Testing

### 1. Test Database Connection
```bash
# Check if tables exist (using Render console or psql)
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('spending_categories','transactions','financial_profiles','balance_adjustments','fixed_expense_payments','spending_logs','audit_logs');

# Expected: 7 tables created
```

### 2. Test Key API Endpoints

**Dashboard Summary:**
```bash
curl https://financial-behavior-analysis-be.onrender.com/api/dashboard/summary
```
Expected fields:
- currentBalanceCents
- expectedSalaryCents
- remainingDays
- status
- warningCount

**Categories:**
```bash
curl https://financial-behavior-analysis-be.onrender.com/api/categories
```
Expected: Array of spending categories

**Transactions:**
```bash
curl https://financial-behavior-analysis-be.onrender.com/api/transactions
```
Expected: Array of transactions

### 3. Test Frontend Connection
- Navigate to frontend URL: https://financial-behavior-analysis-fe.onrender.com
- Check that dashboard loads
- Verify data displays correctly
- Check browser console for errors

### 4. Create Test Transaction
```bash
# Create a test transaction
curl -X POST https://financial-behavior-analysis-be.onrender.com/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "category-uuid",
    "type": "EXPENSE",
    "amountCents": 50000,
    "description": "Test transaction",
    "transactionDate": "2024-01-15"
  }'
```

---

## Rollback Plan

If something goes wrong after deployment:

### Quick Rollback (Render Dashboard)
1. Go to Render.com → financial-behavior-analysis-be
2. Click on "Previous Deployment"
3. Click "Redeploy"
4. Wait for deployment to complete

### Manual Rollback
```bash
# If you need to revert code
git reset --hard HEAD~1
git push render main --force
```

### Database Rollback
If you need to remove the FBA tables:

```sql
-- Only if absolutely necessary
DROP TABLE IF EXISTS spending_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS fixed_expense_payments CASCADE;
DROP TABLE IF EXISTS balance_adjustments CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS financial_profiles CASCADE;
DROP TABLE IF EXISTS spending_categories CASCADE;

-- Other application tables remain untouched
```

---

## Troubleshooting

### Issue: Deployment fails with "Migration error"

**Check:**
1. DATABASE_URL is set in Render environment variables
2. Production database is accessible
3. All migration files exist in repository
4. scripts/migrate-db.js has proper permissions

**Fix:**
```bash
# Verify migration script locally
NODE_ENV=production node scripts/migrate-db.js

# If that fails, check connection
node -e "console.log(process.env.DATABASE_URL)" # Ensure it's set
```

### Issue: "Connection refused" error

**Cause:** Production database not reachable

**Check:**
1. DATABASE_URL format is correct
2. Render PostgreSQL is running
3. SSL mode is set to require

**Fix:**
```bash
# Test connection with psql (if available)
PGPASSWORD=password psql -h host -U user -d database
```

### Issue: API returns "Cannot find table" error

**Cause:** Tables weren't created during migration

**Check:**
1. Review deployment logs for migration phase
2. Verify Procfile has `release` phase
3. Check if migration script ran

**Fix:**
```bash
# Manually run migration on production
# (requires direct database access)
NODE_ENV=production node scripts/migrate-db.js
```

### Issue: Frontend shows no data but API returns data

**Cause:** CORS issue or frontend not configured for production

**Check:**
1. CORS_ORIGIN in .env.production matches frontend domain
2. Frontend API URL is set to production backend
3. Check browser console for CORS errors

**Fix:**
```bash
# Update CORS_ORIGIN in .env.production
CORS_ORIGIN=https://financial-behavior-analysis-fe.onrender.com

# Redeploy backend
git push render main
```

---

## Monitoring Post-Deployment

### Daily Checks
- [ ] API health endpoint responds
- [ ] Frontend loads without errors
- [ ] No error messages in Render logs
- [ ] Database connections are stable

### Weekly Checks
- [ ] Review database size
- [ ] Check error rates
- [ ] Monitor performance metrics
- [ ] Verify scheduled tasks (if any)

### Monthly Checks
- [ ] Database backup verification
- [ ] Security audit
- [ ] Performance optimization
- [ ] Update dependencies

---

## Performance Optimization

After successful migration:

### 1. Enable Database Connection Pooling
```javascript
// Already configured in knexfile.js
pool: {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000
}
```

### 2. Monitor Query Performance
```sql
-- Enable query logging (if needed)
-- Check slow queries
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

### 3. Add Indexes if Needed
```sql
-- Already included in migration, but can add more:
CREATE INDEX CONCURRENTLY idx_transactions_created_at_type 
ON transactions(created_at DESC, type);
```

---

## Success Criteria

✅ **Deployment is successful when:**

- [ ] All 7 FBA tables created in production database
- [ ] API health check returns 200 OK
- [ ] Dashboard endpoint returns data
- [ ] Frontend loads and displays data correctly
- [ ] No errors in Render logs
- [ ] Database connection is stable
- [ ] All CRUD operations work
- [ ] No existing application tables are affected

---

## Documentation

For more information, see:
- [PRODUCTION_MIGRATION_GUIDE.md](PRODUCTION_MIGRATION_GUIDE.md) - Detailed migration guide
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database schema documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Application architecture
- [API_QUICK_REFERENCE.md](../API_QUICK_REFERENCE.md) - API endpoints

---

## Support Contact

If deployment issues occur:
1. Check deployment logs in Render
2. Review this checklist
3. Check troubleshooting section
4. Contact your deployment administrator

---

**Last Updated:** 2024-01-15
**Status:** Ready for Production Deployment ✅
