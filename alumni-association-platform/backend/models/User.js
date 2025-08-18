const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
