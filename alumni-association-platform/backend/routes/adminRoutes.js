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

// All routes require admin authentication
router.use(protect, adminOnly);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/approve', approveUser);
router.delete('/users/:id', deleteUser);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;
