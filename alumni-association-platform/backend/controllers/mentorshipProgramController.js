const MentorshipProgram = require('../models/MentorshipProgram');
const User = require('../models/User');

// @desc    Get all mentorship programs
// @route   GET /api/mentorship
// @access  Private
const getAllMentorshipPrograms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    let filter = { isActive: true };
    
    // If user is alumni, show only their programs
    if (req.user.role === 'alumni') {
      filter.mentor = req.user._id || req.user.id;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const programs = await MentorshipProgram.find(filter)
      .populate('mentor', 'name email profileImage')
      .populate('mentees.mentee', 'name email profileImage')
      .populate('requests.mentee', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format response
    const formattedPrograms = programs.map(program => {
      const programObj = program.toObject();
      return {
        _id: programObj._id,
        mentorName: program.mentor?.name || 'Unknown',
        mentor: program.mentor,
        title: programObj.title,
        description: programObj.description,
        mentees: (programObj.mentees || []).map(m => ({
          name: m.mentee?.name || 'Unknown',
          email: m.mentee?.email || '',
          joinedAt: m.joinedAt
        })),
        requests: (programObj.requests || []).map(r => ({
          _id: r._id,
          name: r.mentee?.name || 'Unknown',
          email: r.mentee?.email || '',
          message: r.message,
          requestedAt: r.requestedAt,
          status: r.status
        })),
        isActive: programObj.isActive,
        maxMentees: programObj.maxMentees,
        createdAt: programObj.createdAt,
        updatedAt: programObj.updatedAt
      };
    });

    const total = await MentorshipProgram.countDocuments(filter);

    res.json({
      programs: formattedPrograms,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPrograms: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all mentorship programs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get mentorship program by ID
// @route   GET /api/mentorship/:id
// @access  Private
const getMentorshipProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await MentorshipProgram.findById(id)
      .populate('mentor', 'name email profileImage')
      .populate('mentees.mentee', 'name email profileImage')
      .populate('requests.mentee', 'name email profileImage');

    if (!program) {
      return res.status(404).json({ message: 'Mentorship program not found' });
    }

    const programObj = program.toObject();
    res.json({
      _id: programObj._id,
      mentorName: program.mentor?.name || 'Unknown',
      mentor: program.mentor,
      title: programObj.title,
      description: programObj.description,
      mentees: (programObj.mentees || []).map(m => ({
        name: m.mentee?.name || 'Unknown',
        email: m.mentee?.email || '',
        joinedAt: m.joinedAt
      })),
      requests: (programObj.requests || []).map(r => ({
        _id: r._id,
        name: r.mentee?.name || 'Unknown',
        email: r.mentee?.email || '',
        message: r.message,
        requestedAt: r.requestedAt,
        status: r.status
      })),
      isActive: programObj.isActive,
      maxMentees: programObj.maxMentees,
      createdAt: programObj.createdAt,
      updatedAt: programObj.updatedAt
    });
  } catch (error) {
    console.error('Get mentorship program by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create mentorship program
// @route   POST /api/mentorship
// @access  Private (Alumni only)
const createMentorshipProgram = async (req, res) => {
  try {
    const { title, description, maxMentees } = req.body;
    const userId = req.user._id || req.user.id;

    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can create mentorship programs' });
    }

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const program = await MentorshipProgram.create({
      mentor: userId,
      title,
      description,
      maxMentees: maxMentees || 10,
      mentees: [],
      requests: []
    });

    const populatedProgram = await MentorshipProgram.findById(program._id)
      .populate('mentor', 'name email profileImage')
      .populate('mentees.mentee', 'name email profileImage')
      .populate('requests.mentee', 'name email profileImage');

    const programObj = populatedProgram.toObject();
    res.status(201).json({
      message: 'Mentorship program created successfully',
      program: {
        _id: programObj._id,
        mentorName: populatedProgram.mentor?.name || 'Unknown',
        mentor: populatedProgram.mentor,
        title: programObj.title,
        description: programObj.description,
        mentees: [],
        requests: [],
        isActive: programObj.isActive,
        maxMentees: programObj.maxMentees,
        createdAt: programObj.createdAt,
        updatedAt: programObj.updatedAt
      }
    });
  } catch (error) {
    console.error('Create mentorship program error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update mentorship program
// @route   PUT /api/mentorship/:id
// @access  Private (Alumni only - owner)
const updateMentorshipProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, maxMentees, isActive } = req.body;
    const userId = req.user._id || req.user.id;

    const program = await MentorshipProgram.findById(id);
    if (!program) {
      return res.status(404).json({ message: 'Mentorship program not found' });
    }

    // Check if user is the mentor
    if (program.mentor.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this program' });
    }

    // Update fields
    if (title !== undefined) program.title = title;
    if (description !== undefined) program.description = description;
    if (maxMentees !== undefined) program.maxMentees = maxMentees;
    if (isActive !== undefined) program.isActive = isActive;

    await program.save();

    const updatedProgram = await MentorshipProgram.findById(id)
      .populate('mentor', 'name email profileImage')
      .populate('mentees.mentee', 'name email profileImage')
      .populate('requests.mentee', 'name email profileImage');

    const programObj = updatedProgram.toObject();
    res.json({
      message: 'Mentorship program updated successfully',
      program: {
        _id: programObj._id,
        mentorName: updatedProgram.mentor?.name || 'Unknown',
        mentor: updatedProgram.mentor,
        title: programObj.title,
        description: programObj.description,
        mentees: (programObj.mentees || []).map(m => ({
          name: m.mentee?.name || 'Unknown',
          email: m.mentee?.email || '',
          joinedAt: m.joinedAt
        })),
        requests: (programObj.requests || []).map(r => ({
          _id: r._id,
          name: r.mentee?.name || 'Unknown',
          email: r.mentee?.email || '',
          message: r.message,
          requestedAt: r.requestedAt,
          status: r.status
        })),
        isActive: programObj.isActive,
        maxMentees: programObj.maxMentees,
        createdAt: programObj.createdAt,
        updatedAt: programObj.updatedAt
      }
    });
  } catch (error) {
    console.error('Update mentorship program error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete mentorship program
// @route   DELETE /api/mentorship/:id
// @access  Private (Alumni only - owner)
const deleteMentorshipProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const program = await MentorshipProgram.findById(id);
    if (!program) {
      return res.status(404).json({ message: 'Mentorship program not found' });
    }

    // Check if user is the mentor
    if (program.mentor.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this program' });
    }

    await MentorshipProgram.findByIdAndDelete(id);

    res.json({ message: 'Mentorship program deleted successfully' });
  } catch (error) {
    console.error('Delete mentorship program error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Request to join mentorship program
// @route   POST /api/mentorship/request/:id
// @access  Private (Student only)
const requestMentorship = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id || req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can request mentorship' });
    }

    const program = await MentorshipProgram.findById(id);
    if (!program || !program.isActive) {
      return res.status(404).json({ message: 'Mentorship program not found or inactive' });
    }

    // Check if already a mentee
    const isMentee = program.mentees.some(m => m.mentee.toString() === userId.toString());
    if (isMentee) {
      return res.status(400).json({ message: 'You are already a mentee in this program' });
    }

    // Check if already requested
    const existingRequest = program.requests.find(
      r => r.mentee.toString() === userId.toString() && r.status === 'pending'
    );
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested to join this program' });
    }

    // Check if max mentees reached
    if (program.mentees.length >= program.maxMentees) {
      return res.status(400).json({ message: 'Maximum mentees limit reached for this program' });
    }

    // Add request
    program.requests.push({
      mentee: userId,
      message: message || '',
      status: 'pending'
    });

    await program.save();

    const updatedProgram = await MentorshipProgram.findById(id)
      .populate('mentor', 'name email profileImage')
      .populate('mentees.mentee', 'name email profileImage')
      .populate('requests.mentee', 'name email profileImage');

    res.status(201).json({
      message: 'Mentorship request sent successfully',
      program: updatedProgram
    });
  } catch (error) {
    console.error('Request mentorship error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept/Reject mentorship request
// @route   PUT /api/mentorship/request/:programId/:requestId
// @access  Private (Alumni only - mentor)
const respondToRequest = async (req, res) => {
  try {
    const { programId, requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const userId = req.user._id || req.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "accepted" or "rejected"' });
    }

    const program = await MentorshipProgram.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Mentorship program not found' });
    }

    // Check if user is the mentor
    if (program.mentor.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    const request = program.requests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request has already been ${request.status}` });
    }

    // If accepting, check max mentees
    if (status === 'accepted') {
      if (program.mentees.length >= program.maxMentees) {
        return res.status(400).json({ message: 'Maximum mentees limit reached' });
      }
      // Add to mentees
      program.mentees.push({
        mentee: request.mentee,
        joinedAt: new Date()
      });
    }

    // Update request status
    request.status = status;
    await program.save();

    const updatedProgram = await MentorshipProgram.findById(programId)
      .populate('mentor', 'name email profileImage')
      .populate('mentees.mentee', 'name email profileImage')
      .populate('requests.mentee', 'name email profileImage');

    res.json({
      message: `Request ${status} successfully`,
      program: updatedProgram
    });
  } catch (error) {
    console.error('Respond to request error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all mentorship programs for admin
// @route   GET /api/mentorship/all
// @access  Private (Admin only)
const getAllMentorshipProgramsForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const programs = await MentorshipProgram.find()
      .populate('mentor', 'name email')
      .populate('mentees.mentee', 'name email')
      .populate('requests.mentee', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedPrograms = programs.map(program => {
      const programObj = program.toObject();
      return {
        _id: programObj._id,
        mentorName: program.mentor?.name || 'Unknown',
        mentor: program.mentor,
        title: programObj.title,
        description: programObj.description,
        mentees: (programObj.mentees || []).map(m => ({
          name: m.mentee?.name || 'Unknown',
          email: m.mentee?.email || ''
        })),
        requests: (programObj.requests || []).map(r => ({
          _id: r._id,
          name: r.mentee?.name || 'Unknown',
          email: r.mentee?.email || '',
          message: r.message,
          status: r.status
        })),
        isActive: programObj.isActive,
        maxMentees: programObj.maxMentees,
        createdAt: programObj.createdAt
      };
    });

    // Calculate statistics
    const totalPrograms = await MentorshipProgram.countDocuments();
    const totalMentors = await MentorshipProgram.distinct('mentor').then(ids => ids.length);
    const allPrograms = await MentorshipProgram.find().populate('mentees.mentee');
    const totalMentees = new Set();
    allPrograms.forEach(p => {
      (p.mentees || []).forEach(m => {
        if (m.mentee) totalMentees.add(m.mentee._id.toString());
      });
    });
    const pendingRequests = await MentorshipProgram.aggregate([
      { $unwind: '$requests' },
      { $match: { 'requests.status': 'pending' } },
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);

    const total = await MentorshipProgram.countDocuments();

    res.json({
      programs: formattedPrograms,
      stats: {
        totalMentors,
        totalMentees: totalMentees.size,
        pendingRequests,
        totalPrograms
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPrograms: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all mentorship programs for admin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllMentorshipPrograms,
  getMentorshipProgramById,
  createMentorshipProgram,
  updateMentorshipProgram,
  deleteMentorshipProgram,
  requestMentorship,
  respondToRequest,
  getAllMentorshipProgramsForAdmin
};


