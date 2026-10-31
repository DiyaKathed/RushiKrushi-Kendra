const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'agro-' + uniqueSuffix + ext);
  }
});

// File filter for image security
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// @route   POST /api/upload
// @desc    Upload an image for product or crop guide
// @access  Private (Admin or Authenticated Farmer)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide an image file' });
    }

    // If Cloudinary is configured (recommended for Render & ephemeral production containers),
    // upload directly to Cloudinary CDN and remove temporary disk file.
    if (isCloudinaryConfigured) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'rushikrushi',
          resource_type: 'image',
        });

        // Clean up temporary local file after successful Cloudinary upload
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.json({
          success: true,
          url: uploadResult.secure_url,
          filename: uploadResult.public_id,
          size: uploadResult.bytes || req.file.size,
          storage: 'cloudinary',
        });
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
        // If Cloudinary fails, fallback to local URL below
      }
    }

    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[Upload Warning] Storing image on ephemeral local disk in production. Configure CLOUDINARY_* environment variables for durable persistent uploads.'
      );
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      storage: 'local',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
