const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: ['workshop', 'job', 'blog', 'platform', 'mentorship', 'event', 'other'],
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // Optional, for specific event feedback
    refPath: 'eventModel'
  },
  eventModel: {
    type: String,
    required: function() {
      return this.eventId != null;
    },
    enum: ['Workshop', 'Job', 'Blog']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comments: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'content', 'user-experience', 'support', 'suggestion'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'addressed', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  adminResponse: {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    response: {
      type: String,
      trim: true
    },
    respondedAt: {
      type: Date
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    markedAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'document', 'video'],
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for search functionality
feedbackSchema.index({ comments: 'text', tags: 'text' });

// Index for efficient queries
feedbackSchema.index({ eventType: 1, eventId: 1 });
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: 1 });

// Virtual for helpful count
feedbackSchema.virtual('helpfulCount').get(function() {
  return this.helpful.length;
});

// Virtual for average rating (for event-specific feedback)
feedbackSchema.virtual('averageRating').get(function() {
  // This would be calculated in aggregation queries
  return this.rating;
});

// Pre-save middleware to set priority based on rating
feedbackSchema.pre('save', function(next) {
  if (this.rating <= 2) {
    this.priority = 'high';
  } else if (this.rating <= 3) {
    this.priority = 'medium';
  } else {
    this.priority = 'low';
  }
  next();
});

// Static method to get average rating for an event
feedbackSchema.statics.getAverageRating = function(eventType, eventId) {
  return this.aggregate([
    {
      $match: {
        eventType: eventType,
        eventId: eventId
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get feedback statistics
feedbackSchema.statics.getFeedbackStats = function(eventType = null) {
  const match = eventType ? { eventType } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Ensure virtual fields are serialized
feedbackSchema.set('toJSON', { virtuals: true });
feedbackSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
