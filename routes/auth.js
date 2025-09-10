const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const db = require('../models/InMemoryDB');
const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = mongoose.connection.readyState === 1;

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location, bio } = req.body;

    if (isMongoConnected) {
      // Use MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({
        name,
        email,
        password,
        location,
        bio
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          points: user.points
        }
      });
    } else {
      // Use in-memory database
      const existingUser = db.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = db.createUser({
        name,
        email,
        password, // In real app, this should be hashed
        location,
        bio,
        points: 100,
        skillsOffered: [],
        skillsWanted: [],
        rating: { average: 0, count: 0 },
        preferences: { learningMode: 'Both', maxDistance: 10 }
      });

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          points: user.points
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (isMongoConnected) {
      // Use MongoDB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          points: user.points,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted
        }
      });
    } else {
      // Use in-memory database
      const user = db.findUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          points: user.points,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
