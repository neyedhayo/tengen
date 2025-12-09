// MonteCarlo.h - Qubic QPI Contract for Monte Carlo risk simulations
// Part of Tengen Bridge - Trustless Compute Coprocessor

#pragma once

#include "qpi.h"

// Contract state (persistent storage)
struct CONTRACT_STATE
{
    uint64 totalSimulations;     // Total number of simulations run
    uint64 totalCalls;           // Total number of contract calls
    uint64 lastSeed;             // Last random seed used
};

// Input structure for calculateRisk function
struct calculateRisk_input
{
    uint64 numSimulations;    // Number of Monte Carlo simulations to run
    uint64 portfolioValue;    // Initial portfolio value (in basis points, e.g., 100000 = $1000.00)
    uint64 volatility;        // Annual volatility in basis points (e.g., 2000 = 20%)
    uint64 timeHorizon;       // Time horizon in days
};

// Output structure for calculateRisk function
struct calculateRisk_output
{
    uint64 meanReturn;        // Mean portfolio return (basis points)
    uint64 valueAtRisk;       // 95% Value at Risk (basis points)
    uint64 sharpeRatio;       // Sharpe Ratio (scaled by 10000)
    uint64 simulationsRun;    // Actual number of simulations completed
};

// Simple Linear Congruential Generator for random numbers
// Note: For production, use a more sophisticated RNG
static uint64 lcg_seed = 0;

static void initRandom(uint64 seed)
{
    lcg_seed = seed;
}

static uint64 randomUint64()
{
    // LCG parameters (from Numerical Recipes)
    lcg_seed = (lcg_seed * 1664525ULL + 1013904223ULL);
    return lcg_seed;
}

// Generate a random number between 0 and 1 (scaled by 10000 for precision)
static uint64 randomScaled()
{
    return (randomUint64() % 10000);
}

// Box-Muller transform for generating normal distribution
// Returns a normally distributed random variable (scaled by 10000)
static int64 randomNormal(int64 mean, uint64 stdDev)
{
    // Simplified Box-Muller using scaled integers
    uint64 u1 = randomScaled();
    uint64 u2 = randomScaled();

    // Prevent log(0)
    if (u1 == 0) u1 = 1;

    // Simplified normal approximation for integer math
    // Using central limit theorem approximation
    int64 sum = 0;
    for (int i = 0; i < 12; i++)
    {
        sum += randomScaled();
    }

    // Central Limit Theorem: sum of 12 uniform(0,1) ~ normal(6, 1)
    // Adjust to desired mean and stdDev
    int64 z = (sum - 60000) / 10;  // Normalize to ~N(0,1) * 1000
    int64 result = mean + (z * (int64)stdDev) / 1000;

    return result;
}

// Simulate one portfolio return path
static int64 simulateReturn(uint64 portfolioValue, uint64 volatility, uint64 timeHorizon)
{
    // Simple geometric Brownian motion model
    // Return = μ*t + σ*sqrt(t)*Z
    // Where Z ~ N(0,1)

    // Assume risk-free rate of 0 for simplicity (can be parameterized)
    int64 drift = 0;

    // Scale time by days/365
    uint64 scaledTime = (timeHorizon * 10000) / 365;

    // volatility * sqrt(time) * randomNormal
    int64 randomComponent = randomNormal(0, volatility);
    int64 timeScaledVol = (randomComponent * (int64)scaledTime) / 10000;

    // Calculate return as percentage of portfolio value
    int64 portfolioReturn = drift + timeScaledVol;

    return portfolioReturn;
}

// Main function to calculate portfolio risk using Monte Carlo simulation
PUBLIC_FUNCTION(calculateRisk)
{
    // Validate input
    if (input.numSimulations < 100)
    {
        input.numSimulations = 100;  // Minimum simulations
    }

    if (input.numSimulations > 100000)
    {
        input.numSimulations = 100000;  // Maximum to prevent timeout
    }

    if (input.portfolioValue == 0)
    {
        input.portfolioValue = 100000;  // Default $1000
    }

    if (input.volatility == 0)
    {
        input.volatility = 2000;  // Default 20% volatility
    }

    if (input.timeHorizon == 0)
    {
        input.timeHorizon = 30;  // Default 30 days
    }

    // Initialize random seed based on tick + state
    uint64 seed = qpi.tick() + state.totalSimulations + state.totalCalls;
    initRandom(seed);
    state.lastSeed = seed;

    // Run Monte Carlo simulations
    int64 sumReturns = 0;
    int64 sumSquaredReturns = 0;
    int64 minReturn = 2147483647;  // Large positive number
    int64 maxReturn = -2147483648; // Large negative number

    // Array to store all returns (for VaR calculation)
    // Note: In production, use dynamic allocation or fixed large array
    #define MAX_SIMS 100000
    static int64 returns[MAX_SIMS];

    uint64 actualSims = input.numSimulations;
    if (actualSims > MAX_SIMS) actualSims = MAX_SIMS;

    for (uint64 i = 0; i < actualSims; i++)
    {
        int64 portfolioReturn = simulateReturn(
            input.portfolioValue,
            input.volatility,
            input.timeHorizon
        );

        returns[i] = portfolioReturn;
        sumReturns += portfolioReturn;
        sumSquaredReturns += (portfolioReturn * portfolioReturn) / 10000;

        if (portfolioReturn < minReturn) minReturn = portfolioReturn;
        if (portfolioReturn > maxReturn) maxReturn = portfolioReturn;
    }

    // Calculate statistics
    int64 meanReturn = sumReturns / (int64)actualSims;

    // Calculate standard deviation
    int64 variance = (sumSquaredReturns / (int64)actualSims) - ((meanReturn * meanReturn) / 10000);
    uint64 stdDev = 0;
    if (variance > 0)
    {
        // Simple sqrt approximation for integers
        uint64 v = (uint64)variance;
        uint64 guess = v / 2;
        for (int i = 0; i < 10; i++)
        {
            if (guess == 0) break;
            guess = (guess + v / guess) / 2;
        }
        stdDev = guess;
    }

    // Sort returns for VaR calculation (simple bubble sort for now)
    // For production, use more efficient sorting
    for (uint64 i = 0; i < actualSims - 1; i++)
    {
        for (uint64 j = 0; j < actualSims - i - 1; j++)
        {
            if (returns[j] > returns[j + 1])
            {
                int64 temp = returns[j];
                returns[j] = returns[j + 1];
                returns[j + 1] = temp;
            }
        }
    }

    // Calculate 95% VaR (5th percentile)
    uint64 varIndex = (actualSims * 5) / 100;  // 5% percentile
    int64 var95 = returns[varIndex];

    // Calculate Sharpe Ratio (assuming risk-free rate = 0)
    // Sharpe = (Mean Return - Risk Free Rate) / Std Dev
    uint64 sharpeRatio = 0;
    if (stdDev > 0)
    {
        sharpeRatio = ((uint64)meanReturn * 10000) / stdDev;
    }

    // Set outputs
    output.meanReturn = (uint64)meanReturn;
    output.valueAtRisk = (uint64)(-var95);  // VaR is typically expressed as positive loss
    output.sharpeRatio = sharpeRatio;
    output.simulationsRun = actualSims;

    // Update state
    state.totalSimulations += actualSims;
    state.totalCalls++;
}

// Function to get contract statistics
struct getStats_input
{
    uint64 dummy;
};

struct getStats_output
{
    uint64 totalSimulations;
    uint64 totalCalls;
    uint64 lastSeed;
};

PUBLIC_FUNCTION(getStats)
{
    output.totalSimulations = state.totalSimulations;
    output.totalCalls = state.totalCalls;
    output.lastSeed = state.lastSeed;
}

// Register all public functions
REGISTER_USER_FUNCTIONS_AND_PROCEDURES
{
    REGISTER_USER_FUNCTION(calculateRisk, 1);
    REGISTER_USER_FUNCTION(getStats, 2);
}
