const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// No MongoDB connection required for this demo

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fields', require('./routes/fields'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Paddy Field Marketplace API is running' });
});

// Socket.IO - Real-time chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User comes online
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  // Send message
  socket.on('send_message', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver._id || data.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive_message', data);
    }
  });

  // Edit message
  socket.on('edit_message', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver._id || data.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('message_edited', data);
    }
  });

  // Delete message
  socket.on('delete_message', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver._id || data.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('message_deleted', data);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user_typing', { sender: data.sender });
    }
  });

  socket.on('stop_typing', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user_stop_typing', { sender: data.sender });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});
