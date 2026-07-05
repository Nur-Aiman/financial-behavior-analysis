/**
 * Express App Setup
 */

import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import { errorHandler, requestLogger, devRouteProtection} from './middleware.js';

export const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://financial-behavior-analysis-fe.onrender.com',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Dev route protection for development endpoints
app.use('/api/dev', devRouteProtection);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;




