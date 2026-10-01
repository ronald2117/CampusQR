const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan   = require('morgan');
const path     = require('path');
const https    = require('https');
const http     = require('http');
const fs       = require('fs');
require('dotenv').config();

const logger          = require('./utils/logger');
const { testConnection } = require('./config/database');
const { runStartupMigrations } = require('./migrations/startup');

// Import routes
const authRoutes      = require('./routes/auth');
const studentRoutes   = require('./routes/students');
const scanRoutes      = require('./routes/scan');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes      = require('./routes/users');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── 1. CORS — must come BEFORE helmet so headers aren't overwritten ──────────
const allowedOrigins = [
  'https://campusqr-client.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl (no Origin header)
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== 'production') {
      // Dev: allow everything
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn('CORS blocked request', { origin });
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Explicitly handle pre-flight for every route
  optionsSuccessStatus: 200,
}));

// Respond to all OPTIONS pre-flight requests immediately
app.options('*', cors());

// ── 2. Security headers (after CORS so it doesn't strip CORS headers) ───────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Don't set CORP for API responses — the CORS middleware already handles it
  crossOriginEmbedderPolicy: false,
}));

// ── 3. Rate limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max:      200,             // raised slightly for photo uploads
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use(limiter);

// ── 4. HTTP request logging via Morgan → Winston ─────────────────────────────
app.use(morgan('combined', { stream: logger.stream }));

// ── 5. Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── 6. Static files (local dev only — Cloudinary handles uploads in prod) ───
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 7. API routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/students',  studentRoutes);
app.use('/api/scan',      scanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users',     userRoutes);

// ── 8. Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'OK',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
    env:       process.env.NODE_ENV || 'development',
  });
});

// ── 9. Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  const status  = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Unhandled error', {
    status,
    message,
    method: req.method,
    path:   req.path,
    stack:  err.stack,
    ip:     req.ip,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation Error', errors: err.errors });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
  if (err.message?.includes('CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  res.status(status).json({ success: false, message });
});

// ── 10. 404 catch-all ─────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  logger.warn('Route not found', { method: req.method, path: req.originalUrl, ip: req.ip });
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Server startup ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Verify DB
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // Run pending migrations automatically
    await runStartupMigrations();

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Production server started`, { port: PORT, env: 'production' });
      });
    } else {
      const certPath = path.join(__dirname, '../client/192.168.1.16+2.pem');
      const keyPath  = path.join(__dirname, '../client/192.168.1.16+2-key.pem');
      const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);

      if (useHttps) {
        const httpsOptions = {
          key:  fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
        const httpsServer = https.createServer(httpsOptions, app);
        httpsServer.listen(PORT, '0.0.0.0', () => {
          logger.info(`HTTPS server started`, { port: PORT });
        });

        // HTTP → HTTPS redirect
        const httpPort   = 3000;
        const httpServer = http.createServer((_req, res) => {
          res.writeHead(301, { Location: `https://${_req.headers.host.replace(httpPort, PORT)}${_req.url}` });
          res.end();
        });
        httpServer.listen(httpPort, '0.0.0.0', () => {
          logger.info(`HTTP redirect server started`, { port: httpPort });
        });
      } else {
        logger.warn('HTTPS certificates not found — running in HTTP mode');
        app.listen(PORT, '0.0.0.0', () => {
          logger.info(`HTTP server started`, { port: PORT, env: process.env.NODE_ENV || 'development' });
        });
      }
    }
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();
