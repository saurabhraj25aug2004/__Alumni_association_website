const mongoose = require('mongoose');
const { getIO } = require('../utils/io');

const mentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    required: false
  },
  mentorResponse: {
    type: String,
    trim: true,
    required: false
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date,
    required: false
  },
  completedAt: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
mentorshipSchema.index({ mentor: 1, status: 1 });
mentorshipSchema.index({ mentee: 1, status: 1 });
mentorshipSchema.index({ mentor: 1, mentee: 1 }); // Prevent duplicates

// Pre-save middleware to set acceptedAt when status changes to accepted
mentorshipSchema.pre('save', function(next) {
  if (this.status === 'accepted' && !this.acceptedAt && this.isModified('status')) {
    this.acceptedAt = new Date();
  }
  if (this.status === 'completed' && !this.completedAt && this.isModified('status')) {
    this.completedAt = new Date();
  }
  next();
});

// Ensure virtual fields are serialized
mentorshipSchema.set('toJSON', { virtuals: true });
mentorshipSchema.set('toObject', { virtuals: true });

// Realtime emit hooks
mentorshipSchema.post('save', function(doc) {
  const io = getIO();
  if (!io) return;
  const event = this.isNew ? 'mentorships:created' : 'mentorships:updated';
  io.emit(event, { mentorship: doc });
});

mentorshipSchema.post('findOneAndUpdate', async function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('mentorships:updated', { _id: result._id, fullDocument: result });
});

mentorshipSchema.post('findOneAndDelete', function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('mentorships:deleted', { _id: result._id });
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);


