import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * File Service
 * Handles file operations and validations
 */

/**
 * Allowed file types configuration
 */
export const FILE_TYPES = {
  images: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    mimetypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  documents: {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'csv'],
    mimetypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  archives: {
    extensions: ['zip', 'rar', '7z', 'tar', 'gz'],
    mimetypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  all: {
    extensions: [
      'jpg', 'jpeg', 'png', 'gif', 'webp',
      'pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'csv',
      'zip', 'rar', '7z', 'tar', 'gz',
    ],
    mimetypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedType = 'all') => {
  const config = FILE_TYPES[allowedType] || FILE_TYPES.all;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  // Check extension
  if (!config.extensions.includes(ext)) {
    throw new Error(
      `Invalid file type. Allowed types: ${config.extensions.join(', ')}`
    );
  }

  // Check mimetype
  if (!config.mimetypes.includes(file.mimetype)) {
    throw new Error('Invalid file mimetype');
  }

  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(2);
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }

  return true;
};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename) => {
  // Remove special characters and spaces
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalname) => {
  const ext = path.extname(originalname);
  const name = path.basename(originalname, ext);
  const sanitized = sanitizeFilename(name);
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  return `${sanitized}-${timestamp}-${random}${ext}`;
};

/**
 * Get file info from uploaded file
 */
export const getFileInfo = (file, baseUrl = '') => {
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `${baseUrl}/uploads/${file.filename}`,
  };
};

/**
 * Delete file from filesystem
 */
export const deleteFile = async (filename) => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadPath, filename);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Delete multiple files
 */
export const deleteFiles = async (filenames) => {
  const results = await Promise.allSettled(
    filenames.map((filename) => deleteFile(filename))
  );
  return results.map((result, index) => ({
    filename: filenames[index],
    success: result.status === 'fulfilled' && result.value,
  }));
};

/**
 * Check if file exists
 */
export const fileExists = async (filename) => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadPath, filename);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase().slice(1);
};

/**
 * Check if file is an image
 */
export const isImage = (filename) => {
  const ext = getFileExtension(filename);
  return FILE_TYPES.images.extensions.includes(ext);
};

/**
 * Check if file is a document
 */
export const isDocument = (filename) => {
  const ext = getFileExtension(filename);
  return FILE_TYPES.documents.extensions.includes(ext);
};

/**
 * Ensure upload directory exists
 */
export const ensureUploadDir = async () => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    await fs.mkdir(uploadPath, { recursive: true });
    return true;
  } catch (error) {
    console.error('Error creating upload directory:', error);
    return false;
  }
};

/**
 * Get upload directory stats
 */
export const getUploadStats = async () => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const files = await fs.readdir(uploadPath);
    
    let totalSize = 0;
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(uploadPath, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      })
    );

    return {
      totalFiles: files.length,
      totalSize,
      totalSizeFormatted: formatFileSize(totalSize),
      files: fileStats,
    };
  } catch (error) {
    console.error('Error getting upload stats:', error);
    return null;
  }
};

/**
 * Clean old files (older than specified days)
 */
export const cleanOldFiles = async (daysOld = 30) => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const files = await fs.readdir(uploadPath);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;

    const deletedFiles = [];

    for (const file of files) {
      const filePath = path.join(uploadPath, file);
      const stats = await fs.stat(filePath);
      const age = now - stats.mtime.getTime();

      if (age > maxAge) {
        await fs.unlink(filePath);
        deletedFiles.push(file);
      }
    }

    return {
      success: true,
      deletedCount: deletedFiles.length,
      deletedFiles,
    };
  } catch (error) {
    console.error('Error cleaning old files:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  FILE_TYPES,
  validateFileType,
  sanitizeFilename,
  generateUniqueFilename,
  getFileInfo,
  deleteFile,
  deleteFiles,
  fileExists,
  formatFileSize,
  getFileExtension,
  isImage,
  isDocument,
  ensureUploadDir,
  getUploadStats,
  cleanOldFiles,
};

// Made with Bob
