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
const { validateObjectIdParams } = require('../middlewares/validation');

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

// Job applications (Students & Alumni)
router.post('/:id/apply', validateObjectIdParams('id'), studentAndAdmin, applyForJob);
router.get('/my-applications', getMyApplications);

// Application management (Job poster only)
router.put('/:id/applications/:applicationId', validateObjectIdParams('id', 'applicationId'), updateApplicationStatus);

module.exports = router;
