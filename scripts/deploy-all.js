const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting comprehensive deployment of all CrosFi contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    throw new Error("No deployer account found. Please check your .env file and ensure PRIVATE_KEY is set.");
  }
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "CELO");

  const deployedContracts = {};

  try {
    // 1. Deploy MentoYieldStrategy first (dependency for vault)
    console.log("\n🎯 Deploying MentoYieldStrategy...");
    const MentoYieldStrategy = await ethers.getContractFactory("MentoYieldStrategy");
    const mentoStrategy = await MentoYieldStrategy.deploy();
    await mentoStrategy.waitForDeployment();
    const mentoStrategyAddress = await mentoStrategy.getAddress();
    deployedContracts.strategy = mentoStrategyAddress;
    console.log("✅ MentoYieldStrategy deployed to:", mentoStrategyAddress);

    // 2. Deploy MultiTokenVault
    console.log("\n🏦 Deploying MultiTokenVault...");
    const MultiTokenVault = await ethers.getContractFactory("MultiTokenVault");
    const vault = await MultiTokenVault.deploy(
      "CrosFi Multi-Token Vault",
      "CFV",
      mentoStrategyAddress
    );
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    deployedContracts.vault = vaultAddress;
    console.log("✅ MultiTokenVault deployed to:", vaultAddress);

    // 3. Deploy InterestModel
    console.log("\n📊 Deploying InterestModel...");
    const InterestModel = await ethers.getContractFactory("InterestModel");
    const interestModel = await InterestModel.deploy();
    await interestModel.waitForDeployment();
    const interestModelAddress = await interestModel.getAddress();
    deployedContracts.interestModel = interestModelAddress;
    console.log("✅ InterestModel deployed to:", interestModelAddress);

    // 4. Deploy OracleAdapter
    console.log("\n🔮 Deploying OracleAdapter...");
    const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
    const oracleAdapter = await OracleAdapter.deploy();
    await oracleAdapter.waitForDeployment();
    const oracleAdapterAddress = await oracleAdapter.getAddress();
    deployedContracts.oracleAdapter = oracleAdapterAddress;
    console.log("✅ OracleAdapter deployed to:", oracleAdapterAddress);

    // 5. Deploy DebtToken contracts for each supported token
    console.log("\n💳 Deploying DebtToken contracts...");
    const DebtToken = await ethers.getContractFactory("DebtToken");
    
    // Deploy DebtToken for cUSD (5% annual interest rate = 500 bps)
    const cUSDDebtToken = await DebtToken.deploy("CrosFi cUSD Debt", "cUSD-DEBT", 500);
    await cUSDDebtToken.waitForDeployment();
    const cUSDDebtTokenAddress = await cUSDDebtToken.getAddress();
    deployedContracts.cUSDDebtToken = cUSDDebtTokenAddress;
    console.log("✅ cUSD DebtToken deployed to:", cUSDDebtTokenAddress);
    
    // Deploy DebtToken for USDC (5% annual interest rate = 500 bps)
    const USDCDebtToken = await DebtToken.deploy("CrosFi USDC Debt", "USDC-DEBT", 500);
    await USDCDebtToken.waitForDeployment();
    const USDCDebtTokenAddress = await USDCDebtToken.getAddress();
    deployedContracts.USDCDebtToken = USDCDebtTokenAddress;
    console.log("✅ USDC DebtToken deployed to:", USDCDebtTokenAddress);
    
    // Deploy DebtToken for CELO (7% annual interest rate = 700 bps)
    const CELODebtToken = await DebtToken.deploy("CrosFi CELO Debt", "CELO-DEBT", 700);
    await CELODebtToken.waitForDeployment();
    const CELODebtTokenAddress = await CELODebtToken.getAddress();
    deployedContracts.CELODebtToken = CELODebtTokenAddress;
    console.log("✅ CELO DebtToken deployed to:", CELODebtTokenAddress);

    // 6. Deploy CollateralManager
    console.log("\n🛡️ Deploying CollateralManager...");
    const CollateralManager = await ethers.getContractFactory("CollateralManager");
    const collateralManager = await CollateralManager.deploy(
      oracleAdapterAddress,
      cUSDDebtTokenAddress, // Use cUSD DebtToken as primary debt token
      7500, // 75% liquidation threshold
      500   // 5% liquidation bonus
    );
    await collateralManager.waitForDeployment();
    const collateralManagerAddress = await collateralManager.getAddress();
    deployedContracts.collateralManager = collateralManagerAddress;
    console.log("✅ CollateralManager deployed to:", collateralManagerAddress);

    // 7. Deploy LendingPool with all required parameters
    console.log("\n💰 Deploying LendingPool...");
    const LendingPool = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPool.deploy(
      interestModelAddress,
      oracleAdapterAddress,
      collateralManagerAddress,
      deployer.address, // Reserve address (using deployer for now)
      ethers.parseEther("0.1") // 10% reserve factor (0.1e18)
    );
    await lendingPool.waitForDeployment();
    const lendingPoolAddress = await lendingPool.getAddress();
    deployedContracts.lendingPool = lendingPoolAddress;
    console.log("✅ LendingPool deployed to:", lendingPoolAddress);

    // 8. Set vault address in strategy
    console.log("\n⚙️ Configuring strategy...");
    const setVaultTx = await mentoStrategy.setVault(vaultAddress);
    await setVaultTx.wait();
    console.log("✅ Vault address set in strategy");

    // 9. Configure LendingPool with DebtToken addresses
    console.log("\n⚙️ Configuring LendingPool with DebtTokens...");
    const setDebtTokenTx1 = await lendingPool.setDebtTokenFor("0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", cUSDDebtTokenAddress); // cUSD
    await setDebtTokenTx1.wait();
    console.log("✅ cUSD DebtToken set in LendingPool");
    
    const setDebtTokenTx2 = await lendingPool.setDebtTokenFor("0x41f4C5E67e9Ecf8C2c53d9B25C4c5B4f8C26b6e8", USDCDebtTokenAddress); // USDC
    await setDebtTokenTx2.wait();
    console.log("✅ USDC DebtToken set in LendingPool");
    
    const setDebtTokenTx3 = await lendingPool.setDebtTokenFor("0x0000000000000000000000000000000000000000", CELODebtTokenAddress); // CELO
    await setDebtTokenTx3.wait();
    console.log("✅ CELO DebtToken set in LendingPool");

    // 10. Configure DebtToken contracts with LendingPool
    console.log("\n⚙️ Configuring DebtToken contracts...");
    const setLendingPoolTx1 = await cUSDDebtToken.setLendingPool(lendingPoolAddress);
    await setLendingPoolTx1.wait();
    console.log("✅ LendingPool set in cUSD DebtToken");
    
    const setLendingPoolTx2 = await USDCDebtToken.setLendingPool(lendingPoolAddress);
    await setLendingPoolTx2.wait();
    console.log("✅ LendingPool set in USDC DebtToken");
    
    const setLendingPoolTx3 = await CELODebtToken.setLendingPool(lendingPoolAddress);
    await setLendingPoolTx3.wait();
    console.log("✅ LendingPool set in CELO DebtToken");

    // 11. Configure CollateralManager with approved tokens
    console.log("\n⚙️ Configuring CollateralManager...");
    const setCollateralTx1 = await collateralManager.setApprovedCollateralToken("0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", true); // cUSD
    await setCollateralTx1.wait();
    console.log("✅ cUSD approved as collateral");
    
    const setCollateralTx2 = await collateralManager.setApprovedCollateralToken("0x41f4C5E67e9Ecf8C2c53d9B25C4c5B4f8C26b6e8", true); // USDC
    await setCollateralTx2.wait();
    console.log("✅ USDC approved as collateral");
    
    const setCollateralTx3 = await collateralManager.setApprovedCollateralToken("0x0000000000000000000000000000000000000000", true); // CELO
    await setCollateralTx3.wait();
    console.log("✅ CELO approved as collateral");

    // 12. Save comprehensive contract addresses
    const addresses = {
      network: "alfajores",
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        vault: vaultAddress,
        strategy: mentoStrategyAddress,
        lendingPool: lendingPoolAddress,
        interestModel: interestModelAddress,
        oracleAdapter: oracleAdapterAddress,
        collateralManager: collateralManagerAddress,
        debtTokens: {
          cUSD: cUSDDebtTokenAddress,
          USDC: USDCDebtTokenAddress,
          CELO: CELODebtTokenAddress
        }
      },
      tokens: {
        cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
        USDC: "0x41f4C5E67e9Ecf8C2c53d9B25C4c5B4f8C26b6e8",
        CELO: "0x0000000000000000000000000000000000000000"
      },
      mento: {
        reserve: "0x0000000000000000000000000000000000000000"
      },
      oracle: {
        adapter: oracleAdapterAddress
      },
      interest: {
        model: interestModelAddress
      }
    };

    // Save to addresses.json
    const addressesPath = path.join(__dirname, "..", "lib", "contracts", "addresses.json");
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("✅ Contract addresses saved to:", addressesPath);

    // 13. Display deployment summary
    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Deployment Summary:");
    console.log("=====================");
    console.log("Network: Celo Alfajores Testnet");
    console.log("Deployer:", deployer.address);
    console.log("Vault:", vaultAddress);
    console.log("Strategy:", mentoStrategyAddress);
    console.log("LendingPool:", lendingPoolAddress);
    console.log("InterestModel:", interestModelAddress);
    console.log("OracleAdapter:", oracleAdapterAddress);
    console.log("CollateralManager:", collateralManagerAddress);
    console.log("cUSD DebtToken:", cUSDDebtTokenAddress);
    console.log("USDC DebtToken:", USDCDebtTokenAddress);
    console.log("CELO DebtToken:", CELODebtTokenAddress);
    console.log("=====================");

    // 14. Display Celoscan links
    console.log("\n🔗 View on Celoscan:");
    console.log(`Vault: https://alfajores.celoscan.io/address/${vaultAddress}`);
    console.log(`Strategy: https://alfajores.celoscan.io/address/${mentoStrategyAddress}`);
    console.log(`LendingPool: https://alfajores.celoscan.io/address/${lendingPoolAddress}`);
    console.log(`InterestModel: https://alfajores.celoscan.io/address/${interestModelAddress}`);
    console.log(`OracleAdapter: https://alfajores.celoscan.io/address/${oracleAdapterAddress}`);
    console.log(`CollateralManager: https://alfajores.celoscan.io/address/${collateralManagerAddress}`);
    console.log(`cUSD DebtToken: https://alfajores.celoscan.io/address/${cUSDDebtTokenAddress}`);
    console.log(`USDC DebtToken: https://alfajores.celoscan.io/address/${USDCDebtTokenAddress}`);
    console.log(`CELO DebtToken: https://alfajores.celoscan.io/address/${CELODebtTokenAddress}`);

    // 15. Display verification commands
    console.log("\n🔍 Contract verification commands:");
    console.log(`npx hardhat verify --network alfajores ${vaultAddress} "CrosFi Multi-Token Vault" "CFV" "${mentoStrategyAddress}"`);
    console.log(`npx hardhat verify --network alfajores ${mentoStrategyAddress}`);
    console.log(`npx hardhat verify --network alfajores ${lendingPoolAddress} "${interestModelAddress}" "${oracleAdapterAddress}" "${collateralManagerAddress}" "${deployer.address}" "100000000000000000"`);
    console.log(`npx hardhat verify --network alfajores ${interestModelAddress}`);
    console.log(`npx hardhat verify --network alfajores ${oracleAdapterAddress}`);
    console.log(`npx hardhat verify --network alfajores ${collateralManagerAddress} "${oracleAdapterAddress}" "${cUSDDebtTokenAddress}" 7500 500`);
    console.log(`npx hardhat verify --network alfajores ${cUSDDebtTokenAddress} "CrosFi cUSD Debt" "cUSD-DEBT" 500`);
    console.log(`npx hardhat verify --network alfajores ${USDCDebtTokenAddress} "CrosFi USDC Debt" "USDC-DEBT" 500`);
    console.log(`npx hardhat verify --network alfajores ${CELODebtTokenAddress} "CrosFi CELO Debt" "CELO-DEBT" 700`);

    // 16. Next steps
    console.log("\n⚠️  Next Steps:");
    console.log("1. Set up price feeds in OracleAdapter for supported tokens");
    console.log("2. Update LendingPool to integrate with CollateralManager and DebtToken contracts");
    console.log("3. Update backend environment variables with new contract addresses");
    console.log("4. Update frontend environment variables");
    console.log("5. Test the complete flow with real testnet tokens");
    console.log("6. Configure Chainlink oracles for price feeds");

    return addresses;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
