# Financial Behavior Analysis - Setup Guide

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Database Setup
Create a PostgreSQL database:
```sql
CREATE DATABASE fba_development;
```

### 2. Backend Setup
```bash
cd FBA_BE
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm start
```

The backend server will run on `http://localhost:3001`

### 3. Frontend Setup
```bash
cd FBA_FE
npm install
npm start
```

The frontend will open on `http://localhost:3000`

### 4. Development Mode (Run Both)
From the root directory:
```bash
npm run dev
```

This will run both frontend and backend concurrently.

## Project Features (To Be Implemented)

- User authentication and profiles
- Financial transaction tracking
- Behavior analysis and insights
- Dashboard with charts and statistics
- Data export functionality
- Budget planning tools

## Database Migrations

To create a new migration:
```bash
cd FBA_BE
npx knex migrate:make migration_name --env development
```

To run migrations:
```bash
npm run migrate
```

## Environment Variables

See `.env.example` in `FBA_BE` directory for all available configuration options.

## Troubleshooting

### Port Already in Use
If port 3001 or 3000 is already in use, update the port in `.env` or use:
```bash
npm start -- --port 3002
```

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

## Next Steps

1. Design database schema
2. Create API endpoints
3. Build React components
4. Implement authentication
5. Add data visualization
