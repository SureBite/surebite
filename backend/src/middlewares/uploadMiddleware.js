import multer from 'multer';

// Use memory storage so files are streamed directly to Cloudinary and not saved on server disk
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Choose a JPG, PNG or WebP image.'));
  }
});