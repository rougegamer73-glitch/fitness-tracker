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

## Deploy frontend (Vercel or Netlify)

The UI is a static Create React App build. **You cannot host the Hardhat node on Vercel/Netlify** — users still need a real RPC + deployed contract (local Hardhat on their machine, or a public testnet).

### Environment variables (set in the host’s dashboard)

Use your production site URL in place of `https://YOUR_SITE`:

| Variable | Example | Notes |
|----------|---------|--------|
| `REACT_APP_API_BASE_URL` | `https://YOUR_SITE/api` | Health card calls `.../api/health`. On Vercel/Netlify this repo wires `/api/health` for you. |
| `REACT_APP_FITNESS_CONTRACT_ADDRESS` | `0x...` | Must match the contract on the network users select in MetaMask. |
| `REACT_APP_DEPLOYED_CHAIN_ID` | `31337` or `11155111` | Must match MetaMask (e.g. Sepolia). |
| `REACT_APP_RPC_URL` | optional | Local builds only; the app uses MetaMask’s provider for reads/writes. |

Redeploy after changing these (CRA bakes them in at build time).

### Vercel

1. Import [your GitHub repo](https://github.com/rougegamer73-glitch/fitness-tracker).
2. **Root Directory:** `frontend`
3. Framework: Create React App (auto).
4. Add the env vars above. Set `REACT_APP_API_BASE_URL` to `https://<your-vercel-domain>/api`.
5. Deploy. Serverless routes live in `frontend/api/` (`/api/health`, `/api/about`).

### Netlify

1. New site from Git → same repo (root must contain **`netlify.toml`**).
2. In **Site settings → Build & deploy → Build settings**, leave the **Publish directory** blank or set it to **`frontend/build`** so it matches `netlify.toml`. If it is set to only `build`, Netlify looks at the repo root and deploys nothing → **“Page not found”**.
3. Build command and publish path are defined in `netlify.toml` (`frontend/build` after `npm run build` in `frontend/`).
4. Add the same env vars. Set `REACT_APP_API_BASE_URL` to `https://<your-netlify-domain>/api`.
5. Trigger **Deploy site** (clear cache if an old bad deploy is cached).

### Local Hardhat + hosted UI

If the site is public but the chain is still **localhost**, only people running **their own** `npx hardhat node` + deploy + MetaMask on `31337` can use the contract; point `REACT_APP_FITNESS_CONTRACT_ADDRESS` at the address from *their* deploy (or use a shared testnet instead).
