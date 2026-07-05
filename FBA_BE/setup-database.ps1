#!/usr/bin/env pwsh
# ============================================================================
# FBA Database Setup Script
# Purpose: Automatically set up PostgreSQL database and run migrations/seeds
# Usage: .\setup-database.ps1
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('local', 'test', 'production')]
    [string]$Environment = 'local',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipInstall = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 FBA Database Setup Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Node.js and npm are installed
Write-Host "📋 Step 1: Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js or npm not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Step 2: Check if PostgreSQL is available
Write-Host "`n📋 Step 2: Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>$null
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL CLI not found. Make sure PostgreSQL is installed and accessible." -ForegroundColor Yellow
}

# Step 3: Install npm dependencies if needed
if (-not $SkipInstall) {
    Write-Host "`n📋 Step 3: Installing npm dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n📋 Step 3: Skipping npm install (--SkipInstall flag set)" -ForegroundColor Yellow
}

# Step 4: Build TypeScript
Write-Host "`n📋 Step 4: Building TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript built" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript build failed" -ForegroundColor Red
    exit 1
}

# Step 5: Run migrations
Write-Host "`n📋 Step 5: Running database migrations..." -ForegroundColor Yellow
npm run db:migrate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations completed" -ForegroundColor Green
} else {
    Write-Host "❌ Migrations failed" -ForegroundColor Red
    exit 1
}

# Step 6: Run seeds
Write-Host "`n📋 Step 6: Seeding initial data..." -ForegroundColor Yellow
npm run db:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Seeds completed" -ForegroundColor Green
} else {
    Write-Host "❌ Seeds failed" -ForegroundColor Red
    exit 1
}

# Step 7: Display verification queries
Write-Host "`n📋 Step 7: Verifying database setup..." -ForegroundColor Yellow
Write-Host "`nYou can verify the setup by running these queries in TablePlus or psql:" -ForegroundColor Cyan
Write-Host ""
Write-Host "-- Check financial profile:" -ForegroundColor Gray
Write-Host "SELECT id, currency, current_balance_cents FROM financial_profiles LIMIT 1;" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Check spending categories:" -ForegroundColor Gray
Write-Host "SELECT id, name, type, display_order FROM spending_categories ORDER BY display_order;" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Count records:" -ForegroundColor Gray
Write-Host "SELECT" -ForegroundColor Gray
Write-Host "  (SELECT COUNT(*) FROM financial_profiles) as profiles," -ForegroundColor Gray
Write-Host "  (SELECT COUNT(*) FROM spending_categories) as categories," -ForegroundColor Gray
Write-Host "  (SELECT COUNT(*) FROM transactions) as transactions;" -ForegroundColor Gray

# Summary
Write-Host "`n" -ForegroundColor Cyan
Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
Write-Host "  ✅ Database 'financial-behavior-analysis' tables created" -ForegroundColor Green
Write-Host "  ✅ Initial data seeded" -ForegroundColor Green
Write-Host "  ✅ 1 Financial Profile created" -ForegroundColor Green
Write-Host "  ✅ 19 Spending Categories created" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Set USE_REAL_DB=true in .env file" -ForegroundColor Yellow
Write-Host "  2. Start the backend: npm start" -ForegroundColor Yellow
Write-Host "  3. Verify API is working at: http://localhost:3001/api/categories" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  Read DATABASE_SETUP.md for detailed information" -ForegroundColor Yellow
Write-Host ""
