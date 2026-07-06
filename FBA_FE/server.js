#!/usr/bin/env node

/**
 * Frontend Server for React SPA
 * Serves static files and handles SPA routing
 * Usage: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, 'build');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(BUILD_DIR, req.url);

  // Normalize path
  if (filePath === BUILD_DIR + '/') {
    filePath = path.join(BUILD_DIR, 'index.html');
  }

  // Try to serve the requested file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found and it's not a file request, serve index.html (SPA routing)
      const ext = path.extname(filePath);
      if (!ext || ext === '') {
        // No extension = likely a route, serve index.html
        fs.readFile(path.join(BUILD_DIR, 'index.html'), (err, indexData) => {
          if (err) {
            res.writeHead(404);
            res.end('index.html not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexData);
        });
      } else {
        // It's a file request but not found
        res.writeHead(404);
        res.end('File not found');
      }
      return;
    }

    // Serve the file
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Cache busting headers
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Frontend SPA server running on http://localhost:${PORT}`);
  console.log(`📦 Serving from: ${BUILD_DIR}`);
  console.log(`🎯 SPA routing enabled - all routes serve index.html`);
});
