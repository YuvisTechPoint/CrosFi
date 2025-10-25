const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy MockERC20 (cUSD)
  console.log("\n📄 Deploying MockERC20 (cUSD)...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20.deploy(
    "Celo USD",
    "cUSD",
    18,
    ethers.parseEther("1000000") // 1M tokens
  );
  await mockERC20.waitForDeployment();
  const mockERC20Address = await mockERC20.getAddress();
  console.log("MockERC20 deployed to:", mockERC20Address);

  // Deploy MockYieldStrategy
  console.log("\n💰 Deploying MockYieldStrategy...");
  const MockYieldStrategy = await ethers.getContractFactory("MockYieldStrategy");
  const mockYieldStrategy = await MockYieldStrategy.deploy(mockERC20Address);
  await mockYieldStrategy.waitForDeployment();
  const mockYieldStrategyAddress = await mockYieldStrategy.getAddress();
  console.log("MockYieldStrategy deployed to:", mockYieldStrategyAddress);

  // Deploy SimpleVault
  console.log("\n🏦 Deploying SimpleVault...");
  const SimpleVault = await ethers.getContractFactory("SimpleVault");
  const simpleVault = await SimpleVault.deploy(
    mockERC20Address,
    mockYieldStrategyAddress,
    "CeloYield Vault",
    "CYV"
  );
  await simpleVault.waitForDeployment();
  const simpleVaultAddress = await simpleVault.getAddress();
  console.log("SimpleVault deployed to:", simpleVaultAddress);

  // Mint some tokens to deployer for testing
  console.log("\n🪙 Minting test tokens...");
  await mockERC20.faucet();
  console.log("Minted 1000 cUSD to deployer");

  // Verify deployments
  console.log("\n✅ Deployment Summary:");
  console.log("========================");
  console.log("MockERC20 (cUSD):", mockERC20Address);
  console.log("MockYieldStrategy:", mockYieldStrategyAddress);
  console.log("SimpleVault:", simpleVaultAddress);
  console.log("========================");

  // Save addresses to file
  const fs = require('fs');
  const addresses = {
    asset: mockERC20Address,
    strategy: mockYieldStrategyAddress,
    vault: simpleVaultAddress,
    network: "alfajores"
  };

  fs.writeFileSync('./lib/contracts/addresses.json', JSON.stringify(addresses, null, 2));
  console.log("\n💾 Addresses saved to lib/contracts/addresses.json");

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
