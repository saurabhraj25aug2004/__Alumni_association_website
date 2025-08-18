const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getPendingUsers,
  approveUser,
  updateProfile,
  deleteProfileImage
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validateRegister, validateLogin, validateApproval } = require('../middlewares/validation');
const { uploadSingle } = require('../middlewares/upload');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, uploadSingle, updateProfile);
router.delete('/delete-profile-image', protect, deleteProfileImage);

// Admin only routes
router.get('/pending-users', protect, adminOnly, getPendingUsers);
router.put('/approve-user/:id', protect, adminOnly, validateApproval, approveUser);

module.exports = router;
