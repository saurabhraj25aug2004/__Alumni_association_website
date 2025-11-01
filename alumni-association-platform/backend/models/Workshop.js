const mongoose = require('mongoose');
const { getIO } = require('../utils/io');

const workshopSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'in-person', 'hybrid'],
      required: true
    },
    address: {
      type: String,
      required: function() {
        return this.location?.type === 'in-person' || this.location?.type === 'hybrid';
      }
    },
    onlineLink: {
      type: String,
      required: function() {
        return this.location?.type === 'online' || this.location?.type === 'hybrid';
      }
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'no-show', 'cancelled'],
      default: 'registered'
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true
      }
    }
  }],
  category: {
    type: String,
    enum: ['career', 'technology', 'leadership', 'networking', 'skills', 'industry'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  materials: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['document', 'video', 'presentation', 'link'],
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDeadline: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for search functionality
workshopSchema.index({ topic: 'text', description: 'text', tags: 'text' });

// Virtual for attendee count
workshopSchema.virtual('attendeeCount').get(function() {
  return this.attendees?.length || 0;
});

// Virtual for available spots
workshopSchema.virtual('availableSpots').get(function() {
  const capacity = this.capacity || 0;
  const attendeeCount = this.attendees?.length || 0;
  return Math.max(0, capacity - attendeeCount);
});

// Virtual for registration status
workshopSchema.virtual('isFull').get(function() {
  const capacity = this.capacity || 0;
  const attendeeCount = this.attendees?.length || 0;
  return attendeeCount >= capacity;
});

// Virtual for registration open
workshopSchema.virtual('registrationOpen').get(function() {
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
});

// Ensure virtual fields are serialized
workshopSchema.set('toJSON', { virtuals: true });
workshopSchema.set('toObject', { virtuals: true });

// Realtime emit hooks (fallback when change streams unavailable)
workshopSchema.post('save', function(doc) {
  const io = getIO();
  if (!io) return;
  const event = this.isNew ? 'workshops:created' : 'workshops:updated';
  io.emit(event, { workshop: doc });
});

workshopSchema.post('findOneAndUpdate', function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('workshops:updated', { _id: result._id, fullDocument: result });
});

workshopSchema.post('findOneAndDelete', function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('workshops:deleted', { _id: result._id });
});

module.exports = mongoose.model('Workshop', workshopSchema);
