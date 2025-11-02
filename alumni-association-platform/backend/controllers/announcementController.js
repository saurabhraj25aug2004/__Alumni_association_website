const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (Alumni and Students)
const getAllAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const priority = req.query.priority;
    const search = req.query.search;

    // Build filter
    const filter = {};
    
    // Handle status filtering
    if (req.user.role === 'admin') {
      // Admin can see all announcements if status is 'all' or undefined
      // Otherwise filter by the specified status
      if (status && status !== 'all') {
        filter.status = status;
      }
      // If status is 'all' or undefined, don't add status filter (show all)
    } else {
      // Non-admins can only see published announcements
      filter.status = 'published';
    }

    if (priority) {
      filter.priority = priority;
    }

    // Build search conditions
    const searchConditions = [];
    if (search) {
      searchConditions.push(
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      );
    }

    // Build target audience conditions
    const userRole = req.user.role;
    const audienceConditions = [];
    if (userRole !== 'admin') {
      // For non-admins, only show announcements targeted to them or 'all'
      audienceConditions.push(
        { targetAudience: 'all' },
        { targetAudience: userRole }
      );
    }

    // Combine conditions using $and to avoid $or conflicts
    const andConditions = [];
    
    if (searchConditions.length > 0) {
      andConditions.push({ $or: searchConditions });
    }
    
    if (audienceConditions.length > 0) {
      andConditions.push({ $or: audienceConditions });
    }

    // Only add $and if we have conditions to combine
    if (andConditions.length > 0) {
      if (filter.$and) {
        filter.$and.push(...andConditions);
      } else {
        filter.$and = andConditions;
      }
    }

    // Filter expired announcements (only for published announcements)
    // Admins viewing all announcements should see expired ones too, but students should not
    if (filter.status === 'published' || (!filter.status && req.user.role !== 'admin')) {
      const now = new Date();
      const expireFilter = {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } }
        ]
      };
      
      // If filter already has $and, push to it, otherwise create it
      if (filter.$and) {
        filter.$and.push(expireFilter);
      } else {
        filter.$and = [expireFilter];
      }
    }
    
    // For admins viewing all (no status filter), don't filter expired announcements
    // So they can see all announcements regardless of expiration

    const announcements = await Announcement.find(filter)
      .populate('author', 'name email profileImage')
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Announcement.countDocuments(filter);

    res.json({
      announcements,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAnnouncements: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all announcements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Private (Alumni and Students)
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate('author', 'name email profileImage');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Increment views
    announcement.views += 1;
    await announcement.save({ validateBeforeSave: false });

    res.json({ announcement });
  } catch (error) {
    console.error('Get announcement by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      status,
      priority,
      targetAudience,
      expiresAt,
      isPinned
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Normalize status to lowercase
    let normalizedStatus = (status || 'draft').toLowerCase();
    // Ensure status is valid enum value
    if (!['draft', 'published', 'archived'].includes(normalizedStatus)) {
      normalizedStatus = 'draft';
    }

    // Normalize targetAudience
    let normalizedAudience = ['all'];
    if (targetAudience) {
      if (Array.isArray(targetAudience)) {
        normalizedAudience = targetAudience;
      } else if (typeof targetAudience === 'string') {
        normalizedAudience = [targetAudience];
      }
    }

    const publishTimestamp = normalizedStatus === 'published' ? new Date() : undefined;

    const announcement = await Announcement.create({
      title,
      content,
      author: req.user.id,
      status: normalizedStatus,
      priority: priority || 'medium',
      targetAudience: normalizedAudience,
      publishedAt: publishTimestamp,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPinned: isPinned || false
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'name email profileImage');

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: populatedAnnouncement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      status,
      priority,
      targetAudience,
      expiresAt,
      isPinned
    } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Update fields
    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (status !== undefined) {
      // Normalize status to lowercase
      let normalizedStatus = status.toLowerCase();
      if (!['draft', 'published', 'archived'].includes(normalizedStatus)) {
        normalizedStatus = announcement.status; // Keep existing if invalid
      }
      announcement.status = normalizedStatus;
    }
    if (priority !== undefined) announcement.priority = priority;
    if (isPinned !== undefined) announcement.isPinned = isPinned;
    if (expiresAt !== undefined) {
      announcement.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    if (targetAudience !== undefined) {
      if (Array.isArray(targetAudience)) {
        announcement.targetAudience = targetAudience;
      } else if (typeof targetAudience === 'string') {
        announcement.targetAudience = [targetAudience];
      }
    }

    // Set publishedAt when transitioning to published
    if (status === 'published' && !announcement.publishedAt) {
      announcement.publishedAt = new Date();
    }

    await announcement.save();

    const updatedAnnouncement = await Announcement.findById(id)
      .populate('author', 'name email profileImage');

    res.json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(id);

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get announcement statistics (Admin only)
// @route   GET /api/announcements/stats
// @access  Private (Admin only)
const getAnnouncementStats = async (req, res) => {
  try {
    const total = await Announcement.countDocuments();
    const published = await Announcement.countDocuments({ status: 'published' });
    const drafts = await Announcement.countDocuments({ status: 'draft' });
    const archived = await Announcement.countDocuments({ status: 'archived' });
    const pinned = await Announcement.countDocuments({ isPinned: true, status: 'published' });

    res.json({
      stats: {
        total,
        published,
        drafts,
        archived,
        pinned
      }
    });
  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get published announcements (for students and alumni)
// @route   GET /api/announcements/published
// @access  Private (Students and Alumni)
const getPublishedAnnouncements = async (req, res) => {
  try {
    // Use simple query to find published announcements (case-insensitive)
    // Check for both "published" and "Published" to handle any inconsistencies
    const filter = {
      $or: [
        { status: 'published' },
        { status: 'Published' }
      ]
    };

    // Filter by target audience
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      filter.$and = [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: userRole },
            { targetAudience: { $in: ['all', userRole] } }
          ]
        }
      ];
    }

    // Filter expired announcements
    const now = new Date();
    if (!filter.$and) {
      filter.$and = [];
    }
    filter.$and.push({
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    });

    // Get announcements sorted by pinned first, then by published date
    const announcements = await Announcement.find(filter)
      .populate('author', 'name email profileImage')
      .sort({ isPinned: -1, publishedAt: -1, createdAt: -1 });

    // Return simple array format for compatibility
    return res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching published announcements:', error);
    return res.status(500).json({ message: 'Server error fetching published announcements', error: error.message });
  }
};

module.exports = {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementStats,
  getPublishedAnnouncements
};

