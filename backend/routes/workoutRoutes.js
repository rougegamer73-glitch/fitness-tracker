const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const Workout = require('../models/Workout');
const { getEligibleAchievements } = require('../utils/milestoneChecker');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', async (req, res, next) => {
  try {
    const walletAddress = getAuthenticatedWallet(req);
    const workouts = await Workout.find({ walletAddress }).sort({
      workoutDate: -1,
      createdAt: -1
    });

    const totals = workouts.reduce(
      (summary, workout) => {
        summary.totalSteps += workout.steps || 0;
        summary.totalCalories += workout.calories || 0;
        summary.totalDurationMinutes += workout.durationMinutes || 0;
        return summary;
      },
      {
        totalSteps: 0,
        totalCalories: 0,
        totalDurationMinutes: 0
      }
    );

    res.status(200).json({
      totalWorkouts: workouts.length,
      ...totals,
      latestWorkouts: workouts.slice(0, 5),
      eligibleAchievements: getEligibleAchievements(workouts)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const walletAddress = getAuthenticatedWallet(req);
    const workouts = await Workout.find({ walletAddress }).sort({
      workoutDate: -1,
      createdAt: -1
    });

    res.status(200).json({
      workouts
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const walletAddress = getAuthenticatedWallet(req);
    const workoutInput = validateWorkoutInput(req.body);

    const workout = await Workout.create({
      walletAddress,
      ...workoutInput
    });

    res.status(201).json({
      workout
    });
  } catch (error) {
    next(error);
  }
});

function validateWorkoutInput(body) {
  const exerciseType = validateRequiredString(body.exerciseType, 'exerciseType');
  const durationMinutes = validateNonNegativeNumber(
    body.durationMinutes,
    'durationMinutes',
    { required: true }
  );
  const steps = validateNonNegativeNumber(body.steps, 'steps');
  const calories = validateNonNegativeNumber(body.calories, 'calories');
  const notes =
    typeof body.notes === 'string' ? body.notes.trim() : body.notes || '';
  const workoutDate = validateWorkoutDate(body.workoutDate);

  if (typeof notes !== 'string') {
    throwHttpError('notes must be a string', 400);
  }

  return {
    exerciseType,
    durationMinutes,
    steps,
    calories,
    notes,
    workoutDate
  };
}

function validateRequiredString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throwHttpError(`${fieldName} is required`, 400);
  }

  return value.trim();
}

function validateNonNegativeNumber(value, fieldName, options = {}) {
  if (value === undefined || value === null || value === '') {
    if (options.required) {
      throwHttpError(`${fieldName} is required`, 400);
    }

    return 0;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throwHttpError(`${fieldName} must be a non-negative number`, 400);
  }

  return parsedValue;
}

function validateWorkoutDate(value) {
  if (!value) {
    throwHttpError('workoutDate is required', 400);
  }

  const workoutDate = new Date(value);

  if (Number.isNaN(workoutDate.getTime())) {
    throwHttpError('workoutDate must be a valid date', 400);
  }

  return workoutDate;
}

function getAuthenticatedWallet(req) {
  if (!req.user || !req.user.walletAddress) {
    throwHttpError('Authenticated wallet address required', 401);
  }

  return req.user.walletAddress.toLowerCase();
}

function throwHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

module.exports = router;
