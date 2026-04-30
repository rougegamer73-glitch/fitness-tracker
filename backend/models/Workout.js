const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  exerciseType: {
    type: String,
    required: true,
    trim: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 0
  },
  steps: {
    type: Number,
    default: 0,
    min: 0
  },
  calories: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  workoutDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workout', workoutSchema);
