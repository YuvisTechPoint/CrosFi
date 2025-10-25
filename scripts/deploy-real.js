const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of real CeloYield contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "CELO");

  // Deploy MentoYieldStrategy first
  console.log("\n🎯 Deploying MentoYieldStrategy...");
  const MentoYieldStrategy = await ethers.getContractFactory("MentoYieldStrategy");
  const mentoStrategy = await MentoYieldStrategy.deploy();
  await mentoStrategy.waitForDeployment();
  console.log("✅ MentoYieldStrategy deployed to:", await mentoStrategy.getAddress());

  // Deploy MultiTokenVault
  console.log("\n🏦 Deploying MultiTokenVault...");
  const MultiTokenVault = await ethers.getContractFactory("MultiTokenVault");
  const vault = await MultiTokenVault.deploy(
    "CeloYield Multi-Token Vault",
    "CYV",
    await mentoStrategy.getAddress()
  );
  await vault.waitForDeployment();
  console.log("✅ MultiTokenVault deployed to:", await vault.getAddress());

  // Set vault address in strategy
  console.log("\n⚙️ Setting vault address in strategy...");
  const setVaultTx = await mentoStrategy.setVault(await vault.getAddress());
  await setVaultTx.wait();
  console.log("✅ Vault address set in strategy");

  // Save contract addresses
  const addresses = {
    network: "alfajores",
    vault: await vault.getAddress(),
    strategy: await mentoStrategy.getAddress(),
    tokens: {
      cUSD: "0x874069Fa1Ee493706DbeE6Cf34ff9829832e6A00",
      USDC: "0x62b8B11039Ff5064145D0D87D32c658Da4CC2Dc1",
      CELO: "0x0000000000000000000000000000000000000000"
    },
    mento: {
      reserve: "0x0000000000000000000000000000000000000000"
    },
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };

  // Save to addresses.json
  const addressesPath = path.join(__dirname, "..", "lib", "contracts", "addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("✅ Contract addresses saved to:", addressesPath);

  // Verify contracts (optional - requires verification setup)
  console.log("\n🔍 Contract verification (optional)...");
  console.log("To verify contracts on Celoscan, run:");
  console.log(`npx hardhat verify --network alfajores ${await vault.getAddress()} "CeloYield Multi-Token Vault" "CYV" "${await mentoStrategy.getAddress()}"`);
  console.log(`npx hardhat verify --network alfajores ${await mentoStrategy.getAddress()}`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Deployment Summary:");
  console.log("=====================");
  console.log("Network: Celo Alfajores Testnet");
  console.log("Deployer:", deployer.address);
  console.log("Vault:", await vault.getAddress());
  console.log("Strategy:", await mentoStrategy.getAddress());
  console.log("\n🔗 View on Celoscan:");
  console.log(`Vault: https://alfajores.celoscan.io/address/${await vault.getAddress()}`);
  console.log(`Strategy: https://alfajores.celoscan.io/address/${await mentoStrategy.getAddress()}`);

  console.log("\n⚠️  Next Steps:");
  console.log("1. Update backend environment variables with new contract addresses");
  console.log("2. Deploy backend API to cloud provider");
  console.log("3. Update frontend environment variables");
  console.log("4. Test the complete flow with real testnet tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });