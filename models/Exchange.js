const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Skill Exchange', 'Points Payment', 'Free'],
    default: 'Skill Exchange'
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  mode: {
    type: String,
    enum: ['Online', 'In-Person'],
    required: true
  },
  location: {
    type: String,
    required: function() {
      return this.mode === 'In-Person';
    }
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  pointsCost: {
    type: Number,
    default: 0
  },
  exchangeSkill: {
    skill: String,
    description: String
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    requesterRating: {
      rating: Number,
      review: String,
      timestamp: Date
    },
    providerRating: {
      rating: Number,
      review: String,
      timestamp: Date
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exchange', exchangeSchema);
