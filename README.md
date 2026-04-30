# FitChain (Pure Blockchain DApp)

FitChain is a simplified blockchain-backed fitness DApp prototype:
- workouts are logged on-chain through `FitnessAchievement`
- users confirm transactions in MetaMask
- frontend reads workouts, stats, achievements, and rewards directly from the smart contract
- backend is only a minimal assignment API (`/api/health`, `/api/about`)

## Architecture

- Frontend: React + TypeScript
- Backend: Express (health/about only)
- Blockchain: Hardhat + Solidity (`pragma solidity ^0.8.4`)
- Wallet: MetaMask
- Network: Hardhat Localhost (`chainId: 31337`)

## Why No Database Is Needed

This version stores workout summaries as contract state on the blockchain.  
Because the blockchain is the persistence layer for the prototype, a separate database (MongoDB or otherwise) is not required.

## Run Locally

### Terminal 1
```bash
cd blockchain
npx hardhat node
```

### Terminal 2
```bash
cd blockchain
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network localhost
```

### Terminal 3
```bash
cd backend
npm install
npm run dev
```

### Terminal 4
```bash
cd frontend
npm install
npm start
```

The deploy script writes `frontend/.env.local` with:
- `REACT_APP_API_BASE_URL=http://localhost:5000/api`
- `REACT_APP_FITNESS_CONTRACT_ADDRESS=<deployedAddress>`
- `REACT_APP_DEPLOYED_CHAIN_ID=31337`
- `REACT_APP_RPC_URL=http://127.0.0.1:8545`

## Demo Flow

1. Open the frontend and connect MetaMask.
2. Ensure MetaMask is on Hardhat Localhost (`31337`).
3. Enter workout details and submit **Confirm Workout on Blockchain**.
4. Confirm the transaction in MetaMask.
5. After confirmation, verify:
   - workout appears in history
   - stats refresh from chain
   - eligible achievements auto-claim
   - FIT reward balance updates from chain
