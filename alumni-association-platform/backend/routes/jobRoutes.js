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
  getMyJobs,
  getMyApplications
} = require('../controllers/jobController');
const { protect, alumniAndAdmin, studentAndAdmin } = require('../middlewares/auth');

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes
router.use(protect);

// Job management (Alumni only)
router.post('/', alumniAndAdmin, createJob);
router.put('/:id', alumniAndAdmin, updateJob);
router.delete('/:id', alumniAndAdmin, deleteJob);
router.get('/my-jobs', alumniAndAdmin, getMyJobs);

// Job applications (Students & Alumni)
router.post('/:id/apply', studentAndAdmin, applyForJob);
router.get('/my-applications', getMyApplications);

// Application management (Job poster only)
router.put('/:id/applications/:applicationId', updateApplicationStatus);

module.exports = router;
