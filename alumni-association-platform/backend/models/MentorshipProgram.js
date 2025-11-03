const mongoose = require('mongoose');
const { getIO } = require('../utils/io');

const mentorshipProgramSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  mentees: [{
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  requests: [{
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      trim: true,
      required: false
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxMentees: {
    type: Number,
    default: 10,
    min: 1
  }
}, {
  timestamps: true
});

// Index for efficient queries
mentorshipProgramSchema.index({ mentor: 1, isActive: 1 });
mentorshipProgramSchema.index({ 'mentees.mentee': 1 });
mentorshipProgramSchema.index({ 'requests.mentee': 1 });

// Virtual for mentor name
mentorshipProgramSchema.virtual('mentorName').get(function() {
  return this.mentor?.name || 'Unknown';
});

// Virtual for mentee count
mentorshipProgramSchema.virtual('menteeCount').get(function() {
  return (this.mentees || []).length;
});

// Virtual for pending requests count
mentorshipProgramSchema.virtual('pendingRequestsCount').get(function() {
  return (this.requests || []).filter(r => r.status === 'pending').length;
});

// Ensure virtual fields are serialized
mentorshipProgramSchema.set('toJSON', { virtuals: true });
mentorshipProgramSchema.set('toObject', { virtuals: true });

// Pre-populate mentor before saving (will need to manually populate in queries)
// Realtime emit hooks
mentorshipProgramSchema.post('save', function(doc) {
  const io = getIO();
  if (!io) return;
  const event = this.isNew ? 'mentorship-programs:created' : 'mentorship-programs:updated';
  io.emit(event, { program: doc });
});

mentorshipProgramSchema.post('findOneAndUpdate', async function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('mentorship-programs:updated', { _id: result._id, fullDocument: result });
});

mentorshipProgramSchema.post('findOneAndDelete', function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('mentorship-programs:deleted', { _id: result._id });
});

module.exports = mongoose.model('MentorshipProgram', mentorshipProgramSchema);




