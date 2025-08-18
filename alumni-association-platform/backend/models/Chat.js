const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
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
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    mentor: {
      type: Number,
      default: 0
    },
    mentee: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatSchema.index({ mentor: 1, mentee: 1 });
chatSchema.index({ lastMessage: -1 });
chatSchema.index({ 'messages.sender': 1 });

// Virtual for getting the other participant
chatSchema.virtual('getOtherParticipant').get(function(userId) {
  return this.mentor.toString() === userId.toString() ? this.mentee : this.mentor;
});

// Method to add a message
chatSchema.methods.addMessage = function(senderId, content, messageType = 'text', fileUrl = null, fileName = null) {
  const message = {
    sender: senderId,
    content,
    messageType,
    fileUrl,
    fileName,
    isRead: false
  };

  this.messages.push(message);
  this.lastMessage = new Date();

  // Update unread count for the other participant
  if (senderId.toString() === this.mentor.toString()) {
    this.unreadCount.mentee += 1;
  } else {
    this.unreadCount.mentor += 1;
  }

  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  const isMentor = userId.toString() === this.mentor.toString();
  
  // Mark all unread messages from the other person as read
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
    }
  });

  // Reset unread count
  if (isMentor) {
    this.unreadCount.mentor = 0;
  } else {
    this.unreadCount.mentee = 0;
  }

  return this.save();
};

// Static method to find or create chat
chatSchema.statics.findOrCreateChat = async function(mentorId, menteeId) {
  let chat = await this.findOne({
    $or: [
      { mentor: mentorId, mentee: menteeId },
      { mentor: menteeId, mentee: mentorId }
    ]
  });

  if (!chat) {
    chat = new this({
      mentor: mentorId,
      mentee: menteeId
    });
    await chat.save();
  }

  return chat;
};

// Static method to get user's chats
chatSchema.statics.getUserChats = async function(userId) {
  return await this.find({
    $or: [{ mentor: userId }, { mentee: userId }],
    isActive: true
  })
  .populate('mentor', 'name email profileImage role')
  .populate('mentee', 'name email profileImage role')
  .populate('messages.sender', 'name profileImage')
  .sort({ lastMessage: -1 });
};

module.exports = mongoose.model('Chat', chatSchema);
