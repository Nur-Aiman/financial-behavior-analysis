# FBA Database Setup with Render Shared PostgreSQL

This guide explains how to connect the Financial Behavior Analysis (FBA) project to your existing Render PostgreSQL database.

## **Database Credentials**

Your shared Render PostgreSQL database credentials:
- **Host:** dpg-d5jq6sql1i9vc73bkquq0-a.singapore-postgres.render.com
- **Port:** 5432
- **Database:** murajaah_tracker_db
- **Username:** murajaah_tracker_db_user
- **Password:** *(from your Render dashboard)*
- **SSL:** Required

## **Step 1: Update Environment Variables**

### Development Setup:

Create/update `FBA_BE/.env` with:
```
USE_REAL_DB=true
DB_HOST=dpg-d5jq6sql1i9vc73bkquq0-a.singapore-postgres.render.com
DB_USER=murajaah_tracker_db_user
DB_PASSWORD=<your-password-from-render>
DB_NAME=murajaah_tracker_db
DB_PORT=5432
PORT=3001
NODE_ENV=development
```

### Production Setup (Render):

Update `FBA_BE/.env.production` with the actual password:
```
DATABASE_URL=postgresql://murajaah_tracker_db_user:<YOUR_PASSWORD>@dpg-d5jq6sql1i9vc73bkquq0-a.singapore-postgres.render.com:5432/murajaah_tracker_db?sslmode=require
```

## **Step 2: Run Migrations**

Migrations will create all FBA tables in the shared database without affecting existing tables.

### Local Development:
```bash
cd FBA_BE
npm run db:migrate
```

### Production (Render):

On your Render Backend Service:
1. Go to **Shell** tab (or via SSH)
2. Run:
```bash
cd /opt/render/project/FBA_BE
npx knex migrate:latest --env production
```

Or add a **Pre-Deploy Command** in Render settings:
```
cd FBA_BE && npx knex migrate:latest --env production
```

## **Step 3: Set Environment Variables on Render**

1. Go to your `fba-backend` service on Render
2. Click **Environment** tab
3. Add/update these variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://murajaah_tracker_db_user:PASSWORD@dpg-d5jq6sql1i9vc73bkquq0-a.singapore-postgres.render.com:5432/murajaah_tracker_db?sslmode=require` |
| `NODE_ENV` | `production` |
| `USE_REAL_DB` | `true` |
| `CORS_ORIGIN` | `https://financial-behavior-analysis-fe.onrender.com` |

4. Click **Save**
5. Click **Manual Deploy** → **Deploy Latest Commit**

## **Step 4: Verify Connection**

Check Render backend logs to verify:
1. Database connection successful
2. Migrations executed
3. Tables created

Look for output like:
```
Creating spending_categories table...
Creating transactions table...
All FBA tables created successfully!
```

## **Existing Tables (Not Affected)**

These tables from the Murajaah Tracker project will remain unchanged:
- calendar_events
- khatam_goal
- memorized_surah
- murajaah_log
- sabaq_tracker
- tahajjud_tracker
- tilawah_tracker
- tilawah_update_log
- user

## **FBA Tables Created**

These new tables will be created for FBA:
- spending_categories
- transactions
- financial_profiles
- balance_adjustments
- fixed_expense_payments
- audit_logs
- spending_logs

## **Troubleshooting**

### Connection Refused
- Verify DATABASE_URL is correct
- Check password from Render dashboard
- Ensure SSL mode is `require` (not `disable`)

### Migration Failed
- Check if tables already exist (won't cause error, just skipped)
- Verify database user has CREATE TABLE permissions
- Check Render logs for detailed error messages

### API Returns Empty Data
- Verify migrations ran successfully
- Check that USE_REAL_DB=true in environment
- Look for console logs in Render backend

## **Seed Data (Optional)**

To populate with seed data:
```bash
npm run db:seed
```

**Note:** Existing transaction data in your local setup will need to be manually migrated or re-entered.
