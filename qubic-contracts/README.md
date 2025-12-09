# Tengen Bridge - Qubic QPI Contracts

This directory contains the Qubic QPI (Qubic Programming Interface) smart contracts for compute-intensive operations.

## 📋 Contracts Overview

### PrimeFinder.h

Finds the Nth prime number after a given starting point using optimized trial division.

**Functions:**
- `findPrime(startNumber, count)` - Find the Nth prime after startNumber
- `getStats()` - Get contract statistics

**Use Case:** Cryptographic operations, number theory computations

### MonteCarlo.h

Performs Monte Carlo simulations for portfolio risk analysis using geometric Brownian motion.

**Functions:**
- `calculateRisk(numSimulations, portfolioValue, volatility, timeHorizon)` - Run risk simulation
- `getStats()` - Get contract statistics

**Use Case:** Financial risk modeling, options pricing, portfolio optimization

## 🏗️ QPI Contract Structure

All QPI contracts follow this pattern:

```cpp
// 1. State structure (persistent storage)
struct CONTRACT_STATE {
    uint64 someData;
};

// 2. Input structure
struct functionName_input {
    uint64 param1;
    uint64 param2;
};

// 3. Output structure
struct functionName_output {
    uint64 result1;
    uint64 result2;
};

// 4. Function implementation
PUBLIC_FUNCTION(functionName) {
    // Access: input, output, state, qpi
    output.result1 = input.param1 + input.param2;
    state.someData++;
}

// 5. Registration
REGISTER_USER_FUNCTIONS_AND_PROCEDURES {
    REGISTER_USER_FUNCTION(functionName, 1);
}
```

## 🚀 Deployment

### Prerequisites

- Qubic wallet with testnet tokens
- Node.js v18+
- @qubic-lib/qubic-ts-library

### Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Qubic seed
```

### Deploy to Testnet

```bash
# Deploy contracts
node deploy/deploy.js

# Contract IDs will be saved to deploy/contract_ids.json
```

## 📊 Contract Details

### PrimeFinder

**Algorithm:** Optimized trial division with 6k±1 optimization

**Performance:**
- Finding 10th prime after 1000: ~100-200 iterations
- Finding 100th prime after 10000: ~1000-2000 iterations
- Max iterations: 1,000,000 (safety limit)

**Input Parameters:**
- `startNumber`: Starting point (minimum 2)
- `count`: Which prime to find (1st, 2nd, 3rd, etc.)

**Output:**
- `primeNumber`: The found prime
- `iterations`: Number of checks performed
- `totalCalls`: Total contract invocations

### MonteCarlo

**Algorithm:** Geometric Brownian Motion with Box-Muller transform

**Performance:**
- 1,000 simulations: ~0.1 seconds
- 10,000 simulations: ~1 second
- 100,000 simulations: ~10 seconds

**Input Parameters:**
- `numSimulations`: 100 to 100,000 (recommended: 10,000)
- `portfolioValue`: In basis points (100000 = $1000.00)
- `volatility`: Annual volatility in basis points (2000 = 20%)
- `timeHorizon`: Days (e.g., 30, 90, 365)

**Output:**
- `meanReturn`: Average return across simulations (basis points)
- `valueAtRisk`: 95% VaR - maximum loss at 95% confidence (basis points)
- `sharpeRatio`: Risk-adjusted return metric (scaled by 10000)
- `simulationsRun`: Actual simulations completed

## 🧪 Testing

### Test with CLI

```bash
# Test PrimeFinder
node cli/test-prime.js 1000 10

# Test MonteCarlo
node cli/test-monte-carlo.js 10000 100000 2000 30
```

### Test from JavaScript

```javascript
const { QubicHelper } = require('@qubic-lib/qubic-ts-library');

// Initialize
const helper = new QubicHelper();
await helper.initialize();

// Call PrimeFinder
const result = await helper.callContract(
    CONTRACT_ID,
    1,  // Function ID
    { startNumber: 1000, count: 10 }
);

console.log(`Prime found: ${result.primeNumber}`);
```

## 📁 Directory Structure

```
qubic-contracts/
├── src/
│   ├── PrimeFinder.h           # Prime number finder contract
│   └── MonteCarlo.h            # Monte Carlo simulation contract
├── deploy/
│   ├── deploy.js               # Deployment script
│   └── contract_ids.json       # Deployed contract IDs (created after deployment)
├── cli/
│   └── (CLI testing tools)
├── package.json                # Node.js dependencies
├── .env.example                # Environment template
└── README.md                   # This file
```

## 🔐 Environment Variables

```env
# Qubic Configuration
QUBIC_SEED=your-55-character-seed-here
QUBIC_RPC_URL=https://testnet-rpc.qubicdev.com/

# Contract IDs (after deployment)
PRIME_FINDER_CONTRACT_ID=AAAA...
MONTE_CARLO_CONTRACT_ID=BBBB...
```

## 💰 Cost Comparison

| Operation | Ethereum Gas (Sepolia) | Qubic | Savings |
|-----------|------------------------|-------|---------|
| **Prime Finding** | ~500,000 gas (~$0.02) | ~0.000001 QUBIC (~$0.0000008) | 25,000x cheaper |
| **Monte Carlo (10k sims)** | Would exceed block gas limit | ~0.00001 QUBIC (~$0.000008) | Impossible on ETH! |

## 🌐 Network Information

**Testnet RPC:** https://testnet-rpc.qubicdev.com/
**Explorer:** https://testnet.explorer.qubic.org/
**Faucet:** https://qforge.qubicdev.com/

## 📖 QPI Resources

- **Qubic Docs:** https://docs.qubic.org
- **Core Repository:** https://github.com/qubic/core
- **TypeScript Library:** https://github.com/qubic/ts-library
- **QPI Examples:** https://github.com/qubic/core/tree/main/src/contracts

## ⚠️ Important Notes

### Contract Deployment
- Contracts cannot be updated after deployment
- Test thoroughly before deploying to mainnet
- Contract IDs are deterministic based on code hash

### State Persistence
- State is maintained across function calls
- State updates are atomic
- Use uint64 for all numeric types (QPI limitation)

### Performance Considerations
- Optimize for minimal iterations
- Avoid unbounded loops
- Use safety limits to prevent timeouts
- Consider gas costs for complex computations

### Security
- Validate all inputs
- Use safety limits on loops
- Be aware of integer overflow (uint64 max: 18,446,744,073,709,551,615)
- Test edge cases thoroughly

## 🔄 Development Workflow

1. **Write Contract** → Edit `.h` files in `src/`
2. **Local Testing** → Test logic with mock data
3. **Deploy to Testnet** → `node deploy/deploy.js`
4. **Test on Testnet** → Use CLI tools or JavaScript
5. **Verify Results** → Check on Qubic explorer
6. **Document IDs** → Save to `contract_ids.json`
7. **Integrate** → Use IDs in bridge configuration

## 🐛 Troubleshooting

### "Connection timeout"
- Check RPC URL: `curl https://testnet-rpc.qubicdev.com/v1/status`
- Try backup RPC if available
- Verify network connectivity

### "Insufficient balance"
- Get testnet tokens from faucet: https://qforge.qubicdev.com/
- Check balance on explorer
- Use backup test seed if needed

### "Contract call failed"
- Verify contract ID is correct (55 characters, A-Z)
- Check input data encoding matches struct
- Ensure function ID is correct
- Review contract logic for errors

### "Invalid seed"
- Seed must be exactly 55 characters
- Only uppercase letters A-Z
- No special characters or numbers

## 📄 License

MIT License - See main project LICENSE file

---

**Project:** Tengen Bridge - Trustless Compute Coprocessor
**Network:** Ethereum ↔ Qubic
**Track:** Infrastructure & Middleware (Qubic Hack the Future)
