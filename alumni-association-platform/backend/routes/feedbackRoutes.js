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
  getFeedbackByUserId,
  getPublicFeedback,
  getFeedbackStats,
  getFeedbackSummary,
  deleteFeedback
} = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validateObjectIdParams } = require('../middlewares/validation');

// Public routes
router.get('/public', getPublicFeedback);

// Protected routes
router.use(protect);

// Feedback submission and management (All authenticated users)
router.post('/', submitFeedback);
router.get('/my-feedback', getMyFeedback);
router.get('/user/:id', validateObjectIdParams('id'), getFeedbackByUserId);
router.get('/summary', adminOnly, getFeedbackSummary);
router.get('/stats', adminOnly, getFeedbackStats);

// Admin routes - must be before /:id routes
router.get('/', adminOnly, getAllFeedback);

// Feedback item routes (must come after specific routes)
router.get('/:id', validateObjectIdParams('id'), getFeedbackById);
router.patch('/:id', validateObjectIdParams('id'), adminOnly, updateFeedbackStatus);
router.put('/:id/status', validateObjectIdParams('id'), adminOnly, updateFeedbackStatus);
router.post('/:id/response', validateObjectIdParams('id'), adminOnly, addAdminResponse);
router.post('/:id/helpful', validateObjectIdParams('id'), markAsHelpful);
router.delete('/:id', validateObjectIdParams('id'), deleteFeedback);

module.exports = router;
