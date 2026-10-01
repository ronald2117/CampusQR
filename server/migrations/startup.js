/**
 * migrations/startup.js
 *
 * Runs all pending schema migrations automatically when the server starts.
 * Each migration is idempotent — safe to run multiple times.
 *
 * To add a new migration: push an entry to the MIGRATIONS array below.
 * The `name` must be unique and is used to track whether it has already run.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/database');
const logger   = require('../utils/logger');

// ── Migration registry ──────────────────────────────────────────────────────
const MIGRATIONS = [
  {
    name: 'add_photo_public_id_to_students',
    sql:  `ALTER TABLE students
           ADD COLUMN photo_public_id VARCHAR(255) DEFAULT NULL
           AFTER photo_url`,
    // Column to check for existence before running
    check: {
      table:  'students',
      column: 'photo_public_id',
    },
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if `column` already exists in `table`.
 */
const columnExists = async (table, column) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME   = ?
       AND COLUMN_NAME  = ?
     LIMIT 1`,
    [table, column]
  );
  return rows.length > 0;
};

// ── Main runner ──────────────────────────────────────────────────────────────

const runStartupMigrations = async () => {
  logger.info('Running startup migrations…');
  let ran = 0;

  for (const migration of MIGRATIONS) {
    try {
      let shouldRun = true;

      // Column-existence pre-check (most common guard)
      if (migration.check?.column) {
        shouldRun = !(await columnExists(migration.check.table, migration.check.column));
      }

      if (!shouldRun) {
        logger.debug(`Migration already applied, skipping: ${migration.name}`);
        continue;
      }

      await pool.query(migration.sql);
      ran++;
      logger.info(`Migration applied: ${migration.name}`);
    } catch (err) {
      // Log but don't crash — a failed optional migration should not block startup
      logger.error(`Migration failed: ${migration.name}`, {
        error: err.message,
        code:  err.code,
      });
    }
  }

  if (ran === 0) {
    logger.info('All migrations already up to date.');
  } else {
    logger.info(`${ran} migration(s) applied.`);
  }
};

module.exports = { runStartupMigrations };
