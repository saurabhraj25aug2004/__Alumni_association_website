const Chat = require('../models/Chat');
const User = require('../models/User');

// Get all chats for a user
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.getUserChats(userId);
    
    // Format chats for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.mentor._id.toString() === userId ? chat.mentee : chat.mentor;
      const unreadCount = chat.mentor._id.toString() === userId ? chat.unreadCount.mentor : chat.unreadCount.mentee;
      
      return {
        _id: chat._id,
        otherParticipant: {
          _id: otherParticipant._id,
          name: otherParticipant.name,
          email: otherParticipant.email,
          profileImage: otherParticipant.profileImage,
          role: otherParticipant.role
        },
        lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
        unreadCount,
        lastMessageTime: chat.lastMessage,
        isActive: chat.isActive
      };
    });

    res.json({
      success: true,
      data: formattedChats
    });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats'
    });
  }
};

// Get specific chat with messages
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId)
      .populate('mentor', 'name email profileImage role')
      .populate('mentee', 'name email profileImage role')
      .populate('messages.sender', 'name profileImage role');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of this chat
    if (chat.mentor._id.toString() !== userId && chat.mentee._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark messages as read
    await chat.markAsRead(userId);

    // Get other participant info
    const otherParticipant = chat.mentor._id.toString() === userId ? chat.mentee : chat.mentor;

    res.json({
      success: true,
      data: {
        _id: chat._id,
        otherParticipant: {
          _id: otherParticipant._id,
          name: otherParticipant.name,
          email: otherParticipant.email,
          profileImage: otherParticipant.profileImage,
          role: otherParticipant.role
        },
        messages: chat.messages,
        isActive: chat.isActive
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat messages'
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text', fileUrl = null, fileName = null } = req.body;
    const senderId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const chat = await Chat.findById(chatId)
      .populate('mentor', 'name email profileImage role')
      .populate('mentee', 'name email profileImage role');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of this chat
    if (chat.mentor._id.toString() !== senderId && chat.mentee._id.toString() !== senderId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add message to chat
    await chat.addMessage(senderId, content.trim(), messageType, fileUrl, fileName);

    // Get the newly added message
    const newMessage = chat.messages[chat.messages.length - 1];
    await newMessage.populate('sender', 'name profileImage role');

    // Get other participant info
    const otherParticipant = chat.mentor._id.toString() === senderId ? chat.mentee : chat.mentor;

    res.json({
      success: true,
      data: {
        message: newMessage,
        chat: {
          _id: chat._id,
          otherParticipant: {
            _id: otherParticipant._id,
            name: otherParticipant.name,
            email: otherParticipant.email,
            profileImage: otherParticipant.profileImage,
            role: otherParticipant.role
          },
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount
        }
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Create or get chat with another user
const createOrGetChat = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is trying to chat with themselves
    if (userId === otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }

    // Find or create chat
    const chat = await Chat.findOrCreateChat(userId, otherUserId);
    
    // Populate chat data
    await chat.populate('mentor', 'name email profileImage role');
    await chat.populate('mentee', 'name email profileImage role');
    await chat.populate('messages.sender', 'name profileImage role');

    // Get other participant info
    const otherParticipant = chat.mentor._id.toString() === userId ? chat.mentee : chat.mentor;

    res.json({
      success: true,
      data: {
        _id: chat._id,
        otherParticipant: {
          _id: otherParticipant._id,
          name: otherParticipant.name,
          email: otherParticipant.email,
          profileImage: otherParticipant.profileImage,
          role: otherParticipant.role
        },
        messages: chat.messages,
        isActive: chat.isActive
      }
    });
  } catch (error) {
    console.error('Create or get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create or get chat'
    });
  }
};

// Mark chat as read
const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of this chat
    if (chat.mentor.toString() !== userId && chat.mentee.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await chat.markAsRead(userId);

    res.json({
      success: true,
      message: 'Chat marked as read'
    });
  } catch (error) {
    console.error('Mark chat as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark chat as read'
    });
  }
};

// Get available mentors for chat
const getAvailableMentors = async (req, res) => {
  try {
    const mentors = await User.find({
      role: 'alumni',
      isApproved: true
    }).select('name email profileImage bio major graduationYear');

    res.json({
      success: true,
      data: mentors
    });
  } catch (error) {
    console.error('Get available mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors'
    });
  }
};

// Get available mentees for chat
const getAvailableMentees = async (req, res) => {
  try {
    const mentees = await User.find({
      role: 'student',
      isApproved: true
    }).select('name email profileImage bio major graduationYear');

    res.json({
      success: true,
      data: mentees
    });
  } catch (error) {
    console.error('Get available mentees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentees'
    });
  }
};

module.exports = {
  getUserChats,
  getChatMessages,
  sendMessage,
  createOrGetChat,
  markChatAsRead,
  getAvailableMentors,
  getAvailableMentees
};
