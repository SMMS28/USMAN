const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import database
const sqlDatabase = require('./models/Database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5001",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup - SQLite for persistent storage
console.log('🗄️ SQLite database initialized and ready');
console.log('📊 All data will be stored persistently');

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/exchanges', require('./routes/exchanges'));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join exchange room for real-time messaging
  socket.on('join_exchange', (exchangeId) => {
    socket.join(`exchange_${exchangeId}`);
    console.log(`User joined exchange room: ${exchangeId}`);
  });

  // Handle real-time messages
  socket.on('send_message', (data) => {
    socket.to(`exchange_${data.exchangeId}`).emit('receive_message', data);
  });

  // Handle status updates
  socket.on('status_update', (data) => {
    socket.to(`exchange_${data.exchangeId}`).emit('status_changed', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally and to routes
global.io = io;
app.set('io', io);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend and API available at http://localhost:${PORT}`);
});

// Export for Vercel (if needed)
module.exports = app;
