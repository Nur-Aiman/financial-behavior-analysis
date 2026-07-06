/**
 * Database Connection Module
 * Provides a singleton connection to PostgreSQL via Knex
 */

import knex from 'knex';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let dbInstance = null;

export function initializeDatabase() {
  if (!dbInstance) {
    const knexfilePath = join(__dirname, '../../config/knexfile.js');
    // Dynamic import for knexfile
    import(knexfilePath).then((knexfileModule) => {
      const knexfile = knexfileModule.default;
      const env = process.env.NODE_ENV || 'development';
      console.log(`Initializing database for environment: ${env}`);
      dbInstance = knex(knexfile[env]);
      console.log('✅ Database connection initialized');
    }).catch((err) => {
      console.error('Error loading knexfile:', err);
      process.exit(1);
    });
  }
  return dbInstance;
}

export function getDatabase() {
  if (!dbInstance) {
    return initializeDatabase();
  }
  return dbInstance;
}

export const db = getDatabase;




