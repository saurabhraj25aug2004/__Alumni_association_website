const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getIO } = require('../utils/io');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'alumni', 'student'],
    required: true
  },
  profileImage: {
    url: {
      type: String,
      default: null
    },
    public_id: {
      type: String,
      default: null
    }
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  graduationYear: {
    type: Number,
    required: function() {
      return this.role === 'alumni' || this.role === 'student';
    }
  },
  major: {
    type: String,
    required: function() {
      return this.role === 'alumni' || this.role === 'student';
    }
  },
  bio: {
    type: String,
    maxlength: 500
  },
  phone: {
    type: String
  },
  location: {
    type: String
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    website: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
 
// Realtime emit hooks (fallback when change streams unavailable)
userSchema.post('save', function(doc) {
  const io = getIO();
  if (!io) return;
  const event = this.isNew ? 'users:created' : 'users:updated';
  io.emit(event, { user: doc });
});

userSchema.post('findOneAndUpdate', function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('users:updated', { _id: result._id, fullDocument: result });
});

userSchema.post('findOneAndDelete', function(result) {
  const io = getIO();
  if (!io) return;
  if (result) io.emit('users:deleted', { _id: result._id });
});
