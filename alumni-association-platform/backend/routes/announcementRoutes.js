const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementStats,
  getPublishedAnnouncements
} = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validateObjectIdParams } = require('../middlewares/validation');

// Public routes (for authenticated users)
router.get('/', protect, getAllAnnouncements);
router.get('/published', protect, getPublishedAnnouncements);
router.get('/stats', protect, adminOnly, getAnnouncementStats);
router.get('/:id', protect, validateObjectIdParams('id'), getAnnouncementById);

// Admin-only routes
router.post('/', protect, adminOnly, createAnnouncement);
router.put('/:id', protect, adminOnly, validateObjectIdParams('id'), updateAnnouncement);
router.delete('/:id', protect, adminOnly, validateObjectIdParams('id'), deleteAnnouncement);

module.exports = router;


