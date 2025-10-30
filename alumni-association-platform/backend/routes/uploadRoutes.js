const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');

// Upload a single image file and return its URL
router.post('/', protect, uploadSingle, async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    return res.status(201).json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


