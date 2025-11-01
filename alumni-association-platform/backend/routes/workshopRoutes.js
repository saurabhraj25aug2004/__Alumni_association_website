const express = require('express');
const router = express.Router();
const {
  createWorkshop,
  getAllWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
  registerForWorkshop,
  cancelWorkshopRegistration,
  updateAttendeeStatus,
  getMyWorkshops,
  getMyRegistrations
} = require('../controllers/workshopController');
const { protect, alumniAndAdmin, studentAndAdmin } = require('../middlewares/auth');
const { validateObjectIdParams } = require('../middlewares/validation');
const { uploadSingle } = require('../middlewares/upload');

// Public routes
router.get('/', getAllWorkshops);
router.get('/:id', validateObjectIdParams('id'), getWorkshopById);

// Protected routes
router.use(protect);

// Workshop management (Alumni only)
router.post('/', alumniAndAdmin, uploadSingle, createWorkshop);
router.put('/:id', validateObjectIdParams('id'), alumniAndAdmin, uploadSingle, updateWorkshop);
router.delete('/:id', validateObjectIdParams('id'), alumniAndAdmin, deleteWorkshop);
router.get('/my-workshops', alumniAndAdmin, getMyWorkshops);

// Workshop registration (Students & Alumni)
router.post('/:id/register', validateObjectIdParams('id'), studentAndAdmin, registerForWorkshop);
router.delete('/:id/register', validateObjectIdParams('id'), studentAndAdmin, cancelWorkshopRegistration);
router.get('/my-registrations', getMyRegistrations);

// Attendee management (Workshop host only)
router.put('/:id/attendees/:attendeeId', validateObjectIdParams('id', 'attendeeId'), updateAttendeeStatus);

module.exports = router;
