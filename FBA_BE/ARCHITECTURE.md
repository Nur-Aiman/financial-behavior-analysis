# Financial Behavior Intelligent Analysis - Backend Architecture

## Complete Backend Structure

```
FBA_BE/
├── src/
│   ├── models/
│   │   └── index.ts                    # All TypeScript interfaces and enums
│   ├── storage/
│   │   ├── in-memory.store.ts         # Singleton in-memory data storage
│   │   └── seed-data.ts               # Development seed data with example scenario
│   ├── repositories/
│   │   ├── financial-profile.repository.ts
│   │   ├── category.repository.ts
│   │   ├── transaction.repository.ts
│   │   ├── fixed-expense.repository.ts
│   │   └── balance-adjustment.repository.ts
│   ├── services/
│   │   ├── financial-forecast.service.ts    # Core forecasting engine
│   │   ├── FORECASTING_ALGORITHM.md         # Algorithm documentation
│   │   ├── balance.service.ts               # (to be created)
│   │   ├── category.service.ts              # (to be created)
│   │   ├── transaction.service.ts           # (to be created)
│   │   └── fixed-expense.service.ts         # (to be created)
│   ├── controllers/                          # (to be created)
│   ├── routes/                               # (to be created)
│   ├── validators/
│   │   └── schemas.ts                       # Zod validation schemas
│   ├── middleware/                           # (to be created)
│   ├── errors/
│   │   ├── error-codes.ts
│   │   └── app-error.ts
│   ├── utils/
│   │   ├── money.utils.ts
│   │   ├── date.utils.ts
│   │   ├── id.utils.ts
│   │   └── response.utils.ts
│   ├── types/                                # (to be created)
│   ├── app.ts                                # (to be created)
│   └── server.ts                             # (to be created)
├── tests/
│   ├── unit/
│   │   └── financial-forecast.service.test.ts
│   └── integration/                          # (to be created)
├── package.json                              # TypeScript, Jest, Supertest
├── tsconfig.json
├── jest.config.ts
├── nodemon.json
└── .env

```

## Completed Components

### 1. **Models and Enums** (`models/index.ts`)
- ✅ `FinancialProfile`: User's financial configuration
- ✅ `SpendingCategory`: Three types (Daily, Usage-based, Fixed)
- ✅ `Transaction`: Expense, Income, Balance Adjustment
- ✅ `FixedExpensePayment`: Bill tracking
- ✅ `BalanceAdjustment`: Audit trail
- ✅ `DailyForecast`: Daily recommendation
- ✅ `FinancialForecast`: Complete forecast summary
- ✅ `Warning`: Financial alerts
- ✅ Enums: Category types, Transaction types, Payment statuses, Forecast statuses

### 2. **In-Memory Storage** (`storage/`)
- ✅ `InMemoryStore`: Singleton data management with Maps
- ✅ `seedData()`: Example scenario (RM1000, 20 days, 5 categories, 1 transaction)
- LIMITATION: Data resets on server restart

### 3. **Repositories** (`repositories/`)
- ✅ `FinancialProfileRepository`: CRUD for profiles
- ✅ `CategoryRepository`: CRUD + query filters (by type, active status)
- ✅ `TransactionRepository`: CRUD + filters (by date range, category)
- ✅ `FixedExpenseRepository`: CRUD + query (unpaid, overdue)
- ✅ `BalanceAdjustmentRepository`: Audit trail
- Design Pattern: Allows future PostgreSQL replacement without changing services

### 4. **Financial Forecast Service** (`services/financial-forecast.service.ts`)
- ✅ Core forecasting algorithm
- ✅ Calculates:
  - Remaining days until payday
  - Reserved fixed expenses
  - Protected usage-based allocations
  - Daily spending pool
  - Daily recommendations (considers category weights)
  - Projected balance on payday
  - Intelligent explanations
  - Financial warnings (Critical, Warning, Info levels)
- ✅ Handles edge cases (payday today, payday passed)
- ✅ Uses decimal-safe money utilities

### 5. **Money Utilities** (`utils/money.utils.ts`)
- ✅ `ringgiitToCents()`: RM1500.50 → 150050
- ✅ `centsTToRinggit()`: 150050 → 1500.50
- ✅ `formatCentsAsRinggit()`: 150050 → "RM 1,500.50"
- ✅ Safe arithmetic: `addCents()`, `subtractCents()`, `divideCents()`, `multiplyCents()`
- ✅ Uses Decimal.js for precision

### 6. **Date Utilities** (`utils/date.utils.ts`)
- ✅ ISO date string handling (YYYY-MM-DD)
- ✅ `calculateRemainingDays()`: Inclusive of both dates
- ✅ `parseIsoDate()`, `dateToIsoString()`
- ✅ Date comparisons: `hasDatePassed()`, `isDateInRange()`
- ✅ `formatDateForDisplay()`
- ✅ Avoids timezone bugs

### 7. **Validation Schemas** (`validators/schemas.ts`)
- ✅ Zod schemas for all requests
- ✅ Financial Profile (create/update)
- ✅ Balance (update)
- ✅ Category (create/update with type validation)
- ✅ Transaction (create/update)
- ✅ Fixed Expense Payment
- ✅ Query filters (category type, date range)

### 8. **Error Handling** (`errors/`)
- ✅ `ErrorCode` types (30+ error codes)
- ✅ `AppError` class with statusCode, code, message, details
- ✅ Helper functions: `notFoundError()`, `validationError()`, `insufficientBalanceError()`
- ✅ Consistent error response format

### 9. **Unit Tests** (`tests/unit/financial-forecast.service.test.ts`)
- ✅ Basic forecast calculations
- ✅ Remaining days calculation
- ✅ Reserved fixed expenses
- ✅ Protected usage allocation
- ✅ Daily spending pool
- ✅ Sufficient vs insufficient funds scenarios
- ✅ Category spending tracking
- ✅ Category allocation limits
- ✅ Fixed expense handling
- ✅ Usage-based category tracking
- ✅ Projected balance calculations
- ✅ Warnings for:
  - Low balance
  - 80% category utilisation
  - Exceeded allocations
  - Overdue bills
  - Approaching bills
- ✅ Payday edge cases
- ✅ Recalculation on data changes

## Key Design Decisions

### 1. **Currency Handling**
- All amounts stored as **integer cents**
- Avoids floating-point precision errors
- Example: RM1500.50 = 150050 cents
- Decimal.js for safe calculations

### 2. **Date Handling**
- All dates as **ISO strings** (YYYY-MM-DD)
- Prevents timezone bugs
- calculateRemainingDays() is inclusive of both dates
- Includes today in remaining day count

### 3. **Clean Architecture**
```
Routes → Controllers → Services → Repositories → In-Memory Store
         ↓
      Validators
```
- Business logic in Services only
- Controllers handle requests/responses
- Repositories provide data access
- Validators enforce schema

### 4. **Forecasting Algorithm Highlights**
- Calculates daily recommendation per category
- Distributes available pool by category weight
- Accounts for remaining allocation
- Generates human-readable explanations
- Deterministic warnings (no external AI)

### 5. **Repository Pattern**
- Allows swapping in-memory storage with PostgreSQL
- No direct data access from services
- Consistent CRUD interface across all repositories

## Test Coverage

### Scenario: RM1000, 20 days until payday
**Daily Category: Food**
- Allocated: RM600
- Preferred: RM20/day
- Already spent: RM200
- Remaining: RM400

**Usage-Based: Fuel (Protected)**
- Allocated: RM150
- Protected: Yes
- Spent: RM0

**Fixed Expenses (Unpaid)**
- Internet: RM100 (5 days)
- Mobile: RM80 (3 days)
- Subscription: RM50 (7 days)
- Total reserved: RM230

**Expected Calculation**
- Daily spending pool: RM1000 - RM230 - RM150 = RM620
- Food can safely spend: RM20/day (RM400 needed < RM620 available)
- Recommendation: RM20/day

**With reduced balance (RM500)**
- Daily spending pool: RM500 - RM230 - RM150 = RM120
- Food safe daily: RM120 / 20 = RM6
- Recommendation: RM6/day
- Status: AT_RISK

## Next Implementation Steps

1. Create remaining services:
   - BalanceService
   - CategoryService
   - TransactionService
   - FixedExpenseService

2. Create controllers for all entities

3. Create route definitions with proper nesting

4. Implement middleware:
   - Request validation
   - Error handling
   - Logging

5. Create Express app and server entry point

6. Write integration tests with Supertest

7. Frontend setup with React + TypeScript

## Development Notes

### Running Tests
```bash
npm test
npm test:watch
npm test:coverage
```

### Building
```bash
npm run build
```

### Development Server
```bash
npm run dev
```

### API Base Path
```
/api
```

## Important Constraints

1. **In-Memory Storage**: Data is temporary, resets on server restart
2. **No Authentication**: Single user application
3. **Single Profile**: Only one active financial profile
4. **ISO Date Strings**: All dates must be YYYY-MM-DD
5. **Integer Cents**: All currency calculations in cents, never floats
6. **No Database**: Pure TypeScript in-memory storage for v1
