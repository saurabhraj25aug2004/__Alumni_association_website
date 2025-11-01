const Workshop = require('../models/Workshop');
const User = require('../models/User');

// @desc    Create a new workshop
// @route   POST /api/workshops
// @access  Private (Alumni only)
const createWorkshop = async (req, res) => {
  try {
    // Safely extract data from req.body (works with both JSON and FormData)
    const body = req.body || {};
    
    // Map form field names to model field names
    const topic = body.title || body.topic;
    const description = body.description;
    const date = body.date;
    const duration = body.duration;
    const capacity = body.maxAttendees || body.capacity;
    const category = body.category;

    // Validation - Check required fields
    if (!topic || !description || !date || !duration || !capacity || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: topic, description, date, duration, capacity, and category are required' 
      });
    }

    // Parse duration from hours to minutes if it's a string
    const durationInMinutes = typeof duration === 'string' ? parseFloat(duration) * 60 : parseInt(duration);
    
    // Validate duration is a valid number
    if (isNaN(durationInMinutes) || durationInMinutes < 15 || durationInMinutes > 480) {
      return res.status(400).json({ 
        message: 'Duration must be between 15 and 480 minutes' 
      });
    }

    // Validate capacity is a valid number
    const capacityNumber = parseInt(capacity);
    if (isNaN(capacityNumber) || capacityNumber < 1) {
      return res.status(400).json({ 
        message: 'Capacity must be a positive number' 
      });
    }

    // Build location object from form data
    // Form sends: isOnline (boolean), location (string), meetingLink (string)
    // Model expects: location: { type: 'online'|'in-person'|'hybrid', address?, onlineLink? }
    let locationObj;
    const isOnline = body.isOnline === true || body.isOnline === 'true';
    const meetingLink = body.meetingLink;
    const locationAddress = body.location;

    if (isOnline) {
      if (!meetingLink) {
        return res.status(400).json({ 
          message: 'Meeting link is required for online workshops' 
        });
      }
      locationObj = {
        type: 'online',
        onlineLink: meetingLink
      };
    } else {
      if (!locationAddress) {
        return res.status(400).json({ 
          message: 'Location address is required for in-person workshops' 
        });
      }
      locationObj = {
        type: 'in-person',
        address: locationAddress
      };
    }

    // Combine date and time if provided
    let workshopDate = date;
    if (body.time && typeof date === 'string') {
      // Combine date and time strings
      workshopDate = `${date}T${body.time}`;
    }

    // Parse tags if it's a string
    let tagsArray = [];
    if (body.tags) {
      if (typeof body.tags === 'string') {
        tagsArray = body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(body.tags)) {
        tagsArray = body.tags;
      }
    }

    // Build workshop object
    const workshopData = {
      topic,
      description,
      host: req.user.id,
      date: workshopDate,
      duration: durationInMinutes,
      location: locationObj,
      capacity: capacityNumber,
      category,
      tags: tagsArray
    };

    // Add optional fields if provided
    if (body.registrationDeadline) {
      workshopData.registrationDeadline = body.registrationDeadline;
    }
    // HANDLE MATERIALS: Model expects array of objects, but form may send plain text
    // Only add materials if it's valid JSON array format
    if (body.materials) {
      if (typeof body.materials === 'string') {
        const trimmed = body.materials.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          // It's a JSON array string, parse it
          try {
            workshopData.materials = JSON.parse(body.materials);
          } catch (parseError) {
            console.warn('Failed to parse materials array, skipping:', parseError.message);
            // Don't add materials if parsing fails
          }
        } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          // Single object wrapped in JSON, wrap in array
          try {
            const parsed = JSON.parse(body.materials);
            workshopData.materials = [parsed];
          } catch (parseError) {
            console.warn('Failed to parse materials object, skipping:', parseError.message);
          }
        }
        // If it's plain text, don't add materials (model validation would fail anyway)
      } else if (Array.isArray(body.materials)) {
        // Already an array, use as-is
        workshopData.materials = body.materials;
      } else if (typeof body.materials === 'object') {
        // Single object, wrap in array
        workshopData.materials = [body.materials];
      }
    }

    const workshop = await Workshop.create(workshopData);

    const populatedWorkshop = await Workshop.findById(workshop._id)
      .populate('host', 'name email');

    res.status(201).json({
      message: 'Workshop created successfully',
      workshop: populatedWorkshop
    });
  } catch (error) {
    console.error('Create workshop error:', error);
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
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
    const body = req.body || {};

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Check if user is the workshop host
    if (workshop.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this workshop' });
    }

    // Build update data, preserving existing values when not provided
    const updateData = {};

    // Map form fields to model fields
    if (body.title !== undefined || body.topic !== undefined) {
      updateData.topic = body.title || body.topic;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.date !== undefined) {
      updateData.date = body.date;
    }
    if (body.duration !== undefined) {
      // Convert hours to minutes
      const durationInMinutes = typeof body.duration === 'string' ? parseFloat(body.duration) * 60 : parseInt(body.duration);
      
      // Validate duration
      if (isNaN(durationInMinutes) || durationInMinutes < 15 || durationInMinutes > 480) {
        return res.status(400).json({ 
          message: 'Duration must be between 15 and 480 minutes' 
        });
      }
      updateData.duration = durationInMinutes;
    }
    if (body.maxAttendees !== undefined || body.capacity !== undefined) {
      const capacityNumber = parseInt(body.maxAttendees || body.capacity);
      if (isNaN(capacityNumber) || capacityNumber < 1) {
        return res.status(400).json({ 
          message: 'Capacity must be a positive number' 
        });
      }
      updateData.capacity = capacityNumber;
    }
    if (body.category !== undefined) {
      updateData.category = body.category;
    }

    // Handle location - build object from form data
    // Only update location if any location-related field is provided
    if (body.isOnline !== undefined || body.location !== undefined || body.meetingLink !== undefined) {
      const isOnline = body.isOnline === true || body.isOnline === 'true';
      const meetingLink = body.meetingLink;
      const locationAddress = body.location;

      // Determine location type if isOnline is provided, otherwise preserve existing
      let locationType = isOnline ? 'online' : 'in-person';
      if (body.isOnline === undefined && workshop.location?.type) {
        locationType = workshop.location.type;
      }

      if (locationType === 'online') {
        updateData.location = {
          type: 'online',
          onlineLink: meetingLink || workshop.location?.onlineLink
        };
      } else if (locationType === 'hybrid') {
        // Handle hybrid location - requires both address and onlineLink
        updateData.location = {
          type: 'hybrid',
          address: locationAddress || workshop.location?.address,
          onlineLink: meetingLink || workshop.location?.onlineLink
        };
      } else {
        updateData.location = {
          type: 'in-person',
          address: locationAddress || workshop.location?.address
        };
      }
    }

    // Handle date + time combination
    if (body.time && body.date) {
      updateData.date = `${body.date}T${body.time}`;
    }

    // Handle tags if provided
    if (body.tags !== undefined) {
      if (typeof body.tags === 'string') {
        updateData.tags = body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(body.tags)) {
        updateData.tags = body.tags;
      }
    }

    // Handle optional fields
    if (body.registrationDeadline !== undefined) {
      updateData.registrationDeadline = body.registrationDeadline;
    }
    if (body.materials !== undefined) {
      // SAFE JSON PARSE: Only parse if it looks like JSON
      if (typeof body.materials === 'string') {
        const trimmed = body.materials.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            updateData.materials = JSON.parse(body.materials);
          } catch (parseError) {
            console.warn('Failed to parse materials array, skipping:', parseError.message);
          }
        }
      } else if (Array.isArray(body.materials)) {
        updateData.materials = body.materials;
      }
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
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
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
