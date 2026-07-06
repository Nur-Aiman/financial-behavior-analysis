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
  // Normalize URL (remove query strings and hash)
  let urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  
  // Always serve index.html for root
  if (urlPath === '/' || urlPath === '') {
    const filePath = path.join(BUILD_DIR, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('index.html not found');
        return;
      }
      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
    return;
  }

  let filePath = path.join(BUILD_DIR, urlPath);

  // Try to serve the requested file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // File not found - check if it's a route or an actual file request
      const ext = path.extname(urlPath);
      
      // If no extension or the file doesn't exist, it's likely a SPA route
      // Serve index.html for all SPA routes
      if (!ext || ext === '') {
        fs.readFile(path.join(BUILD_DIR, 'index.html'), (err, indexData) => {
          if (err) {
            res.writeHead(404);
            res.end('404 - Not Found');
            return;
          }
          res.writeHead(200, { 
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          });
          res.end(indexData);
        });
      } else {
        // It's a file request with an extension but file doesn't exist
        res.writeHead(404);
        res.end('404 - File not found');
      }
      return;
    }

    // Serve the file
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Cache busting headers - cache static assets, but not HTML
    const cacheControl = ext === '.html' 
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=31536000, immutable';
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Frontend SPA server running on http://localhost:${PORT}`);
  console.log(`📦 Serving from: ${BUILD_DIR}`);
  console.log(`🎯 SPA routing enabled - all routes serve index.html`);
});
