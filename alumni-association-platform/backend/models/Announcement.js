const mongoose = require('mongoose');
const { getIO } = require('../utils/io');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetAudience: {
    type: [String],
    enum: ['all', 'alumni', 'students', 'admin'],
    default: ['all']
  },
  publishedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
announcementSchema.index({ title: 'text', content: 'text' });
announcementSchema.index({ status: 1, publishedAt: -1 });
announcementSchema.index({ isPinned: -1, publishedAt: -1 });

// Pre-save middleware to set publishedAt
announcementSchema.pre('save', function(next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Virtual for checking if announcement is active
announcementSchema.virtual('isActive').get(function() {
  if (this.status !== 'published') return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
});

// Ensure virtual fields are serialized
announcementSchema.set('toJSON', { virtuals: true });
announcementSchema.set('toObject', { virtuals: true });

// Realtime emit hooks
announcementSchema.post('save', function(doc) {
  const io = getIO();
  if (!io) return;
  const event = this.isNew ? 'announcements:created' : 'announcements:updated';
  io.emit(event, { announcement: doc });
});

announcementSchema.post('findOneAndUpdate', async function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('announcements:updated', { _id: result._id, fullDocument: result });
});

announcementSchema.post('findOneAndDelete', function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('announcements:deleted', { _id: result._id });
});

module.exports = mongoose.model('Announcement', announcementSchema);




