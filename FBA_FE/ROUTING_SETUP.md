# Testing SPA Routing Locally

## Local Testing Steps

### 1. Build the frontend
```bash
cd FBA_FE
npm run build
```
This creates a `build/` folder with the production build.

### 2. Start the SPA server
```bash
npm run serve
```
This starts the Node.js server on `http://localhost:3000`

### 3. Test routing (open each in a browser and reload - should work!)
- http://localhost:3000 (Dashboard)
- http://localhost:3000/profile (reload - should NOT show "Not Found")
- http://localhost:3000/transactions (reload - should NOT show "Not Found")
- http://localhost:3000/categories (reload - should NOT show "Not Found")

### 4. If it works locally
```bash
git add .
git commit -m "fix: Use Node.js server for SPA routing"
git push origin master
```

This will redeploy to Render with the new server.

## How It Works

- `server.js` is a simple Node.js HTTP server
- It serves static files from the `build/` folder
- For any route without a file extension, it serves `index.html`
- React Router then handles client-side routing
- This is the standard SPA pattern used by create-react-app

## Production Deployment

Render will:
1. Run `npm run build` to create the production build
2. Run `npm run serve` to start the server
3. The frontend will be accessible at https://financial-behavior-analysis-fe.onrender.com
