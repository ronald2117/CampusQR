/**
 * Migration: add photo_public_id column to students table
 *
 * Run once:  node server/migrations/add_photo_public_id.js
 *
 * The column stores the Cloudinary public_id so assets can be
 * properly destroyed when a student photo is updated or deleted.
 * Existing rows will have NULL — their old local-path photo_url
 * values remain intact until the photo is re-uploaded via the UI.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/database');

const runMigration = async () => {
  console.log('Running migration: add photo_public_id to students...');

  try {
    // Check if column already exists to make migration idempotent
    const [cols] = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'students'
        AND COLUMN_NAME  = 'photo_public_id'
    `);

    if (cols.length > 0) {
      console.log('✅ Column photo_public_id already exists — skipping.');
      process.exit(0);
    }

    await pool.query(`
      ALTER TABLE students
      ADD COLUMN photo_public_id VARCHAR(255) DEFAULT NULL
      AFTER photo_url
    `);

    console.log('✅ Migration complete: photo_public_id column added.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigration();
