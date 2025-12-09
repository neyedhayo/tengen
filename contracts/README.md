# Tengen Bridge - Ethereum Smart Contracts

This directory contains the Ethereum smart contracts for the Tengen Bridge project, providing a trustless gateway for submitting compute jobs to the Qubic network.

## 📋 Contract Overview

### ComputeGateway.sol

The main entry point for users to submit computational jobs from Ethereum to Qubic.

**Key Features:**
- Job submission with fee validation
- Result submission from authorized bridge nodes
- Admin functions for fee and node management
- Comprehensive events for bridge monitoring
- OpenZeppelin security (Ownable + ReentrancyGuard)

## 🚀 Deployment Information

### Sepolia Testnet

**Contract Address:** `0x3B157f99356823497d5f0Dcb9840E500Be9F9933`

**Etherscan:** https://sepolia.etherscan.io/address/0x3B157f99356823497d5f0Dcb9840E500Be9F9933#code

**Network Details:**
- Chain ID: 11155111
- RPC: Alchemy (see `.env.example`)
- Minimum Fee: 0.001 ETH per job

**Deployer:** `0xC6371B0Ba0cE3B452dc460432462840d96E0A715`

## 📁 Project Structure

```
contracts/
├── src/
│   └── ComputeGateway.sol          # Main gateway contract
├── test/
│   └── ComputeGateway.test.js      # Comprehensive test suite (29 tests)
├── scripts/
│   ├── deploy.js                   # Deployment script
│   ├── check-balance.js            # Balance checker
│   └── test-connection.js          # RPC connection tester
├── abi/
│   └── ComputeGateway.json         # Contract ABI (for integration)
├── deployed-addresses.json         # Deployment addresses by network
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Dependencies
├── .env.example                    # Environment template
└── README.md                       # This file
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your keys:
# - SEPOLIA_RPC_URL (Alchemy/Infura)
# - PRIVATE_KEY (your wallet private key)
# - ETHERSCAN_API_KEY (for verification)
```

### Environment Variables

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

## 🧪 Testing

### Run All Tests

```bash
npx hardhat test
```

**Expected Output:**
```
  ComputeGateway
    ✔ 29 passing (2s)
```

### Run Tests with Gas Report

```bash
REPORT_GAS=true npx hardhat test
```

### Test Coverage

```bash
npx hardhat coverage
```

## 📦 Compilation

```bash
npx hardhat compile
```

**Output Location:** `artifacts/src/ComputeGateway.sol/ComputeGateway.json`

## 🚀 Deployment

### Deploy to Local Hardhat Network

```bash
npx hardhat run scripts/deploy.js
```

### Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Deployment will:**
1. Deploy ComputeGateway with 0.001 ETH minimum fee
2. Wait for 5 block confirmations
3. Save address to `deployed-addresses.json`
4. Display verification command

### Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "1000000000000000"
```

**Note:** The second parameter is minFeePerJob in wei (0.001 ETH = 1000000000000000 wei)

## 📊 Gas Costs

Based on test results (Sepolia testnet estimates):

| Function | Gas Cost | ~USD Cost (at $2000 ETH, 20 gwei) |
|----------|----------|-----------------------------------|
| **Deploy Contract** | 2,513,034 | ~$0.10 |
| **requestCompute()** | 197,144 | ~$0.008 |
| **submitResult()** | 189,113 | ~$0.008 |
| **markJobFailed()** | 121,607 | ~$0.005 |
| **authorizeComputeNode()** | 48,026 | ~$0.002 |
| **updateMinFee()** | 30,969 | ~$0.001 |
| **withdrawFees()** | 35,386 | ~$0.001 |

## 🔗 ABI Location

The contract ABI is exported to multiple locations for easy integration:

1. **Source:** `artifacts/src/ComputeGateway.sol/ComputeGateway.json` (full artifact)
2. **ABI Only:** `abi/ComputeGateway.json` (773 lines)
3. **Bridge:** `../bridge/ComputeGateway_abi.json`
4. **Frontend:** `../frontend/lib/contracts/ComputeGateway.json`

### Using the ABI

**JavaScript/TypeScript:**
```javascript
const ComputeGatewayABI = require('./abi/ComputeGateway.json');
const contract = new ethers.Contract(contractAddress, ComputeGatewayABI, signer);
```

**Python (for bridge):**
```python
import json
with open('ComputeGateway_abi.json') as f:
    abi = json.load(f)
contract = web3.eth.contract(address=contract_address, abi=abi)
```

## 📖 Contract API

### User Functions

#### `requestCompute(uint8 taskType, bytes calldata inputData)`
Submit a compute job to Qubic network.

**Parameters:**
- `taskType`: Type of computation (0=PrimeFinder, 1=MonteCarlo, etc.)
- `inputData`: ABI-encoded input parameters

**Requires:** `msg.value >= minFeePerJob`

**Returns:** `uint256 jobId`

**Example:**
```javascript
const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
  ["uint256", "uint256"],
  [1000, 10]  // startNumber, count
);

const tx = await contract.requestCompute(0, inputData, {
  value: ethers.parseEther("0.001")
});
```

### Bridge Functions (Authorized Nodes Only)

#### `submitResult(uint256 jobId, bytes calldata resultData)`
Submit computation result.

#### `markJobFailed(uint256 jobId, string calldata reason)`
Mark job as failed with reason.

### Admin Functions (Owner Only)

#### `authorizeComputeNode(address node)`
Authorize a bridge node to submit results.

#### `revokeComputeNode(address node)`
Revoke bridge node authorization.

#### `updateMinFee(uint256 newMinFee)`
Update minimum fee per job.

#### `withdrawFees()`
Withdraw accumulated fees to owner.

### View Functions

#### `getJob(uint256 jobId) → Job memory`
Get complete job details.

#### `getJobStatus(uint256 jobId) → JobStatus`
Get job status only.

#### `getJobResult(uint256 jobId) → bytes memory`
Get result data (only for completed jobs).

#### `getStats() → (uint256, uint256, uint256, uint256)`
Get contract statistics (nextJobId, totalCompleted, totalFailed, minFee).

## 🔐 Security Features

- **OpenZeppelin Ownable:** Role-based access control
- **ReentrancyGuard:** Protection against reentrancy attacks
- **Custom Errors:** Gas-efficient error handling
- **Authorization Checks:** Only authorized nodes can submit results
- **Fee Validation:** Ensures minimum fee is paid

## 🧰 Utility Scripts

### Check Balance

```bash
# Local Hardhat network
npx hardhat run scripts/check-balance.js

# Sepolia testnet
npx hardhat run scripts/check-balance.js --network sepolia
```

### Test Connection

```bash
npx hardhat run scripts/test-connection.js
```

## 📝 Development Workflow

### Local Development (Recommended)

1. **Write Contract** → Edit `src/ComputeGateway.sol`
2. **Write Tests** → Add to `test/ComputeGateway.test.js`
3. **Run Tests** → `npx hardhat test`
4. **Iterate** → Repeat until all tests pass
5. **Deploy Locally** → `npx hardhat run scripts/deploy.js`
6. **Test Locally** → Interact with local deployment

### Sepolia Deployment (Final Step)

1. **Ensure Tests Pass** → `npx hardhat test` (29/29 passing)
2. **Fund Wallet** → Ensure 0.05+ ETH on Sepolia
3. **Deploy** → `npx hardhat run scripts/deploy.js --network sepolia`
4. **Verify** → `npx hardhat verify --network sepolia <ADDRESS> "1000000000000000"`
5. **Test on Testnet** → Submit test transactions
6. **Export ABI** → ABI automatically copied to bridge/frontend

## 🐛 Troubleshooting

### "Insufficient funds" error
- Check balance: `npx hardhat run scripts/check-balance.js --network sepolia`
- Get testnet ETH: https://sepoliafaucet.com or Google Cloud Web3 faucet

### "Invalid nonce" error
- Reset account nonce in MetaMask: Settings → Advanced → Reset Account

### "Contract verification failed"
- Ensure constructor args match: `"1000000000000000"` (0.001 ETH in wei)
- Wait 1-2 minutes after deployment before verifying

### "Transaction reverted" errors
- Check you have sufficient fee: `msg.value >= minFeePerJob`
- Verify you're calling from authorized address (for bridge functions)
- Ensure job exists and is in valid state

## 📚 Additional Resources

- **Hardhat Docs:** https://hardhat.org/docs
- **OpenZeppelin Contracts:** https://docs.openzeppelin.com/contracts
- **Etherscan Sepolia:** https://sepolia.etherscan.io
- **Sepolia Faucet:** https://sepoliafaucet.com

## 🔄 Version History

### v1.0.0 (December 7, 2025)
- Initial deployment to Sepolia
- Contract address: `0x3B157f99356823497d5f0Dcb9840E500Be9F9933`
- 29 comprehensive tests passing
- Verified on Etherscan

## 📄 License

MIT License - See main project LICENSE file

---

**Project:** Tengen Bridge - Trustless Compute Coprocessor
**Network:** Ethereum ↔ Qubic
**Track:** Infrastructure & Middleware (Qubic Hack the Future)
