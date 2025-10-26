const { ethers } = require("hardhat");

async function main() {
  console.log("🔮 Setting up price feeds for testing...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Load contract addresses
  const addresses = require("../lib/contracts/addresses.json");
  
  // Get the OracleAdapter contract
  const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
  const oracleAdapter = OracleAdapter.attach(addresses.contracts.oracleAdapter);

  // Mock token addresses (these are the ones in the keeper config)
  const mockTokens = [
    "0x874069fa1ee493706DbeE6Cf34FF9829832E6A00", // Token 1
    "0x62b8b11039FF5064145D0D87d32C658DA4cC2Dc1"  // Token 2
  ];

  // Deploy mock price feed contracts
  const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
  
  for (let i = 0; i < mockTokens.length; i++) {
    const token = mockTokens[i];
    
    // Deploy mock price feed
    const mockPriceFeed = await MockPriceFeed.deploy(ethers.parseUnits("1.0", 8), 8);
    await mockPriceFeed.waitForDeployment();
    const priceFeedAddress = await mockPriceFeed.getAddress();
    
    // Register the price feed in OracleAdapter
    await oracleAdapter.setPriceFeed(token, priceFeedAddress, 8);
    
    console.log(`✅ Set up price feed for token ${token}:`);
    console.log(`   Price Feed: ${priceFeedAddress}`);
    console.log(`   Price: 1.0 (8 decimals)`);
  }

  console.log("\n🎉 Price feeds setup completed!");
  console.log("The keeper should now be able to update rates successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
