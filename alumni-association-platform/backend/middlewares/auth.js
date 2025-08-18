const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Check if user is approved (except for admins)
    if (user.role !== 'admin' && !user.isApproved) {
      return res.status(401).json({ message: 'Account pending approval' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  return authorize('admin')(req, res, next);
};

// Alumni and Admin middleware
const alumniAndAdmin = (req, res, next) => {
  return authorize('alumni', 'admin')(req, res, next);
};

// Student and Admin middleware
const studentAndAdmin = (req, res, next) => {
  return authorize('student', 'admin')(req, res, next);
};

module.exports = {
  protect,
  authorize,
  adminOnly,
  alumniAndAdmin,
  studentAndAdmin
};
