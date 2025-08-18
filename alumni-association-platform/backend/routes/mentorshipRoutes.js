const express = require('express');
const router = express.Router();
const {
  getAvailableMentors,
  getMentorshipRequests,
  sendMentorshipRequest,
  respondToMentorshipRequest,
  getMentorshipRelationships,
  getChatMessages,
  sendChatMessage,
  getMentorshipStats
} = require('../controllers/mentorshipController');
const { protect, studentAndAdmin } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Mentor discovery
router.get('/mentors', getAvailableMentors);

// Mentorship requests
router.get('/requests', getMentorshipRequests);
router.post('/request', studentAndAdmin, sendMentorshipRequest);
router.put('/request/:id', respondToMentorshipRequest);

// Mentorship relationships
router.get('/relationships', getMentorshipRelationships);

// Chat functionality
router.get('/chat/:relationshipId', getChatMessages);
router.post('/chat/:relationshipId', sendChatMessage);

// Statistics
router.get('/stats', getMentorshipStats);

module.exports = router;
