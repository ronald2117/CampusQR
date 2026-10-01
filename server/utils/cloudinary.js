const { v2: cloudinary } = require('cloudinary');
const logger = require('./logger');

/**
 * Lazily configure Cloudinary the first time it's used.
 * Also validates that credentials are actually present.
 */
let configured = false;

const ensureConfigured = () => {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, ' +
      'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Render environment.'
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  configured = true;
};

/**
 * Call this at server startup to log Cloudinary config status.
 * Does NOT throw — only logs a warning if credentials are missing.
 */
const checkCloudinaryConfig = () => {
  const ok = !!(process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY    &&
                process.env.CLOUDINARY_API_SECRET);
  if (ok) {
    logger.info('✅ Cloudinary configured', { cloud: process.env.CLOUDINARY_CLOUD_NAME });
  } else {
    logger.warn(
      '⚠️  Cloudinary credentials NOT set — photo uploads will be skipped. ' +
      'Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET ' +
      'to your Render environment variables.'
    );
  }
  return ok;
};

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer   - File buffer from multer memoryStorage.
 * @param {object} options  - Extra Cloudinary upload options.
 * @returns {Promise<object>} { secure_url, public_id, … }
 */
const uploadToCloudinary = (buffer, options = {}) => {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        'campusqr/students',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary by its public_id.
 * Silently succeeds if the asset doesn't exist or publicId is null.
 * @param {string|null} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    ensureConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    logger.warn('Cloudinary delete failed', { publicId, error: err.message });
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, checkCloudinaryConfig };
