const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🪙 Deploying mock ERC20 tokens for testing...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "CELO");

  // Load existing addresses
  const addressesPath = path.join(__dirname, '../lib/contracts/addresses.json');
  let addresses = {};
  
  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  }

  // Initialize tokens object if it doesn't exist
  if (!addresses.tokens) {
    addresses.tokens = {};
  }

  // Deploy MockERC20 contract
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  // Deploy cUSD (18 decimals)
  console.log("\n💰 Deploying Mock cUSD...");
  const mockCUSD = await MockERC20.deploy(
    "Mock Celo Dollar",
    "mcUSD", 
    18, // decimals
    ethers.parseEther("1000000") // 1M initial supply
  );
  await mockCUSD.waitForDeployment();
  const cUSDAddress = await mockCUSD.getAddress();
  addresses.tokens.cUSD = cUSDAddress;
  console.log("✅ Mock cUSD deployed to:", cUSDAddress);

  // Deploy USDC (6 decimals)
  console.log("\n💵 Deploying Mock USDC...");
  const mockUSDC = await MockERC20.deploy(
    "Mock USD Coin",
    "mUSDC",
    6, // decimals
    ethers.parseUnits("1000000", 6) // 1M initial supply
  );
  await mockUSDC.waitForDeployment();
  const USDCAddress = await mockUSDC.getAddress();
  addresses.tokens.USDC = USDCAddress;
  console.log("✅ Mock USDC deployed to:", USDCAddress);

  // Mint additional tokens to deployer for testing
  console.log("\n🎁 Minting additional tokens for testing...");
  
  // Mint 10,000 cUSD to deployer
  await mockCUSD.mint(deployer.address, ethers.parseEther("10000"));
  console.log("✅ Minted 10,000 mcUSD to deployer");

  // Mint 10,000 USDC to deployer
  await mockUSDC.mint(deployer.address, ethers.parseUnits("10000", 6));
  console.log("✅ Minted 10,000 mUSDC to deployer");

  // Update network info
  addresses.network = "localhost";
  addresses.deployedAt = new Date().toISOString();
  addresses.deployer = deployer.address;

  // Save updated addresses
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\n💾 Contract addresses saved to:", addressesPath);

  console.log("\n🎉 Mock token deployment completed!");
  console.log("\n📋 Deployment Summary:");
  console.log("=====================");
  console.log("Network: Local Hardhat");
  console.log("Deployer:", deployer.address);
  console.log("Mock cUSD:", cUSDAddress);
  console.log("Mock USDC:", USDCAddress);
  console.log("=====================");

  console.log("\n🔍 Token Details:");
  console.log("Mock cUSD - Name:", await mockCUSD.name());
  console.log("Mock cUSD - Symbol:", await mockCUSD.symbol());
  console.log("Mock cUSD - Decimals:", await mockCUSD.decimals());
  console.log("Mock cUSD - Total Supply:", ethers.formatEther(await mockCUSD.totalSupply()));
  console.log("Mock cUSD - Deployer Balance:", ethers.formatEther(await mockCUSD.balanceOf(deployer.address)));
  
  console.log("\nMock USDC - Name:", await mockUSDC.name());
  console.log("Mock USDC - Symbol:", await mockUSDC.symbol());
  console.log("Mock USDC - Decimals:", await mockUSDC.decimals());
  console.log("Mock USDC - Total Supply:", ethers.formatUnits(await mockUSDC.totalSupply(), 6));
  console.log("Mock USDC - Deployer Balance:", ethers.formatUnits(await mockUSDC.balanceOf(deployer.address), 6));

  console.log("\n⚠️  Next Steps:");
  console.log("1. Restart your frontend to pick up the new token addresses");
  console.log("2. The balanceOf errors should now be resolved");
  console.log("3. You can test token interactions with the mock tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
