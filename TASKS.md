# TASKS.md - Tengen Bridge Implementation Tasks

> **Purpose:** Detailed task breakdown for implementing Tengen Bridge. Mark tasks as complete `[x]` when done. Update this file continuously throughout development.

**Last Updated:** December 7, 2025  
**Current Milestone:** M0 - Project Setup  
**Sprint:** Pre-Development

---

## How to Use This File

1. **At Start of Session:** Read current milestone to understand focus
2. **During Development:** Mark tasks as `[x]` when completed
3. **When Stuck:** Add blockers to the "Blocked Tasks" section
4. **New Requirements:** Add to "Backlog" section
5. **End of Session:** Update "Current State" section

---

## Current State

**Active Milestone:** M0 - Project Setup ✅ COMPLETE
**Progress:** 100% (All essential M0 tasks complete)
**Blockers:** None
**Next Priority:** Begin M1 (Ethereum Contracts) and M2 (Qubic Contracts)

---

## Milestone M0: Project Setup & Infrastructure

**Goal:** Get development environments ready for all team members  
**Duration:** Hours 0-2  
**Owner:** DevOps + All

### Repository & Version Control

- [x] Create GitHub organization/repo for Tengen Bridge
- [x] Setup branch protection rules (require PR reviews)
- [x] Create `.gitignore` files for all subdirectories
- [ ] Setup branch structure: `main`, `develop`, `feature/*` (OPTIONAL - single branch workflow sufficient for hackathon)
- [x] Add all team members as collaborators
- [x] Create initial README.md with project overview

### Project Structure

- [x] Create root directory structure:
  ```
  tengen/
  ├── contracts/         # Ethereum smart contracts
  ├── qubic-contracts/   # Qubic QPI contracts
  ├── bridge/            # Bridge agent
  ├── frontend/          # Next.js application
  ├── docs/              # Documentation
  └── docker/            # Docker configurations
  ```
- [x] Create `.env.example` templates for each service
- [x] Add documentation structure (CLAUDE.md, PLANNING.md, TASKS.md - comprehensive, covers PRD/ARCHITECTURE)
- [ ] Create CONTRIBUTING.md with development workflow (MOVED TO BACKLOG - unnecessary for hackathon)

### ~~CI/CD Pipeline~~ (Moved to M5)

*All CI/CD tasks moved to Milestone M5: Integration & Testing*

### ~~Infrastructure~~ (Moved to M3)

*All infrastructure provisioning tasks moved to Milestone M3: Bridge Development*

**Milestone Completion Criteria:**
- ✅ All team members can clone repo and run setup
- ✅ Environment variables documented with .env.example templates
- ✅ .gitignore configured to prevent committing secrets
- ✅ Planning documentation complete and comprehensive
- ✅ Ready to begin M1 (Ethereum Contracts) and M2 (Qubic Contracts)

---

## Milestone M1: Ethereum Smart Contracts

**Goal:** Deploy working ComputeGateway.sol to Sepolia testnet
**Duration:** Hours 2-12
**Owner:** Backend Engineer 1

### 🔧 Development Network Strategy

**Two Networks, Two Addresses:**

1. **Local Hardhat Network (90% of development time)**
   - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Hardhat default #0)
   - Balance: 10,000 ETH (unlimited, always available)
   - Use: Contract development, testing, debugging
   - Commands: `npx hardhat test`, `npx hardhat run scripts/deploy.js`
   - Benefits: Free, instant, unlimited retries

2. **Sepolia Testnet (Final 10% - deployment)**
   - Address: `0xC6371B0Ba0cE3B452dc460432462840d96E0A715` (Your actual wallet)
   - Balance: 0.05 ETH (real testnet ETH)
   - Use: Final deployment, public verification, frontend integration
   - Commands: `npx hardhat run scripts/deploy.js --network sepolia`
   - Benefits: Public, verifiable on Etherscan, usable by bridge/frontend

**Workflow:** Develop locally on Hardhat → Test thoroughly → Deploy once to Sepolia when ready

### Environment Setup

- [x] Install Node.js v18+ and npm
- [x] Install Hardhat: `npm install --save-dev hardhat`
- [x] Initialize Hardhat project in `contracts/`
- [x] Install dependencies:
  - [x] `@nomicfoundation/hardhat-toolbox`
  - [x] `@openzeppelin/contracts`
  - [x] `dotenv`
- [x] Configure `hardhat.config.js` for Sepolia network
- [x] Setup `.env` with Sepolia RPC URL and private key
- [x] Test Hardhat console connection to Sepolia

### Account & Funding Setup

- [x] Create dedicated development wallet in MetaMask
- [x] **CRITICAL:** Backup seed phrase securely
- [x] Get Sepolia ETH from faucet: https://sepoliafaucet.com (Got 10,000 Sepolia ETH via Google Cloud Web3)
- [x] Verify balance: at least 0.5 ETH for deployment + testing (Current: 10,000 ETH ✅)
- [x] Get Etherscan API key for verification (Configured in .env)
- [x] Get Infura/Alchemy API key for RPC access (Alchemy configured in .env)

### ComputeGateway.sol Development

- [ ] Create `contracts/src/ComputeGateway.sol`
- [ ] Implement contract state variables:
  - [ ] `mapping(uint256 => Job) public jobs`
  - [ ] `uint256 public nextJobId`
  - [ ] `uint256 public minFeePerJob`
  - [ ] `mapping(address => bool) public authorizedComputeNodes`
- [ ] Implement `Job` struct:
  - [ ] `address requester`
  - [ ] `uint8 taskType`
  - [ ] `bytes inputData`
  - [ ] `uint256 fee`
  - [ ] `JobStatus status`
  - [ ] `bytes32 resultHash`
  - [ ] `uint256 timestamp`
  - [ ] `address computeProvider`
- [ ] Implement `JobStatus` enum: `Pending`, `Processing`, `Completed`, `Failed`
- [ ] Implement `requestCompute()` function:
  - [ ] Accept taskType and inputData
  - [ ] Require minimum fee
  - [ ] Create job in mapping
  - [ ] Emit `JobRequested` event
  - [ ] Return jobId
- [ ] Implement `submitResult()` function:
  - [ ] Verify caller is authorized node
  - [ ] Verify job exists and is pending
  - [ ] Store result hash
  - [ ] Update job status to Completed
  - [ ] Emit `JobCompleted` event
- [ ] Implement admin functions:
  - [ ] `authorizeComputeNode(address node)`
  - [ ] `revokeComputeNode(address node)`
  - [ ] `updateMinFee(uint256 newFee)`
  - [ ] `withdrawFees()` (owner only)
- [ ] Add OpenZeppelin `Ownable` for access control
- [ ] Add proper error handling with custom errors
- [ ] Add events:
  - [ ] `JobRequested(uint256 indexed jobId, address indexed requester, uint8 taskType, bytes inputData, uint256 fee)`
  - [ ] `JobCompleted(uint256 indexed jobId, bytes32 resultHash, address indexed computeProvider)`
  - [ ] `JobFailed(uint256 indexed jobId, string reason)`

### Testing

- [ ] Create `contracts/test/ComputeGateway.test.js`
- [ ] Test job submission:
  - [ ] Successfully submit job with correct fee
  - [ ] Reject job with insufficient fee
  - [ ] Emit JobRequested event
  - [ ] Increment jobId correctly
- [ ] Test result submission:
  - [ ] Authorized node can submit result
  - [ ] Unauthorized address cannot submit result
  - [ ] Update job status correctly
  - [ ] Emit JobCompleted event
- [ ] Test admin functions:
  - [ ] Owner can authorize nodes
  - [ ] Owner can revoke nodes
  - [ ] Non-owner cannot call admin functions
- [ ] Test edge cases:
  - [ ] Submit result for non-existent job
  - [ ] Submit result for already-completed job
  - [ ] Multiple jobs in sequence
- [ ] Run full test suite: `npx hardhat test`
- [ ] Achieve >90% code coverage

### Deployment

- [ ] Create `contracts/scripts/deploy.js`
- [ ] Add deployment logic with constructor args
- [ ] Test deployment on Hardhat local network
- [ ] Deploy to Sepolia testnet: `npx hardhat run scripts/deploy.js --network sepolia`
- [ ] **CRITICAL:** Save contract address to `deployed-addresses.json`
- [ ] Verify contract on Etherscan: `npx hardhat verify --network sepolia <ADDRESS>`
- [ ] Verify contract appears on Etherscan with green checkmark

### ABI Export & Sharing

- [ ] Copy ABI from `artifacts/contracts/ComputeGateway.sol/ComputeGateway.json`
- [ ] Create `contracts/abi/ComputeGateway.json` (ABI only)
- [ ] Copy ABI to `frontend/lib/contracts/ComputeGateway.ts`
- [ ] Copy ABI to `bridge/ComputeGateway_abi.json`
- [ ] Update all team members with contract address

### Documentation

- [ ] Document all contract functions in comments
- [ ] Create `contracts/README.md` with:
  - [ ] Deployment instructions
  - [ ] Contract addresses
  - [ ] ABI location
  - [ ] Testing instructions
- [ ] Add gas cost estimates for each function

**Milestone Completion Criteria:**
- ✅ ComputeGateway.sol deployed to Sepolia
- ✅ Contract verified on Etherscan
- ✅ All tests passing
- ✅ ABI exported and shared with team

---

## Milestone M2: Qubic Smart Contracts

**Goal:** Deploy working QPI contracts to Qubic testnet  
**Duration:** Hours 2-12  
**Owner:** Backend Engineer 2

### Environment Setup

- [ ] Install Node.js v18+ and npm
- [ ] Install Python 3.10+
- [ ] Clone Qubic core: `git clone https://github.com/qubic/core.git`
- [ ] Study QPI examples in `core/src/contracts/`
- [ ] Install Qubic TypeScript library: `npm install @qubic-lib/qubic-ts-library`
- [ ] Setup development directory structure

### Qubic Wallet Setup

- [ ] Generate Qubic seed (55 uppercase letters A-Z)
- [ ] **CRITICAL:** Backup seed securely (cannot be recovered)
- [ ] Derive identity from seed
- [ ] Request testnet tokens from: https://qforge.qubicdev.com/
- [ ] Verify balance on explorer: https://testnet.explorer.qubic.org
- [ ] **BACKUP:** Save backup seed: `fwqatwliqyszxivzgtyyfllymopjimkyoreolgyflsnfpcytkhagqii`

### RPC Connection Testing

- [ ] Test testnet RPC: `curl https://testnet-rpc.qubicdev.com/v1/status`
- [ ] Verify response contains `lastProcessedTick`
- [ ] Test from TypeScript:
  ```typescript
  import { QubicConnector } from '@qubic-lib/qubic-ts-library';
  const connector = new QubicConnector();
  // Test connection
  ```
- [ ] Document working RPC endpoint

### PrimeFinder.h Contract Development

- [ ] Create `qubic-contracts/src/PrimeFinder.h`
- [ ] Define contract struct:
  ```cpp
  struct CONTRACT_STATE {
      uint64 totalCallCount;
      uint64 lastPrimeFound;
  };
  ```
- [ ] Define input struct:
  ```cpp
  struct findPrime_input {
      uint64 startNumber;
      uint64 count;  // Nth prime to find
  };
  ```
- [ ] Define output struct:
  ```cpp
  struct findPrime_output {
      uint64 primeNumber;
      uint64 iterations;
  };
  ```
- [ ] Implement `PUBLIC_FUNCTION(findPrime)`:
  - [ ] Validate input (startNumber > 1, count > 0)
  - [ ] Implement prime checking logic
  - [ ] Find Nth prime after startNumber
  - [ ] Update state variables
  - [ ] Set output values
- [ ] Implement helper function `isPrime(uint64 n)`:
  - [ ] Check divisibility up to sqrt(n)
  - [ ] Optimize for performance
- [ ] Add `REGISTER_USER_FUNCTIONS_AND_PROCEDURES`:
  ```cpp
  REGISTER_USER_FUNCTIONS_AND_PROCEDURES {
      REGISTER_USER_FUNCTION(findPrime, 1);
  }
  ```

### MonteCarlo.h Contract Development

- [ ] Create `qubic-contracts/src/MonteCarlo.h`
- [ ] Define contract struct:
  ```cpp
  struct CONTRACT_STATE {
      uint64 totalSimulations;
  };
  ```
- [ ] Define input struct:
  ```cpp
  struct calculateRisk_input {
      uint64 numSimulations;
      uint64 portfolioValue;
      uint64 volatility;  // Annual volatility in basis points
      uint64 timeHorizon; // Days
  };
  ```
- [ ] Define output struct:
  ```cpp
  struct calculateRisk_output {
      uint64 meanReturn;
      uint64 valueAtRisk;  // 95% VaR
      uint64 sharpeRatio;
  };
  ```
- [ ] Implement `PUBLIC_FUNCTION(calculateRisk)`:
  - [ ] Initialize random seed from tick
  - [ ] Run Monte Carlo simulations
  - [ ] Calculate portfolio returns
  - [ ] Compute VaR (95th percentile)
  - [ ] Calculate Sharpe ratio
  - [ ] Set output values
- [ ] Implement helper functions:
  - [ ] `randomNormal()` - Box-Muller transform
  - [ ] `simulateReturn()` - Single simulation
  - [ ] `sortReturns()` - For VaR calculation
- [ ] Register function

### Contract Deployment

- [ ] Create `qubic-contracts/deploy/deploy.js`
- [ ] Implement deployment script using qubic-ts-library
- [ ] Deploy PrimeFinder contract:
  - [ ] Build transaction
  - [ ] Sign with seed
  - [ ] Broadcast to testnet
  - [ ] Wait for confirmation
  - [ ] **CRITICAL:** Save contract ID (55 chars)
- [ ] Deploy MonteCarlo contract:
  - [ ] Follow same process
  - [ ] **CRITICAL:** Save contract ID
- [ ] Verify deployments on Qubic explorer
- [ ] Take screenshots of deployed contracts (for demo proof)
- [ ] Save contract IDs to `qubic-contracts/deploy/contract_ids.json`:
  ```json
  {
    "primeFinder": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "monteCarlo": "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
  }
  ```

### Contract Testing

- [ ] Create `qubic-contracts/test/test-contracts.js`
- [ ] Test PrimeFinder:
  - [ ] Call with `startNumber=1000, count=10`
  - [ ] Verify result is correct (should be 1033)
  - [ ] Test with various inputs
  - [ ] Verify gas costs
- [ ] Test MonteCarlo:
  - [ ] Call with reasonable parameters
  - [ ] Verify output format
  - [ ] Check execution time
- [ ] Document test results

### CLI Tool Development

- [ ] Create `qubic-contracts/cli/qubic_client_cli.js`
- [ ] Add command: `test-connection`
  - [ ] Ping RPC endpoint
  - [ ] Check wallet balance
- [ ] Add command: `call-prime-finder <start> <count>`
  - [ ] Build transaction
  - [ ] Call contract
  - [ ] Display result
- [ ] Add command: `call-monte-carlo <sims> <value> <vol> <days>`
  - [ ] Call MonteCarlo contract
  - [ ] Display results
- [ ] Test all CLI commands work

### Documentation

- [ ] Create `qubic-contracts/README.md`:
  - [ ] Contract IDs and addresses
  - [ ] Deployment instructions
  - [ ] Testing instructions
  - [ ] Function specifications
- [ ] Document QPI contract structure
- [ ] Add troubleshooting guide for common issues

**Milestone Completion Criteria:**
- ✅ PrimeFinder.h deployed to Qubic testnet
- ✅ MonteCarlo.h deployed to Qubic testnet
- ✅ Both contracts callable via TypeScript
- ✅ Contract IDs documented and shared
- ✅ Screenshots of Qubic explorer showing contracts

---

## Milestone M3: Bridge Agent Development

**Goal:** Working bridge that listens to Ethereum and calls Qubic  
**Duration:** Hours 12-24  
**Owner:** Backend Engineer 2

### Python Environment Setup

- [ ] Create `bridge/` directory
- [ ] Create virtual environment: `python3 -m venv venv`
- [ ] Activate venv: `source venv/bin/activate`
- [ ] Create `requirements.txt`:
  ```
  web3>=6.0.0
  python-dotenv>=1.0.0
  pyyaml>=6.0
  asyncio
  ```
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Create `.env` file with all required variables

### Qubic Client Module (Node.js)

- [ ] Create `bridge/qubic_client.js`
- [ ] Import qubic-ts-library
- [ ] Implement `connectToQubic()`:
  - [ ] Initialize QubicConnector
  - [ ] Load seed from environment
  - [ ] Test connection
- [ ] Implement `callPrimeFinder(startNumber, count)`:
  - [ ] Build transaction for PrimeFinder contract
  - [ ] Sign with wallet
  - [ ] Submit to network
  - [ ] Wait for execution
  - [ ] Parse result
  - [ ] Return as JSON
- [ ] Implement `callMonteCarlo(numSims, value, vol, days)`:
  - [ ] Build transaction for MonteCarlo contract
  - [ ] Submit and wait
  - [ ] Parse result
  - [ ] Return as JSON
- [ ] Add error handling and retries
- [ ] Add logging for debugging

### CLI Wrapper for Testing

- [ ] Create `bridge/qubic_client_cli.js`
- [ ] Parse command line arguments
- [ ] Add commands:
  - [ ] `test-connection`
  - [ ] `call-prime-finder <start> <count> <expected>`
  - [ ] `call-monte-carlo <sims> <value> <vol> <days>`
- [ ] Test each command independently:
  ```bash
  node qubic_client_cli.js test-connection
  node qubic_client_cli.js call-prime-finder 1000 10 1033
  ```
- [ ] Verify all commands work before integrating with Python

### Bridge Agent Core (Python)

- [ ] Create `bridge/bridge_agent.py`
- [ ] Implement configuration loading:
  - [ ] Read from `.env`
  - [ ] Read from `config.yaml`
  - [ ] Validate all required fields
- [ ] Implement Ethereum connection:
  - [ ] Connect to Sepolia RPC via web3.py
  - [ ] Load ComputeGateway contract ABI
  - [ ] Create contract instance
  - [ ] Test connection
- [ ] Implement event listener:
  - [ ] Subscribe to `JobRequested` events
  - [ ] Parse event data (jobId, taskType, inputData, fee)
  - [ ] Handle event in callback
- [ ] Implement job queue:
  - [ ] Use asyncio queue
  - [ ] Add jobs from events
  - [ ] Process jobs sequentially (initially)
- [ ] Implement job processor:
  - [ ] Parse job type (0=PrimeFinder, 1=MonteCarlo)
  - [ ] Decode input data
  - [ ] Route to appropriate Qubic function
  - [ ] Handle Qubic response

### Qubic Integration

- [ ] Implement `call_qubic_contract()` in bridge_agent.py:
  - [ ] Build command for Node.js subprocess
  - [ ] Execute: `subprocess.run(['node', 'qubic_client.js', ...])`
  - [ ] Capture stdout as JSON
  - [ ] Parse result
  - [ ] Handle errors
- [ ] Implement routing logic:
  - [ ] If taskType == 0: call PrimeFinder
  - [ ] If taskType == 1: call MonteCarlo
  - [ ] If taskType == 2: call BlackScholes (future)
- [ ] Add timeout handling (30 seconds max)
- [ ] Add retry logic (3 attempts with exponential backoff)

### Result Submission

- [ ] Implement `submit_result_to_ethereum()`:
  - [ ] Build transaction for `submitResult()`
  - [ ] Encode result as bytes32 hash
  - [ ] Sign transaction with bridge wallet
  - [ ] Send transaction
  - [ ] Wait for confirmation
  - [ ] Log transaction hash
- [ ] Add gas estimation
- [ ] Add nonce management
- [ ] Handle transaction failures

### Error Handling & Logging

- [ ] Setup Python logging:
  - [ ] Console output (INFO level)
  - [ ] File output (DEBUG level)
  - [ ] Rotating log files
- [ ] Add structured logging for:
  - [ ] Job received
  - [ ] Qubic call initiated
  - [ ] Qubic result received
  - [ ] Result submitted to Ethereum
  - [ ] Job completed
  - [ ] Any errors
- [ ] Implement error recovery:
  - [ ] Network errors: retry
  - [ ] Qubic timeout: mark job failed
  - [ ] Ethereum submission failure: retry with higher gas

### Testing

- [ ] Test Ethereum event detection:
  - [ ] Submit test job via Etherscan
  - [ ] Verify bridge detects event
  - [ ] Check logs for event data
- [ ] Test Qubic execution:
  - [ ] Trigger PrimeFinder job
  - [ ] Verify Qubic contract called
  - [ ] Check result returned correctly
- [ ] Test result submission:
  - [ ] Verify transaction appears on Etherscan
  - [ ] Check job status updated in contract
- [ ] Test error scenarios:
  - [ ] Invalid input data
  - [ ] Qubic network down
  - [ ] Insufficient gas
- [ ] Test end-to-end flow:
  - [ ] Submit job on Ethereum
  - [ ] Watch bridge logs
  - [ ] Verify result on Ethereum
  - [ ] Check both explorers

### Configuration & Deployment

- [ ] Create `bridge/config.yaml`:
  ```yaml
  ethereum:
    rpc_url: "${ETHEREUM_RPC_URL}"
    contract_address: "${CONTRACT_ADDRESS}"
    poll_interval: 2
  qubic:
    rpc_url: "${QUBIC_RPC_URL}"
    seed: "${QUBIC_SEED}"
    contracts:
      prime_finder: "${PRIME_FINDER_CONTRACT_ID}"
      monte_carlo: "${MONTE_CARLO_CONTRACT_ID}"
  ```
- [ ] Create systemd service file (for VPS deployment)
- [ ] Create Docker configuration
- [ ] Test deployment on local machine

### Infrastructure Provisioning (Moved from M0)

- [ ] Provision VPS for bridge agent (AWS EC2 or DigitalOcean Droplet)
  - [ ] Minimum 2GB RAM, 1 CPU
  - [ ] Ubuntu 22.04 LTS or similar
  - [ ] Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] Setup SSH access and security groups
  - [ ] Generate SSH key pair
  - [ ] Add public key to VPS
  - [ ] Configure firewall rules
  - [ ] Disable password authentication
- [ ] Install Docker and Docker Compose on VPS
  - [ ] Update package manager: `apt update && apt upgrade`
  - [ ] Install Docker: `curl -fsSL https://get.docker.com | sh`
  - [ ] Install Docker Compose: `apt install docker-compose`
  - [ ] Add user to docker group: `usermod -aG docker $USER`
  - [ ] Verify installation: `docker --version && docker-compose --version`

**Milestone Completion Criteria:**
- ✅ Bridge detects Ethereum events
- ✅ Bridge calls Qubic contracts successfully
- ✅ Bridge submits results back to Ethereum
- ✅ Full round-trip works: Ethereum → Bridge → Qubic → Bridge → Ethereum
- ✅ Error handling robust

---

## Milestone M4: Frontend Application

**Goal:** Working web UI for submitting jobs and viewing results  
**Duration:** Hours 6-36  
**Owner:** Frontend Engineer

### Project Initialization

- [ ] Create Next.js project:
  ```bash
  npx create-next-app@latest frontend \
    --typescript \
    --tailwind \
    --app \
    --no-src-dir
  ```
- [ ] Setup project structure:
  ```
  frontend/
  ├── app/
  ├── components/
  ├── hooks/
  ├── lib/
  └── public/
  ```
- [ ] Install dependencies:
  ```bash
  npm install wagmi viem @rainbow-me/rainbowkit
  npm install @tanstack/react-query
  npm install lucide-react
  npm install framer-motion
  ```

### Configuration

- [ ] Configure Tailwind with design system colors in `tailwind.config.js`:
  ```javascript
  colors: {
    gray: colors.gray,
    blue: colors.blue,
    green: colors.green,
    red: colors.red,
  }
  ```
- [ ] Create `lib/constants.ts`:
  - [ ] Chain configurations
  - [ ] Contract addresses
  - [ ] Function definitions
- [ ] Setup environment variables in `.env.local`:
  ```
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
  NEXT_PUBLIC_COMPUTE_GATEWAY_ADDRESS=
  ```

### Web3 Provider Setup

- [ ] Create `app/providers.tsx`:
  - [ ] Import wagmi, RainbowKit, React Query
  - [ ] Configure chains (Sepolia)
  - [ ] Setup RainbowKit with custom theme
  - [ ] Wrap with QueryClientProvider
- [ ] Update `app/layout.tsx`:
  - [ ] Wrap children with Providers
  - [ ] Add global fonts (Inter)
  - [ ] Setup metadata

### Contract Integration

- [ ] Create `lib/contracts/ComputeGateway.ts`:
  - [ ] Import contract ABI from deployed contract
  - [ ] Export contract address
  - [ ] Export typed contract interface
- [ ] Create `hooks/useComputeGateway.ts`:
  - [ ] Implement `useReadContract` for getJob()
  - [ ] Implement `useWriteContract` for requestCompute()
  - [ ] Handle loading and error states
  - [ ] Export typed hooks

### UI Component Library

- [ ] Create `components/ui/Button.tsx`:
  - [ ] Primary variant (black bg)
  - [ ] Secondary variant (white bg, border)
  - [ ] Loading state with spinner
  - [ ] Disabled state
- [ ] Create `components/ui/Card.tsx`:
  - [ ] Base card with border and shadow
  - [ ] Hover effect for interactive cards
- [ ] Create `components/ui/Input.tsx`:
  - [ ] Text input with label
  - [ ] Error state styling
  - [ ] Help text support
- [ ] Create `components/ui/Badge.tsx`:
  - [ ] Success, warning, error, info variants
- [ ] Create `components/ui/Spinner.tsx`:
  - [ ] Loading spinner animation
- [ ] Create `components/ui/Modal.tsx`:
  - [ ] Overlay with backdrop
  - [ ] Close button
  - [ ] Responsive

### Layout Components

- [ ] Create `components/layout/Header.tsx`:
  - [ ] Logo on left
  - [ ] Navigation links (optional)
  - [ ] RainbowKit ConnectButton on right
  - [ ] Responsive mobile menu
- [ ] Create `components/layout/Footer.tsx`:
  - [ ] Copyright notice
  - [ ] Links: Docs, GitHub, API
  - [ ] Social links (optional)
- [ ] Create `components/layout/Container.tsx`:
  - [ ] Max-width wrapper (1200px)
  - [ ] Padding on mobile
  - [ ] Centered content

### Wallet Components

- [ ] Create `components/wallet/WalletInfo.tsx`:
  - [ ] Display connected address (truncated)
  - [ ] Display ETH balance
  - [ ] Disconnect button
- [ ] Create `components/wallet/NetworkSwitch.tsx`:
  - [ ] Detect if on wrong network
  - [ ] Show prompt to switch to Sepolia
  - [ ] Button to trigger network switch

### Function Selection

- [ ] Create `lib/functions/index.ts`:
  - [ ] Define ComputeFunction interface
  - [ ] Export array of available functions
- [ ] Create `lib/functions/primeFinder.ts`:
  ```typescript
  export const primeFinder: ComputeFunction = {
    id: 0,
    name: "Prime Finder",
    description: "Find the Nth prime number after a starting value",
    icon: "Calculator",
    parameters: [
      { name: "startNumber", type: "uint64", min: 2, max: 1e18, default: 1000 },
      { name: "count", type: "uint64", min: 1, max: 10000, default: 10 }
    ],
    estimatedTime: "3-5 seconds",
    estimatedCost: "0.001 ETH"
  };
  ```
- [ ] Create `lib/functions/monteCarlo.ts` (similar structure)
- [ ] Create `components/compute/FunctionCard.tsx`:
  - [ ] Display function icon
  - [ ] Show name and description
  - [ ] Show estimated cost and time
  - [ ] "Select" button
  - [ ] Hover effect
- [ ] Create `components/compute/FunctionSelector.tsx`:
  - [ ] Grid of FunctionCard components
  - [ ] Handle selection
  - [ ] Pass selected function to parent

### Parameter Input

- [ ] Create `components/compute/ParameterForm.tsx`:
  - [ ] Dynamic form generation from function parameters
  - [ ] Input validation (min/max, required)
  - [ ] Real-time error display
  - [ ] Help tooltips
- [ ] Create `hooks/useFunctionParameters.ts`:
  - [ ] Form state management
  - [ ] Validation logic
  - [ ] Encode parameters for contract call

### Price Estimation

- [ ] Create `hooks/useEthPrice.ts`:
  - [ ] Fetch ETH/USD price from Coingecko API
  - [ ] Cache for 60 seconds
  - [ ] Handle API errors
- [ ] Create `hooks/usePriceEstimate.ts`:
  - [ ] Calculate Tengen cost (from contract minFee)
  - [ ] Calculate Ethereum gas cost (estimated)
  - [ ] Calculate savings percentage
  - [ ] Convert to USD using ETH price
- [ ] Create `components/compute/PriceEstimate.tsx`:
  - [ ] Display Tengen cost in ETH and USD
  - [ ] Show estimated time
- [ ] Create `components/compute/ComparisonWidget.tsx`:
  - [ ] Side-by-side comparison: Tengen vs Ethereum
  - [ ] Highlight savings in green
  - [ ] Visual bar chart (optional)

### Job Submission

- [ ] Create `components/compute/SubmitButton.tsx`:
  - [ ] Call useWriteContract hook
  - [ ] Show loading state during transaction
  - [ ] Handle success: emit jobId
  - [ ] Handle error: show message
  - [ ] Disabled when wallet not connected
- [ ] Integrate wallet confirmation modal (from RainbowKit)
- [ ] Handle transaction rejected by user
- [ ] Show transaction hash after submission

### Status Monitoring

- [ ] Create `hooks/useJobStatus.ts`:
  - [ ] Poll contract every 2 seconds for job status
  - [ ] Return: status, progress, stage, txHashes
  - [ ] Stop polling when job complete/failed
- [ ] Create `components/status/JobStatus.tsx`:
  - [ ] Container for status display
  - [ ] Show job ID
- [ ] Create `components/status/ProgressBar.tsx`:
  - [ ] Visual progress bar (0-100%)
  - [ ] Animated fill
  - [ ] Color changes by stage
- [ ] Create `components/status/StatusStep.tsx`:
  - [ ] Display individual step (Submitted, Processing, etc.)
  - [ ] Checkmark for completed
  - [ ] Spinner for active
  - [ ] Gray for pending
  - [ ] Include timestamp
  - [ ] Include explorer link when available
- [ ] Create `components/status/Timer.tsx`:
  - [ ] Count elapsed time since submission
  - [ ] Format as MM:SS

### Result Display

- [ ] Create `components/results/ResultDisplay.tsx`:
  - [ ] Container for result
  - [ ] Success animation on completion
- [ ] Create `components/results/ResultValue.tsx`:
  - [ ] Large, prominent result number
  - [ ] Description of result
  - [ ] Proper formatting (commas, decimals)
- [ ] Create `components/results/VerificationLinks.tsx`:
  - [ ] Link to Qubic explorer
  - [ ] Link to Etherscan
  - [ ] External link icon
  - [ ] Open in new tab
- [ ] Create `components/results/CopyButton.tsx`:
  - [ ] Copy result to clipboard
  - [ ] Show "Copied!" confirmation
  - [ ] Icon changes temporarily

### Main Page Assembly

- [ ] Create `app/page.tsx`:
  - [ ] State: not connected | function selection | parameter input | job processing | result
  - [ ] Conditional rendering based on state
  - [ ] Hero section when not connected
  - [ ] FunctionSelector when connected
  - [ ] ParameterForm when function selected
  - [ ] JobStatus when job submitted
  - [ ] ResultDisplay when job complete
- [ ] Implement state transitions:
  - [ ] Connect wallet → show functions
  - [ ] Select function → show parameters
  - [ ] Submit job → show status
  - [ ] Job complete → show result
  - [ ] "Submit Another" → back to functions
- [ ] Add back navigation buttons where appropriate

### Styling & Polish

- [ ] Apply design system consistently across all components
- [ ] Add hover effects to interactive elements
- [ ] Add focus indicators for keyboard navigation
- [ ] Implement smooth transitions between states
- [ ] Add loading skeletons for async data
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Add dark mode support (optional)

### Error Handling

- [ ] Create `components/ErrorBoundary.tsx`
- [ ] Handle wallet connection errors
- [ ] Handle network mismatch errors
- [ ] Handle insufficient balance errors
- [ ] Handle transaction rejection errors
- [ ] Handle timeout errors
- [ ] Show user-friendly error messages
- [ ] Provide actionable next steps

### Performance Optimization

- [ ] Implement React.memo for expensive components
- [ ] Use dynamic imports for heavy components
- [ ] Optimize images (use Next.js Image component)
- [ ] Minimize bundle size
- [ ] Add loading states to prevent layout shift

### Testing

- [ ] Test wallet connection with MetaMask
- [ ] Test wallet connection with WalletConnect
- [ ] Test on wrong network (prompt to switch)
- [ ] Test with insufficient balance
- [ ] Test job submission flow
- [ ] Test status polling
- [ ] Test result display
- [ ] Test on mobile Safari
- [ ] Test on mobile Chrome
- [ ] Test keyboard navigation
- [ ] Test with screen reader (basic)

**Milestone Completion Criteria:**
- ✅ User can connect wallet
- ✅ User can select function and input parameters
- ✅ User can submit job and see transaction
- ✅ User can monitor job status in real-time
- ✅ User can see result and verify on explorers
- ✅ Mobile responsive and accessible

---

## Milestone M5: Integration & Testing

**Goal:** All components working together end-to-end  
**Duration:** Hours 24-36  
**Owner:** All Team Members

### Bridge Deployment

- [ ] Create Dockerfile for bridge agent
- [ ] Test Docker build locally
- [ ] Push Docker image to registry (optional)
- [ ] Deploy to VPS:
  - [ ] Copy files via SSH/rsync
  - [ ] Install dependencies
  - [ ] Configure environment variables
  - [ ] Start service
- [ ] Test bridge is running: `curl http://VPS_IP:PORT/health`
- [ ] Configure auto-restart on crash
- [ ] Setup log rotation

### Frontend Deployment

- [ ] Connect Vercel to GitHub repo
- [ ] Configure build settings:
  - [ ] Framework: Next.js
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `.next`
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy and test preview URL
- [ ] Test production deployment
- [ ] Use Vercel auto-generated URL (custom domain moved to backlog)

### CI/CD Pipeline (Moved from M0)

- [ ] Setup GitHub Actions workflow for frontend
  - [ ] Run linting on PR
  - [ ] Run build test
  - [ ] Deploy preview to Vercel
- [ ] Setup GitHub Actions workflow for contracts
  - [ ] Run Hardhat tests on PR
  - [ ] Run Solidity linter
- [ ] Configure automated testing on PR
  - [ ] Require tests to pass before merge
  - [ ] Add status badges to README
- [ ] Finalize Vercel integration for auto-deploy
  - [ ] Auto-deploy on push to main
  - [ ] Preview deploys for PRs

### Contract Authorization

- [ ] Get bridge wallet address (from .env)
- [ ] Call `authorizeComputeNode()` from contract owner account
- [ ] Verify authorization: check `authorizedComputeNodes` mapping
- [ ] Test bridge can submit results

### End-to-End Testing

- [ ] **Test 1: Prime Finder Full Flow**
  - [ ] Open frontend in browser
  - [ ] Connect MetaMask wallet
  - [ ] Select Prime Finder function
  - [ ] Input: startNumber=1000, count=10
  - [ ] Submit job (confirm in MetaMask)
  - [ ] Watch bridge logs: should detect event
  - [ ] Verify Qubic contract called
  - [ ] Wait for result submission
  - [ ] Verify result displayed: 1033
  - [ ] Click Qubic explorer link: verify transaction
  - [ ] Click Etherscan link: verify result submission
  - [ ] **PASS/FAIL:** ___

- [ ] **Test 2: Monte Carlo Full Flow**
  - [ ] Select Monte Carlo function
  - [ ] Input: sims=10000, value=100000, vol=20, days=30
  - [ ] Submit and monitor
  - [ ] Verify results appear
  - [ ] Check both explorers
  - [ ] **PASS/FAIL:** ___

- [ ] **Test 3: Multiple Sequential Jobs**
  - [ ] Submit 3 Prime Finder jobs in sequence
  - [ ] Verify all complete successfully
  - [ ] Check job IDs increment correctly
  - [ ] **PASS/FAIL:** ___

- [ ] **Test 4: Error Handling**
  - [ ] Submit job with insufficient fee (should fail)
  - [ ] Submit job when bridge is down (should timeout)
  - [ ] Disconnect wallet during submission
  - [ ] Test with invalid parameters
  - [ ] **PASS/FAIL:** ___

### Performance Testing

- [ ] Measure end-to-end latency:
  - [ ] Job submission to confirmation: target < 5 sec
  - [ ] Qubic execution: target < 10 sec
  - [ ] Result submission: target < 5 sec
  - [ ] Total: target < 30 sec
- [ ] Test bridge under load:
  - [ ] Submit 10 jobs rapidly
  - [ ] Verify all complete (may be sequential)
- [ ] Monitor resource usage on VPS
- [ ] Check for memory leaks in bridge

### Bug Fixes

- [ ] Create GitHub issues for all bugs found
- [ ] Prioritize by severity:
  - [ ] P0: Blocks demo (fix immediately)
  - [ ] P1: Major UX issue (fix before demo)
  - [ ] P2: Minor issue (fix if time)
  - [ ] P3: Nice to have (backlog)
- [ ] Fix all P0 and P1 bugs
- [ ] Test fixes thoroughly

### Documentation Updates

- [ ] Update README.md with actual deployed addresses
- [ ] Document known issues and workarounds
- [ ] Create troubleshooting guide
- [ ] Update API documentation
- [ ] Add screenshots to documentation

**Milestone Completion Criteria:**
- ✅ Full Ethereum → Qubic → Ethereum flow works reliably
- ✅ All P0 and P1 bugs fixed
- ✅ System stable for 10+ consecutive jobs
- ✅ Performance meets target latency
- ✅ Documentation up to date

---

## Milestone M6: Demo Preparation

**Goal:** Polished demo ready for presentation  
**Duration:** Hours 36-48  
**Owner:** All Team Members

### Demo Script Writing

- [ ] Write 2-3 minute demo script
- [ ] Structure:
  1. Problem statement (15 sec)
  2. Solution overview (30 sec)
  3. Live demo (90 sec)
  4. Results verification (30 sec)
  5. Closing value prop (15 sec)
- [ ] Practice timing with team
- [ ] Assign speaking roles

### Demo Wallet Preparation

- [ ] Create dedicated demo wallet
- [ ] Fund with 0.5 ETH on Sepolia
- [ ] Fund Qubic wallet with testnet tokens
- [ ] Test wallet works in demo environment
- [ ] **BACKUP:** Create second wallet in case of issues

### Demo Environment Setup

- [ ] Verify production frontend URL works
- [ ] Verify bridge is running and healthy
- [ ] Pre-connect demo wallet to frontend
- [ ] Open browser tabs:
  - [ ] Frontend application
  - [ ] Etherscan with contract address
  - [ ] Qubic testnet explorer
- [ ] Close unnecessary tabs
- [ ] Clear browser cache
- [ ] Disable browser extensions that might interfere
- [ ] Set browser zoom to comfortable level

### Demo Video Recording (Backup)

- [ ] Record full demo run on screen recorder
- [ ] Include voiceover explaining each step
- [ ] Edit for clarity (remove dead time)
- [ ] Keep under 3 minutes
- [ ] Export in high quality (1080p minimum)
- [ ] Test video plays correctly
- [ ] Upload to YouTube (unlisted)
- [ ] Download local backup

### UI Polish

- [ ] Review all UI components for consistency
- [ ] Fix any visual bugs:
  - [ ] Alignment issues
  - [ ] Color inconsistencies
  - [ ] Font size mismatches
  - [ ] Spacing problems
- [ ] Add micro-interactions:
  - [ ] Button hover effects
  - [ ] Card elevation on hover
  - [ ] Success animation on completion
- [ ] Test animations are smooth (60fps)
- [ ] Add favicon and meta tags for sharing

### Demo Dry Runs

- [ ] **Dry Run 1:** Full team (Hour 42)
  - [ ] Run through complete demo
  - [ ] Time each section
  - [ ] Note any issues
  - [ ] Get feedback on presentation
- [ ] Fix issues found in Dry Run 1
- [ ] **Dry Run 2:** Full team (Hour 44)
  - [ ] Run through again
  - [ ] Verify all issues fixed
  - [ ] Practice Q&A responses
- [ ] **Dry Run 3:** Final check (Hour 46)
  - [ ] Quick run-through
  - [ ] Verify backup video works
  - [ ] Confirm all materials ready

### Submission Materials Preparation

- [ ] Create project screenshots:
  - [ ] Hero section (not connected)
  - [ ] Function selection
  - [ ] Parameter input with price comparison
  - [ ] Job processing with status
  - [ ] Completed result with explorer links
- [ ] Create architecture diagram (visual)
- [ ] Write project description (300 words)
- [ ] Write technical description (500 words)
- [ ] List all technologies used
- [ ] Prepare team member bios
- [ ] Collect GitHub links
- [ ] Prepare deployed URLs:
  - [ ] Frontend: https://tengen-bridge.vercel.app
  - [ ] Sepolia contract: 0x...
  - [ ] Qubic contracts: AAAA..., BBBB...

### Lablab.ai Submission Form

- [ ] Project name: "Tengen Bridge"
- [ ] Tagline: "Trustless compute coprocessor bridging Ethereum and Qubic"
- [ ] Track: Infrastructure & Middleware
- [ ] Description: (paste prepared 300-word description)
- [ ] Technical details: (paste prepared 500-word description)
- [ ] Demo video URL: (YouTube link)
- [ ] Live demo URL: (Vercel URL)
- [ ] GitHub repository: (public repo link)
- [ ] Screenshots: (upload all prepared images)
- [ ] Technologies: Ethereum, Qubic, Next.js, Solidity, C++, TypeScript
- [ ] Team members: (add all with emails)
- [ ] Special notes: (any important context)
- [ ] **SUBMIT at Hour 47** (leave 1 hour buffer)

### Contingency Planning

- [ ] **Plan A:** Live demo in person/video
- [ ] **Plan B:** Backup recorded video if live fails
- [ ] **Plan C:** Slides with screenshots if video fails
- [ ] Prepare answers for common questions:
  - [ ] "How is this different from Chainlink?"
  - [ ] "What about security of the bridge?"
  - [ ] "Can this scale?"
  - [ ] "What's the business model?"
  - [ ] "Why Qubic over other chains?"

### Final Checks (Hour 47)

- [ ] Frontend accessible: ✅ / ❌
- [ ] Bridge running: ✅ / ❌
- [ ] Demo wallet funded: ✅ / ❌
- [ ] Video backup works: ✅ / ❌
- [ ] Submission form complete: ✅ / ❌
- [ ] All team members available: ✅ / ❌
- [ ] Internet connection stable: ✅ / ❌

**Milestone Completion Criteria:**
- ✅ Demo runs smoothly (3/3 dry runs successful)
- ✅ Backup video ready and tested
- ✅ All submission materials prepared
- ✅ Lablab.ai form submitted before deadline
- ✅ Team confident and ready to present

---

## Backlog (Post-Hackathon)

### Documentation & Developer Experience

- [ ] Create CONTRIBUTING.md with development workflow (Moved from M0 - unnecessary for hackathon, useful for open source)
- [ ] Create comprehensive docs/PRD.md (Currently covered by PLANNING.md)
- [ ] Create docs/ARCHITECTURE.md (Currently covered by PLANNING.md)
- [ ] Create docs/API.md (For public API documentation)
- [ ] Configure custom domain/subdomain (Using Vercel URL for hackathon)

### Future Features

- [ ] Add BlackScholes QPI contract (3rd compute function)
- [ ] Implement job history dashboard
- [ ] Add email notifications for job completion
- [ ] Create developer API documentation page
- [ ] Add rate limiting for jobs per user
- [ ] Implement job cancellation
- [ ] Add WebSocket for real-time status updates
- [ ] Create mobile app (React Native)
- [ ] Add batch job submission
- [ ] Implement custom code upload (advanced mode)

### Optimizations

- [ ] Optimize Solidity contract gas costs
- [ ] Implement parallel job processing in bridge
- [ ] Add caching layer for frequent computations
- [ ] Optimize Qubic contract execution time
- [ ] Improve error recovery mechanisms
- [ ] Add circuit breaker pattern to bridge
- [ ] Implement job priority queue

### Infrastructure

- [ ] Add monitoring dashboard (Grafana)
- [ ] Setup alerts (PagerDuty/Discord)
- [ ] Implement automatic scaling for bridge
- [ ] Add load balancer for multiple bridge instances
- [ ] Setup CDN for frontend assets
- [ ] Implement backup bridge node
- [ ] Add database for job history

### Multi-Chain Support

- [ ] Deploy to Ethereum mainnet
- [ ] Add Arbitrum support
- [ ] Add Base support
- [ ] Add Polygon support
- [ ] Create unified interface for all chains

### Business/Growth

- [ ] Create landing page with marketing copy
- [ ] Write technical blog post
- [ ] Create tutorial videos
- [ ] Build developer SDK (JavaScript, Python)
- [ ] Create smart contract integration guide
- [ ] Apply for grants (Ethereum Foundation, etc.)
- [ ] Launch on Product Hunt
- [ ] Submit to DeFi aggregators

---

## Blocked Tasks

> **Instructions:** When you encounter a blocker, add it here with details. Update when unblocked.

**Example Format:**
```
- [ ] Task: Deploy PrimeFinder to Qubic
- Blocker: Qubic testnet RPC not responding
- Impact: Cannot proceed with contract deployment
- Attempted: Tried both testnet-rpc URLs, both timing out
- Owner: Backend Engineer 2
- Status: Investigating alternative RPC endpoints
- Added: 2025-12-07 10:30 AM
```

### Current Blockers

*None yet - add blockers as they arise*

---

## Technical Debt

> Track technical shortcuts taken during hackathon that should be fixed later

- [ ] Bridge agent uses polling instead of WebSocket (less efficient)
- [ ] No database for job persistence (all in memory)
- [ ] Error handling could be more granular
- [ ] Gas price estimation is static (should be dynamic)
- [ ] No rate limiting on frontend
- [ ] Qubic client spawned as subprocess (could be IPC)
- [ ] No automated testing for frontend
- [ ] Missing comprehensive logging in contracts

---

## Daily Standup Notes

### Day 1 - Hour 0-24

**What we accomplished:**
- 

**What we're working on next:**
- 

**Blockers:**
- 

**Demo risks:**
- 

### Day 2 - Hour 24-48

**What we accomplished:**
- 

**What we're working on next:**
- 

**Blockers:**
- 

**Demo risks:**
- 

---

## Definition of Done

### For a task to be marked complete [x]:

1. **Code Quality:**
   - [ ] Code written and tested
   - [ ] No compilation/runtime errors
   - [ ] Follows project conventions (see CLAUDE.md)
   - [ ] Properly commented

2. **Testing:**
   - [ ] Unit tests written (if applicable)
   - [ ] Manual testing completed
   - [ ] Edge cases considered
   - [ ] No known bugs

3. **Documentation:**
   - [ ] Code documented in comments
   - [ ] README updated if needed
   - [ ] API docs updated if needed

4. **Integration:**
   - [ ] Code pushed to GitHub
   - [ ] Merged to appropriate branch
   - [ ] Other team members notified
   - [ ] Dependencies communicated

5. **Verification:**
   - [ ] Reviewed by at least one other person
   - [ ] Deployed to test environment
   - [ ] Tested in context of full system

---

## Quick Reference: Key Files & Locations

| What | Where |
|------|-------|
| **Ethereum Contract Address** | `contracts/deployed-addresses.json` |
| **Ethereum Contract ABI** | `contracts/abi/ComputeGateway.json` |
| **Qubic Contract IDs** | `qubic-contracts/deploy/contract_ids.json` |
| **Bridge Configuration** | `bridge/config.yaml` |
| **Frontend Environment** | `frontend/.env.local` |
| **Bridge Environment** | `bridge/.env` |
| **Demo Video** | `docs/demo-video.mp4` |
| **Submission Materials** | `docs/submission/` |

---

## Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Backend 1 (Ethereum) | TBD | TBD | 24/7 during hackathon |
| Backend 2 (Qubic) | TBD | TBD | 24/7 during hackathon |
| Frontend | TBD | TBD | 24/7 during hackathon |
| DevOps | TBD | TBD | 24/7 during hackathon |

---

## Resources & Links

| Resource | URL |
|----------|-----|
| **Qubic Docs** | https://docs.qubic.org |
| **Qubic Core GitHub** | https://github.com/qubic/core |
| **Qubic TS Library** | https://github.com/qubic/ts-library |
| **Qubic Testnet Explorer** | https://testnet.explorer.qubic.org |
| **Qubic Faucet** | https://qforge.qubicdev.com/ |
| **Sepolia Faucet** | https://sepoliafaucet.com |
| **Sepolia Etherscan** | https://sepolia.etherscan.io |
| **wagmi Docs** | https://wagmi.sh |
| **RainbowKit Docs** | https://rainbowkit.com |
| **Next.js Docs** | https://nextjs.org/docs |
| **Lablab.ai Platform** | https://lablab.ai |

---

**Remember:**
- Update this file continuously as you work
- Mark tasks complete `[x]` immediately when done
- Add new tasks as you discover requirements
- Communicate blockers to team ASAP
- Review "Current State" section at start of each session

**Good luck building Tengen Bridge! 🌉**