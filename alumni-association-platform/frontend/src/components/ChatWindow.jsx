import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../alumni-association-platform/frontend/src/utils/api';
import socketService from '../../alumni-association-platform/frontend/src/utils/socket';
import useAuthStore from '../store/authStore';

const ChatWindow = ({ selectedChat, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      connectSocket();
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectSocket = () => {
    if (token) {
      socketService.connect(token);
      
      // Join chat room
      socketService.joinChat(selectedChat._id);
      
      // Listen for new messages
      socketService.onNewMessage((data) => {
        if (data.chatId === selectedChat._id) {
          setMessages(prev => [...prev, data.message]);
        }
      });
      
      // Listen for typing indicators
      socketService.onUserTyping((data) => {
        if (data.chatId === selectedChat._id && data.userId !== user._id) {
          setTypingUsers(prev => new Set(prev).add(data.userName));
        }
      });
      
      socketService.onUserStopTyping((data) => {
        if (data.chatId === selectedChat._id && data.userId !== user._id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userName);
            return newSet;
          });
        }
      });
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getChatMessages(selectedChat._id);
      setMessages(response.data.data.messages);
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Send message via API
      const response = await chatAPI.sendMessage(selectedChat._id, {
        content: messageContent,
        messageType: 'text'
      });

      // Add message to local state
      setMessages(prev => [...prev, response.data.data.message]);
      
      // Send via Socket.IO for real-time
      socketService.sendMessage(selectedChat._id, {
        content: messageContent,
        messageType: 'text'
      });
      
      // Mark as read
      socketService.markAsRead(selectedChat._id);
      
    } catch (err) {
      console.error('Send message error:', err);
      // Revert the input if sending failed
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (e.target.value.length > 0) {
      socketService.startTyping(selectedChat._id);
    } else {
      socketService.stopTyping(selectedChat._id);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message) => {
    return message.sender._id === user._id;
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="mr-3 p-1 rounded-md hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-3">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={selectedChat.otherParticipant.profileImage?.url || 'https://via.placeholder.com/40'}
            alt={selectedChat.otherParticipant.name}
          />
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {selectedChat.otherParticipant.name}
            </h3>
            <p className="text-xs text-gray-500 capitalize">
              {selectedChat.otherParticipant.role}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage(message)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className={`text-xs ${
                      isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  {message.isRead && isOwnMessage(message) && (
                    <div className="flex justify-end mt-1">
                      <svg className="w-4 h-4 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {Array.from(typingUsers).join(', ')} typing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending
              </div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
