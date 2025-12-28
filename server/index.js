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
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // In production, use whitelist
      const allowedOrigins = [
        'http://localhost:5173',
        'https://localhost:5173',
        'http://localhost:3000',
        'https://localhost:3000',
        'http://192.168.1.16:5173',
        'https://192.168.1.16:5173'
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
    
    // Check for HTTPS certificates - using network IP certificates
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
      // HTTP Server (fallback)
      console.log('⚠️  HTTPS certificates not found. Running in HTTP mode.');
      console.log('⚠️  Camera features may not work on mobile devices.');
      console.log(`📁 Looking for certificates at:`);
      console.log(`   - ${certPath}`);
      console.log(`   - ${keyPath}`);
      
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 HTTP Server running on port ${PORT}`);
        console.log(`📊 Local: http://localhost:${PORT}/api/health`);
        console.log(`🌐 Network: http://0.0.0.0:${PORT}/api/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
