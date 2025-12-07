const hre = require("hardhat");
require("dotenv").config();

async function main() {
  try {
    // Get the network name
    const network = hre.network.name;
    console.log(`Network: ${network}`);
    console.log("---");

    const [signer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(signer.address);
    const blockNumber = await hre.ethers.provider.getBlockNumber();

    console.log(`Address: ${signer.address}`);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
    console.log(`Current Block: ${blockNumber}`);

    if (network === "hardhat" || network === "localhost") {
      console.log("\n⚠️  You're on local Hardhat network!");
      console.log("💡 To check Sepolia balance, run: npx hardhat run scripts/check-balance.js --network sepolia");
    }
  } catch (error) {
    console.error("Error checking balance:", error);
  }
}

main();
