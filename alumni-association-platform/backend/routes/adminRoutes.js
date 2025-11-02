const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  approveUser,
  getAnalytics,
  getUserDetails,
  deleteUser,
  getAllMentorships
} = require('../controllers/adminController');
const {
  getAllJobsForAdmin,
  getAllApplications
} = require('../controllers/jobController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validateObjectIdParams } = require('../middlewares/validation');

// All routes require admin authentication
router.use(protect, adminOnly);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', validateObjectIdParams('id'), getUserDetails);
router.put('/users/:id/approve', validateObjectIdParams('id'), approveUser);
router.delete('/users/:id', validateObjectIdParams('id'), deleteUser);

// Job and Application management
router.get('/jobs', getAllJobsForAdmin);
router.get('/applications', getAllApplications);

// Mentorship management
router.get('/mentorships', getAllMentorships);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;
