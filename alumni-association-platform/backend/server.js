const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const initChangeStreams = require('./utils/changeStreams');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jobRoutes = require('./routes/jobRoutes');
const workshopRoutes = require('./routes/workshopRoutes');
const blogRoutes = require('./routes/blogRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const chatRoutes = require('./routes/chatRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'API running' });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

  // Join user to their personal room
  socket.join(socket.user._id.toString());

  // Handle joining chat rooms
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.user.name} joined chat: ${chatId}`);
  });

  // Handle leaving chat rooms
  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.user.name} left chat: ${chatId}`);
  });

  // Handle new messages
  socket.on('send-message', (data) => {
    const { chatId, message } = data;

    // Broadcast message to all users in the chat room
    socket.to(chatId).emit('new-message', {
      chatId,
      message: {
        ...message,
        sender: {
          _id: socket.user._id,
          name: socket.user.name,
          profileImage: socket.user.profileImage,
          role: socket.user.role
        }
      }
    });

    console.log(`Message sent in chat ${chatId} by ${socket.user.name}`);
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { chatId } = data;
    socket.to(chatId).emit('user-typing', {
      chatId,
      userId: socket.user._id,
      userName: socket.user.name
    });
  });

  socket.on('typing-stop', (data) => {
    const { chatId } = data;
    socket.to(chatId).emit('user-stop-typing', {
      chatId,
      userId: socket.user._id
    });
  });

  // Handle read receipts
  socket.on('mark-read', (data) => {
    const { chatId } = data;
    socket.to(chatId).emit('messages-read', {
      chatId,
      userId: socket.user._id
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const DEFAULT_PORT = Number(process.env.PORT) || 5000;
let currentPort = DEFAULT_PORT;

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    // Initialize MongoDB change streams -> Socket.IO broadcaster
    initChangeStreams(io);
  });
};

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.warn(`Port ${currentPort} is in use. Trying ${currentPort + 1}...`);
    currentPort += 1;
    setTimeout(() => startServer(currentPort), 500);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

startServer(currentPort);
