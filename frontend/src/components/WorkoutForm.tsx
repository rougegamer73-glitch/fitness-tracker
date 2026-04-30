import React, { useState } from "react";
import { createWorkout, WorkoutPayload } from "../services/backendApi";

interface Props {
  onWorkoutCreated: () => void;
}

const LOCAL_WORKOUTS_KEY = "fitchain_demo_workouts";

const WorkoutForm: React.FC<Props> = ({ onWorkoutCreated }) => {
  const [form, setForm] = useState<WorkoutPayload>({
    exerciseType: "Running",
    durationMinutes: 30,
    steps: 2500,
    calories: 200,
    notes: "",
    workoutDate: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (
    field: keyof WorkoutPayload,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await createWorkout({
        ...form,
        durationMinutes: Number(form.durationMinutes),
        steps: Number(form.steps),
        calories: Number(form.calories),
      });

      setMessage("Workout saved successfully.");
      onWorkoutCreated();
    } catch (error: any) {
      const localWorkouts = JSON.parse(
        localStorage.getItem(LOCAL_WORKOUTS_KEY) || "[]"
      );

      const workout = {
        ...form,
        id: `local-${Date.now()}`,
        durationMinutes: Number(form.durationMinutes),
        steps: Number(form.steps),
        calories: Number(form.calories),
        workoutDate: form.workoutDate || new Date().toISOString(),
      };

      localStorage.setItem(
        LOCAL_WORKOUTS_KEY,
        JSON.stringify([workout, ...localWorkouts])
      );

      setMessage("Using local demo storage while backend login is inactive.");
      onWorkoutCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={submitHandler}>
      <h2>Log Workout</h2>

      <label>Exercise Type</label>
      <select
        value={form.exerciseType}
        onChange={(e) => updateField("exerciseType", e.target.value)}
      >
        <option>Running</option>
        <option>Walking</option>
        <option>Cycling</option>
        <option>Gym</option>
        <option>Swimming</option>
      </select>

      <label>Duration Minutes</label>
      <input
        type="number"
        value={form.durationMinutes}
        min="1"
        onChange={(e) =>
          updateField("durationMinutes", Number(e.target.value))
        }
      />

      <label>Steps</label>
      <input
        type="number"
        value={form.steps}
        min="0"
        onChange={(e) => updateField("steps", Number(e.target.value))}
      />

      <label>Calories</label>
      <input
        type="number"
        value={form.calories}
        min="0"
        onChange={(e) => updateField("calories", Number(e.target.value))}
      />

      <label>Date</label>
      <input
        type="date"
        value={form.workoutDate}
        onChange={(e) => updateField("workoutDate", e.target.value)}
      />

      <label>Notes</label>
      <textarea
        value={form.notes}
        onChange={(e) => updateField("notes", e.target.value)}
      />

      <button disabled={loading} type="submit">
        {loading ? "Saving..." : "Save Workout"}
      </button>

      {message && <p className="message">{message}</p>}
    </form>
  );
};

export default WorkoutForm;