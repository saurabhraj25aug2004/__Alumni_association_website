const express = require('express');
const router = express.Router();
const {
  getAllMentorshipPrograms,
  getMentorshipProgramById,
  createMentorshipProgram,
  updateMentorshipProgram,
  deleteMentorshipProgram,
  requestMentorship,
  respondToRequest,
  getAllMentorshipProgramsForAdmin
} = require('../controllers/mentorshipProgramController');
const { protect, adminOnly, alumniAndAdmin } = require('../middlewares/auth');
const { validateObjectIdParams } = require('../middlewares/validation');

// All routes require authentication
router.use(protect);

// Get all mentorship programs (role-based)
router.get('/', getAllMentorshipPrograms);

// Get all programs for admin
router.get('/all', adminOnly, getAllMentorshipProgramsForAdmin);

// Get program by ID
router.get('/:id', validateObjectIdParams('id'), getMentorshipProgramById);

// Create mentorship program (alumni only)
router.post('/', alumniAndAdmin, createMentorshipProgram);

// Update mentorship program (alumni only - owner)
router.put('/:id', validateObjectIdParams('id'), alumniAndAdmin, updateMentorshipProgram);

// Delete mentorship program (alumni only - owner)
router.delete('/:id', validateObjectIdParams('id'), alumniAndAdmin, deleteMentorshipProgram);

// Request to join program (student only)
router.post('/request/:id', validateObjectIdParams('id'), requestMentorship);

// Accept/Reject request (alumni only - mentor)
router.put('/request/:programId/:requestId', 
  validateObjectIdParams('programId'), 
  validateObjectIdParams('requestId'), 
  respondToRequest
);

module.exports = router;




