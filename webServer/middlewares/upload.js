const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create absolute paths for uploads
const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
['images', 'trailers', 'videos'].forEach(dir => {
  const fullPath = path.join(uploadPath, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    
    if (file.fieldname === 'trailer') {
      uploadDir = path.join(uploadDir, 'trailers');
    } else if (file.fieldname === 'movieFile') {
      uploadDir = path.join(uploadDir, 'videos');
    } else if (file.fieldname === 'mainImage' || file.fieldname === 'images') {
      uploadDir = path.join(uploadDir, 'images');
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Parse incoming form data
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Always allow categories field through
    if (file.fieldname === 'categories') {
      return cb(null, true);
    }
    // Handle file uploads
    if (file.fieldname === 'trailer') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Only video files are allowed'), false);
      }
    } else if (file.fieldname === 'mainImage' || file.fieldname === 'images') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
      }
    }
    cb(null, true);
  }
});

module.exports = upload;