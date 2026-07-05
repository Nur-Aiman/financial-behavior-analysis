# FBA Database Schema Documentation

## 📊 Database Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│   FBA PostgreSQL: financial-behavior-analysis                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  financial_profiles (1 row)                                 │
├──────────────────────────────────────────────────────────────┤
│ • Currency & salary information                             │
│ • Current & opening balance                                 │
│ • Salary cycle dates                                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  spending_categories (19 rows)                              │
├──────────────────────────────────────────────────────────────┤
│ • Category name & type (3 enum types)                       │
│ • Allocated budget amounts                                  │
│ • Display order (supports drag-drop reordering)             │
│ • Due dates for fixed categories                            │
└──────────────────────────────────────────────────────────────┘
           ↓ (one-to-many)
┌──────────────────────────────────────────────────────────────┐
│  transactions (grows)                                       │
├──────────────────────────────────────────────────────────────┤
│ • Transaction amount & type (EXPENSE/INCOME)                │
│ • Category reference (foreign key)                          │
│ • Transaction date & description                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  spending_logs (daily entries)                              │
├──────────────────────────────────────────────────────────────┤
│ • Amount spent for category on specific date                │
│ • Category reference (foreign key)                          │
│ • One entry per category per day (UNIQUE constraint)        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  audit_logs (change history)                                │
├──────────────────────────────────────────────────────────────┤
│ • Records all CREATE/UPDATE/DELETE actions                  │
│ • Stores old and new values as JSON                         │
│ • Tracks changes for compliance & debugging                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Table Specifications

### 1. financial_profiles

**Purpose**: Store user's financial profile information

**Columns**:

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| currency | VARCHAR(3) | NOT NULL | 'RM' | Currency code (RM, USD, etc.) |
| expected_salary_cents | BIGINT | NULLABLE | NULL | Expected monthly salary (in cents) |
| opening_balance_cents | BIGINT | NULLABLE | NULL | Starting balance when salary received |
| current_balance_cents | BIGINT | NOT NULL | - | Current account balance |
| salary_cycle_start_date | DATE | NULLABLE | NULL | Date salary cycle starts each month |
| next_payday | DATE | NULLABLE | NULL | Expected next salary payment date |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update time |

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "currency": "RM",
  "expected_salary_cents": 600000,
  "opening_balance_cents": 165200,
  "current_balance_cents": 165200,
  "salary_cycle_start_date": "2026-07-05",
  "next_payday": "2026-08-05",
  "created_at": "2026-07-05T00:00:00Z",
  "updated_at": "2026-07-05T00:00:00Z"
}
```

**Indexes**:
- `idx_financial_profiles_created_at` (created_at)

---

### 2. spending_categories

**Purpose**: Define budget categories and allocations

**Columns**:

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique category identifier |
| name | VARCHAR(255) | NOT NULL | - | Category name (e.g., "Husby food") |
| type | ENUM | NOT NULL | - | Category type (see below) |
| allocated_amount_cents | BIGINT | NOT NULL | - | Total allocated budget in cents |
| preferred_daily_amount_cents | BIGINT | NULLABLE | NULL | Daily budget for TIME_BASED categories |
| expected_amount_cents | BIGINT | NULLABLE | NULL | Expected cost for FIXED categories |
| due_date | DATE | NULLABLE | NULL | Due date for FIXED categories |
| recurring | BOOLEAN | NOT NULL | FALSE | Is this a recurring expense? |
| protected | BOOLEAN | NOT NULL | FALSE | Cannot be deleted (protected=true) |
| display_order | INTEGER | NOT NULL | 0 | Order in UI (supports drag-drop) |
| active | BOOLEAN | NOT NULL | TRUE | Is this category active? |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update time |

**Type Enum Values**:

```sql
'DAILY_TIME_BASED'    -- Budget spread daily (e.g., food RM20/day)
'USAGE_BASED'         -- Budget based on usage (e.g., petrol)
'FIXED_ONE_TIME'      -- Fixed monthly expense (e.g., electricity bill)
```

**Example Data**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Husby food",
  "type": "DAILY_TIME_BASED",
  "allocated_amount_cents": 60000,
  "preferred_daily_amount_cents": 2000,
  "expected_amount_cents": null,
  "due_date": null,
  "recurring": false,
  "protected": false,
  "display_order": 0,
  "active": true,
  "created_at": "2026-07-05T00:00:00Z",
  "updated_at": "2026-07-05T00:00:00Z"
}
```

**Indexes**:
- `idx_spending_categories_display_order` (display_order)
- `idx_spending_categories_active` (active)
- `idx_spending_categories_type` (type)
- `idx_spending_categories_created_at` (created_at)

**Constraints**:
- Foreign Key constraints are enforced ON DELETE CASCADE
- Any transaction or log referencing a deleted category is also deleted

---

### 3. transactions

**Purpose**: Track individual financial transactions

**Columns**:

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique transaction identifier |
| category_id | UUID | FOREIGN KEY | - | References spending_categories.id |
| type | ENUM | NOT NULL | - | Transaction type (EXPENSE or INCOME) |
| amount_cents | BIGINT | NOT NULL | - | Transaction amount in cents |
| description | TEXT | NULLABLE | NULL | Transaction description/notes |
| transaction_date | DATE | NOT NULL | - | Date transaction occurred |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update time |

**Type Enum Values**:
```sql
'EXPENSE'    -- Money spent
'INCOME'     -- Money received
```

**Example Data**:
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "category_id": "660e8400-e29b-41d4-a716-446655440001",
  "type": "EXPENSE",
  "amount_cents": 20000,
  "description": "Food expenses for week",
  "transaction_date": "2026-07-05",
  "created_at": "2026-07-05T14:30:00Z",
  "updated_at": "2026-07-05T14:30:00Z"
}
```

**Indexes**:
- `idx_transactions_category_id` (category_id)
- `idx_transactions_transaction_date` (transaction_date)
- `idx_transactions_type` (type)
- `idx_transactions_created_at` (created_at)

---

### 4. spending_logs

**Purpose**: Track daily spending per category

**Columns**:

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique log entry identifier |
| category_id | UUID | FOREIGN KEY | - | References spending_categories.id |
| amount_spent_cents | BIGINT | NOT NULL | - | Amount spent on this date in cents |
| log_date | DATE | NOT NULL | - | Date of spending |
| notes | TEXT | NULLABLE | NULL | Additional notes about spending |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update time |

**Unique Constraint**:
- `(category_id, log_date)` - Only one entry per category per day

**Example Data**:
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "category_id": "660e8400-e29b-41d4-a716-446655440001",
  "amount_spent_cents": 2500,
  "log_date": "2026-07-05",
  "notes": "Breakfast and lunch",
  "created_at": "2026-07-05T20:00:00Z",
  "updated_at": "2026-07-05T20:00:00Z"
}
```

**Indexes**:
- `idx_spending_logs_category_id` (category_id)
- `idx_spending_logs_log_date` (log_date)
- `idx_spending_logs_created_at` (created_at)
- UNIQUE(category_id, log_date)

---

### 5. audit_logs

**Purpose**: Track all changes for compliance and debugging

**Columns**:

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique log identifier |
| action | VARCHAR(50) | NOT NULL | - | Action type: CREATE/UPDATE/DELETE |
| entity_type | VARCHAR(100) | NOT NULL | - | Type of entity changed |
| entity_id | UUID | NOT NULL | - | ID of entity that changed |
| old_values | JSONB | NULLABLE | NULL | Previous values as JSON object |
| new_values | JSONB | NULLABLE | NULL | New values as JSON object |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | When change occurred |

**Example Data**:
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "action": "UPDATE",
  "entity_type": "spending_categories",
  "entity_id": "660e8400-e29b-41d4-a716-446655440001",
  "old_values": {
    "display_order": 0,
    "active": true
  },
  "new_values": {
    "display_order": 5,
    "active": true
  },
  "created_at": "2026-07-05T15:45:00Z"
}
```

**Indexes**:
- `idx_audit_logs_entity_type` (entity_type)
- `idx_audit_logs_entity_id` (entity_id)
- `idx_audit_logs_action` (action)
- `idx_audit_logs_created_at` (created_at)

---

## 🔗 Relationships (Entity Diagram)

```
┌─────────────────────────┐
│ financial_profiles      │
│ (1 row - User Profile)  │
└─────────────────────────┘

┌─────────────────────────────────────────────┐
│    spending_categories (19 rows)            │
│  • DAILY_TIME_BASED (3)                    │
│  • USAGE_BASED (5)                         │
│  • FIXED_ONE_TIME (11)                     │
└─────────────────────────────────────────────┘
              ↓
      (foreign key)
           ↓
┌────────────────────────────────────────┐
│  transactions (many)                   │
│  └─ Money spent/received in categories │
└────────────────────────────────────────┘

              ↓
      (foreign key)
           ↓
┌────────────────────────────────────────┐
│  spending_logs (many)                  │
│  └─ Daily tracking per category        │
└────────────────────────────────────────┘

                         ↓
         (Independent - tracks all changes)
                         ↓
┌────────────────────────────────────────┐
│  audit_logs (many)                     │
│  └─ Change history for all tables      │
└────────────────────────────────────────┘
```

---

## 📊 Sample Query Examples

### Get Financial Summary

```sql
SELECT
  fp.currency,
  ROUND(fp.current_balance_cents::numeric / 100, 2) as current_balance,
  ROUND(fp.expected_salary_cents::numeric / 100, 2) as monthly_salary,
  fp.next_payday
FROM financial_profiles fp
LIMIT 1;

-- Result:
-- currency | current_balance | monthly_salary | next_payday
-- RM       | 1652.00         | 6000.00        | 2026-08-05
```

### Get All Categories Ordered

```sql
SELECT
  sc.id,
  sc.name,
  sc.type,
  ROUND(sc.allocated_amount_cents::numeric / 100, 2) as allocated_amount,
  sc.display_order,
  sc.active
FROM spending_categories sc
ORDER BY sc.display_order;

-- Result: 19 rows ordered 0-17
```

### Get Daily Spending for Today

```sql
SELECT
  sc.name,
  ROUND(sl.amount_spent_cents::numeric / 100, 2) as amount_spent
FROM spending_logs sl
JOIN spending_categories sc ON sl.category_id = sc.id
WHERE sl.log_date = CURRENT_DATE
ORDER BY sc.display_order;
```

### Get Spending by Category This Month

```sql
SELECT
  sc.name,
  COUNT(t.id) as transaction_count,
  ROUND(SUM(t.amount_cents)::numeric / 100, 2) as total_spent,
  ROUND(sc.allocated_amount_cents::numeric / 100, 2) as allocated,
  ROUND((SUM(t.amount_cents)::numeric / sc.allocated_amount_cents) * 100, 1) as usage_percent
FROM transactions t
JOIN spending_categories sc ON t.category_id = sc.id
WHERE t.type = 'EXPENSE'
  AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY sc.id, sc.name, sc.allocated_amount_cents
ORDER BY sc.display_order;
```

### Get Change History for a Category

```sql
SELECT
  al.action,
  al.created_at,
  al.old_values,
  al.new_values
FROM audit_logs al
WHERE al.entity_type = 'spending_categories'
  AND al.entity_id = 'category-uuid-here'
ORDER BY al.created_at DESC;
```

---

## 🔐 Data Integrity

### Constraints Enforced

1. **Primary Keys**: UUID for all tables (no sequential IDs)
2. **Foreign Keys**: spending_categories ← transactions/spending_logs
   - ON DELETE CASCADE: Removes related records
3. **Unique Constraints**: One spending_log per category per day
4. **Not Null Constraints**: Critical fields always have values
5. **Check Constraints**: Type enums validated at database level

### Referential Integrity

```sql
-- If a spending_category is deleted:
DELETE FROM spending_categories WHERE id = 'xxx';
-- Automatically deletes:
-- - All transactions for that category
-- - All spending_logs for that category
-- - All audit logs for that category
```

---

## 📈 Performance Considerations

### Indexes Created

| Table | Column | Purpose |
|-------|--------|---------|
| financial_profiles | created_at | Query recent profiles |
| spending_categories | display_order | Sort by UI order |
| spending_categories | active | Filter active categories |
| spending_categories | type | Filter by type |
| transactions | category_id | Join lookups |
| transactions | transaction_date | Range queries |
| spending_logs | category_id | Join lookups |
| spending_logs | log_date | Daily queries |
| audit_logs | entity_type | Audit queries |

### Query Optimization

```sql
-- GOOD: Uses index (category_id)
SELECT * FROM transactions WHERE category_id = 'xxx';

-- GOOD: Uses index (log_date)
SELECT * FROM spending_logs WHERE log_date = '2026-07-05';

-- GOOD: Uses index (display_order)
SELECT * FROM spending_categories ORDER BY display_order;

-- CONSIDER: May benefit from composite index
SELECT * FROM transactions 
WHERE category_id = 'xxx' AND transaction_date > '2026-07-01';
```

---

## 🚀 Scaling Considerations

### Current Capacity

- **Rows**: Can handle millions of transactions
- **Storage**: ~50MB with 1 year of daily logs + transactions
- **Performance**: Queries <10ms with proper indexes

### Future Improvements

1. **Partitioning**: Partition transactions by date for very large datasets
2. **Archive**: Move old transactions to archive table
3. **Materialized Views**: Pre-compute monthly summaries
4. **Read Replicas**: For high-traffic analytics queries

---

## 📚 Migration & Seed Files

### Migration File

**Location**: `migrations/001_create_initial_schema.js`

**Responsibilities**:
- Create all 5 tables
- Create type enums
- Create indexes
- Define foreign key constraints

**Running**: `npm run db:migrate`

### Seed File

**Location**: `seeds/001_initial_seed.js`

**Responsibilities**:
- Create 1 financial profile
- Create 19 spending categories
- Create 1 sample transaction

**Running**: `npm run db:seed`

---

## 🔄 Backup & Recovery

### Backup Database

```bash
./backup-database.ps1
# Creates: db_backup/fba_development_YYYY-MM-DD_HH-MM-SS.sql
```

### Restore Database

```bash
psql -U postgres -h localhost -d fba_development -f backup_file.sql
```

---

## 📝 Conclusion

The FBA PostgreSQL schema provides:
- ✅ Normalized data structure
- ✅ Referential integrity via foreign keys
- ✅ Performance via strategic indexing
- ✅ Audit trail via audit_logs table
- ✅ Scalability for future growth
- ✅ Easy migration management with Knex.js

**Total Tables**: 5 (+ 2 auto-created by Knex)
**Total Rows**: ~20 (initial seed)
**Total Columns**: ~60

---

**Last Updated**: 2026-07-05  
**Version**: 1.0  
**Database**: PostgreSQL 12+
