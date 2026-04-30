import React, { useCallback, useEffect, useState } from "react";
import "./index.css";
import {
  connectWallet,
  disconnectWallet,
  ensureHardhatNetwork,
  getCurrentWallet,
  getUserStats,
  getWorkouts,
  ACHIEVEMENTS,
  AchievementCode,
  claimAchievement,
  hasAchievement,
  isEligibleForAchievement,
  logWorkoutOnChain,
  getRewardBalance,
  OnChainWorkout,
} from "./services/contract";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [rewardBalance, setRewardBalance] = useState(0);
  const [claimedAchievements, setClaimedAchievements] = useState<
    Record<AchievementCode, boolean>
  >({
    FIRST_WORKOUT: false,
    TEN_THOUSAND_STEPS: false,
    FIVE_HUNDRED_CALORIES: false,
  });
  const [eligibleAchievements, setEligibleAchievements] = useState<
    Record<AchievementCode, boolean>
  >({
    FIRST_WORKOUT: false,
    TEN_THOUSAND_STEPS: false,
    FIVE_HUNDRED_CALORIES: false,
  });
  const [backendStatus, setBackendStatus] = useState("Checking backend...");
  const [networkWarning, setNetworkWarning] = useState("");
  const [workouts, setWorkouts] = useState<OnChainWorkout[]>([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalSteps: 0,
    totalCalories: 0,
    totalDurationMinutes: 0,
  });

  const [workoutForm, setWorkoutForm] = useState({
    exerciseType: "Running",
    steps: 0,
    calories: 0,
    durationMinutes: 0,
  });

  async function handleConnectWallet() {
    try {
      const wallet = await connectWallet();
      setWalletAddress(wallet);
      setNetworkWarning("");
      setMessage("Wallet connected successfully.");
      await refreshBlockchainData(wallet);
    } catch (error: any) {
      setNetworkWarning(error.message || "Wrong network.");
      setMessage("Wallet connection failed.");
    }
  }

  async function handleDisconnectWallet() {
    await disconnectWallet();
    setWalletAddress("");
    setWorkouts([]);
    setStats({
      totalWorkouts: 0,
      totalSteps: 0,
      totalCalories: 0,
      totalDurationMinutes: 0,
    });
    setRewardBalance(0);
    setClaimedAchievements({
      FIRST_WORKOUT: false,
      TEN_THOUSAND_STEPS: false,
      FIVE_HUNDRED_CALORIES: false,
    });
    setEligibleAchievements({
      FIRST_WORKOUT: false,
      TEN_THOUSAND_STEPS: false,
      FIVE_HUNDRED_CALORIES: false,
    });
    setMessage("Wallet disconnected from this app.");
  }

  const refreshBlockchainData = useCallback(async (wallet = walletAddress) => {
    if (!wallet) return;

    try {
      await ensureHardhatNetwork();
      setNetworkWarning("");
      const [workoutList, userStats, balance] = await Promise.all([
        getWorkouts(wallet),
        getUserStats(wallet),
        getRewardBalance(wallet),
      ]);
      const achievementEntries = await Promise.all(
        ACHIEVEMENTS.map(async (achievement) => [
          achievement.code,
          await hasAchievement(wallet, achievement.code),
        ] as const)
      );
      const eligibilityEntries = await Promise.all(
        ACHIEVEMENTS.map(async (achievement) => [
          achievement.code,
          await isEligibleForAchievement(wallet, achievement.code),
        ] as const)
      );
      const achievementMap = achievementEntries.reduce(
        (acc, [code, claimed]) => ({ ...acc, [code]: claimed }),
        {} as Record<AchievementCode, boolean>
      );
      const eligibleMap = eligibilityEntries.reduce(
        (acc, [code, eligible]) => ({ ...acc, [code]: eligible }),
        {} as Record<AchievementCode, boolean>
      );

      setWorkouts(workoutList);
      setStats(userStats);
      setRewardBalance(balance);
      setClaimedAchievements(achievementMap);
      setEligibleAchievements(eligibleMap);
    } catch (error: any) {
      setNetworkWarning(error.message || "Wrong network.");
    }
  }, [walletAddress]);

  async function handleClaimAchievement(code: AchievementCode) {
    if (!walletAddress) {
      setMessage("Please connect MetaMask first.");
      return;
    }

    try {
      setMessage("Confirm transaction in MetaMask...");
      await claimAchievement(code);
      setMessage("Achievement claimed successfully on blockchain.");
      await refreshBlockchainData();
    } catch (error: any) {
      setMessage(error.message || "Transaction failed.");
    }
  }

  async function submitWorkout(event: React.FormEvent) {
    event.preventDefault();

    if (!walletAddress) {
      setMessage("Please connect MetaMask first.");
      return;
    }

    try {
      setMessage("Confirm transaction in MetaMask");
      await logWorkoutOnChain(
        workoutForm.exerciseType,
        Number(workoutForm.steps),
        Number(workoutForm.calories),
        Number(workoutForm.durationMinutes)
      );
      setMessage("Workout logged on blockchain.");
      await refreshBlockchainData(walletAddress);
    } catch (error: any) {
      setMessage(error.message || "Workout transaction failed.");
    }
  }

  const checkBackend = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/health");
      const data = await response.json();
      setBackendStatus(data.message || "Backend connected.");
    } catch {
      setBackendStatus("Backend not running");
    }
  }, []);

  useEffect(() => {
    const loadWallet = async () => {
      const wallet = await getCurrentWallet();
      if (wallet) {
        setWalletAddress(wallet);
        await refreshBlockchainData(wallet);
      }
    };
    loadWallet();
    checkBackend();
  }, [checkBackend, refreshBlockchainData]);

  useEffect(() => {
    if (walletAddress) {
      refreshBlockchainData(walletAddress);
    }
  }, [walletAddress, refreshBlockchainData]);

  return (
    <main className="app">
      <section className="hero">
        <div>
          <h1>FitChain</h1>
          <p>
            Blockchain Fitness Tracking DApp
          </p>
          <p>
            Workout records are confirmed through MetaMask and fetched from the smart contract.
          </p>
        </div>

        <div className="wallet-box">
          {walletAddress ? (
            <>
              <p>Connected: {walletAddress}</p>
              <button onClick={handleDisconnectWallet}>Disconnect Wallet</button>
            </>
          ) : (
            <button onClick={handleConnectWallet}>Connect MetaMask</button>
          )}
        </div>
      </section>

      {message && <p className="message">{message}</p>}
      {networkWarning && <p className="message">{networkWarning}</p>}

      <section className="panel">
        <h2>Backend Status</h2>
        <p>{backendStatus}</p>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalWorkouts}</h3>
          <p>Total Workouts</p>
        </div>

        <div className="stat-card">
          <h3>{stats.totalSteps}</h3>
          <p>Total Steps</p>
        </div>

        <div className="stat-card">
          <h3>{stats.totalCalories}</h3>
          <p>Calories</p>
        </div>

        <div className="stat-card">
          <h3>{stats.totalDurationMinutes}</h3>
          <p>Minutes</p>
        </div>

        <div className="stat-card">
          <h3>{rewardBalance}</h3>
          <p>FIT Rewards</p>
        </div>
      </section>

      <section className="layout">
        <form className="panel" onSubmit={submitWorkout}>
          <h2>Log Workout</h2>

          <label>Exercise Type</label>
          <select
            value={workoutForm.exerciseType}
            onChange={(e) =>
              setWorkoutForm({ ...workoutForm, exerciseType: e.target.value })
            }
          >
            <option>Running</option>
            <option>Walking</option>
            <option>Cycling</option>
            <option>Gym</option>
          </select>

          <label>Steps</label>
          <input
            type="number"
            value={workoutForm.steps}
            onChange={(e) =>
              setWorkoutForm({
                ...workoutForm,
                steps: Number(e.target.value),
              })
            }
          />

          <label>Calories</label>
          <input
            type="number"
            value={workoutForm.calories}
            onChange={(e) =>
              setWorkoutForm({
                ...workoutForm,
                calories: Number(e.target.value),
              })
            }
          />

          <label>Minutes</label>
          <input
            type="number"
            value={workoutForm.durationMinutes}
            onChange={(e) =>
              setWorkoutForm({
                ...workoutForm,
                durationMinutes: Number(e.target.value),
              })
            }
          />

          <button type="submit">Confirm Workout on Blockchain</button>
        </form>

        <section className="panel">
          <h2>Workout History</h2>

          {workouts.length === 0 ? (
            <p>No workouts logged on-chain yet.</p>
          ) : (
            workouts.map((workout) => (
              <div className="workout-item" key={workout.timestamp + workout.exerciseType}>
                <strong>{workout.exerciseType}</strong>
                <span>
                  {workout.steps} steps · {workout.calories} calories · {workout.durationMinutes} mins
                </span>
                <span>{new Date(workout.timestamp * 1000).toLocaleString()}</span>
              </div>
            ))
          )}
        </section>
      </section>

      <section className="panel">
        <h2>Blockchain Achievements</h2>
        <p>
          Achievements are stored on-chain and auto-claimed after workout logging when eligible.
        </p>

        <div className="achievement-grid">
          {ACHIEVEMENTS.map((achievement) => {
            const isClaimed = claimedAchievements[achievement.code];
            const isEligible = eligibleAchievements[achievement.code];

            return (
              <div className="achievement-card" key={achievement.code}>
                <h3>{achievement.label}</h3>
                <p>{achievement.reward} FIT reward points</p>

                {isClaimed ? (
                  <button disabled>Already Claimed</button>
                ) : !isEligible ? (
                  <button disabled>Not Eligible Yet</button>
                ) : (
                  <button
                    onClick={() => handleClaimAchievement(achievement.code)}
                  >
                    Claim on Blockchain
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </section>
    </main>
  );
}

export default App;