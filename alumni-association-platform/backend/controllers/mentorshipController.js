const User = require('../models/User');

// @desc    Get available mentors
// @route   GET /api/mentorship/mentors
// @access  Private (Students & Alumni)
const getAvailableMentors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    // Build filter for approved alumni
    const filter = { 
      role: 'alumni', 
      isApproved: true 
    };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { major: { $regex: search, $options: 'i' } }
      ];
    }

    const mentors = await User.find(filter)
      .select('name email major graduationYear profileImage')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      mentors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMentors: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get available mentors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get mentorship requests
// @route   GET /api/mentorship/requests
// @access  Private
const getMentorshipRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // This would typically query a MentorshipRequest model
    // For now, returning a placeholder response
    res.json({
      requests: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalRequests: 0,
        hasNext: false,
        hasPrev: false
      }
    });
  } catch (error) {
    console.error('Get mentorship requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send mentorship request
// @route   POST /api/mentorship/request
// @access  Private (Students only)
const sendMentorshipRequest = async (req, res) => {
  try {
    const { mentorId, message } = req.body;

    // Check if mentor exists and is approved
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'alumni' || !mentor.isApproved) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // This would typically create a MentorshipRequest
    // For now, returning a placeholder response
    res.status(201).json({
      message: 'Mentorship request sent successfully',
      request: {
        id: 'placeholder-id',
        mentor: mentor.name,
        message,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Send mentorship request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept/reject mentorship request
// @route   PUT /api/mentorship/request/:id
// @access  Private (Mentor only)
const respondToMentorshipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    // This would typically update a MentorshipRequest
    // For now, returning a placeholder response
    res.json({
      message: `Mentorship request ${status}`,
      request: {
        id,
        status,
        mentorMessage: message
      }
    });
  } catch (error) {
    console.error('Respond to mentorship request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get mentorship relationships
// @route   GET /api/mentorship/relationships
// @access  Private
const getMentorshipRelationships = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // This would typically query a MentorshipRelationship model
    // For now, returning a placeholder response
    res.json({
      relationships: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalRelationships: 0,
        hasNext: false,
        hasPrev: false
      }
    });
  } catch (error) {
    console.error('Get mentorship relationships error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat messages
// @route   GET /api/mentorship/chat/:relationshipId
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // This would typically query a ChatMessage model
    // For now, returning a placeholder response
    res.json({
      messages: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalMessages: 0,
        hasNext: false,
        hasPrev: false
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send chat message
// @route   POST /api/mentorship/chat/:relationshipId
// @access  Private
const sendChatMessage = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { message } = req.body;

    // This would typically create a ChatMessage
    // For now, returning a placeholder response
    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: {
        id: 'placeholder-id',
        relationshipId,
        sender: req.user.id,
        message,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get mentorship statistics
// @route   GET /api/mentorship/stats
// @access  Private
const getMentorshipStats = async (req, res) => {
  try {
    // This would typically aggregate data from mentorship models
    // For now, returning a placeholder response
    res.json({
      totalMentors: 0,
      totalMentees: 0,
      activeRelationships: 0,
      pendingRequests: 0,
      completedMentorships: 0
    });
  } catch (error) {
    console.error('Get mentorship stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAvailableMentors,
  getMentorshipRequests,
  sendMentorshipRequest,
  respondToMentorshipRequest,
  getMentorshipRelationships,
  getChatMessages,
  sendChatMessage,
  getMentorshipStats
};
