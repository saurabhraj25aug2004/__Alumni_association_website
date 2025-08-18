const Workshop = require('../models/Workshop');
const User = require('../models/User');

// @desc    Create a new workshop
// @route   POST /api/workshops
// @access  Private (Alumni only)
const createWorkshop = async (req, res) => {
  try {
    const {
      topic,
      description,
      date,
      duration,
      location,
      capacity,
      category,
      tags,
      materials,
      registrationDeadline
    } = req.body;

    const workshop = await Workshop.create({
      topic,
      description,
      host: req.user.id,
      date,
      duration,
      location,
      capacity,
      category,
      tags,
      materials,
      registrationDeadline
    });

    const populatedWorkshop = await Workshop.findById(workshop._id)
      .populate('host', 'name email');

    res.status(201).json({
      message: 'Workshop created successfully',
      workshop: populatedWorkshop
    });
  } catch (error) {
    console.error('Create workshop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all workshops with filters
// @route   GET /api/workshops
// @access  Public
const getAllWorkshops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const category = req.query.category;
    const locationType = req.query.locationType;
    const upcoming = req.query.upcoming === 'true';

    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (locationType) filter['location.type'] = locationType;
    if (upcoming) {
      filter.date = { $gte: new Date() };
    }

    const workshops = await Workshop.find(filter)
      .populate('host', 'name email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Workshop.countDocuments(filter);

    res.json({
      workshops,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalWorkshops: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all workshops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get workshop by ID
// @route   GET /api/workshops/:id
// @access  Public
const getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;

    const workshop = await Workshop.findById(id)
      .populate('host', 'name email')
      .populate('attendees.user', 'name email');

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    res.json(workshop);
  } catch (error) {
    console.error('Get workshop by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update workshop
// @route   PUT /api/workshops/:id
// @access  Private (Workshop host only)
const updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Check if user is the workshop host
    if (workshop.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this workshop' });
    }

    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('host', 'name email');

    res.json({
      message: 'Workshop updated successfully',
      workshop: updatedWorkshop
    });
  } catch (error) {
    console.error('Update workshop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete workshop
// @route   DELETE /api/workshops/:id
// @access  Private (Workshop host only)
const deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Check if user is the workshop host
    if (workshop.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this workshop' });
    }

    await Workshop.findByIdAndDelete(id);

    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    console.error('Delete workshop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register for a workshop
// @route   POST /api/workshops/:id/register
// @access  Private (Students & Alumni)
const registerForWorkshop = async (req, res) => {
  try {
    const { id } = req.params;

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (!workshop.isActive) {
      return res.status(400).json({ message: 'This workshop is no longer active' });
    }

    // Check if registration is still open
    if (workshop.registrationDeadline && new Date() > workshop.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if workshop is full
    if (workshop.attendees.length >= workshop.capacity) {
      return res.status(400).json({ message: 'Workshop is full' });
    }

    // Check if user has already registered
    const alreadyRegistered = workshop.attendees.find(
      attendee => attendee.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You have already registered for this workshop' });
    }

    // Add registration
    workshop.attendees.push({
      user: req.user.id
    });

    await workshop.save();

    const updatedWorkshop = await Workshop.findById(id)
      .populate('host', 'name email')
      .populate('attendees.user', 'name email');

    res.json({
      message: 'Registration successful',
      workshop: updatedWorkshop
    });
  } catch (error) {
    console.error('Register for workshop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel workshop registration
// @route   DELETE /api/workshops/:id/register
// @access  Private (User)
const cancelWorkshopRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Find and remove user's registration
    const attendeeIndex = workshop.attendees.findIndex(
      attendee => attendee.user.toString() === req.user.id
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({ message: 'You are not registered for this workshop' });
    }

    workshop.attendees.splice(attendeeIndex, 1);
    await workshop.save();

    const updatedWorkshop = await Workshop.findById(id)
      .populate('host', 'name email')
      .populate('attendees.user', 'name email');

    res.json({
      message: 'Registration cancelled successfully',
      workshop: updatedWorkshop
    });
  } catch (error) {
    console.error('Cancel workshop registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update attendee status
// @route   PUT /api/workshops/:id/attendees/:attendeeId
// @access  Private (Workshop host only)
const updateAttendeeStatus = async (req, res) => {
  try {
    const { id, attendeeId } = req.params;
    const { status } = req.body;

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Check if user is the workshop host
    if (workshop.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update attendees' });
    }

    const attendee = workshop.attendees.id(attendeeId);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    attendee.status = status;
    await workshop.save();

    const updatedWorkshop = await Workshop.findById(id)
      .populate('host', 'name email')
      .populate('attendees.user', 'name email');

    res.json({
      message: 'Attendee status updated successfully',
      workshop: updatedWorkshop
    });
  } catch (error) {
    console.error('Update attendee status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's hosted workshops
// @route   GET /api/workshops/my-workshops
// @access  Private (Workshop host)
const getMyWorkshops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const workshops = await Workshop.find({ host: req.user.id })
      .populate('host', 'name email')
      .populate('attendees.user', 'name email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Workshop.countDocuments({ host: req.user.id });

    res.json({
      workshops,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalWorkshops: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my workshops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's workshop registrations
// @route   GET /api/workshops/my-registrations
// @access  Private (User)
const getMyRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const workshops = await Workshop.find({
      'attendees.user': req.user.id
    })
      .populate('host', 'name email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Workshop.countDocuments({
      'attendees.user': req.user.id
    });

    res.json({
      registrations: workshops,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createWorkshop,
  getAllWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
  registerForWorkshop,
  cancelWorkshopRegistration,
  updateAttendeeStatus,
  getMyWorkshops,
  getMyRegistrations
};
