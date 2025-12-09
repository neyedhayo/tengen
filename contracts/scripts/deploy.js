const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of ComputeGateway...\n");

  // Get network info
  const network = hre.network.name;
  console.log(`Network: ${network}`);

  // Get deployer info
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Set minimum fee (0.001 ETH)
  const MIN_FEE = hre.ethers.parseEther("0.001");
  console.log(`Minimum Fee: ${hre.ethers.formatEther(MIN_FEE)} ETH\n`);

  // Deploy contract
  console.log("📝 Deploying ComputeGateway contract...");
  const ComputeGateway = await hre.ethers.getContractFactory("ComputeGateway");
  const computeGateway = await ComputeGateway.deploy(MIN_FEE);

  await computeGateway.waitForDeployment();
  const contractAddress = await computeGateway.getAddress();

  console.log(`✅ ComputeGateway deployed to: ${contractAddress}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: network,
    contractAddress: contractAddress,
    minFeePerJob: MIN_FEE.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  // Create deployed-addresses.json
  const deploymentsDir = path.join(__dirname, "..");
  const deploymentsFile = path.join(deploymentsDir, "deployed-addresses.json");

  let deployments = {};
  if (fs.existsSync(deploymentsFile)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
  }

  deployments[network] = deploymentInfo;
  fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));

  console.log(`📁 Deployment info saved to deployed-addresses.json\n`);

  // Wait for a few blocks before verification (only on testnets/mainnet)
  if (network !== "hardhat" && network !== "localhost") {
    console.log("⏳ Waiting for 5 block confirmations...");
    await computeGateway.deploymentTransaction().wait(5);
    console.log("✅ Confirmations received\n");

    // Display verification command
    console.log("📋 To verify on Etherscan, run:");
    console.log(`npx hardhat verify --network ${network} ${contractAddress} "${MIN_FEE.toString()}"`);
    console.log("");
  }

  // Display contract info
  console.log("📊 Contract Information:");
  console.log(`   Address: ${contractAddress}`);
  console.log(`   Owner: ${deployer.address}`);
  console.log(`   Min Fee: ${hre.ethers.formatEther(MIN_FEE)} ETH`);
  console.log(`   Network: ${network}`);

  if (network === "sepolia") {
    console.log(`   Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  }

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
