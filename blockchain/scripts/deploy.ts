import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const FitnessAchievement = await ethers.getContractFactory("FitnessAchievement");
  const fitnessAchievement = await FitnessAchievement.deploy();
  await fitnessAchievement.deployed();

  const address = fitnessAchievement.address;
  console.log("FitnessAchievement deployed to:", address);

  const frontendEnvPath = path.join(__dirname, "../../frontend/.env.local");

  fs.writeFileSync(
    frontendEnvPath,
    `REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_FITNESS_CONTRACT_ADDRESS=${address}
REACT_APP_DEPLOYED_CHAIN_ID=31337
REACT_APP_RPC_URL=http://127.0.0.1:8545
`
  );

  console.log("Updated frontend/.env.local");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});