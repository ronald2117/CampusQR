const { v2: cloudinary } = require('cloudinary');

// Initialize Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer   - The file buffer from multer memoryStorage.
 * @param {object} options  - Cloudinary upload options (folder, public_id, etc.)
 * @returns {Promise<object>} Cloudinary upload result ({ secure_url, public_id, ... })
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusqr/students',
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
    uploadStream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary by its public_id.
 * Silently succeeds if the asset doesn't exist (handles null gracefully).
 * @param {string|null} publicId
 * @returns {Promise<void>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    // Log but don't throw — a missing asset shouldn't block DB updates
    console.warn(`[Cloudinary] Could not delete asset "${publicId}":`, err.message);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
