const express = require('express');
const router = express.Router();
const {
  getAvailableMentors,
  getMentorshipRequests,
  getMentorRequests,
  sendMentorshipRequest,
  respondToMentorshipRequest,
  getMentorshipRelationships,
  getMenteeMentorships,
  getChatMessages,
  sendChatMessage,
  getMentorshipStats
} = require('../controllers/mentorshipController');
const { protect, studentAndAdmin, alumniAndAdmin } = require('../middlewares/auth');
const { validateObjectIdParams } = require('../middlewares/validation');

// All routes require authentication
router.use(protect);

// Mentor discovery (available to all authenticated users)
router.get('/mentors', getAvailableMentors);

// Mentorship requests - generic route (backward compatibility)
router.get('/requests', getMentorshipRequests);

// Mentorship requests - mentor specific (alumni only)
router.get('/mentor/requests', alumniAndAdmin, getMentorRequests);

// Mentorship requests - mentee specific (student only)
router.get('/mentee/mentorships', getMenteeMentorships);

// Send mentorship request (students only)
router.post('/request', sendMentorshipRequest);

// Respond to mentorship request (mentor only)
router.put('/request/:id', validateObjectIdParams('id'), respondToMentorshipRequest);

// Mentorship relationships (all authenticated users)
router.get('/relationships', getMentorshipRelationships);

// Chat functionality
router.get('/chat/:relationshipId', validateObjectIdParams('relationshipId'), getChatMessages);
router.post('/chat/:relationshipId', validateObjectIdParams('relationshipId'), sendChatMessage);

// Statistics
router.get('/stats', getMentorshipStats);

module.exports = router;
