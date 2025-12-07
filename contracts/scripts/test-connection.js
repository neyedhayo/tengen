const hre = require("hardhat");

async function main() {
  try {
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(`Connection successful! Current block number on Sepolia: ${blockNumber}`);
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }
}

main();
