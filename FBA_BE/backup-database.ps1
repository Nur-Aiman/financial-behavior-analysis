#!/usr/bin/env pwsh
# ============================================================================
# FBA Database Backup Script
# Purpose: Backup PostgreSQL database to SQL file
# Usage: .\backup-database.ps1 [-BackupPath "C:\Backups"]
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = "./db_backup",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "development"
)

# Retrieve environment variables
$dbHost = $env:DB_HOST ?? "localhost"
$dbUser = $env:DB_USER ?? "postgres"
$dbName = $env:DB_NAME ?? "financial-behavior-analysis"
$dbPort = $env:DB_PORT ?? "5432"

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "📁 Created backup directory: $BackupPath" -ForegroundColor Green
}

# Generate timestamp for backup file
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $BackupPath "fba_${Environment}_${timestamp}.sql"

# Run pg_dump to backup the database
Write-Host "🔄 Backing up PostgreSQL database..." -ForegroundColor Cyan
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Output: $backupFile" -ForegroundColor Gray
Write-Host ""

try {
    # Set PGPASSWORD environment variable for non-interactive password input
    $env:PGPASSWORD = $env:DB_PASSWORD ?? ""
    
    # Execute pg_dump
    & pg_dump `
        --host $dbHost `
        --port $dbPort `
        --username $dbUser `
        --format plain `
        --no-owner `
        --no-acl `
        --create `
        --clean `
        $dbName | Out-File -FilePath $backupFile -Encoding UTF8
    
    if ($LASTEXITCODE -eq 0) {
        $fileSize = (Get-Item $backupFile).Length / 1KB
        Write-Host "✅ Database backed up successfully" -ForegroundColor Green
        Write-Host "   File: $backupFile" -ForegroundColor Green
        Write-Host "   Size: $([Math]::Round($fileSize, 2)) KB" -ForegroundColor Green
    } else {
        Write-Host "❌ Backup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error during backup: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "💡 To restore this backup, run:" -ForegroundColor Cyan
Write-Host "   psql -U $dbUser -h $dbHost -d $dbName -f $backupFile" -ForegroundColor Gray
