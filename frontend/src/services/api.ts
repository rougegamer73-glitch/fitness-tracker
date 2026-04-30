import { API_BASE_URL } from "../config";

export interface WorkoutPayload {
  exerciseType: string;
  durationMinutes: number;
  steps: number;
  calories: number;
  notes?: string;
  workoutDate: string;
}

const getToken = () => localStorage.getItem("fitchain_token");

const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

export const createWorkout = async (payload: WorkoutPayload) => {
  return request("/workouts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getWorkouts = async () => {
  return request<any[]>("/workouts");
};

export const getWorkoutStats = async () => {
  return request<any>("/workouts/stats");
};

export const createDemoData = async () => {
  return request("/demo/seed", {
    method: "POST",
  });
};