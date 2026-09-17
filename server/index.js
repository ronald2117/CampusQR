const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const scanRoutes = require('./routes/scan');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - permissive for development
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      const allowedOrigins = [
        'https://campusqr-client.onrender.com',
        'http://localhost:5173'
      ];
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.errors
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }
    
    // Check if we are running in Production on Render
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // 🌐 RENDER PRODUCTION MODE: Standard HTTP Server
      // Render handles the HTTPS layer automatically before it reaches Node.js
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Production HTTP Server running on port ${PORT}`);
        console.log(`🌍 Environment: production`);
      });
    } else {
      // 💻 LOCAL DEVELOPMENT MODE: Custom HTTPS setup for your local network/camera testing
      const certPath = path.join(__dirname, '../client/192.168.1.16+2.pem');
      const keyPath = path.join(__dirname, '../client/192.168.1.16+2-key.pem');
      const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);
      
      if (useHttps) {
        const httpsOptions = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        };
        
        const httpsServer = https.createServer(httpsOptions, app);
        httpsServer.listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 HTTPS Server running on port ${PORT}`);
          console.log(`📊 Local: https://localhost:${PORT}/api/health`);
          console.log(`🌐 Network: https://0.0.0.0:${PORT}/api/health`);
          console.log(`🔒 HTTPS Enabled (for camera access on mobile)`);
          console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
        
        const httpPort = 3000;
        const httpServer = http.createServer((req, res) => {
          res.writeHead(301, { "Location": `https://${req.headers.host.replace(httpPort, PORT)}${req.url}` });
          res.end();
        });
        
        httpServer.listen(httpPort, '0.0.0.0', () => {
          console.log(`↪️  HTTP Redirect server running on port ${httpPort}`);
        });
      } else {
        // Local HTTP Fallback
        console.log('⚠️  HTTPS certificates not found. Running in HTTP mode.');
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 HTTP Server running on port ${PORT}`);
          console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
