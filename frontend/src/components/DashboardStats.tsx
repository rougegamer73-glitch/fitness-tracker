import React from "react";

interface Props {
  stats: {
    totalWorkouts: number;
    totalSteps: number;
    totalCalories: number;
    totalDurationMinutes: number;
  };
  rewardBalance: number;
}

const DashboardStats: React.FC<Props> = ({ stats, rewardBalance }) => {
  const cards = [
    { label: "Workouts", value: stats.totalWorkouts },
    { label: "Steps", value: stats.totalSteps },
    { label: "Calories", value: stats.totalCalories },
    { label: "Minutes", value: stats.totalDurationMinutes },
    { label: "FIT Rewards", value: rewardBalance },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div className="stat-card" key={card.label}>
          <h3>{card.value}</h3>
          <p>{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;