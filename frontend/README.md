# FitChain: Hybrid Fitness Tracking DApp

FitChain is a Hybrid Fitness Tracking Decentralized Application developed for a university blockchain assignment. The application combines a traditional full-stack web architecture with blockchain-based achievement and reward recording.

## Features

- MetaMask wallet connection
- Hardhat Local Network support
- Workout logging
- MongoDB off-chain storage
- On-chain achievement claiming
- FIT reward point balance
- Dashboard statistics
- Smart contract tests
- Express backend API

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Blockchain | Solidity + Hardhat |
| Wallet | MetaMask |
| Web3 Library | Ethers.js |
| Network | Hardhat Localhost, Chain ID 31337 |

## Hybrid Architecture

FitChain uses a hybrid architecture because not all fitness data should be stored on-chain.

Workout logs are stored off-chain in MongoDB because they can be frequent, detailed and inefficient to store directly on a blockchain. Important milestones, such as achievements and reward points, are stored on-chain to provide transparency and tamper resistance.

## Folder Structure

```text
fitness-tracking-dapp/
├── contracts/
│   └── FitnessAchievement.sol
├── scripts/
│   └── deploy.ts
├── test/
│   └── FitnessAchievement.test.ts
├── frontend/
│   └── src/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
└── README.md