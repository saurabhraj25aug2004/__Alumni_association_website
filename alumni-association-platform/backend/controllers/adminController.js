const User = require('../models/User');
const Job = require('../models/Job');
const Workshop = require('../models/Workshop');
const Blog = require('../models/Blog');
const Feedback = require('../models/Feedback');

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const isApproved = req.query.isApproved;
    const search = req.query.search;

    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve/reject user
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin only)
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin users' });
    }

    user.isApproved = isApproved;
    if (reason) {
      user.approvalReason = reason;
    }
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

// @desc    Get analytics dashboard data
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalAlumni = await User.countDocuments({ role: 'alumni', isApproved: true });
    const totalStudents = await User.countDocuments({ role: 'student', isApproved: true });
    const pendingApprovals = await User.countDocuments({ isApproved: false });

    // Content statistics
    const totalJobs = await Job.countDocuments({ isActive: true });
    const totalWorkshops = await Workshop.countDocuments({ isActive: true });
    const totalBlogs = await Blog.countDocuments({ status: 'published' });
    const totalFeedback = await Feedback.countDocuments();

    // Recent activity
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentJobs = await Job.find({ isActive: true })
      .select('title company createdAt')
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentWorkshops = await Workshop.find({ isActive: true })
      .select('topic host date')
      .populate('host', 'name')
      .sort({ date: -1 })
      .limit(5);

    // Feedback statistics
    const feedbackStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly user registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      userStats: {
        total: totalUsers,
        alumni: totalAlumni,
        students: totalStudents,
        pendingApprovals
      },
      contentStats: {
        jobs: totalJobs,
        workshops: totalWorkshops,
        blogs: totalBlogs,
        feedback: totalFeedback
      },
      recentActivity: {
        users: recentUsers,
        jobs: recentJobs,
        workshops: recentWorkshops
      },
      feedbackStats,
      monthlyRegistrations
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's activities
    const userJobs = await Job.find({ postedBy: id }).countDocuments();
    const userWorkshops = await Workshop.find({ host: id }).countDocuments();
    const userBlogs = await Blog.find({ author: id }).countDocuments();
    const userFeedback = await Feedback.find({ user: id }).countDocuments();

    res.json({
      user,
      activities: {
        jobsPosted: userJobs,
        workshopsHosted: userWorkshops,
        blogsWritten: userBlogs,
        feedbackSubmitted: userFeedback
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Check if user has any content
    const hasJobs = await Job.exists({ postedBy: id });
    const hasWorkshops = await Workshop.exists({ host: id });
    const hasBlogs = await Blog.exists({ author: id });

    if (hasJobs || hasWorkshops || hasBlogs) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing content. Please archive their content first.' 
      });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  approveUser,
  getAnalytics,
  getUserDetails,
  deleteUser
};
