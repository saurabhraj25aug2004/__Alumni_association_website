const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { cloudinary } = require('../middlewares/upload');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// @desc    Register user (students & alumni only)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, graduationYear, major } = req.body;

    // Validate role
    if (role === 'admin') {
      return res.status(400).json({ message: 'Admin registration not allowed' });
    }

    if (!['alumni', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be alumni or student' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      graduationYear,
      major,
      isApproved: false // Requires admin approval
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful. Waiting for admin approval.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is approved (except for admins)
    if (user.role !== 'admin' && !user.isApproved) {
      return res.status(401).json({ message: 'Account pending approval' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pending users for admin approval
// @route   GET /api/auth/pending-users
// @access  Private (Admin only)
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      isApproved: false, 
      role: { $in: ['alumni', 'student'] } 
    }).select('-password');
    
    res.json(pendingUsers);
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve/reject user
// @route   PUT /api/auth/approve-user/:id
// @access  Private (Admin only)
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin users' });
    }

    user.isApproved = isApproved;
    await user.save();

    res.json({
      message: `User ${isApproved ? 'approved' : 'rejected'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, graduationYear, major, bio, phone, location, socialLinks } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (graduationYear) user.graduationYear = graduationYear;
    if (major) user.major = major;
    if (bio) user.bio = bio;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (socialLinks) user.socialLinks = socialLinks;

    // Handle profile image upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (user.profileImage && user.profileImage.public_id) {
        try {
          await cloudinary.uploader.destroy(user.profileImage.public_id);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Save new image info
      user.profileImage = {
        url: req.file.path,
        public_id: req.file.filename
      };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        graduationYear: user.graduationYear,
        major: user.major,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        socialLinks: user.socialLinks
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete profile image
// @route   DELETE /api/auth/delete-profile-image
// @access  Private
const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profileImage || !user.profileImage.public_id) {
      return res.status(400).json({ message: 'No profile image to delete' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }

    // Remove from user document
    user.profileImage = undefined;
    await user.save();

    res.json({
      message: 'Profile image deleted successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getPendingUsers,
  approveUser,
  updateProfile,
  deleteProfileImage
};
