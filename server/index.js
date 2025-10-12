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

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'https://localhost:5173',
      'http://localhost:5174',
      'https://localhost:5174',
      'http://127.0.0.1:5173',
      'https://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://127.0.0.1:5174',
      'http://10.86.120.206:5173',
      'https://10.86.120.206:5173',
      'http://10.86.120.206:5174',
      'https://10.86.120.206:5174'
    ];
    
    const allowedPatterns = [
      /^https?:\/\/192\.168\.\d+\.\d+:(5173|5174)$/,
      /^https?:\/\/10\.\d+\.\d+\.\d+:(5173|5174)$/,
      /^https?:\/\/172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+:(5173|5174)$/
    ];
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin matches any pattern
    for (const pattern of allowedPatterns) {
      if (pattern.test(origin)) {
        return callback(null, true);
      }
    }
    
    // For development, allow all origins (remove this in production!)
    console.log('⚠️ Allowing origin:', origin, '(development mode)');
    return callback(null, true);
  },
  credentials: true
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

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }
    
    // Check for HTTPS certificates
    const certPath = path.join(__dirname, '../client/10.154.13.206+2.pem');
    const keyPath = path.join(__dirname, '../client/10.154.13.206+2-key.pem');
    
    const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);
    
    if (useHttps) {
      // HTTPS Server
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
      
      // Also start HTTP server for redirects (optional)
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
