// PrimeFinder.h - Qubic QPI Contract for finding prime numbers
// Part of Tengen Bridge - Trustless Compute Coprocessor

#pragma once

#include "qpi.h"

// Contract state (persistent storage)
struct CONTRACT_STATE
{
    uint64 totalCalls;          // Total number of times contract has been called
    uint64 lastPrimeFound;      // Last prime number found
    uint64 totalPrimesFound;    // Total count of primes found
};

// Input structure for findPrime function
struct findPrime_input
{
    uint64 startNumber;  // Starting point to search for primes
    uint64 count;        // Nth prime to find after startNumber
};

// Output structure for findPrime function
struct findPrime_output
{
    uint64 primeNumber;  // The Nth prime found
    uint64 iterations;   // Number of iterations to find it
    uint64 totalCalls;   // Total calls to this contract
};

// Helper function to check if a number is prime
static bool isPrime(uint64 n)
{
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;

    // Check divisibility up to sqrt(n)
    for (uint64 i = 5; i * i <= n; i += 6)
    {
        if (n % i == 0 || n % (i + 2) == 0)
            return false;
    }

    return true;
}

// Main function to find the Nth prime after a starting number
PUBLIC_FUNCTION(findPrime)
{
    // Validate input
    if (input.startNumber < 2)
    {
        input.startNumber = 2;  // Minimum valid starting point
    }

    if (input.count < 1)
    {
        input.count = 1;  // At least find one prime
    }

    uint64 currentNumber = input.startNumber;
    uint64 primesFound = 0;
    uint64 iterations = 0;

    // Search for the Nth prime
    while (primesFound < input.count)
    {
        iterations++;

        if (isPrime(currentNumber))
        {
            primesFound++;
            if (primesFound == input.count)
            {
                // Found the Nth prime!
                output.primeNumber = currentNumber;
                output.iterations = iterations;

                // Update contract state
                state.lastPrimeFound = currentNumber;
                state.totalPrimesFound += input.count;
                break;
            }
        }

        currentNumber++;

        // Safety limit to prevent infinite loops (max 1 million iterations)
        if (iterations > 1000000)
        {
            output.primeNumber = 0;  // Indicate failure
            output.iterations = iterations;
            state.totalCalls++;
            output.totalCalls = state.totalCalls;
            return;
        }
    }

    // Update state
    state.totalCalls++;
    output.totalCalls = state.totalCalls;
}

// Optional: Function to get contract statistics
struct getStats_input
{
    uint64 dummy;  // QPI requires at least one field
};

struct getStats_output
{
    uint64 totalCalls;
    uint64 lastPrimeFound;
    uint64 totalPrimesFound;
};

PUBLIC_FUNCTION(getStats)
{
    output.totalCalls = state.totalCalls;
    output.lastPrimeFound = state.lastPrimeFound;
    output.totalPrimesFound = state.totalPrimesFound;
}

// Register all public functions
REGISTER_USER_FUNCTIONS_AND_PROCEDURES
{
    REGISTER_USER_FUNCTION(findPrime, 1);
    REGISTER_USER_FUNCTION(getStats, 2);
}
