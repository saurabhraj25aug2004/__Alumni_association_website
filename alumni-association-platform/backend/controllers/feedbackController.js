const Feedback = require('../models/Feedback');
const User = require('../models/User');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const {
      eventType,
      eventId,
      eventModel,
      rating,
      comments,
      category,
      tags,
      isAnonymous,
      isPublic,
      attachments
    } = req.body;

    const feedback = await Feedback.create({
      user: req.user.id,
      eventType,
      eventId,
      eventModel,
      rating,
      comments,
      category,
      tags,
      isAnonymous,
      isPublic,
      attachments
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'name email');

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: populatedFeedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all feedback (admin)
// @route   GET /api/feedback
// @access  Private (Admin only)
const getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const eventType = req.query.eventType;
    const status = req.query.status;
    const priority = req.query.priority;
    const rating = req.query.rating;

    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (rating) filter.rating = parseInt(rating);

    const feedback = await Feedback.find(filter)
      .populate('user', 'name email')
      .populate('adminResponse.admin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(filter);

    res.json({
      feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFeedback: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get feedback by ID
// @route   GET /api/feedback/:id
// @access  Private
const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id)
      .populate('user', 'name email')
      .populate('adminResponse.admin', 'name email');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user can view this feedback
    if (feedback.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this feedback' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update feedback status
// @route   PUT /api/feedback/:id/status
// @access  Private (Admin only)
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.status = status;
    await feedback.save();

    const updatedFeedback = await Feedback.findById(id)
      .populate('user', 'name email')
      .populate('adminResponse.admin', 'name email');

    res.json({
      message: 'Feedback status updated successfully',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add admin response to feedback
// @route   POST /api/feedback/:id/response
// @access  Private (Admin only)
const addAdminResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.adminResponse = {
      admin: req.user.id,
      response,
      respondedAt: new Date()
    };

    // Update status to addressed
    feedback.status = 'addressed';

    await feedback.save();

    const updatedFeedback = await Feedback.findById(id)
      .populate('user', 'name email')
      .populate('adminResponse.admin', 'name email');

    res.json({
      message: 'Admin response added successfully',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Add admin response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark feedback as helpful
// @route   POST /api/feedback/:id/helpful
// @access  Private
const markAsHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user has already marked as helpful
    const alreadyMarked = feedback.helpful.find(
      helpful => helpful.user.toString() === req.user.id
    );

    if (alreadyMarked) {
      // Remove helpful mark
      feedback.helpful = feedback.helpful.filter(
        helpful => helpful.user.toString() !== req.user.id
      );
    } else {
      // Add helpful mark
      feedback.helpful.push({
        user: req.user.id
      });
    }

    await feedback.save();

    res.json({
      message: alreadyMarked ? 'Removed helpful mark' : 'Marked as helpful',
      helpfulCount: feedback.helpful.length
    });
  } catch (error) {
    console.error('Mark as helpful error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's feedback
// @route   GET /api/feedback/my-feedback
// @access  Private
const getMyFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ user: req.user.id })
      .populate('user', 'name email')
      .populate('adminResponse.admin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ user: req.user.id });

    res.json({
      feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFeedback: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get public feedback
// @route   GET /api/feedback/public
// @access  Public
const getPublicFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const eventType = req.query.eventType;
    const skip = (page - 1) * limit;

    const filter = { isPublic: true };
    if (eventType) filter.eventType = eventType;

    const feedback = await Feedback.find(filter)
      .populate('user', 'name email')
      .populate('adminResponse.admin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(filter);

    res.json({
      feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFeedback: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get public feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private (Admin only)
const getFeedbackStats = async (req, res) => {
  try {
    const eventType = req.query.eventType;

    // Get overall statistics
    const totalFeedback = await Feedback.countDocuments();
    const pendingFeedback = await Feedback.countDocuments({ status: 'pending' });
    const highPriorityFeedback = await Feedback.countDocuments({ priority: 'high' });
    const criticalPriorityFeedback = await Feedback.countDocuments({ priority: 'critical' });

    // Get rating distribution
    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get event type distribution
    const eventTypeStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get status distribution
    const statusStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent feedback (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFeedback = await Feedback.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      overview: {
        total: totalFeedback,
        pending: pendingFeedback,
        highPriority: highPriorityFeedback,
        criticalPriority: criticalPriorityFeedback,
        recent: recentFeedback
      },
      ratingDistribution: ratingStats,
      eventTypeDistribution: eventTypeStats,
      statusDistribution: statusStats
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Feedback owner or admin)
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user is the feedback owner or admin
    if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    await Feedback.findByIdAndDelete(id);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  addAdminResponse,
  markAsHelpful,
  getMyFeedback,
  getPublicFeedback,
  getFeedbackStats,
  deleteFeedback
};
