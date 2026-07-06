/**
 * Create Database Backup for Production Import
 * 
 * This script:
 * 1. Exports all FBA data from dev database
 * 2. Creates a SQL dump file
 * 3. Can be imported into production database via Render console
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import knex from 'knex';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 Creating Database Backup for Production Import\n');

const devDb = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'financial-behavior-analysis',
    port: process.env.DB_PORT || 5432,
  },
});

async function createBackup() {
  try {
    console.log('🔗 Connecting to development database...');
    await devDb.raw('SELECT 1');
    console.log('✅ Connected\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupFile = path.join(__dirname, '..', `fba-backup-${timestamp}.sql`);
    const dataFile = path.join(__dirname, '..', `fba-data-${timestamp}.json`);

    const tables = [
      'spending_categories',
      'transactions',
      'financial_profiles',
      'balance_adjustments',
      'fixed_expense_payments',
      'spending_logs',
      'audit_logs',
    ];

    let sqlScript = '-- FBA Database Backup for Production Import\n';
    sqlScript += `-- Created: ${new Date().toISOString()}\n`;
    sqlScript += `-- Source: Development Database (${process.env.DB_NAME})\n`;
    sqlScript += '-- Instructions: Run this SQL in Render PostgreSQL console\n\n';

    // Clear existing data
    sqlScript += '-- Clear existing FBA data (optional - uncomment if needed)\n';
    sqlScript += '-- DELETE FROM spending_logs;\n';
    sqlScript += '-- DELETE FROM audit_logs;\n';
    sqlScript += '-- DELETE FROM fixed_expense_payments;\n';
    sqlScript += '-- DELETE FROM balance_adjustments;\n';
    sqlScript += '-- DELETE FROM transactions;\n';
    sqlScript += '-- DELETE FROM financial_profiles;\n';
    sqlScript += '-- DELETE FROM spending_categories;\n\n';

    const jsonData = {};

    console.log('📊 Exporting data from all tables...\n');

    for (const table of tables) {
      const data = await devDb.select('*').from(table);
      jsonData[table] = data;

      console.log(`📋 ${table}: ${data.length} rows`);

      if (data.length > 0) {
        sqlScript += `\n-- Table: ${table}\n`;
        sqlScript += `INSERT INTO ${table} (`;

        // Get column names from first row
        const columns = Object.keys(data[0]);
        sqlScript += columns.join(', ');
        sqlScript += ') VALUES\n';

        // Add data rows
        data.forEach((row, idx) => {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            if (typeof val === 'string') {
              // Escape single quotes
              const escaped = val.replace(/'/g, "''");
              return `'${escaped}'`;
            }
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val.toString();
          });

          sqlScript += `(${values.join(', ')})`;
          if (idx < data.length - 1) sqlScript += ',\n';
          else sqlScript += ';\n';
        });
      }
    }

    // Save SQL backup
    fs.writeFileSync(backupFile, sqlScript);
    console.log(`\n✅ SQL backup created: ${backupFile}`);

    // Save JSON backup
    fs.writeFileSync(dataFile, JSON.stringify(jsonData, null, 2));
    console.log(`✅ JSON backup created: ${dataFile}\n`);

    console.log('📋 Import Instructions:\n');
    console.log('Option 1: Using Render Console');
    console.log('---------------------------------');
    console.log('1. Go to Render Dashboard → Your Database → Console');
    console.log('2. Copy-paste the SQL from the .sql file above');
    console.log('3. Execute the SQL\n');

    console.log('Option 2: Using Command Line (if you have pg_restore)');
    console.log('------------------------------------------------------');
    console.log('1. Get your database URL from Render\n');
    console.log('2. Run: PGPASSWORD=<password> psql <connection_string> < ' + backupFile + '\n');

    console.log('Option 3: Programmatic Import');
    console.log('------------------------------');
    console.log('See scripts/restore-data-from-backup.js\n');

    console.log('🎉 Backup files ready for production import!\n');
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    process.exit(1);
  } finally {
    await devDb.destroy();
  }
}

createBackup();
