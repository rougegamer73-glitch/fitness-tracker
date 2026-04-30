const ACHIEVEMENTS = {
  FIRST_WORKOUT: 'FIRST_WORKOUT',
  TEN_THOUSAND_STEPS: 'TEN_THOUSAND_STEPS',
  FIVE_HUNDRED_CALORIES: 'FIVE_HUNDRED_CALORIES',
  SEVEN_DAY_STREAK: 'SEVEN_DAY_STREAK'
};

function getEligibleAchievements(workouts = []) {
  const stats = summarizeWorkouts(workouts);
  const eligibleAchievements = [];

  if (stats.totalWorkouts >= 1) {
    eligibleAchievements.push(ACHIEVEMENTS.FIRST_WORKOUT);
  }

  if (stats.totalSteps >= 10000) {
    eligibleAchievements.push(ACHIEVEMENTS.TEN_THOUSAND_STEPS);
  }

  if (stats.totalCalories >= 500) {
    eligibleAchievements.push(ACHIEVEMENTS.FIVE_HUNDRED_CALORIES);
  }

  if (hasSevenDayStreak(workouts)) {
    eligibleAchievements.push(ACHIEVEMENTS.SEVEN_DAY_STREAK);
  }

  return eligibleAchievements;
}

function summarizeWorkouts(workouts = []) {
  return workouts.reduce(
    (summary, workout) => {
      summary.totalWorkouts += 1;
      summary.totalSteps += workout.steps || 0;
      summary.totalCalories += workout.calories || 0;
      summary.totalDurationMinutes += workout.durationMinutes || 0;
      return summary;
    },
    {
      totalWorkouts: 0,
      totalSteps: 0,
      totalCalories: 0,
      totalDurationMinutes: 0
    }
  );
}

function hasSevenDayStreak(workouts = []) {
  const workoutDateKeys = new Set(
    workouts
      .map((workout) => toDateKey(workout.workoutDate))
      .filter((dateKey) => dateKey !== null)
  );

  const sortedDateKeys = Array.from(workoutDateKeys).sort();

  for (const dateKey of sortedDateKeys) {
    let streakLength = 1;
    let currentDate = parseDateKey(dateKey);

    while (streakLength < 7) {
      currentDate = addUtcDays(currentDate, 1);

      if (!workoutDateKeys.has(toDateKey(currentDate))) {
        break;
      }

      streakLength += 1;
    }

    if (streakLength >= 7) {
      return true;
    }
  }

  return false;
}

function toDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function parseDateKey(dateKey) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function addUtcDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function checkWorkoutMilestones(_workout, recentWorkouts = []) {
  return getEligibleAchievements(recentWorkouts);
}

module.exports = {
  ACHIEVEMENTS,
  checkWorkoutMilestones,
  getEligibleAchievements,
  summarizeWorkouts
};
