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

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await sqlDatabase.findUserById(parseInt(req.user.userId));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, location, bio, skillsOffered, skillsWanted, preferences } = req.body;
    
    const updatedUser = await sqlDatabase.updateUser(parseInt(req.user.userId), {
      name, location, bio, skillsOffered, skillsWanted, preferences
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users with filtering and pagination
router.get('/search', async (req, res) => {
  try {
    const { 
      skill, 
      location, 
      minRating, 
      sortBy = 'newest',
      page = 1,
      limit = 20 
    } = req.query;

    // Get all users from database
    const allUsers = await sqlDatabase.getAllUsers();
    
    // Apply filters
    let filteredUsers = allUsers;
    
    if (skill) {
      filteredUsers = filteredUsers.filter(user => {
        const skillsOffered = JSON.parse(user.skills_offered || '[]');
        return skillsOffered.some(s => s.toLowerCase().includes(skill.toLowerCase()));
      });
    }
    
    if (location) {
      filteredUsers = filteredUsers.filter(user => 
        user.location && user.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (minRating) {
      filteredUsers = filteredUsers.filter(user => 
        (user.rating?.average || 0) >= parseFloat(minRating)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filteredUsers.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'points':
        filteredUsers.sort((a, b) => b.points - a.points);
        break;
      case 'name':
        filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filteredUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove passwords from response
    const usersWithoutPasswords = paginatedUsers.map(({ password, ...user }) => user);

    const total = filteredUsers.length;
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      users: usersWithoutPasswords,
      pagination: {
        current: parseInt(page),
        pages,
        total,
        hasNext: parseInt(page) < pages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get featured users
router.get('/featured', async (req, res) => {
  try {
    const allUsers = await sqlDatabase.getAllUsers();
    
    // Filter for high-rated users with skills
    const featuredUsers = allUsers
      .filter(user => {
        const skillsOffered = JSON.parse(user.skills_offered || '[]');
        return skillsOffered.length > 0;
      })
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
      .slice(0, 6)
      .map(({ password, ...user }) => user);

    res.json(featuredUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;