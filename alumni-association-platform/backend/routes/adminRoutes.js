const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  approveUser,
  getAnalytics,
  getUserDetails,
  deleteUser
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validateObjectIdParams } = require('../middlewares/validation');

// All routes require admin authentication
router.use(protect, adminOnly);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', validateObjectIdParams('id'), getUserDetails);
router.put('/users/:id/approve', validateObjectIdParams('id'), approveUser);
router.delete('/users/:id', validateObjectIdParams('id'), deleteUser);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;
