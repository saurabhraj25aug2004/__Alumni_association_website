const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Alumni only)
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      type,
      salary,
      requirements,
      skills,
      deadline
    } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      type,
      salary,
      requirements,
      skills,
      postedBy: req.user.id,
      deadline
    });

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'name email');

    res.status(201).json({
      message: 'Job posted successfully',
      job: populatedJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const type = req.query.type;
    const location = req.query.location;
    const company = req.query.company;

    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    if (search) {
      filter.$text = { $search: search };
    }
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (company) filter.company = { $regex: company, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Job poster only)
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job poster
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Job poster only)
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job poster
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Students only)
const applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter } = req.body;

    // Ensure only students can apply
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply for jobs' });
    }

    // Validate required fields
    if (!req.file && !coverLetter) {
      return res.status(400).json({ message: 'Please provide a resume or cover letter' });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: 'This job is no longer active' });
    }

    // Check if user has already applied
    const alreadyApplied = (job.applicants || []).find(
      applicant => applicant.user && applicant.user.toString() === req.user.id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Get user details for the application
    const applicantName = req.user.name || 'Unknown';
    const applicantEmail = req.user.email || '';

    // Handle resume file upload
    let resumeUrl = null;
    if (req.file && req.file.path) {
      resumeUrl = req.file.path;
    }

    // Ensure applicants array exists
    if (!job.applicants) {
      job.applicants = [];
    }

    // Add application with resume URL and user details
    job.applicants.push({
      user: req.user.id,
      resume: resumeUrl,
      coverLetter: coverLetter || '',
      status: 'pending',
      appliedAt: new Date()
    });

    await job.save();

    const updatedJob = await Job.findById(id)
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email');

    res.status(201).json({
      message: 'Application submitted successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/jobs/:id/applications/:applicationId
// @access  Private (Job poster or Admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id, applicationId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job poster or admin
    const isJobPoster = job.postedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isJobPoster && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update applications' });
    }

    const application = (job.applicants || []).id(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await job.save();

    const updatedJob = await Job.findById(id)
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email');

    res.json({
      message: 'Application status updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update application status by Admin (alternative route)
// @route   PUT /api/jobs/:id/status
// @access  Private (Admin only)
const updateApplicationStatusByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationId, status } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: 'applicationId is required' });
    }

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const application = (job.applicants || []).id(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await job.save();

    const updatedJob = await Job.findById(id)
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email');

    res.json({
      message: 'Application status updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update application status by admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's posted jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Job poster)
const getMyJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments({ postedBy: req.user.id });

    res.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's job applications
// @route   GET /api/jobs/my-applications
// @route   GET /api/jobs/applied
// @access  Private (User)
const getMyApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({
      'applicants.user': req.user.id
    })
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Map jobs to include user's specific application data
    const applications = jobs.map(job => {
      const userApplication = (job.applicants || []).find(
        app => app.user && app.user._id && app.user._id.toString() === req.user.id.toString()
      );
      return {
        ...job.toObject(),
        applicationStatus: userApplication?.status || 'pending',
        appliedAt: userApplication?.appliedAt || job.createdAt
      };
    });

    const total = await Job.countDocuments({
      'applicants.user': req.user.id
    });

    res.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalApplications: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all jobs with applications (Admin only)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
const getAllJobsForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({})
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments({});

    res.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all jobs for admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all applications (Admin only)
// @route   GET /api/admin/applications
// @access  Private (Admin only)
const getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Get all jobs and extract applications
    const filter = {};
    if (status) {
      filter['applicants.status'] = status;
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Flatten applications with job details
    const applications = [];
    jobs.forEach(job => {
      (job.applicants || []).forEach(applicant => {
        if (!status || applicant.status === status) {
          applications.push({
            _id: applicant._id,
            jobId: job._id,
            jobTitle: job.title,
            company: job.company,
            postedBy: {
              name: job.postedBy?.name || 'Unknown',
              email: job.postedBy?.email || ''
            },
            applicant: {
              _id: applicant.user?._id || '',
              name: applicant.user?.name || 'Unknown',
              email: applicant.user?.email || ''
            },
            resume: applicant.resume || '',
            coverLetter: applicant.coverLetter || '',
            status: applicant.status || 'pending',
            appliedAt: applicant.appliedAt || applicant.createdAt || new Date()
          });
        }
      });
    });

    // Sort by applied date
    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    const totalApplications = applications.length;

    res.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalApplications / limit),
        totalApplications: totalApplications,
        hasNext: page * limit < totalApplications,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyForJob,
  updateApplicationStatus,
  updateApplicationStatusByAdmin,
  getMyJobs,
  getMyApplications,
  getAllJobsForAdmin,
  getAllApplications
};
