const express = require('express');
const jwt = require('jsonwebtoken');
const Exchange = require('../models/Exchange');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Create new exchange request
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const {
      providerId,
      skill,
      description,
      duration,
      mode,
      location,
      scheduledDate,
      type,
      pointsCost,
      exchangeSkill
    } = req.body;

    const exchange = new Exchange({
      requester: req.user.userId,
      provider: providerId,
      skill,
      description,
      duration,
      mode,
      location,
      scheduledDate,
      type,
      pointsCost,
      exchangeSkill
    });

    await exchange.save();
    await exchange.populate('requester provider', 'name email location');

    res.status(201).json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's exchanges
router.get('/my-exchanges', authenticateToken, async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [
        { requester: req.user.userId },
        { provider: req.user.userId }
      ]
    })
    .populate('requester provider', 'name email location')
    .sort({ createdAt: -1 });

    res.json(exchanges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update exchange status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Check if user is authorized to update this exchange
    if (exchange.requester.toString() !== req.user.userId && 
        exchange.provider.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    exchange.status = status;
    await exchange.save();

    // If exchange is completed, update user points
    if (status === 'Completed') {
      await User.findByIdAndUpdate(exchange.provider, {
        $inc: { points: exchange.pointsCost }
      });
      await User.findByIdAndUpdate(exchange.requester, {
        $inc: { points: -exchange.pointsCost }
      });
    }

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add message to exchange
router.post('/:id/message', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Check if user is part of this exchange
    if (exchange.requester.toString() !== req.user.userId && 
        exchange.provider.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    exchange.messages.push({
      sender: req.user.userId,
      message
    });

    await exchange.save();
    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Rate exchange
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { rating, review, userType } = req.body; // userType: 'requester' or 'provider'
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (userType === 'requester') {
      exchange.rating.requesterRating = { rating, review, timestamp: new Date() };
    } else {
      exchange.rating.providerRating = { rating, review, timestamp: new Date() };
    }

    await exchange.save();

    // Update user's average rating
    const userId = userType === 'requester' ? exchange.requester : exchange.provider;
    const userExchanges = await Exchange.find({
      [userType]: userId,
      'rating.providerRating.rating': { $exists: true }
    });

    const totalRating = userExchanges.reduce((sum, ex) => {
      return sum + (ex.rating.providerRating?.rating || 0);
    }, 0);

    const averageRating = totalRating / userExchanges.length;

    await User.findByIdAndUpdate(userId, {
      'rating.average': averageRating,
      'rating.count': userExchanges.length
    });

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
