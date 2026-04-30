export const HARDHAT_CHAIN_ID_DECIMAL = 31337;
export const HARDHAT_CHAIN_ID_HEX = "0x7a69";

export const CONTRACT_ADDRESS =
  process.env.REACT_APP_FITNESS_CONTRACT_ADDRESS || "";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

/** Same-origin on Vercel/Netlify when REACT_APP_API_BASE_URL is set to the deployed /api base. */
export function getApiHealthUrl(): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/health`;
}