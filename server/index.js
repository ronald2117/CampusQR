const express   = require('express');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan    = require('morgan');
const path      = require('path');
const https     = require('https');
const http      = require('http');
const fs        = require('fs');
require('dotenv').config();

const logger             = require('./utils/logger');
const { testConnection } = require('./config/database');
const { runStartupMigrations } = require('./migrations/startup');
const { checkCloudinaryConfig } = require('./utils/cloudinary');

// Import routes
const authRoutes      = require('./routes/auth');
const studentRoutes   = require('./routes/students');
const scanRoutes      = require('./routes/scan');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes      = require('./routes/users');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────────────────────
// 1.  CORS — hand-rolled so headers are set unconditionally on EVERY response,
//     including errors, 401s, 404s, and crashes.
//     The cors() package only sets headers when its callback fires correctly;
//     if it throws or the request hits an error handler first, headers are lost.
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://campusqr-client.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const isAllowed =
    process.env.NODE_ENV !== 'production' ||   // dev: allow everything
    !origin ||                                  // server-to-server / curl
    ALLOWED_ORIGINS.includes(origin);

  // Always write these headers — even on errors the browser needs them
  res.setHeader(
    'Access-Control-Allow-Origin',
    isAllowed ? (origin || '*') : 'null'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  res.setHeader('Access-Control-Max-Age', '86400'); // cache preflight 24 h

  // Respond to pre-flight immediately — no further middleware needed
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isAllowed) {
    logger.warn('CORS blocked request', { origin, path: req.path });
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }

  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.  Security headers (after CORS so it doesn't overwrite our CORS headers)
// ─────────────────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy:  { policy: 'cross-origin' },
  crossOriginEmbedderPolicy:  false,
}));

// ─────────────────────────────────────────────────────────────────────────────
// 3.  Rate limiting
// ─────────────────────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             300,
  message:         { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use(limiter);

// ─────────────────────────────────────────────────────────────────────────────
// 4.  Logging
// ─────────────────────────────────────────────────────────────────────────────
app.use(morgan('combined', { stream: logger.stream }));

// ─────────────────────────────────────────────────────────────────────────────
// 5.  Body parsing
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────────────────────────────────────
// 6.  Static files (local dev only — Cloudinary handles uploads in prod)
// ─────────────────────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────────────────────────────────────────
// 7.  API Routes
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/students',  studentRoutes);
app.use('/api/scan',      scanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users',     userRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 8.  Health check
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'OK',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
    env:       process.env.NODE_ENV || 'development',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9.  Global error handler
//     NOTE: CORS headers are already set by middleware #1, so errors here
//     will always include them — the browser can read the error body.
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  const status  = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Unhandled error', {
    status,
    message,
    method: req.method,
    path:   req.path,
    ip:     req.ip,
    stack:  err.stack,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation Error', errors: err.errors });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  res.status(status).json({ success: false, message });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. 404 catch-all
// ─────────────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  logger.warn('Route not found', { method: req.method, path: req.originalUrl });
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─────────────────────────────────────────────────────────────────────────────
// Server startup
// ─────────────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // Auto-apply any pending schema migrations
    await runStartupMigrations();

    // Log whether Cloudinary photo uploads are available
    checkCloudinaryConfig();

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      app.listen(PORT, '0.0.0.0', () => {
        logger.info('Production server started', { port: PORT });
      });
    } else {
      const certPath = path.join(__dirname, '../client/192.168.1.16+2.pem');
      const keyPath  = path.join(__dirname, '../client/192.168.1.16+2-key.pem');
      const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);

      if (useHttps) {
        const httpsServer = https.createServer(
          { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) },
          app
        );
        httpsServer.listen(PORT, '0.0.0.0', () => {
          logger.info('HTTPS server started', { port: PORT });
        });

        const httpPort   = 3000;
        const httpServer = http.createServer((_req, res) => {
          res.writeHead(301, {
            Location: `https://${_req.headers.host.replace(httpPort, PORT)}${_req.url}`,
          });
          res.end();
        });
        httpServer.listen(httpPort, '0.0.0.0', () => {
          logger.info('HTTP redirect server started', { port: httpPort });
        });
      } else {
        logger.warn('HTTPS certificates not found — running HTTP mode');
        app.listen(PORT, '0.0.0.0', () => {
          logger.info('HTTP server started', { port: PORT, env: process.env.NODE_ENV || 'development' });
        });
      }
    }
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();
