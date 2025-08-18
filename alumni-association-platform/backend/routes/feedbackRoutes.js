const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  addAdminResponse,
  markAsHelpful,
  getMyFeedback,
  getPublicFeedback,
  getFeedbackStats,
  deleteFeedback
} = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middlewares/auth');

// Public routes
router.get('/public', getPublicFeedback);

// Protected routes
router.use(protect);

// Feedback submission and management (All authenticated users)
router.post('/', submitFeedback);
router.get('/my-feedback', getMyFeedback);
router.get('/:id', getFeedbackById);
router.post('/:id/helpful', markAsHelpful);
router.delete('/:id', deleteFeedback);

// Admin routes
router.get('/', adminOnly, getAllFeedback);
router.put('/:id/status', adminOnly, updateFeedbackStatus);
router.post('/:id/response', adminOnly, addAdminResponse);
router.get('/stats', adminOnly, getFeedbackStats);

module.exports = router;
