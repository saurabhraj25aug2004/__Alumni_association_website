const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'alumni-association',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Single file upload middleware
const uploadSingle = upload.single('image');

// Multiple files upload middleware
const uploadMultiple = upload.array('images', 5); // Max 5 images

// Resume upload storage configuration (PDF/DOC files)
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'alumni-association/resumes',
    resource_type: 'raw',
    format: async (req, file) => {
      // Preserve original file format
      const ext = file.originalname.split('.').pop().toLowerCase();
      return ext === 'docx' ? 'docx' : ext === 'doc' ? 'doc' : 'pdf';
    },
    public_id: (req, file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      return `${timestamp}_${originalName}`;
    }
  }
});

// Create multer upload instance for resumes
const resumeUpload = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for resumes
  },
  fileFilter: (req, file, cb) => {
    // Check file type for resumes
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes!'), false);
    }
  }
});

// Single resume upload middleware
const uploadResume = resumeUpload.single('resume');

// Error handling wrapper
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB for resumes, 5MB for images.'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle: handleUpload(uploadSingle),
  uploadMultiple: handleUpload(uploadMultiple),
  uploadResume: handleUpload(uploadResume),
  cloudinary
};
