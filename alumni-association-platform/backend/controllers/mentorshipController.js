const User = require('../models/User');
const Mentorship = require('../models/Mentorship');

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
        { major: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const mentors = await User.find(filter)
      .select('name email major graduationYear profileImage position company expertise')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    // Get user's existing mentorship requests/relationships to filter out already requested mentors
    const userId = req.user._id || req.user.id;
    const existingMentorships = await Mentorship.find({
      $or: [
        { mentee: userId },
        { mentor: userId }
      ]
    }).select('mentor mentee');

    const requestedMentorIds = existingMentorships
      .filter(m => m.mentee?.toString() === userId.toString())
      .map(m => m.mentor?.toString());

    // Filter out mentors that user has already requested
    const availableMentors = mentors.filter(mentor => 
      !requestedMentorIds.includes(mentor._id.toString()) && 
      mentor._id.toString() !== userId.toString()
    );

    const total = await User.countDocuments(filter);
    const availableCount = availableMentors.length;

    res.json({
      mentors: availableMentors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMentors: availableCount,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get available mentors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get mentorship requests (for mentor - alumni)
// @route   GET /api/mentorship/mentor/requests
// @access  Private (Alumni only)
const getMentorRequests = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can view mentee requests' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'pending';
    const skip = (page - 1) * limit;

    const filter = { mentor: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const requests = await Mentorship.find(filter)
      .populate('mentee', 'name email major graduationYear profileImage')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Mentorship.countDocuments(filter);

    res.json({
      requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get mentor requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get mentorship requests (generic - for backward compatibility)
// @route   GET /api/mentorship/requests
// @access  Private
const getMentorshipRequests = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // If user is alumni, get requests where they are mentor
    // If user is student, get requests where they are mentee
    const filter = req.user.role === 'alumni' 
      ? { mentor: userId }
      : { mentee: userId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const requests = await Mentorship.find(filter)
      .populate('mentor', 'name email profileImage position company')
      .populate('mentee', 'name email major graduationYear profileImage')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Mentorship.countDocuments(filter);

    res.json({
      requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get mentorship requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send mentorship request
// @route   POST /api/mentorship/request
// @access  Private (Students only)
const sendMentorshipRequest = async (req, res) => {
  try {
    const { mentorId, message } = req.body;
    const userId = req.user._id || req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can send mentorship requests' });
    }

    if (!mentorId) {
      return res.status(400).json({ message: 'Mentor ID is required' });
    }

    // Check if mentor exists and is approved
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'alumni' || !mentor.isApproved) {
      return res.status(404).json({ message: 'Mentor not found or not approved' });
    }

    // Check if user is trying to request themselves
    if (mentor._id.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Cannot request mentorship from yourself' });
    }

    // Check if a mentorship already exists between these users
    const existingMentorship = await Mentorship.findOne({
      mentor: mentorId,
      mentee: userId
    });

    if (existingMentorship) {
      if (existingMentorship.status === 'pending') {
        return res.status(400).json({ message: 'Mentorship request already pending' });
      }
      if (existingMentorship.status === 'accepted') {
        return res.status(400).json({ message: 'Mentorship relationship already exists' });
      }
    }

    // Create mentorship request
    const mentorship = await Mentorship.create({
      mentor: mentorId,
      mentee: userId,
      message: message || '',
      status: 'pending'
    });

    const populatedMentorship = await Mentorship.findById(mentorship._id)
      .populate('mentor', 'name email profileImage position company')
      .populate('mentee', 'name email major graduationYear profileImage');

    res.status(201).json({
      message: 'Mentorship request sent successfully',
      request: populatedMentorship
    });
  } catch (error) {
    console.error('Send mentorship request error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept/reject mentorship request
// @route   PUT /api/mentorship/request/:id
// @access  Private (Mentor only)
const respondToMentorshipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const userId = req.user._id || req.user.id;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "accepted" or "rejected"' });
    }

    const mentorship = await Mentorship.findById(id);
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship request not found' });
    }

    // Check if user is the mentor
    if (mentorship.mentor.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    // Check if request is still pending
    if (mentorship.status !== 'pending') {
      return res.status(400).json({ message: `Request has already been ${mentorship.status}` });
    }

    // Update mentorship
    mentorship.status = status;
    if (response) {
      mentorship.mentorResponse = response;
    }
    await mentorship.save();

    const updatedMentorship = await Mentorship.findById(id)
      .populate('mentor', 'name email profileImage position company')
      .populate('mentee', 'name email major graduationYear profileImage');

    res.json({
      message: `Mentorship request ${status} successfully`,
      request: updatedMentorship
    });
  } catch (error) {
    console.error('Respond to mentorship request error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get mentorship relationships (for mentee - student)
// @route   GET /api/mentorship/mentee/mentorships
// @access  Private (Student only)
const getMenteeMentorships = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their mentorships' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const mentorships = await Mentorship.find({
      mentee: userId,
      status: 'accepted'
    })
      .populate('mentor', 'name email profileImage position company expertise')
      .sort({ acceptedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Mentorship.countDocuments({
      mentee: userId,
      status: 'accepted'
    });

    res.json({
      mentorships,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMentorships: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get mentee mentorships error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get mentorship relationships (generic)
// @route   GET /api/mentorship/relationships
// @access  Private
const getMentorshipRelationships = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get relationships where user is either mentor or mentee and status is accepted
    const filter = {
      $or: [
        { mentor: userId },
        { mentee: userId }
      ],
      status: 'accepted'
    };

    const relationships = await Mentorship.find(filter)
      .populate('mentor', 'name email profileImage position company')
      .populate('mentee', 'name email major graduationYear profileImage')
      .sort({ acceptedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Mentorship.countDocuments(filter);

    res.json({
      relationships,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRelationships: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get mentorship relationships error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

    // Verify user has access to this relationship
    const relationship = await Mentorship.findById(relationshipId);
    if (!relationship) {
      return res.status(404).json({ message: 'Mentorship relationship not found' });
    }

    const userId = req.user._id || req.user.id;
    if (relationship.mentor.toString() !== userId.toString() && 
        relationship.mentee.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    // This would typically query a ChatMessage model
    // For now, returning empty array as chat functionality might be separate
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send chat message
// @route   POST /api/mentorship/chat/:relationshipId
// @access  Private
const sendChatMessage = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { message } = req.body;

    // Verify user has access to this relationship
    const relationship = await Mentorship.findById(relationshipId);
    if (!relationship) {
      return res.status(404).json({ message: 'Mentorship relationship not found' });
    }

    const userId = req.user._id || req.user.id;
    if (relationship.mentor.toString() !== userId.toString() && 
        relationship.mentee.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    // This would typically create a ChatMessage
    // For now, returning placeholder response
    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: {
        id: 'placeholder-id',
        relationshipId,
        sender: userId,
        message,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get mentorship statistics
// @route   GET /api/mentorship/stats
// @access  Private
const getMentorshipStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    let stats = {};
    if (req.user.role === 'alumni') {
      // Mentor stats
      const totalRequests = await Mentorship.countDocuments({ mentor: userId });
      const pendingRequests = await Mentorship.countDocuments({ mentor: userId, status: 'pending' });
      const activeMentorships = await Mentorship.countDocuments({ mentor: userId, status: 'accepted' });
      const completedMentorships = await Mentorship.countDocuments({ mentor: userId, status: 'completed' });
      
      stats = {
        totalRequests,
        pendingRequests,
        activeMentorships,
        completedMentorships
      };
    } else if (req.user.role === 'student') {
      // Mentee stats
      const totalRequests = await Mentorship.countDocuments({ mentee: userId });
      const pendingRequests = await Mentorship.countDocuments({ mentee: userId, status: 'pending' });
      const activeMentorships = await Mentorship.countDocuments({ mentee: userId, status: 'accepted' });
      const completedMentorships = await Mentorship.countDocuments({ mentee: userId, status: 'completed' });
      
      stats = {
        totalRequests,
        pendingRequests,
        activeMentorships,
        completedMentorships
      };
    } else {
      // Admin stats
      const totalMentorships = await Mentorship.countDocuments();
      const pendingRequests = await Mentorship.countDocuments({ status: 'pending' });
      const activeMentorships = await Mentorship.countDocuments({ status: 'accepted' });
      const completedMentorships = await Mentorship.countDocuments({ status: 'completed' });
      
      stats = {
        totalMentorships,
        pendingRequests,
        activeMentorships,
        completedMentorships
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Get mentorship stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAvailableMentors,
  getMentorshipRequests,
  getMentorRequests,
  sendMentorshipRequest,
  respondToMentorshipRequest,
  getMentorshipRelationships,
  getMenteeMentorships,
  getChatMessages,
  sendChatMessage,
  getMentorshipStats
};
