const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyForJob,
  updateApplicationStatus,
  updateApplicationStatusByAdmin,
  getMyJobs,
  getMyApplications
} = require('../controllers/jobController');
const { protect, alumniAndAdmin, studentAndAdmin, adminOnly } = require('../middlewares/auth');
const { validateObjectIdParams } = require('../middlewares/validation');
const { uploadResume } = require('../middlewares/upload');

// Public routes
router.get('/', getAllJobs);
router.get('/:id', validateObjectIdParams('id'), getJobById);

// Protected routes
router.use(protect);

// Job management (Alumni only)
router.post('/', alumniAndAdmin, createJob);
router.put('/:id', validateObjectIdParams('id'), alumniAndAdmin, updateJob);
router.delete('/:id', validateObjectIdParams('id'), alumniAndAdmin, deleteJob);
router.get('/my-jobs', alumniAndAdmin, getMyJobs);

// Job applications (Students only)
router.post('/:id/apply', validateObjectIdParams('id'), uploadResume, applyForJob);
router.get('/my-applications', getMyApplications);
router.get('/applied', getMyApplications); // Alias for my-applications

// Application management (Job poster or Admin)
router.put('/:id/applications/:applicationId', validateObjectIdParams('id', 'applicationId'), updateApplicationStatus);

// Admin routes for application status management
router.put('/:id/status', validateObjectIdParams('id'), adminOnly, updateApplicationStatusByAdmin);

module.exports = router;
