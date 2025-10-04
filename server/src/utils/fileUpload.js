const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../middleware/errorMiddleware');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine proper subdirectory based on file type
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadsDir, 'avatars');
    } else if (file.fieldname === 'coverImage' || file.fieldname === 'image') {
      uploadPath = path.join(uploadsDir, 'blogs');
    } else if (file.fieldname === 'categoryImage') {
      uploadPath = path.join(uploadsDir, 'categories');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Format: fieldname-timestamp-random.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter to only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, GIF, and WebP files are allowed', 400), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware for handling file uploads
exports.uploadAvatar = upload.single('avatar');
exports.uploadBlogImage = upload.single('coverImage');
exports.uploadCategoryImage = upload.single('categoryImage');

// Middleware for uploading multiple blog images
exports.uploadBlogImages = upload.array('images', 5); // Max 5 images

// Helper function to format file URL
exports.getFileUrl = (req, filename) => {
  if (!filename) return null;
  
  const protocol = req.protocol;
  const host = req.get('host');
  
  return `${protocol}://${host}/${filename.replace(/\\/g, '/')}`;
}; 