const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateRemoveStaffRole() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'campusqr'
    });

    console.log('Connected to database');

    // Check if there are any users with 'staff' role
    const [staffUsers] = await connection.execute(
      'SELECT id, username, email, role FROM users WHERE role = ?',
      ['staff']
    );

    if (staffUsers.length > 0) {
      console.log(`\nFound ${staffUsers.length} user(s) with 'staff' role:`);
      staffUsers.forEach(user => {
        console.log(`  - ${user.username} (${user.email})`);
      });

      // Update all staff users to security role
      const [result] = await connection.execute(
        'UPDATE users SET role = ? WHERE role = ?',
        ['security', 'staff']
      );

      console.log(`\n✅ Updated ${result.affectedRows} user(s) from 'staff' to 'security' role`);
    } else {
      console.log('\nNo users with "staff" role found. Database is already clean.');
    }

    // Alter the table to remove 'staff' from ENUM
    console.log('\nUpdating users table ENUM to remove "staff" role...');
    
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('admin', 'security') DEFAULT 'security'
    `);

    console.log('✅ Successfully updated role ENUM to only include admin and security');

    // Verify the change
    const [finalCheck] = await connection.execute(
      'SELECT DISTINCT role FROM users ORDER BY role'
    );

    console.log('\nCurrent roles in database:');
    finalCheck.forEach(row => {
      console.log(`  - ${row.role}`);
    });

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run migration
migrateRemoveStaffRole();
