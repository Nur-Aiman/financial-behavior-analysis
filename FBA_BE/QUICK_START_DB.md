# FBA Database - Quick Command Reference

## 📌 Prerequisites Setup

### 1. Create PostgreSQL Database (Run in pgAdmin or TablePlus)

```sql
CREATE DATABASE "financial-behavior-analysis";
```

### 2. Update .env File

Edit `FBA_BE/.env`:
```env
USE_REAL_DB=true
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=financial-behavior-analysis
DB_PORT=5432
```

---

## 🚀 Database Setup (One-Command Setup)

### Option A: Automated Setup Script (Recommended)

```powershell
cd "d:\SWE\Financial Behavior Analysis\FBA_BE"
.\setup-database.ps1
```

**Expected Output:**
```
🚀 FBA Database Setup Script
=============================
📋 Step 1: Checking prerequisites...
✅ Node.js v20.x.x
✅ npm 10.x.x

📋 Step 2: Checking PostgreSQL...
✅ PostgreSQL found: postgres (PostgreSQL) 15.x

📋 Step 3: Installing npm dependencies...
✅ Dependencies installed

📋 Step 4: Building TypeScript...
✅ TypeScript built

📋 Step 5: Running database migrations...
✅ Created all initial tables for FBA
✅ Migrations completed

📋 Step 6: Seeding initial data...
✅ Created financial profile
✅ Created 19 spending categories
✅ Created sample transaction
🎉 Database seeding completed successfully!

🎉 Database setup completed successfully!
```

### Option B: Manual Step-by-Step Setup

```powershell
cd "d:\SWE\Financial Behavior Analysis\FBA_BE"

# Step 1: Install dependencies
npm install

# Step 2: Build TypeScript
npm run build

# Step 3: Run migrations
npm run db:migrate

# Step 4: Run seeds
npm run db:seed
```

---

## 📊 Verify Setup

### Check in TablePlus

1. Open **TablePlus**
2. Connect to `fba_development` database
3. You should see these tables:
   - `financial_profiles` - 1 row
   - `spending_categories` - 19 rows
   - `transactions` - 1 row
   - `spending_logs` - 0 rows
   - `audit_logs` - 0 rows
   - `knex_migrations` - 1 row (migration tracker)

### Run SQL Queries

```sql
-- Check financial profile
SELECT id, currency, current_balance_cents, created_at 
FROM financial_profiles 
LIMIT 1;

-- Check spending categories
SELECT id, name, type, allocated_amount_cents, display_order 
FROM spending_categories 
ORDER BY display_order;

-- Count records
SELECT
  (SELECT COUNT(*) FROM financial_profiles) as profiles,
  (SELECT COUNT(*) FROM spending_categories) as categories,
  (SELECT COUNT(*) FROM transactions) as transactions;
```

**Expected Results:**
```
profiles: 1
categories: 19
transactions: 1
```

---

## 🔄 Common Database Commands

### Run Migrations
```bash
npm run db:migrate
# Output: Done! Up to: 001_create_initial_schema [100.0ms]
```

### Create New Migration
```bash
npm run db:migrate:make -- -n add_new_column
# Creates: migrations/002_add_new_column.js
```

### Rollback Last Migration
```bash
npm run db:rollback
# Output: Rolled back 1 migrations
```

### Rollback All Migrations
```bash
npm run db:rollback -- --all
# Output: Rolled back 1 migrations
```

### Run Seeds
```bash
npm run db:seed
# Output: ✅ Created financial profile...
```

### Create New Seed
```bash
npm run db:seed:make -- seed_name
# Creates: seeds/002_seed_name.js
```

### Reset Database (⚠️ Destructive - All data lost!)
```bash
npm run db:reset
# Rollback all → Migrate → Seed
```

### Backup Database
```powershell
.\backup-database.ps1
# Output: File saved to: db_backup/fba_development_2026-07-05_14-30-45.sql
```

---

## 🧪 Test Database Connection

### Start Backend
```bash
npm start
```

**Expected Output:**
```
🗄️  Using DATABASE_URL? false
   → Host: localhost | DB: fba_development | User: postgres
   → SSL enabled: false
✅ Database connection successful!
✅ Server running on http://localhost:3001
```

### Test API Endpoints
```bash
# Get categories
curl http://localhost:3001/api/categories

# Get financial profile
curl http://localhost:3001/api/financial-profile

# Create transaction
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "uuid-here",
    "type": "EXPENSE",
    "amountCents": 50000,
    "transactionDate": "2026-07-05"
  }'
```

---

## ❌ Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Problem**: PostgreSQL is not running

**Solution**:
```powershell
# Windows: Start PostgreSQL service
Get-Service PostgreSQL* | Start-Service

# Verify
pg_isready -h localhost -p 5432
# Output: accepting connections
```

### Error: "FATAL: password authentication failed"

**Problem**: Wrong password

**Solution**:
```sql
-- In pgAdmin or TablePlus:
ALTER USER postgres WITH PASSWORD 'newpassword';
```

Then update `.env`:
```env
DB_PASSWORD=newpassword
```

### Error: "database financial-behavior-analysis does not exist"

**Problem**: Database not created

**Solution**:
```sql
-- In TablePlus or psql:
CREATE DATABASE "financial-behavior-analysis";
```

Then retry: `npm run db:migrate`

### Error: "npm: command not found"

**Problem**: Node.js not installed or not in PATH

**Solution**: Download and install from https://nodejs.org/

### Migrations table error

**Problem**: knex_migrations table locked or corrupted

**Solution**:
```sql
-- In TablePlus:
DROP TABLE IF EXISTS knex_migrations;
DROP TABLE IF EXISTS knex_migrations_lock;
```

Then retry: `npm run db:migrate`

---

## 📊 Database Schema Summary

| Table | Rows | Purpose |
|-------|------|---------|
| financial_profiles | 1 | User financial profile |
| spending_categories | 19 | Budget categories (with display order for drag-drop) |
| transactions | 1 | Sample transaction |
| spending_logs | 0 | Daily spending logs |
| audit_logs | 0 | Change history |
| knex_migrations | (auto) | Migration tracker |

---

## 🔐 Enable PostgreSQL in Backend

Once setup is complete, update `FBA_BE/.env`:

```env
# Before (in-memory)
USE_REAL_DB=false

# After (PostgreSQL)
USE_REAL_DB=true
```

Then restart backend:
```bash
npm run build
npm start
```

---

## 📋 Seeded Data Details

### Financial Profile
- **Currency**: RM (Malaysian Ringgit)
- **Expected Salary**: RM 6,000
- **Opening Balance**: RM 1,652
- **Current Balance**: RM 1,652
- **Salary Cycle**: 5th to 5th of next month

### 19 Spending Categories

**Daily Time-Based (3):**
- Husby food (RM 600/month)
- Shampoo (Husby) (RM 25/month)
- Shower soap (Husby) (RM 25/month)

**Usage-Based (5):**
- Petrol (Husby) (RM 200/month)
- Parking fee (Husby) (RM 140/month)
- Car service (Husby) (RM 300 emergency)
- Car tyre (Emergency) (RM 500 emergency)
- Car battery (Emergency) (RM 300 emergency)

**Fixed One-Time (11):**
- Phone bill (RM 160)
- Electricity bill (RM 150)
- Water bill (RM 40)
- Toll (RM 150)
- Road tax (RM 66.67)
- Haircut (RM 20)
- Medical card (RM 150)
- Religious class (RM 100)
- Parents pocket money (RM 300)
- EPF/SOCSO/EIS/PCB (RM 968)

---

## 🎯 Next Steps

1. ✅ Database created and seeded
2. ⏭️ Start backend with PostgreSQL enabled
3. ⏭️ Test API endpoints
4. ⏭️ Update repositories to query PostgreSQL (not in-memory)
5. ⏭️ Run full backend tests
6. ⏭️ Deploy to production

---

## 📚 Additional Resources

- **DATABASE_SETUP.md** - Detailed setup guide
- **Knex Documentation** - http://knexjs.org/
- **PostgreSQL Documentation** - https://www.postgresql.org/docs/
- **Reference Project** - `d:\SWE\Murajaah Tracker\`

---

**Last Updated**: 2026-07-05  
**Created for**: Financial Behavior Analysis (FBA)
