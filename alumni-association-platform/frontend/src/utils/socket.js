import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Connect to Socket.IO server
  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const DEFAULT_SOCKET_PORT = import.meta.env.VITE_API_PORT || 5000;
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `http://localhost:${DEFAULT_SOCKET_PORT}`;
    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  // Disconnect from Socket.IO server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Join a chat room
  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-chat', chatId);
    }
  }

  // Leave a chat room
  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-chat', chatId);
    }
  }

  // Send a message
  sendMessage(chatId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', { chatId, message });
    }
  }

  // Start typing indicator
  startTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-start', { chatId });
    }
  }

  // Stop typing indicator
  stopTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-stop', { chatId });
    }
  }

  // Mark messages as read
  markAsRead(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark-read', { chatId });
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
      this.listeners.set('new-message', callback);
    }
  }

  // Listen for typing indicators
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
      this.listeners.set('user-typing', callback);
    }
  }

  // Listen for stop typing
  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
      this.listeners.set('user-stop-typing', callback);
    }
  }

  // Listen for read receipts
  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('messages-read', callback);
      this.listeners.set('messages-read', callback);
    }
  }

  // Remove specific listener
  removeListener(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Generic entity event subscriptions
  onEntityCreated(entity, callback) {
    if (this.socket) {
      const event = `${entity}:created`;
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  onEntityUpdated(entity, callback) {
    if (this.socket) {
      const event = `${entity}:updated`;
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  onEntityDeleted(entity, callback) {
    if (this.socket) {
      const event = `${entity}:deleted`;
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
