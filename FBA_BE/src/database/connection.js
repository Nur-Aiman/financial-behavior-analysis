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
let knexfile = null;

// Setter function for knexfile (called by server.js)
export function setKnexfile(config) {
  knexfile = config;
}

export function initializeDatabase() {
  if (!dbInstance) {
    const env = process.env.NODE_ENV || 'development';
    try {
      if (!knexfile) {
        throw new Error('Knexfile not loaded. Server.js must call setKnexfile() first.');
      }
      dbInstance = knex(knexfile[env]);
      console.log(`✅ Database connection initialized for environment: ${env}`);
    } catch (err) {
      console.error('Error initializing database:', err);
      process.exit(1);
    }
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

