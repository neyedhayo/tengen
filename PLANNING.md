# PLANNING.md - Tengen Bridge Architecture & Strategy

> **Purpose:** This document defines the architectural vision, technical decisions, and development strategy for Tengen Bridge. Read this at the start of every Claude Code session to understand the current state and strategic direction.

**Last Updated:** December 7, 2025  
**Current Phase:** Pre-Development (Planning Complete)  
**Target Completion:** 48 hours from kickoff

---

## Table of Contents

1. [Vision & Strategic Goals](#vision--strategic-goals)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Required Tools & Setup](#required-tools--setup)
5. [Development Phases](#development-phases)
6. [Current State](#current-state)
7. [Next Actions](#next-actions)
8. [Critical Paths](#critical-paths)
9. [Decision Log](#decision-log)
10. [Known Constraints](#known-constraints)

---

## Vision & Strategic Goals

### Primary Vision

**"Make blockchain computation accessible, affordable, and trustless by bridging Ethereum's liquidity with Qubic's bare-metal performance."**

### Success Criteria for Hackathon

| Goal | Measurement | Status |
|------|-------------|--------|
| **Functional Demo** | Complete Ethereum → Qubic → Ethereum flow working | ⬜ Not Started |
| **Trustless Verification** | Results verifiable on both explorers | ⬜ Not Started |
| **Cost Demonstration** | Show 25M+ times cheaper vs Ethereum gas | ⬜ Not Started |
| **Clean UI** | Professional interface matching design system | ⬜ Not Started |
| **Live Demo Ready** | 2-3 minute demo that works reliably | ⬜ Not Started |

### Strategic Differentiators

1. **Trustless Compute**: Verified by 451+ Qubic validators, not centralized cloud
2. **Native Integration**: Smart contract interface, not off-chain API
3. **Extreme Cost Savings**: 25 million times cheaper than on-chain
4. **Developer-First**: Clean API, excellent docs, simple integration

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Next.js + RainbowKit)                       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Connect    │  │   Select     │  │   Monitor    │        │
│  │   Wallet     │→ │   Function   │→ │   Status     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ETHEREUM LAYER (L1)                        │
│                   (Sepolia Testnet Initially)                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              ComputeGateway.sol                           │ │
│  │  • Job queue management                                   │ │
│  │  • Payment handling                                       │ │
│  │  • Result storage                                         │ │
│  │  • Event emission                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Events: JobRequested, JobCompleted, JobFailed                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BRIDGE LAYER                               │
│              (Python + Node.js on VPS/Cloud)                    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │           bridge_agent.py (Python)                        │ │
│  │  • Listen to Ethereum events (web3.py)                    │ │
│  │  • Job queue management                                   │ │
│  │  • Result submission                                      │ │
│  │  • Error handling & retries                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │        qubic_client.js (Node.js)                          │ │
│  │  • Qubic transaction building                             │ │
│  │  • Contract interaction                                   │ │
│  │  • Result parsing                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      QUBIC LAYER                                │
│                   (Qubic Testnet Initially)                     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ PrimeFinder  │  │ MonteCarlo   │  │ BlackScholes │        │
│  │    QPI       │  │    QPI       │  │    QPI       │        │
│  │  Contract    │  │  Contract    │  │  Contract    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  Execution: 676 validators (451+ quorum)                       │
│  Result: Cryptographically verified                            │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  User   │                 │Ethereum │                 │  Qubic  │
│(Browser)│                 │Contract │                 │ Network │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │ 1. Submit Job + ETH       │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │ 2. Emit JobRequested      │
     │                           │      Event                │
     │                           ├───────────┐               │
     │                           │           │               │
     │                           │           ▼               │
     │                           │    ┌─────────────┐        │
     │                           │    │   Bridge    │        │
     │                           │    │   Agent     │        │
     │                           │    └──────┬──────┘        │
     │                           │           │               │
     │                           │           │ 3. Call QPI   │
     │                           │           ├──────────────>│
     │                           │           │               │
     │                           │           │ 4. Execute    │
     │                           │           │    (451+ val.)│
     │                           │           │               │
     │                           │           │ 5. Return     │
     │                           │           │    Result     │
     │                           │           │<──────────────┤
     │                           │           │               │
     │                           │ 6. Submit │               │
     │                           │    Result │               │
     │                           │<──────────┘               │
     │                           │                           │
     │ 7. Poll for Status        │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │ 8. Return Result          │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │ 9. Verify on Explorers    │                           │
     ├──────────────────────────────────────────────────────>│
     │                           │                           │
```

---

## Technology Stack

### Frontend Application

| Layer | Technology | Version | Purpose | Decision Rationale |
|-------|------------|---------|---------|-------------------|
| **Framework** | Next.js | 14.x (App Router) | React framework | Modern, SSR support, Vercel integration |
| **Language** | TypeScript | 5.x | Type safety | Catch errors at compile time |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS | Rapid development, consistent design |
| **Web3 Provider** | wagmi | Latest | Ethereum hooks | Type-safe, React Query integration |
| **Wallet UI** | RainbowKit | Latest | Wallet connection | Best UX for wallet connect |
| **Ethereum Client** | viem | Latest | Ethereum interactions | Lightweight, TypeScript-first |
| **State Management** | TanStack Query | 5.x | Async state | Perfect for blockchain polling |
| **Animations** | Framer Motion | Latest | UI animations | Smooth, declarative animations |
| **Icons** | Lucide React | Latest | Icon library | Clean, consistent icons |
| **HTTP Client** | fetch (native) | - | API calls | Built-in, no dependencies |

**Why Next.js 14 App Router?**
- Server Components for better performance
- Built-in API routes for backend needs
- Excellent TypeScript support
- Vercel deployment is trivial
- Modern React patterns (Suspense, Streaming)

**Why wagmi + viem?**
- Type-safe contract interactions
- Automatic ABI type generation
- Built-in caching and state management
- Better than ethers.js for React apps

### Smart Contracts (Ethereum)

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Language** | Solidity | ^0.8.20 | Smart contracts |
| **Framework** | Hardhat | Latest | Development framework |
| **Testing** | Hardhat + Chai | Latest | Contract testing |
| **Libraries** | OpenZeppelin | 5.x | Secure contract primitives |
| **Verification** | Hardhat Verify | Latest | Etherscan verification |
| **Network** | Sepolia | - | Ethereum testnet |

**Why Hardhat over Foundry?**
- JavaScript/TypeScript ecosystem integration
- Easier for full-stack developers
- Better TypeScript plugin support
- More familiar to team if coming from web dev

### Qubic Contracts (Compute Layer)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Language** | C++ | QPI contract development |
| **Framework** | QPI (Qubic Programming Interface) | Contract structure |
| **Library** | @qubic-lib/qubic-ts-library | TypeScript client |
| **CLI** | qubic-cli | Contract deployment |
| **Network** | Qubic Testnet | Initial deployment |

**QPI Contract Structure:**
```cpp
// Each function needs:
struct FunctionName_input { /* parameters */ };
struct FunctionName_output { /* results */ };
PUBLIC_FUNCTION(functionName) { /* logic */ }
REGISTER_USER_FUNCTIONS_AND_PROCEDURES { /* registration */ }
```

### Bridge Agent (Middleware)

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Core Language** | Python | 3.10+ | Main orchestration |
| **Ethereum Client** | web3.py | Latest | Ethereum interactions |
| **Qubic Client** | Node.js subprocess | 18+ | Qubic interactions (via ts-library) |
| **Queue** | asyncio | Built-in | Job queue management |
| **Logging** | Python logging | Built-in | Debug and monitoring |
| **Config** | YAML + python-dotenv | Latest | Configuration management |
| **HTTP Server** | FastAPI (optional) | Latest | Health checks, API |

**Why Python + Node.js Hybrid?**
- Python: Excellent web3.py library for Ethereum
- Node.js: Only official Qubic TypeScript library
- Bridge spawns Node.js as subprocess for Qubic calls
- Keeps concerns separated and maintainable

### Infrastructure & Deployment

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Hosting** | Vercel | Next.js deployment |
| **Bridge Hosting** | AWS EC2 / DigitalOcean | VPS for bridge agent |
| **Docker** | Docker + Compose | Bridge containerization |
| **CI/CD** | GitHub Actions | Automated testing & deployment |
| **Monitoring** | CloudWatch / Logs | System monitoring |
| **Version Control** | Git + GitHub | Code repository |

### Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Primary IDE |
| **MetaMask** | Wallet testing |
| **Hardhat Console** | Contract debugging |
| **Qubic Explorer** | Transaction verification |
| **Etherscan** | Ethereum verification |
| **Postman** | API testing |

---

## Required Tools & Setup

### For All Developers

```bash
# Node.js & Package Manager
node --version  # Should be v18+
npm --version   # or yarn/pnpm

# Git
git --version

# Code Editor
code --version  # VS Code recommended
```

### Backend Engineer 1 (Ethereum/Solidity)

#### Required Tools

```bash
# Node.js v18+
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Hardhat (installed per project)
npm install --save-dev hardhat

# Solidity Extension for VS Code
# Install: "Solidity" by Juan Blanco
```

#### Required Accounts

1. **Infura Account** → https://infura.io
   - Get Sepolia RPC URL
   - Save API key

2. **Etherscan Account** → https://etherscan.io
   - Get API key for contract verification

3. **MetaMask Wallet**
   - Create dedicated development wallet
   - **Never use personal wallet with funds**
   - Get test ETH from Sepolia faucet

#### Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Hardhat project initialized
- [ ] `.env` file created (DO NOT COMMIT)
- [ ] Infura Sepolia RPC URL configured
- [ ] Development wallet created
- [ ] Sepolia test ETH obtained (https://sepoliafaucet.com)
- [ ] Etherscan API key obtained

#### Environment Variables (Ethereum)

```bash
# .env (DO NOT COMMIT TO GIT)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

### Backend Engineer 2 (Qubic Integration)

#### Required Tools

```bash
# Node.js v18+
nvm install 18
nvm use 18

# Python 3.10+
python3 --version  # Should be 3.10+
pip3 --version

# Qubic TypeScript Library
npm install @qubic-lib/qubic-ts-library

# Python dependencies
pip3 install web3 pyyaml python-dotenv asyncio
```

#### Required Accounts & Assets

1. **Qubic Testnet Wallet**
   - Generate seed (55 characters, A-Z only)
   - Get testnet tokens from: https://qforge.qubicdev.com/
   - **Backup seed securely - can't be recovered**

2. **Qubic Explorer Access**
   - Testnet: https://testnet.explorer.qubic.org
   - Mainnet: https://explorer.qubic.org

#### Setup Checklist

- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Qubic TypeScript library installed
- [ ] Qubic wallet created with testnet tokens
- [ ] Qubic RPC connectivity tested
- [ ] Bridge agent dependencies installed

#### Environment Variables (Qubic)

```bash
# .env (DO NOT COMMIT TO GIT)
QUBIC_RPC_URL=https://testnet-rpc.qubicdev.com/
QUBIC_SEED=YOUR_55_CHARACTER_SEED_HERE
PRIME_FINDER_CONTRACT_ID=AAAA...  # After deployment
MONTE_CARLO_CONTRACT_ID=BBBB...   # After deployment
```

#### Qubic Development Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| **Core Repo** | https://github.com/qubic/core | QPI contract examples |
| **TypeScript Library** | https://github.com/qubic/ts-library | Client library |
| **Documentation** | https://docs.qubic.org | Official docs |
| **Explorer** | https://testnet.explorer.qubic.org | Testnet explorer |
| **Faucet** | https://qforge.qubicdev.com/ | Get testnet tokens |

### Frontend Engineer

#### Required Tools

```bash
# Node.js v18+
nvm install 18
nvm use 18

# Next.js (installed per project)
npx create-next-app@latest

# VS Code Extensions
# - Tailwind CSS IntelliSense
# - ES7+ React/Redux/React-Native snippets
# - Prettier - Code formatter
```

#### Required Accounts

1. **WalletConnect Project** → https://cloud.walletconnect.com
   - Create project
   - Get Project ID for RainbowKit

2. **Vercel Account** → https://vercel.com
   - Connect GitHub
   - Enable auto-deploy

#### Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Next.js 14 project initialized
- [ ] Tailwind CSS configured
- [ ] WalletConnect Project ID obtained
- [ ] MetaMask installed for testing
- [ ] `.env.local` created (DO NOT COMMIT)

#### Environment Variables (Frontend)

```bash
# .env.local (DO NOT COMMIT TO GIT)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_COMPUTE_GATEWAY_ADDRESS=0x...  # After deployment
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key  # Or Infura
```

### DevOps Engineer

#### Required Tools

```bash
# Docker
docker --version
docker-compose --version

# Cloud CLI (choose one)
aws --version  # AWS CLI
doctl version  # DigitalOcean CLI

# SSH
ssh-keygen -t ed25519 -C "tengen-bridge"
```

#### Required Accounts

1. **Cloud Provider** (AWS or DigitalOcean)
   - Setup billing
   - Create VPS instance (2GB RAM minimum)

2. **Domain Provider** (optional)
   - Register domain for bridge API

#### Setup Checklist

- [ ] Docker installed and running
- [ ] Cloud VPS provisioned
- [ ] SSH access configured
- [ ] GitHub Actions secrets configured
- [ ] Docker Hub account (optional)

---

## Development Phases

### Phase 1: Foundation (Hours 0-12)

**Goal:** Core infrastructure deployed and testable independently

#### Deliverables

- [x] **Project Structure** (All)
  - GitHub repository created
  - Directory structure established
  - `.gitignore` configured
  - README.md with setup instructions

- [ ] **Ethereum Smart Contract** (Backend 1)
  - ComputeGateway.sol written
  - Unit tests passing
  - Deployed to Sepolia
  - Verified on Etherscan
  - ABI exported

- [ ] **Qubic QPI Contracts** (Backend 2)
  - PrimeFinder.h written
  - Deployed to Qubic testnet
  - Contract ID documented
  - Test call successful

- [ ] **Frontend Foundation** (Frontend)
  - Next.js project initialized
  - Wallet connection working
  - Basic UI layout complete
  - Design system configured

- [ ] **Infrastructure** (DevOps)
  - CI/CD pipeline configured
  - Docker setup for bridge
  - VPS provisioned

#### Success Criteria

- ✅ Smart contract on Sepolia accepting transactions
- ✅ Qubic contract callable from TypeScript
- ✅ Frontend can connect wallet and read contract
- ✅ All components can be tested independently

### Phase 2: Bridge Development (Hours 12-24)

**Goal:** Bridge agent connecting Ethereum ↔ Qubic

#### Deliverables

- [ ] **Bridge Agent Core** (Backend 2)
  - Python event listener working
  - Qubic client module complete
  - Job queue management
  - Basic error handling

- [ ] **Contract Integration** (Backend 1)
  - Result submission function tested
  - Bridge wallet authorized
  - Event emission verified

- [ ] **Frontend Job Submission** (Frontend)
  - Function selection UI
  - Parameter forms
  - Transaction submission
  - Price estimation

- [ ] **Deployment** (DevOps)
  - Bridge agent deployed to VPS
  - Monitoring configured
  - Logs accessible

#### Success Criteria

- ✅ Ethereum event triggers Qubic execution
- ✅ Qubic result returns to bridge
- ✅ Frontend can submit jobs
- ✅ Bridge runs reliably for 1+ hour

### Phase 3: End-to-End Integration (Hours 24-36)

**Goal:** Complete flow working, results verifiable

#### Deliverables

- [ ] **Full Integration** (Backend 2)
  - Result submission to Ethereum
  - Complete round-trip working
  - All functions (Prime, MonteCarlo) deployed

- [ ] **Frontend Completion** (Frontend)
  - Status monitoring UI
  - Result display
  - Explorer links
  - Error handling

- [ ] **Testing** (All)
  - Multiple successful runs
  - Edge cases handled
  - Performance acceptable

#### Success Criteria

- ✅ Ethereum → Qubic → Ethereum flow works
- ✅ Results visible on both explorers
- ✅ UI shows accurate status
- ✅ System stable for 3+ consecutive runs

### Phase 4: Demo & Polish (Hours 36-48)

**Goal:** Demo-ready system with backup plan

#### Deliverables

- [ ] **UI Polish** (Frontend)
  - Animations smooth
  - Mobile responsive
  - Error messages clear

- [ ] **Documentation** (All)
  - API documentation
  - Setup instructions
  - Architecture diagrams

- [ ] **Demo Preparation** (DevOps)
  - Demo video recorded
  - Wallets funded
  - Backup plan ready
  - Submission materials prepared

#### Success Criteria

- ✅ Demo works reliably (3/3 dry runs)
- ✅ Backup video ready
- ✅ All documentation complete
- ✅ Submission ready 2 hours before deadline

---

## Current State

**Date:** December 7, 2025
**Phase:** Active Development - M2 Complete, Ready for M3 (Bridge)

### Completed

- [x] M0: Project Setup & Infrastructure (100%)
- [x] M1: Ethereum Smart Contracts (100%)
  - [x] ComputeGateway.sol deployed to Sepolia: `0x3B157f99356823497d5f0Dcb9840E500Be9F9933`
  - [x] Contract verified on Etherscan
  - [x] 29/29 tests passing
  - [x] ABI exported to bridge and frontend
  - [x] Complete documentation (contracts/README.md)
- [x] M2: Qubic Smart Contracts (100% - Proof of Concept)
  - [x] PrimeFinder.h written (130 lines QPI contract)
  - [x] MonteCarlo.h written (250+ lines QPI contract)
  - [x] Development environment setup (Node, Python, qubic-core, qubic-ts-library)
  - [x] RPC connection tested and working
  - [x] CLI tools created (test-rpc.js, check-balance.js, get-identity.js)
  - [x] Comprehensive README.md documentation
  - [x] Deployment process researched and documented
  - ⚠️ **CRITICAL FINDING:** Qubic contracts require governance deployment (2-3 weeks, not feasible for hackathon)
- [x] PRD written (TENGEN_BRIDGE_PRD.md)
- [x] Architecture planned (PLANNING.md)
- [x] Claude Code context prepared (CLAUDE.md)
- [x] Technology stack decided
- [x] Team roles assigned
- [x] Hardhat environment configured
- [x] Development wallet created and funded (0.05 Sepolia ETH)
- [x] Alchemy RPC access configured
- [x] Etherscan API key configured

### Development Networks & Wallets

**Local Development (Hardhat Network):**
- Network: `hardhat` (local)
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Hardhat default account #0)
- Balance: 10,000 ETH (unlimited)
- Use: Local testing, rapid iteration, contract development
- Command: `npx hardhat test` or `npx hardhat run scripts/deploy.js`

**Live Testnet (Sepolia):**
- Network: `sepolia`
- Address: `0xC6371B0Ba0cE3B452dc460432462840d96E0A715` (Your actual wallet)
- Balance: 0.05 ETH (real testnet ETH from Google Cloud Web3 faucet)
- RPC: Alchemy (https://eth-sepolia.g.alchemy.com/v2/...)
- Use: Final deployment, public testing, Etherscan verification
- Command: `npx hardhat run scripts/deploy.js --network sepolia`

### In Progress

- [ ] Nothing (M2 complete, ready for M3)

### Blocked

- ⚠️ Qubic contract deployment (requires governance proposal - 2-3 weeks)
  - **Impact:** Cannot deploy actual Qubic contracts for hackathon
  - **Mitigation:** Bridge will simulate Qubic execution for demo
  - **Reference:** qubic-core/doc/contracts.md - Deployment section

### Next Milestone

**M3: Bridge Agent Development** (ADJUSTED STRATEGY)
- Python bridge agent (Ethereum event listener)
- Node.js Qubic client (for potential future use)
- **Simulated Qubic execution** for hackathon demo
- Result submission to Ethereum
- Error handling and retries

---

## Next Actions

### For Backend Engineer 1 (Ethereum)

```bash
# 1. Initialize Hardhat project
mkdir contracts && cd contracts
npm init -y
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# 2. Initialize Hardhat
npx hardhat

# 3. Configure for Sepolia
# Edit hardhat.config.js with Sepolia network

# 4. Write ComputeGateway.sol
# See PRD for contract specifications

# 5. Write tests
# See CLAUDE.md for testing patterns

# 6. Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 7. Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# 8. Export ABI
# Copy from artifacts/ to shared location
```

### For Backend Engineer 2 (Qubic)

```bash
# 1. Setup Qubic development environment
git clone https://github.com/qubic/core.git
cd core

# 2. Study QPI examples
# Look at src/contracts/*.h files

# 3. Create Qubic wallet
# Generate 55-char seed, get testnet tokens

# 4. Test RPC connection
curl https://testnet-rpc.qubicdev.com/v1/status

# 5. Write PrimeFinder.h
# Follow QPI contract patterns

# 6. Setup TypeScript client
npm install @qubic-lib/qubic-ts-library

# 7. Deploy contract
# Use qubic-cli or ts-library

# 8. Test contract call
node qubic_client_cli.js call-prime-finder 1000 10
```

### For Frontend Engineer

```bash
# 1. Create Next.js project
npx create-next-app@latest frontend --typescript --tailwind --app

# 2. Install Web3 dependencies
cd frontend
npm install wagmi viem @rainbow-me/rainbowkit

# 3. Configure RainbowKit
# Create app/providers.tsx

# 4. Setup Tailwind with design system
# Configure tailwind.config.js with PRD colors

# 5. Build basic layout
# Header, Footer, Container components

# 6. Test wallet connection
npm run dev
# Open http://localhost:3000
```

### For DevOps Engineer

```bash
# 1. Create GitHub repository
gh repo create tengen-bridge --public

# 2. Setup CI/CD
# Create .github/workflows/ci.yml

# 3. Create Docker configuration
# Write Dockerfile for bridge agent

# 4. Provision VPS
# AWS EC2 or DigitalOcean droplet (2GB RAM)

# 5. Configure Vercel
# Connect GitHub repo to Vercel
```

---

## Critical Paths

### Path 1: Qubic Contract Deployment (CRITICAL)

**Why Critical:** Qubic is the unique value proposition. Everything depends on this working.

```
Setup Qubic Wallet → Write QPI Contract → Deploy to Testnet → Verify on Explorer
     (Hour 3)              (Hour 5)           (Hour 10)          (Hour 11)
```

**Blockers:**
- Qubic testnet down (use backup seed)
- TypeScript library issues (check GitHub issues)
- Contract deployment fails (retry, check logs)

**Mitigation:**
- Start early (Hour 0)
- Use provided test seed if faucet fails
- Document all contract IDs immediately

### Path 2: Bridge Agent (HIGH PRIORITY)

**Why Important:** This is the "glue" between chains.

```
Ethereum Contract → Bridge Listener → Qubic Client → Result Submission
   (Hour 12)          (Hour 18)        (Hour 20)        (Hour 22)
```

**Blockers:**
- Event detection not working (check RPC)
- Qubic calls failing (verify contract ID)
- Result submission rejected (check authorization)

**Mitigation:**
- Test components independently first
- Use CLI wrapper for Qubic testing
- Implement comprehensive logging

### Path 3: Frontend Integration (MEDIUM PRIORITY)

**Why Important:** This is what judges will see.

```
Wallet Connect → Job Submission → Status Polling → Result Display
  (Hour 6)         (Hour 20)        (Hour 28)       (Hour 32)
```

**Blockers:**
- Wallet not connecting (check WalletConnect ID)
- Transaction failing (verify ABI matches)
- Polling not working (check event structure)

**Mitigation:**
- Test with multiple wallets early
- Use Hardhat console for contract debugging
- Mock bridge responses for UI development

---

## Decision Log

### ADR-001: Next.js App Router vs Pages Router

**Date:** 2025-12-07  
**Status:** Accepted  
**Decision:** Use Next.js 14 App Router  
**Rationale:**
- Modern React patterns (Server Components)
- Better TypeScript support
- Simpler data fetching
- Future-proof

**Consequences:**
- Team needs to learn new patterns
- Some libraries not yet updated
- But: Better long-term maintainability

### ADR-002: wagmi + viem vs ethers.js

**Date:** 2025-12-07  
**Status:** Accepted  
**Decision:** Use wagmi + viem for Ethereum interactions  
**Rationale:**
- Type-safe contract interactions
- Built-in React hooks
- Better caching
- Modern, actively maintained

**Consequences:**
- Smaller community than ethers.js
- But: Superior DX for React apps

### ADR-003: Python + Node.js Hybrid Bridge vs Pure Node.js

**Date:** 2025-12-07  
**Status:** Accepted  
**Decision:** Use Python for bridge core + Node.js subprocess for Qubic  
**Rationale:**
- Python has excellent web3.py
- Qubic only has TypeScript library
- Spawning subprocess keeps concerns separated

**Consequences:**
- More complex than single language
- But: Uses best tool for each job

### ADR-004: Sepolia vs Goerli Testnet

**Date:** 2025-12-07  
**Status:** Accepted  
**Decision:** Use Sepolia testnet  
**Rationale:**
- Goerli deprecated (shutting down)
- Sepolia is official replacement
- Better long-term support

### ADR-005: Docker for Bridge Deployment

**Date:** 2025-12-07  
**Status:** Accepted  
**Decision:** Containerize bridge agent with Docker  
**Rationale:**
- Consistent environment
- Easy deployment
- Simple rollback

**Consequences:**
- Requires Docker knowledge
- But: Industry standard, well-documented

---

## Known Constraints

### Technical Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| **Qubic Testnet Stability** | May have downtime | Use backup seed, test early |
| **Ethereum Gas Costs** | Sepolia faucets limited | Get ETH early, optimize gas |
| **Bridge Single Point of Failure** | If bridge down, system down | Implement health checks, auto-restart |
| **Qubic TypeScript Library Maturity** | May have bugs | Check GitHub issues, have workarounds |
| **48-Hour Timeline** | Limited time for iteration | Prioritize ruthlessly, ship MVP |

### Resource Constraints

| Resource | Limit | Strategy |
|----------|-------|----------|
| **Team Size** | 4 people | Clear role separation, minimal overlap |
| **Time** | 48 hours | Work in parallel, merge frequently |
| **Budget** | Minimal | Use free tiers, testnets only |
| **Testnet Tokens** | Limited from faucets | Use backup seed if needed |

### Scope Constraints (MVP Only)

**In Scope for Hackathon:**
- 