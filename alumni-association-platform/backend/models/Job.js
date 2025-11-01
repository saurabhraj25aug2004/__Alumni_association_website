const mongoose = require('mongoose');
const { getIO } = require('../utils/io');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract'],
    required: true
  },
  salary: {
    min: {
      type: Number,
      required: false
    },
    max: {
      type: Number,
      required: false
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requirements: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'pending'
    },
    resume: {
      type: String, // URL to resume file
      required: false
    },
    coverLetter: {
      type: String,
      required: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  deadline: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

// Virtual for applicant count
jobSchema.virtual('applicantCount').get(function() {
  return this.applicants.length;
});

// Ensure virtual fields are serialized
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

// Realtime emit hooks (fallback when change streams unavailable)
jobSchema.post('save', function(doc) {
  const io = getIO();
  if (!io) return;
  const event = this.isNew ? 'jobs:created' : 'jobs:updated';
  io.emit(event, { job: doc });
});

jobSchema.post('findOneAndUpdate', function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('jobs:updated', { _id: result._id, fullDocument: result });
});

jobSchema.post('findOneAndDelete', function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('jobs:deleted', { _id: result._id });
});

module.exports = mongoose.model('Job', jobSchema);
