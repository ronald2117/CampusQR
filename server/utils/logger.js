/**
 * utils/logger.js
 *
 * Centralised Winston logger for CampusQR.
 *
 * - In production:  logs go to stdout (Render streams these to its dashboard)
 *                   AND to rotating daily files under logs/
 * - In development: pretty, colourised console output only
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Server started', { port: 3001 });
 *   logger.error('Something broke', { error: err.message, stack: err.stack });
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs   = require('fs');

const isProduction = process.env.NODE_ENV === 'production';

// ── Ensure the logs directory exists (local dev only) ──
const logsDir = path.join(__dirname, '../logs');
if (!isProduction && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ── Shared formats ──
const timestampFmt = format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });

const jsonFmt = format.combine(
  timestampFmt,
  format.errors({ stack: true }),
  format.json()
);

const prettyFmt = format.combine(
  timestampFmt,
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// ── Transport list ──
const logTransports = [];

if (isProduction) {
  // Render captures stdout/stderr — use Console with JSON for easy searching
  logTransports.push(
    new transports.Console({ format: jsonFmt })
  );

  // Also try daily-rotate files (only works if the filesystem is writable)
  try {
    const DailyRotateFile = require('winston-daily-rotate-file');

    logTransports.push(
      new DailyRotateFile({
        filename:    path.join(logsDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level:       'error',
        maxSize:     '10m',
        maxFiles:    '7d',
        format:      jsonFmt,
      }),
      new DailyRotateFile({
        filename:    path.join(logsDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize:     '20m',
        maxFiles:    '7d',
        format:      jsonFmt,
      })
    );
  } catch (_) {
    // winston-daily-rotate-file not available — Console-only is fine on Render
  }
} else {
  // Local dev: pretty colourised console
  logTransports.push(new transports.Console({ format: prettyFmt }));
}

const logger = createLogger({
  level:      process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  transports: logTransports,
  // Don't crash the process on unhandled logger errors
  exitOnError: false,
});

// ── Create a stream for Morgan HTTP request logging ──
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
