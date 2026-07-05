# Quick API Reference & Testing Guide

## Server Setup

```bash
cd FBA_BE
npm install
npm run dev
```

The server will start on `http://localhost:3001`

## Testing the API

### Seed Data (Load Example Scenario)
```bash
curl -X POST http://localhost:3001/api/dev/seed
```
This loads:
- RM1000 balance
- 20 days until payday (2026-07-25)
- 5 categories (1 daily, 1 usage-based, 3 fixed expenses)
- 1 transaction (RM200 food spending)
- 3 unpaid bills (RM230 reserved)

### Get Active Profile
```bash
curl http://localhost:3001/api/profile
```

### Get Today's Forecast
```bash
curl http://localhost:3001/api/forecast/today
```

### Create a Transaction
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "CATEGORY_ID_HERE",
    "type": "EXPENSE",
    "amountCents": 50000,
    "description": "Lunch",
    "transactionDate": "2024-12-19"
  }'
```

### Get All Categories
```bash
curl http://localhost:3001/api/categories
```

### Filter Categories by Type
```bash
# Daily categories
curl http://localhost:3001/api/categories?type=DAILY_TIME_BASED

# Usage-based categories
curl http://localhost:3001/api/categories?type=USAGE_BASED

# Fixed expense categories
curl http://localhost:3001/api/categories?type=FIXED_ONE_TIME
```

### Get Dashboard Summary
```bash
curl http://localhost:3001/api/dashboard/summary
```

### Filter Transactions
```bash
# By date range
curl http://localhost:3001/api/transactions?dateFrom=2024-12-15&dateTo=2024-12-20

# By category
curl http://localhost:3001/api/transactions?categoryId=CATEGORY_ID

# By type
curl http://localhost:3001/api/transactions?type=EXPENSE
```

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation succeeded"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { /* error details */ }
  }
}
```

## Common Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `PROFILE_NOT_FOUND` | No active profile | 404 |
| `INSUFFICIENT_BALANCE` | Not enough funds | 400 |
| `CATEGORY_NOT_FOUND` | Category doesn't exist | 404 |
| `TRANSACTION_NOT_FOUND` | Transaction doesn't exist | 404 |
| `FIXED_EXPENSE_ALREADY_PAID` | Bill already paid | 400 |
| `VALIDATION_FAILED` | Invalid input data | 400 |
| `INTERNAL_ERROR` | Server error | 500 |

## Currency Format

All monetary values are stored as **integer cents**:
- RM1000.50 = 100050 cents
- RM100 = 10000 cents
- RM10 = 1000 cents
- RM1 = 100 cents

API responses include formatted values:
```json
{
  "currentBalanceCents": 100050,
  "currentBalance": "RM1000.50"
}
```

## Date Format

All dates use **ISO 8601** format (YYYY-MM-DD):
- Today: `2024-12-19`
- Tomorrow: `2024-12-20`
- Next month: `2025-01-19`

## Category Types

### 1. DAILY_TIME_BASED
Daily spending with preferred amount:
```json
{
  "type": "DAILY_TIME_BASED",
  "preferredDailyAmountCents": 10000,
  "allocatedAmountCents": 300000
}
```

### 2. USAGE_BASED
Spending based on usage (e.g., fuel):
```json
{
  "type": "USAGE_BASED",
  "allocatedAmountCents": 200000,
  "protected": true
}
```

### 3. FIXED_ONE_TIME
Fixed expenses with due date:
```json
{
  "type": "FIXED_ONE_TIME",
  "expectedAmountCents": 50000,
  "dueDate": "2024-12-25"
}
```

## Common Workflows

### 1. Create Profile
```bash
curl -X POST http://localhost:3001/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "MYR",
    "expectedSalaryCents": 500000,
    "openingBalanceCents": 100000,
    "currentBalanceCents": 100000,
    "salaryCycleStartDate": "2024-12-05",
    "nextPayday": "2024-12-25"
  }'
```

### 2. Create Categories
```bash
# Food category (daily)
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food",
    "type": "DAILY_TIME_BASED",
    "allocatedAmountCents": 300000,
    "preferredDailyAmountCents": 15000
  }'

# Fuel category (usage-based)
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fuel",
    "type": "USAGE_BASED",
    "allocatedAmountCents": 200000,
    "protected": true
  }'

# Internet bill (fixed)
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Internet",
    "type": "FIXED_ONE_TIME",
    "allocatedAmountCents": 12000,
    "expectedAmountCents": 12000,
    "dueDate": "2024-12-25"
  }'
```

### 3. Record a Transaction
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "food-category-id",
    "type": "EXPENSE",
    "amountCents": 50000,
    "description": "Lunch at restaurant",
    "transactionDate": "2024-12-19"
  }'
```

### 4. Pay a Fixed Expense
```bash
curl -X POST http://localhost:3001/api/fixed-expenses/internet-category-id/pay \
  -H "Content-Type: application/json" \
  -d '{
    "actualAmountCents": 12000,
    "paymentDate": "2024-12-25"
  }'
```

### 5. Get Forecast
```bash
curl http://localhost:3001/api/forecast/today
```

## Running Tests

```bash
# All tests
npm test

# Integration tests only
npm test tests/integration/api.test.ts

# Unit tests only
npm test tests/unit/financial-forecast.service.test.ts

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Debugging

### Check TypeScript Compilation
```bash
npm run build
```

### Check Code Linting
```bash
npm run lint
```

### View Server Logs
The server logs all requests in format:
```
✓ GET /api/profile - 200 (45ms)
✓ POST /api/transactions - 201 (32ms)
✗ GET /api/categories/invalid - 404 (10ms)
```

## Environment Variables

Create `.env` file in `FBA_BE` directory:
```
PORT=3001
NODE_ENV=development
USE_REAL_DB=false
```

## Production Considerations

1. **Database**: Currently using in-memory storage. For production, integrate PostgreSQL using the repository pattern.
2. **Authentication**: Add JWT token validation middleware
3. **Rate Limiting**: Add rate limiting middleware for API protection
4. **Logging**: Use a proper logging library (e.g., Winston, Pino)
5. **Environment Variables**: Use a .env.production file with production settings

## CORS

API has CORS enabled for all origins by default. To restrict:
```typescript
// In app.ts
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
```
