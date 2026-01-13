const express = require('express');
const os = require('os');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { exec } = require('child_process');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);
const router = express.Router();

router.get('/network-info', async (req, res) => {
  try {
    const networkInterfaces = os.networkInterfaces();
    const ips = [];

    Object.keys(networkInterfaces).forEach((interfaceName) => {
      const interfaces = networkInterfaces[interfaceName];
      
      interfaces.forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push(iface.address);
        }
      });
    });

    res.json({
      success: true,
      data: {
        ips,
        hostname: os.hostname(),
        platform: os.platform(),
        type: os.type()
      }
    });
  } catch (error) {
    console.error('Failed to get network info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve network information'
    });
  }
});

router.get('/test-connection', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Backend connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Connection test failed'
    });
  }
});

// Test database connection
router.post('/test-db', async (req, res) => {
  const { host, port, user, password, database } = req.body;
  
  try {
    // Try to connect without database first (in case it doesn't exist)
    const connection = await mysql.createConnection({
      host: host || 'localhost',
      port: port || 3306,
      user: user || 'root',
      password: password || ''
    });
    
    await connection.ping();
    await connection.end();
    
    res.json({
      success: true,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.json({
      success: false,
      message: `Connection failed: ${error.message}`
    });
  }
});

// Initialize database
router.post('/init-db', async (req, res) => {
  const { host, port, user, password, database, method } = req.body;
  let connection;
  
  try {
    // Connect to MySQL without database
    connection = await mysql.createConnection({
      host: host || 'localhost',
      port: port || 3306,
      user: user || 'root',
      password: password || ''
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database || 'campusqr'}\``);
    await connection.end();
    
    if (method === 'import') {
      // Import from SQL dump
      const sqlFilePath = path.join(__dirname, '../../campusqr_db.sql');
      const command = `mysql -h ${host || 'localhost'} -P ${port || 3306} -u ${user || 'root'} ${password ? `-p${password}` : ''} ${database || 'campusqr'} < "${sqlFilePath}"`;
      
      try {
        await execPromise(command);
        res.json({
          success: true,
          message: 'Database imported successfully from SQL dump'
        });
      } catch (error) {
        throw new Error(`SQL import failed: ${error.message}`);
      }
    } else {
      // Use setup script method
      connection = await mysql.createConnection({
        host: host || 'localhost',
        port: port || 3306,
        user: user || 'root',
        password: password || '',
        database: database || 'campusqr'
      });

      // Create tables
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'security') DEFAULT 'security',
          active BOOLEAN DEFAULT true,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS students (
          id INT PRIMARY KEY AUTO_INCREMENT,
          student_id VARCHAR(20) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          course VARCHAR(100) NOT NULL,
          year_level INT DEFAULT 1,
          enrollment_status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
          photo_url VARCHAR(255) NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_student_id (student_id),
          INDEX idx_email (email),
          INDEX idx_enrollment_status (enrollment_status),
          INDEX idx_active (active)
        )
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS access_logs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          student_id INT NULL,
          scanned_by INT NOT NULL,
          location VARCHAR(100) NULL,
          access_granted BOOLEAN NOT NULL,
          verification_type ENUM('qr', 'manual') DEFAULT 'qr',
          qr_data TEXT NULL,
          manual_reason TEXT NULL,
          error_message TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
          FOREIGN KEY (scanned_by) REFERENCES users(id) ON DELETE RESTRICT,
          
          INDEX idx_student_id (student_id),
          INDEX idx_scanned_by (scanned_by),
          INDEX idx_created_at (created_at),
          INDEX idx_access_granted (access_granted)
        )
      `);

      // Create default admin user
      const adminEmail = 'admin@campusqr.com';
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const [existingAdmin] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [adminEmail]
      );

      if (existingAdmin.length === 0) {
        await connection.execute(
          `INSERT INTO users (username, email, password, role, created_at, updated_at) 
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          ['admin', adminEmail, hashedPassword, 'admin']
        );
      }

      // Create sample security user
      const securityEmail = 'security@campusqr.com';
      const securityPassword = 'security123';
      const hashedSecurityPassword = await bcrypt.hash(securityPassword, 10);

      const [existingSecurity] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [securityEmail]
      );

      if (existingSecurity.length === 0) {
        await connection.execute(
          `INSERT INTO users (username, email, password, role, created_at, updated_at) 
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          ['security', securityEmail, hashedSecurityPassword, 'security']
        );
      }

      await connection.end();
      
      res.json({
        success: true,
        message: 'Database initialized successfully with default users'
      });
    }
  } catch (error) {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore close errors
      }
    }
    
    console.error('Database initialization failed:', error);
    res.json({
      success: false,
      message: `Database initialization failed: ${error.message}`
    });
  }
});

module.exports = router;
