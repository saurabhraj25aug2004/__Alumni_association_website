const express = require('express');
const router = express.Router();
const {
  getUserChats,
  getChatMessages,
  sendMessage,
  createOrGetChat,
  markChatAsRead,
  getAvailableMentors,
  getAvailableMentees
} = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

// All routes are protected
router.use(protect);

// Get all chats for the authenticated user
router.get('/', getUserChats);

// Get available mentors (for students)
router.get('/mentors', getAvailableMentors);

// Get available mentees (for alumni)
router.get('/mentees', getAvailableMentees);

// Create or get chat with another user
router.get('/user/:otherUserId', createOrGetChat);

// Get messages for a specific chat
router.get('/:chatId/messages', getChatMessages);

// Send a message in a chat
router.post('/:chatId/messages', sendMessage);

// Mark chat as read
router.put('/:chatId/read', markChatAsRead);

module.exports = router;
