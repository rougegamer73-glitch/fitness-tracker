import React from "react";

interface Props {
  workouts: any[];
}

const WorkoutHistory: React.FC<Props> = ({ workouts }) => {
  return (
    <div className="panel">
      <h2>Latest Workouts</h2>

      {workouts.length === 0 ? (
        <p>No workouts logged yet.</p>
      ) : (
        <div className="workout-list">
          {workouts.map((workout) => (
            <div className="workout-item" key={workout._id || workout.id}>
              <strong>{workout.exerciseType}</strong>
              <span>
                {workout.steps} steps · {workout.calories} calories ·{" "}
                {workout.durationMinutes} mins
              </span>
              <small>
                {workout.workoutDate
                  ? new Date(workout.workoutDate).toLocaleDateString()
                  : "No date"}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;