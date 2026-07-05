# Financial Behavior Analysis - PostgreSQL Database Setup Guide

## Overview
This guide walks you through setting up PostgreSQL for the Financial Behavior Analysis (FBA) application. The setup follows the pattern used in the Murajaah Tracker project.

## Prerequisites

- PostgreSQL 12+ installed
- TablePlus (or pgAdmin/psql) for database management
- Node.js 18+ and npm
- FBA Backend application

## Step 1: Install Dependencies

First, install the required npm packages:

```bash
cd "d:\SWE\Financial Behavior Analysis\FBA_BE"
npm install
```

This will install:
- `pg`: PostgreSQL client for Node.js
- `knex`: SQL query builder and migration tool

## Step 2: Create PostgreSQL Database

### Option A: Using TablePlus (Recommended)

1. Open **TablePlus**
2. Click **Create New...** → **PostgreSQL**
3. Enter connection details:
   - **Name**: FBA Development
   - **Host**: 127.0.0.1
   - **Port**: 5432
   - **User**: postgres
   - **Password**: 1234 (or your PostgreSQL password)
4. Click **Test** to verify connection
5. Once connected, click **File** → **Execute Query** and run:

```sql
CREATE DATABASE "financial-behavior-analysis";
```

### Option B: Using Command Line (psql)

```bash
psql -U postgres -h localhost

-- In psql prompt:
CREATE DATABASE fba_development;
\c fba_development
```

### Option C: Using SQL Script

Create a file `create_database.sql`:

```sql
-- Create database
CREATE DATABASE fba_development
  WITH 
    ENCODING = 'UTF8'
    TEMPLATE = template0;

-- Connect to the new database
\c fba_development

-- Verify
SELECT datname FROM pg_database WHERE datname = 'fba_development';
```

Then run:
```bash
psql -U postgres -f create_database.sql
```

## Step 3: Verify Environment Configuration

Check `.env` file in `FBA_BE/` folder:

```env
# Database Configuration
USE_REAL_DB=true

# PostgreSQL Connection (Development)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=fba_development
DB_PORT=5432
```

**Adjust DB_PASSWORD and DB_USER** if needed to match your PostgreSQL setup.

## Step 4: Run Migrations

Migrations create all the necessary database tables.

```bash
cd "d:\SWE\Financial Behavior Analysis\FBA_BE"

# Run all pending migrations
npm run db:migrate

# Expected output:
# ✅ Created all initial tables for FBA
# Done! Up to: 001_create_initial_schema [100.0ms]
```

### Migration Details

The migration creates the following tables:

1. **financial_profiles** - User's financial profile (salary, balance, cycle dates)
2. **spending_categories** - Budget categories (food, utilities, etc.)
3. **transactions** - Individual transactions
4. **spending_logs** - Daily spending tracking
5. **audit_logs** - Change history for auditing

## Step 5: Seed Initial Data

Seeds populate the database with your financial profile and 19 spending categories.

```bash
npm run db:seed

# Expected output:
# ✅ Created financial profile
# ✅ Created 19 spending categories
# ✅ Created sample transaction
# 🎉 Database seeding completed successfully!
```

### Seeded Data Includes:

- **1 Financial Profile**
  - Currency: RM (Malaysian Ringgit)
  - Expected Salary: RM6,000
  - Current Balance: RM1,652
  - Salary Cycle: 5th to 5th of next month

- **19 Spending Categories** (Husby household expenses):
  - Daily Time-Based: Food, Shampoo, Shower soap
  - Usage-Based: Petrol, Parking, Car service, Tyre, Battery
  - Fixed One-Time: Phone bill, Electricity, Water, Toll, Road tax, Haircut, Medical, Religious class, Parents allowance, EPF/SOCSO
  - Each category includes allocated amounts and due dates where applicable

- **1 Sample Transaction**
  - RM200 food expense (for testing)

## Step 6: Enable PostgreSQL in Backend

Update `FBA_BE/.env`:

```env
USE_REAL_DB=true
```

## Step 7: Verify Setup in TablePlus

1. Open TablePlus
2. Connect to `fba_development` database
3. You should see these tables:
   - `financial_profiles`
   - `spending_categories`
   - `transactions`
   - `spending_logs`
   - `audit_logs`
   - `knex_migrations` (automatically created by knex)
   - `knex_migrations_lock` (automatically created by knex)

### Verify Data:

```sql
-- Check financial profile
SELECT id, currency, current_balance_cents, created_at FROM financial_profiles LIMIT 1;

-- Check categories
SELECT id, name, display_order, allocated_amount_cents FROM spending_categories ORDER BY display_order;

-- Check transactions
SELECT * FROM transactions;
```

Expected results:
- ✅ 1 financial profile row
- ✅ 19 spending categories rows
- ✅ 1 transaction row

## Common Database Commands

```bash
# Run migrations
npm run db:migrate

# Make a new migration
npm run db:migrate:make -- -n migration_name

# Rollback last migration
npm run db:rollback

# Rollback all migrations
npm run db:rollback -- --all

# Run seeds
npm run db:seed

# Make a new seed file
npm run db:seed:make -- seed_name

# Reset database (rollback all + migrate + seed)
npm run db:reset
```

## Testing Database Connection

Start the backend server:

```bash
cd "d:\SWE\Financial Behavior Analysis\FBA_BE"
npm run build
npm start
```

Expected output:
```
🗄️  Using DATABASE_URL? false
   → Host: localhost | DB: fba_development | User: postgres
   → SSL enabled: false
✅ Database connection successful!
✅ Server running on http://localhost:3001
```

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Cause**: PostgreSQL is not running

**Solution**:
- Windows: Open Services and start PostgreSQL
- Mac: Run `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### Error: "FATAL: password authentication failed"

**Cause**: Wrong password in .env

**Solution**:
- Check PostgreSQL user password
- In `psql`: `ALTER USER postgres WITH PASSWORD 'newpassword';`
- Update `.env` with correct password

### Error: "database fba_development does not exist"

**Cause**: Database not created

**Solution**:
- Run: `CREATE DATABASE fba_development;` in psql or TablePlus
- Then run: `npm run db:migrate`

### Migration fails to run

**Cause**: Usually migration file syntax error

**Solution**:
- Check migration file in `migrations/` folder
- Run: `npm run db:rollback --all` then `npm run db:migrate`
- Check error messages carefully

## Production Deployment

For production, use PostgreSQL connection string:

```env
# .env.production
DATABASE_URL=postgresql://user:password@host:port/database
USE_REAL_DB=true
```

Or with RDS (AWS):
```env
DATABASE_URL=postgresql://user:password@xxx.region.rds.amazonaws.com:5432/fba_production
```

## Database Schema Documentation

### financial_profiles Table
```
id              UUID (Primary Key)
currency        VARCHAR(3)           - Currency code (RM, USD, etc.)
expected_salary_cents    BIGINT       - Expected monthly salary
opening_balance_cents    BIGINT       - Starting balance
current_balance_cents    BIGINT       - Current balance
salary_cycle_start_date  DATE         - Salary cycle start date
next_payday     DATE                - Next salary date
created_at      TIMESTAMP           - Record created timestamp
updated_at      TIMESTAMP           - Record updated timestamp
```

### spending_categories Table
```
id              UUID (Primary Key)
name            VARCHAR(255)        - Category name
type            ENUM                - DAILY_TIME_BASED | USAGE_BASED | FIXED_ONE_TIME
allocated_amount_cents   BIGINT     - Allocated budget in cents
preferred_daily_amount_cents BIGINT - Daily preference for TIME_BASED
expected_amount_cents    BIGINT     - Expected cost for FIXED
due_date        DATE                - Due date for FIXED categories
recurring       BOOLEAN             - Is this recurring?
protected       BOOLEAN             - Is this protected from deletion?
display_order   INTEGER             - Order in UI (supports drag-drop reordering)
active          BOOLEAN             - Is this category active?
created_at      TIMESTAMP           - Record created timestamp
updated_at      TIMESTAMP           - Record updated timestamp
```

### transactions Table
```
id              UUID (Primary Key)
category_id     UUID (Foreign Key)  - References spending_categories
type            ENUM                - EXPENSE | INCOME
amount_cents    BIGINT              - Transaction amount in cents
description     TEXT                - Transaction description
transaction_date DATE               - Date of transaction
created_at      TIMESTAMP           - Record created timestamp
updated_at      TIMESTAMP           - Record updated timestamp
```

### spending_logs Table
```
id              UUID (Primary Key)
category_id     UUID (Foreign Key)  - References spending_categories
amount_spent_cents BIGINT           - Amount spent in cents
log_date        DATE                - Date of spending
notes           TEXT                - Additional notes
created_at      TIMESTAMP           - Record created timestamp
updated_at      TIMESTAMP           - Record updated timestamp
```

### audit_logs Table
```
id              UUID (Primary Key)
action          VARCHAR(50)         - CREATE | UPDATE | DELETE
entity_type     VARCHAR(100)        - Type of entity changed
entity_id       UUID                - ID of entity changed
old_values      JSON                - Previous values
new_values      JSON                - New values
created_at      TIMESTAMP           - When change occurred
```

## Next Steps

1. ✅ Database created and seeded
2. ⏭️  Update backend repositories to use PostgreSQL
3. ⏭️  Update backend services to query from database
4. ⏭️  Test API endpoints with database
5. ⏭️  Update frontend if necessary
6. ⏭️  Deploy to production

## Additional Resources

- [Knex.js Documentation](http://knexjs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TablePlus Documentation](https://docs.tableplus.com/)
- Murajaah Tracker reference: `d:\SWE\Murajaah Tracker\MT_BE\`

---

**Last Updated**: 2026-07-05  
**Maintainer**: Database Setup Team
