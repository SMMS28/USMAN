const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sqlDatabase = require('../models/Database');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location, bio } = req.body;

    // Check if user already exists
    const existingUser = await sqlDatabase.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await sqlDatabase.createUser({
      name,
      email,
      password, // In production, this should be hashed
      location,
      bio
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'skillswap-secret-key',
      { expiresIn: '7d' }
    );

    // Return success response
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        points: user.points,
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        bio: user.bio || '',
        preferences: { learningMode: 'Both', maxDistance: 10 },
        rating: { average: 0, count: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await sqlDatabase.findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'skillswap-secret-key',
      { expiresIn: '7d' }
    );

    // Return success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        points: user.points,
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        bio: user.bio || '',
        preferences: { learningMode: 'Both', maxDistance: 10 },
        rating: user.rating || { average: 0, count: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Password Reset (Placeholder for future implementation)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    // In production, implement email sending logic
    res.json({ message: 'Password reset instructions sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;