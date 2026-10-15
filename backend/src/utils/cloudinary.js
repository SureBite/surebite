import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.trim() : undefined,
  api_key: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : undefined,
  api_secret: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : undefined,
  secure: true,
});

/**
 * Checks if Cloudinary credentials are fully configured.
 */
export const isCloudinaryConfigured = () => {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET) ||
      process.env.CLOUDINARY_URL
  );
};

/**
 * Uploads an in-memory buffer directly to Cloudinary using upload_stream.
 * Ensures no photos are saved to local server or disk.
 *
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Additional Cloudinary upload parameters
 * @returns {Promise<{ secure_url: string, public_id: string, url: string }>}
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env'
        )
      );
    }

    const defaultOptions = {
      folder: 'surebite/menus',
      resource_type: 'image',
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID.
 *
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<any>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn('Failed to delete image from Cloudinary:', error.message);
    return null;
  }
};

export default cloudinary;
