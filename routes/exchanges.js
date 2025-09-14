const express = require('express');
const jwt = require('jsonwebtoken');
const sqlDatabase = require('../models/Database');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'skillswap-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user's exchanges
router.get('/my-exchanges', authenticateToken, async (req, res) => {
  try {
    const exchanges = await sqlDatabase.findExchangesByUserId(parseInt(req.user.userId));
    res.json(exchanges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new exchange request
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { providerId, skill, description } = req.body;

    // Get requester and provider details
    const requester = await sqlDatabase.findUserById(parseInt(req.user.userId));
    const provider = await sqlDatabase.findUserById(parseInt(providerId));

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Create exchange
    const exchange = await sqlDatabase.createExchange({
      requester,
      provider,
      skill,
      description
    });

    res.status(201).json({
      message: 'Exchange request created successfully',
      exchange
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get exchange details with messages
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const exchangeId = parseInt(req.params.id);
    
    // Get exchange details
    const exchanges = await sqlDatabase.findExchangesByUserId(parseInt(req.user.userId));
    const exchange = exchanges.find(ex => ex._id === exchangeId);
    
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Get messages for this exchange
    const messages = await sqlDatabase.getExchangeMessages(exchangeId);
    exchange.messages = messages;

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add message to exchange
router.post('/:id/message', authenticateToken, async (req, res) => {
  try {
    const exchangeId = parseInt(req.params.id);
    const { message } = req.body;
    const senderId = parseInt(req.user.userId);

    // Add message to database
    const newMessage = await sqlDatabase.addMessage(exchangeId, senderId, message);

    // Emit real-time message if socket.io is available
    const io = req.app.get('io');
    if (io) {
      io.to(`exchange_${exchangeId}`).emit('receive_message', {
        exchangeId,
        message: newMessage
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;