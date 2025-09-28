const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const setupDatabase = async () => {
  let connection;
  
  try {
    console.log('🔧 Setting up CampusQR database...');
    
    // Connect to MySQL (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'campusqr';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    
    // Close initial connection and reconnect with database selected
    await connection.end();
    
    // Reconnect with database specified
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: dbName
    });
    
    console.log(`✅ Database '${dbName}' created/selected`);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'security', 'staff') DEFAULT 'security',
        active BOOLEAN DEFAULT true,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create students table
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
    console.log('✅ Students table created');

    // Create access_logs table
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
    console.log('✅ Access logs table created');

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@campusqr.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin user already exists
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
      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      console.log('ℹ️  Admin user already exists');
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
      console.log(`✅ Security user created: ${securityEmail}`);
    }

    // Insert sample students
    const sampleStudents = [
      {
        student_id: 'STU001',
        name: 'John Doe',
        email: 'john.doe@university.edu',
        course: 'Computer Science',
        year_level: 3,
        enrollment_status: 'active'
      },
      {
        student_id: 'STU002',
        name: 'Jane Smith',
        email: 'jane.smith@university.edu',
        course: 'Information Technology',
        year_level: 2,
        enrollment_status: 'active'
      },
      {
        student_id: 'STU003',
        name: 'Bob Johnson',
        email: 'bob.johnson@university.edu',
        course: 'Engineering',
        year_level: 4,
        enrollment_status: 'active'
      },
      {
        student_id: 'STU004',
        name: 'Alice Brown',
        email: 'alice.brown@university.edu',
        course: 'Business Administration',
        year_level: 1,
        enrollment_status: 'active'
      }
    ];

    for (const student of sampleStudents) {
      const [existingStudent] = await connection.execute(
        'SELECT id FROM students WHERE student_id = ? OR email = ?',
        [student.student_id, student.email]
      );

      if (existingStudent.length === 0) {
        await connection.execute(
          `INSERT INTO students (student_id, name, email, course, year_level, enrollment_status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [student.student_id, student.name, student.email, student.course, student.year_level, student.enrollment_status]
        );
      }
    }
    console.log('✅ Sample students created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Default Login Credentials:');
    console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`   Security: ${securityEmail} / ${securityPassword}`);
    console.log('\n⚠️  Please change default passwords in production!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
