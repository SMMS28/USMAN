const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all available skills
router.get('/available', async (req, res) => {
  try {
    const users = await User.find({}, 'skillsOffered');
    const allSkills = new Set();
    
    users.forEach(user => {
      user.skillsOffered.forEach(skill => {
        allSkills.add(skill.skill);
      });
    });

    res.json(Array.from(allSkills).sort());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get skill matching suggestions
router.get('/match/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userSkillsWanted = user.skillsWanted.map(s => s.skill);
    const userSkillsOffered = user.skillsOffered.map(s => s.skill);

    // Find users who offer skills the current user wants
    const potentialMatches = await User.find({
      _id: { $ne: user._id },
      'skillsOffered.skill': { $in: userSkillsWanted }
    }).select('name location bio skillsOffered skillsWanted rating points');

    // Calculate match score for each potential match
    const matches = potentialMatches.map(match => {
      const offeredSkills = match.skillsOffered.filter(skill => 
        userSkillsWanted.includes(skill.skill)
      );
      
      const wantedSkills = match.skillsWanted.filter(skill => 
        userSkillsOffered.includes(skill.skill)
      );

      const matchScore = offeredSkills.length + wantedSkills.length;

      return {
        user: match,
        offeredSkills,
        wantedSkills,
        matchScore,
        canExchange: wantedSkills.length > 0
      };
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches.slice(0, 10)); // Return top 10 matches
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
