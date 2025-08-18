const mongoose = require('mongoose');

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
        return this.location.type === 'in-person' || this.location.type === 'hybrid';
      }
    },
    onlineLink: {
      type: String,
      required: function() {
        return this.location.type === 'online' || this.location.type === 'hybrid';
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
    enum: ['career', 'technical', 'soft-skills', 'networking', 'industry', 'other'],
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
  return this.attendees.length;
});

// Virtual for available spots
workshopSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.capacity - this.attendees.length);
});

// Virtual for registration status
workshopSchema.virtual('isFull').get(function() {
  return this.attendees.length >= this.capacity;
});

// Virtual for registration open
workshopSchema.virtual('registrationOpen').get(function() {
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
});

// Ensure virtual fields are serialized
workshopSchema.set('toJSON', { virtuals: true });
workshopSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Workshop', workshopSchema);
