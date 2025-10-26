const { ethers } = require("hardhat");

async function main() {
  console.log("📉 Simulating price drop for liquidation testing...");

  const addresses = require("../lib/contracts/addresses.json");
  const [deployer] = await ethers.getSigners();

  // Get the OracleAdapter contract
  const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
  const oracleAdapter = OracleAdapter.attach(addresses.contracts.oracleAdapter);

  // Get price feed for the first token (collateral)
  const collateralToken = "0x874069fa1ee493706DbeE6Cf34FF9829832E6A00";
  const priceFeedInfo = await oracleAdapter.priceFeeds(collateralToken);
  const priceFeedAddress = priceFeedInfo.oracleAddress;

  if (priceFeedAddress === ethers.ZeroAddress) {
    console.error("Price feed not found for token:", collateralToken);
    return;
  }

  const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
  const mockPriceFeed = MockPriceFeed.attach(priceFeedAddress);

  // Get current price
  const currentRoundData = await mockPriceFeed.latestRoundData();
  const currentPrice = currentRoundData.answer;
  const decimals = await mockPriceFeed.decimals();

  console.log(`Current price: ${ethers.formatUnits(currentPrice, decimals)}`);

  // Drop price by 50% to trigger liquidation
  const newPrice = (currentPrice * 50n) / 100n;
  console.log(`Setting new price to: ${ethers.formatUnits(newPrice, decimals)} (50% drop)`);

  const tx = await mockPriceFeed.setPrice(newPrice);
  await tx.wait();
  
  console.log("✅ Price dropped! Keeper should detect liquidation opportunity.");
  console.log("Tx hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
