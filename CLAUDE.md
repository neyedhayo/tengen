# CLAUDE.md - Tengen Bridge Project Guide

> This file provides context for Claude Code sessions working on the Tengen Bridge project.

## 🧠 AI Workflow Rules
**IMPORTANT: Follow these strict operational protocols for every session.**

1.  **Initialization**: At the start of *every* new conversation, you must read `PLANNING.md` to understand the current architectural state and strategic direction.
2.  **Task Management**:
    * Check `TASKS.md` before writing any code to see active, pending, and blocked items.
    * **Mark Complete**: Immediately mark tasks as completed (`[x]`) in `TASKS.md` when a feature is successfully implemented and verified.
    * **Discovery**: If you identify new requirements or technical debt during implementation, add them to the "Backlog" or "Current Sprint" section of `TASKS.md`.
3.  **Context**: Always refer to `docs/PRD.md` (Product Requirements) if decision logic is ambiguous.

## Project Overview

**Tengen Bridge** is a trustless compute coprocessor connecting Ethereum smart contracts to Qubic's bare-metal C++ execution layer. Users submit computational jobs via Ethereum, which are executed on Qubic's network of 676 validators and returned with cryptographic verification.

**Hackathon:** Qubic Hack the Future  
**Track:** Infrastructure & Middleware  
**Core Value:** 25 million times cheaper compute than on-chain Ethereum execution

## Repository Structure

```
tengen/
├── contracts/                 # Ethereum smart contracts (Solidity)
│   ├── src/
│   │   └── ComputeGateway.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   │   └── ComputeGateway.test.js
│   ├── hardhat.config.js
│   └── package.json
│
├── qubic-contracts/           # Qubic QPI contracts (C++)
│   ├── src/
│   │   ├── PrimeFinder.h
│   │   ├── MonteCarlo.h
│   │   └── BlackScholes.h
│   ├── deploy/
│   │   ├── deploy.js
│   │   └── contract_ids.json
│   └── README.md
│
├── bridge/                    # Bridge agent (Python + Node.js)
│   ├── bridge_agent.py        # Main bridge orchestrator
│   ├── qubic_client.js        # Qubic interaction module
│   ├── qubic_client_cli.js    # CLI wrapper for testing
│   ├── requirements.txt
│   ├── package.json
│   ├── config.yaml
│   └── Dockerfile
│
├── frontend/                  # Web application (Next.js)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   ├── wallet/
│   │   ├── compute/
│   │   ├── status/
│   │   ├── results/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── package.json
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── API.md
│
├── CLAUDE.md                  # This file
├── docker-compose.yml
└── README.md
```

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js (App Router) | 14.x |
| **Styling** | Tailwind CSS | 3.x |
| **Web3** | wagmi + viem + RainbowKit | Latest |
| **State** | TanStack Query | 5.x |
| **Ethereum Contracts** | Solidity + Hardhat | ^0.8.20 |
| **Qubic Contracts** | C++ with QPI framework | - |
| **Bridge** | Python 3.10+ + Node.js | - |
| **Deployment** | Vercel (frontend), VPS (bridge) | - |

## Key Configuration

### Networks

```typescript
// Ethereum
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_RPC = "https://sepolia.infura.io/v3/YOUR_KEY";

// Qubic
const QUBIC_TESTNET_RPC = "https://testnet-rpc.qubicdev.com/";
const QUBIC_MAINNET_RPC = "https://rpc.qubic.org";
const QUBIC_EXPLORER = "https://testnet.explorer.qubic.org/";
```

### Contract Addresses (Update after deployment)

```typescript
// Ethereum Sepolia
const COMPUTE_GATEWAY_ADDRESS = "0x..."; // Set after deployment

// Qubic Testnet
const PRIME_FINDER_CONTRACT_ID = "AAAA..."; // 55-char Qubic ID
const MONTE_CARLO_CONTRACT_ID = "BBBB...";  // 55-char Qubic ID
```

## Development Commands

### Frontend

```bash
cd frontend
npm install
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
```

### Contracts (Ethereum)

```bash
cd contracts
npm install
npx hardhat compile              # Compile contracts
npx hardhat test                 # Run tests
npx hardhat run scripts/deploy.js --network sepolia  # Deploy
npx hardhat verify --network sepolia <ADDRESS>       # Verify on Etherscan
```

### Bridge

```bash
cd bridge
pip install -r requirements.txt
npm install                      # For qubic_client.js

# Test Qubic connection
node qubic_client_cli.js test-connection

# Test contract call
node qubic_client_cli.js call-prime-finder 1000 10 999

# Run bridge agent
python bridge_agent.py
```

### Docker

```bash
docker-compose up -d             # Start all services
docker-compose logs -f bridge    # Follow bridge logs
docker-compose down              # Stop all services
```

## Architecture Decisions

### Why This Structure?

1. **Separate contract directories:** Ethereum and Qubic have completely different toolchains
2. **Bridge as Python + Node.js hybrid:** Python for Ethereum (web3.py), Node.js subprocess for Qubic (ts-library)
3. **Next.js App Router:** Modern React patterns, server components where beneficial
4. **wagmi + viem:** Type-safe, modern Ethereum interaction

### Data Flow

```
User → Frontend → Ethereum Contract → Event Emitted
                                           ↓
                              Bridge Agent (Python)
                                           ↓
                              Qubic Client (Node.js)
                                           ↓
                              Qubic Network (C++ execution)
                                           ↓
                              Bridge Agent receives result
                                           ↓
                              Submit to Ethereum Contract
                                           ↓
User ← Frontend polls for result ← Contract Updated
```

### Job Status States

```typescript
enum JobStatus {
  Pending = 0,      // Submitted to Ethereum, waiting confirmation
  Processing = 1,   // Confirmed, executing on Qubic
  Completed = 2,    // Result submitted back to Ethereum
  Failed = 3        // Error occurred
}
```

## Code Conventions

### TypeScript/React

```typescript
// Use named exports for components
export function FunctionCard({ ... }) { }

// Use hooks for contract interactions
const { submitJob, isLoading } = useComputeGateway();

// Prefer const arrow functions for utilities
const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
```

### Tailwind Classes

```typescript
// Design system colors (white background theme)
const colors = {
  background: "bg-white",
  text: "text-gray-900",
  muted: "text-gray-500",
  border: "border-gray-100",
  accent: "text-blue-600",
  success: "text-green-600",
  error: "text-red-600",
};

// Component patterns
const cardClasses = "bg-white border border-gray-100 rounded-xl p-6 shadow-sm";
const buttonPrimary = "bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors";
const buttonSecondary = "bg-white text-black border border-gray-200 px-6 py-3 rounded-lg hover:bg-gray-50";
```

### Solidity

```solidity
// Use explicit visibility
function requestCompute(uint8 taskType, bytes calldata inputData) external payable returns (uint256)

// Use custom errors over require strings
error InsufficientFee(uint256 required, uint256 provided);

// Emit events for all state changes
emit JobRequested(jobId, msg.sender, taskType, inputData, msg.value);
```

### QPI (Qubic C++)

```cpp
// Follow QPI struct naming convention
struct FunctionName_input { ... };
struct FunctionName_output { ... };

// Use PUBLIC_FUNCTION macro
PUBLIC_FUNCTION(functionName) {
    // Access: input, output, state, qpi
}

// Register all functions
REGISTER_USER_FUNCTIONS_AND_PROCEDURES {
    REGISTER_USER_FUNCTION(functionName, 1);
}
```

## Common Tasks

### Adding a New Compute Function

1. **Write QPI contract** (`qubic-contracts/src/NewFunction.h`):
   ```cpp
   struct NewFunction_input { uint64 param1; };
   struct NewFunction_output { uint64 result; };
   PUBLIC_FUNCTION(newFunction) { ... }
   ```

2. **Deploy to Qubic testnet** and save contract ID

3. **Add to bridge routing** (`bridge/bridge_agent.py`):
   ```python
   elif function_id == 3:  # New function ID
       result = await self.call_new_function(job_id, input_data)
   ```

4. **Add function config** (`frontend/lib/functions/newFunction.ts`):
   ```typescript
   export const newFunction: ComputeFunction = {
     id: 3,
     name: "New Function",
     description: "...",
     parameters: [...],
     estimatedTime: "5-10 sec",
     estimatedCost: "0.001",
   };
   ```

5. **Update function registry** (`frontend/lib/functions/index.ts`)

### Updating Contract ABI

After deploying new contract version:

1. Copy ABI from `contracts/artifacts/contracts/ComputeGateway.sol/ComputeGateway.json`
2. Update `frontend/lib/contracts/ComputeGateway.ts`
3. Update `bridge/ComputeGateway_abi.json`

### Testing End-to-End Flow

```bash
# 1. Ensure bridge is running
cd bridge && python bridge_agent.py

# 2. In another terminal, run frontend
cd frontend && npm run dev

# 3. Connect wallet, submit job
# 4. Watch bridge logs for:
#    - "📥 New Job #X"
#    - "🚀 Calling Qubic..."
#    - "✅ Qubic returned..."
#    - "📤 Submitting result..."
#    - "🎉 Job #X completed!"

# 5. Verify on explorers:
#    - Etherscan: https://sepolia.etherscan.io/tx/...
#    - Qubic: https://testnet.explorer.qubic.org/...
```

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_COMPUTE_GATEWAY_ADDRESS=0x...
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key
```

### Bridge (.env)

```env
ETHEREUM_RPC=https://sepolia.infura.io/v3/YOUR_KEY
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
QUBIC_RPC=https://testnet-rpc.qubicdev.com/
QUBIC_SEED=your-55-char-seed
PRIME_FINDER_CONTRACT_ID=AAAA...
MONTE_CARLO_CONTRACT_ID=BBBB...
```

### Contracts (hardhat.config.js)

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=your_key
```

## Qubic-Specific Notes

### Working RPC Endpoints

```
✅ Testnet: https://testnet-rpc.qubicdev.com/  (USE THIS)
✅ Mainnet: https://rpc.qubic.org
❌ https://testnet-rpc.qubic.org (often down)
```

### Getting Testnet Tokens

1. **Public faucet:** https://qforge.qubicdev.com/
2. **Backup test seed:** `fwqatwliqyszxivzgtyyfllymopjimkyoreolgyflsnfpcytkhagqii` (pre-funded)

### Qubic Identity Format

- 55 uppercase letters (A-Z only)
- Example: `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`

### Testing Qubic Connection

```bash
curl https://testnet-rpc.qubicdev.com/v1/status
# Should return JSON with lastProcessedTick
```

## Troubleshooting

### "Wallet not connecting"

- Check RainbowKit project ID is set
- Ensure user is on Sepolia network
- Check browser console for errors

### "Transaction failing"

- Verify contract address is correct
- Check user has sufficient ETH for gas + fee
- Verify ABI matches deployed contract

### "Bridge not detecting events"

- Confirm Ethereum RPC is responsive
- Check bridge is listening to correct contract address
- Verify fromBlock is set correctly in event filter

### "Qubic call failing"

- Test RPC: `curl https://testnet-rpc.qubicdev.com/v1/status`
- Verify Qubic wallet has balance
- Check contract ID is correct (55 chars, all uppercase)
- Ensure input struct encoding matches contract

### "Result not appearing"

- Check bridge logs for submission errors
- Verify bridge wallet is authorized as compute node
- Check Ethereum transaction for revert reason

## Key Files to Know

| File | Purpose |
|------|---------|
| `contracts/src/ComputeGateway.sol` | Main Ethereum entry point |
| `qubic-contracts/src/PrimeFinder.h` | Example Qubic compute contract |
| `bridge/bridge_agent.py` | Orchestrates Ethereum↔Qubic communication |
| `bridge/qubic_client.js` | Handles Qubic transaction building |
| `frontend/hooks/useComputeGateway.ts` | Contract interaction hook |
| `frontend/hooks/useJobStatus.ts` | Status polling hook |
| `frontend/components/compute/FunctionSelector.tsx` | Function selection UI |
| `frontend/components/status/JobStatus.tsx` | Progress display |

## Design System Quick Reference

### Colors (White Background Theme)

```
Background:     #FFFFFF (white)
Primary Text:   #111827 (gray-900)
Secondary Text: #6B7280 (gray-500)
Borders:        #F3F4F6 (gray-100)
Accent:         #3B82F6 (blue-500)
Success:        #22C55E (green-500)
Error:          #EF4444 (red-500)
```

### Typography

```
Display:    48px / 700 weight (hero)
H1:         36px / 700 weight
H2:         24px / 600 weight
H3:         20px / 600 weight
Body:       16px / 400 weight
Small:      14px / 400 weight
Mono:       14px / 400 weight (addresses)
```

### Component Patterns

```typescript
// Card
className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm"

// Button Primary
className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"

// Input
className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

// Badge Success
className="inline-flex px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
```

## Demo Checklist

Before presenting:

- [ ] Bridge agent running and connected
- [ ] Frontend deployed to Vercel
- [ ] Demo wallet has Sepolia ETH (0.1+ ETH)
- [ ] Qubic wallet has testnet tokens
- [ ] Contract addresses verified correct
- [ ] Both explorer links working
- [ ] Backup demo video ready
- [ ] Can show: Etherscan tx + Qubic explorer tx

## Contact & Resources

- **Qubic Docs:** https://docs.qubic.org
- **Qubic GitHub:** https://github.com/qubic/core
- **Qubic TS Library:** https://github.com/qubic/ts-library
- **wagmi Docs:** https://wagmi.sh
- **RainbowKit Docs:** https://rainbowkit.com

---

*Last Updated: December 2025*
*Project: Tengen Bridge - Qubic Hack the Future*
