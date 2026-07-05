#!/usr/bin/env node

/**
 * Entry point for production deployment on Render
 * This script starts the FBA_BE server
 */

const path = require('path');
const { spawn } = require('child_process');

// Change to FBA_BE directory
process.chdir(path.join(__dirname, 'FBA_BE'));

// Start the backend server
const server = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true,
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code);
});
