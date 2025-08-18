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

// Public routes
router.get('/', getAllWorkshops);
router.get('/:id', getWorkshopById);

// Protected routes
router.use(protect);

// Workshop management (Alumni only)
router.post('/', alumniAndAdmin, createWorkshop);
router.put('/:id', alumniAndAdmin, updateWorkshop);
router.delete('/:id', alumniAndAdmin, deleteWorkshop);
router.get('/my-workshops', alumniAndAdmin, getMyWorkshops);

// Workshop registration (Students & Alumni)
router.post('/:id/register', studentAndAdmin, registerForWorkshop);
router.delete('/:id/register', studentAndAdmin, cancelWorkshopRegistration);
router.get('/my-registrations', getMyRegistrations);

// Attendee management (Workshop host only)
router.put('/:id/attendees/:attendeeId', updateAttendeeStatus);

module.exports = router;
