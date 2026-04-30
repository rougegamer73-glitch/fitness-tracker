import { ethers } from "ethers";
import FitnessAchievement from "../artifacts/contracts/FitnessAchievement.sol/FitnessAchievement.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type AchievementCode =
  | "FIRST_WORKOUT"
  | "TEN_THOUSAND_STEPS"
  | "FIVE_HUNDRED_CALORIES";

export const ACHIEVEMENTS: { code: AchievementCode; label: string; reward: number }[] = [
  { code: "FIRST_WORKOUT", label: "First Workout", reward: 10 },
  { code: "TEN_THOUSAND_STEPS", label: "10,000 Steps", reward: 25 },
  { code: "FIVE_HUNDRED_CALORIES", label: "500 Calories", reward: 20 },
];
export const ACHIEVEMENT_LABELS: Record<AchievementCode, string> = {
  FIRST_WORKOUT: "First Workout",
  TEN_THOUSAND_STEPS: "10,000 Steps",
  FIVE_HUNDRED_CALORIES: "500 Calories",
};

export const ACHIEVEMENT_REWARDS: Record<AchievementCode, number> = {
  FIRST_WORKOUT: 10,
  TEN_THOUSAND_STEPS: 25,
  FIVE_HUNDRED_CALORIES: 20,
};

export type OnChainWorkout = {
  exerciseType: string;
  steps: number;
  calories: number;
  durationMinutes: number;
  timestamp: number;
};

export type UserStats = {
  totalWorkouts: number;
  totalSteps: number;
  totalCalories: number;
  totalDurationMinutes: number;
};

const CONTRACT_ADDRESS = process.env.REACT_APP_FITNESS_CONTRACT_ADDRESS || "";
const REQUIRED_CHAIN_ID = Number(process.env.REACT_APP_DEPLOYED_CHAIN_ID || "31337");

function assertEthereum() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }
  if (!CONTRACT_ADDRESS) {
    throw new Error("Missing REACT_APP_FITNESS_CONTRACT_ADDRESS in frontend/.env.local.");
  }
}

function toNumber(value: any): number {
  if (typeof value === "bigint") return Number(value);
  if (value && typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

function normalizeChainId(chainId: any): number {
  if (typeof chainId === "bigint") return Number(chainId);
  return Number(chainId);
}

async function getProvider() {
  assertEthereum();
  return new ethers.providers.Web3Provider(window.ethereum);
}

async function getSigner() {
  const provider: any = await getProvider();
  return provider.getSigner();
}

async function getContractWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, FitnessAchievement.abi, signer);
}

async function getContractWithProvider() {
  const provider = await getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, FitnessAchievement.abi, provider as any);
}

export async function ensureHardhatNetwork() {
  const provider: any = await getProvider();
  const network = await provider.getNetwork();
  const chainId = normalizeChainId(network.chainId);

  if (chainId !== REQUIRED_CHAIN_ID) {
    throw new Error("Please switch MetaMask to Hardhat Localhost (chain ID 31337).");
  }
}

export async function connectWallet() {
  assertEthereum();
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  await ensureHardhatNetwork();
  return accounts[0] || "";
}

export async function disconnectWallet() {
  return;
}

export async function getCurrentWallet() {
  if (!window.ethereum) return "";
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts[0] || "";
}

export async function logWorkoutOnChain(
  exerciseType: string,
  steps: number,
  calories: number,
  durationMinutes: number
) {
  await ensureHardhatNetwork();
  const contract = await getContractWithSigner();
  const tx = await contract.logWorkout(exerciseType, steps, calories, durationMinutes);
  return tx.wait();
}

export async function getWorkouts(walletAddress: string): Promise<OnChainWorkout[]> {
  await ensureHardhatNetwork();
  const contract = await getContractWithProvider();
  const workouts = await contract.getWorkouts(walletAddress);
  return workouts.map((w: any) => ({
    exerciseType: w.exerciseType,
    steps: toNumber(w.steps),
    calories: toNumber(w.calories),
    durationMinutes: toNumber(w.durationMinutes),
    timestamp: toNumber(w.timestamp),
  }));
}

export async function getUserStats(walletAddress: string): Promise<UserStats> {
  await ensureHardhatNetwork();
  const contract = await getContractWithProvider();
  const stats = await contract.getUserStats(walletAddress);
  return {
    totalWorkouts: toNumber(stats[0]),
    totalSteps: toNumber(stats[1]),
    totalCalories: toNumber(stats[2]),
    totalDurationMinutes: toNumber(stats[3]),
  };
}

export async function getRewardBalance(walletAddress: string): Promise<number> {
  await ensureHardhatNetwork();
  const contract = await getContractWithProvider();
  const balance = await contract.getRewardBalance(walletAddress);
  return toNumber(balance);
}

export async function getUserAchievements(walletAddress: string): Promise<string[]> {
  await ensureHardhatNetwork();
  const contract = await getContractWithProvider();
  return contract.getUserAchievements(walletAddress);
}

export async function hasAchievement(walletAddress: string, code: AchievementCode): Promise<boolean> {
  await ensureHardhatNetwork();
  const contract = await getContractWithProvider();
  return contract.hasAchievement(walletAddress, code);
}

export async function isEligibleForAchievement(
  walletAddress: string,
  code: AchievementCode
): Promise<boolean> {
  await ensureHardhatNetwork();
  const contract = await getContractWithProvider();
  return contract.isEligibleForAchievement(walletAddress, code);
}

export async function claimAchievement(code: AchievementCode) {
  await ensureHardhatNetwork();
  const contract = await getContractWithSigner();
  const tx = await contract.claimAchievement(code);
  return tx.wait();
}

export async function claimAchievementOnChain(code: AchievementCode) {
  return claimAchievement(code);
}