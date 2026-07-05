/**
 * Database Connection Module
 * Provides a singleton connection to PostgreSQL via Knex
 */

import knex, { Knex} from 'knex';

let dbInstance= null;

export function initializeDatabase(): Knex {
  if (!dbInstance) {
    const knexfile = require('../../config/knexfile');
    const env = process.env.NODE_ENV || 'development';
    console.log(`Initializing database for environment: ${env}`);
    dbInstance = knex(knexfile[env]);}
  return dbInstance;}

export function getDatabase(): Knex {
  if (!dbInstance) {
    return initializeDatabase();}
  return dbInstance;}

export const db = getDatabase;



