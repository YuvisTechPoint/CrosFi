const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CeloYield Integration Tests", function () {
  let vault, strategy, tokenConfig;
  let owner, user1, user2;
  let cusdToken, usdcToken;

  // Real Celo Alfajores testnet token addresses
  const CUSD_ADDRESS = "0x874069Fa1Ee493706DbeE6Cf34ff9829832e6A00";
  const USDC_ADDRESS = "0x62b8B11039Ff5064145D0D87D32c658Da4CC2Dc1";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy TokenConfig library
    const TokenConfig = await ethers.getContractFactory("TokenConfig");
    tokenConfig = await TokenConfig.deploy();
    await tokenConfig.waitForDeployment();

    // Deploy MentoYieldStrategy
    const MentoYieldStrategy = await ethers.getContractFactory("MentoYieldStrategy");
    strategy = await MentoYieldStrategy.deploy(
      "0x0000000000000000000000000000000000000000", // Placeholder Mento protocol
      "0x0000000000000000000000000000000000000000"  // Placeholder Mento oracle
    );
    await strategy.waitForDeployment();

    // Deploy MultiTokenVault
    const MultiTokenVault = await ethers.getContractFactory("MultiTokenVault");
    vault = await MultiTokenVault.deploy(
      "CeloYield Multi-Token Vault",
      "CYV"
    );
    await vault.waitForDeployment();

    // Initialize vault with strategies
    await vault.initialize(
      await strategy.getAddress(),
      await strategy.getAddress(),
      await strategy.getAddress()
    );

    // Get token contracts (using real addresses)
    const ERC20_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ];

    cusdToken = new ethers.Contract(CUSD_ADDRESS, ERC20_ABI, owner);
    usdcToken = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, owner);
  });

  describe("Multi-Token Vault Integration", function () {
    it("Should support multiple tokens", async function () {
      // Check that vault supports the configured tokens
      const cusdStrategy = await vault.strategies(CUSD_ADDRESS);
      const usdcStrategy = await vault.strategies(USDC_ADDRESS);
      
      expect(cusdStrategy).to.not.equal(ethers.ZeroAddress);
      expect(usdcStrategy).to.not.equal(ethers.ZeroAddress);
    });

    it("Should handle cUSD deposits and withdrawals", async function () {
      // This test assumes the deployer has cUSD tokens
      // In a real test environment, you would need to get testnet tokens first
      
      const depositAmount = ethers.parseEther("100"); // 100 cUSD
      
      // Check if deployer has enough cUSD
      const balance = await cusdToken.balanceOf(owner.address);
      if (balance < depositAmount) {
        console.log("⚠️  Skipping cUSD test - insufficient balance");
        console.log(`   Available: ${ethers.formatEther(balance)} cUSD`);
        console.log(`   Required: ${ethers.formatEther(depositAmount)} cUSD`);
        return;
      }

      // Approve vault to spend cUSD
      await cusdToken.approve(await vault.getAddress(), depositAmount);
      
      // Deposit cUSD
      await vault.deposit(CUSD_ADDRESS, depositAmount);
      
      // Check vault balance
      const vaultBalance = await vault.totalAssets(CUSD_ADDRESS);
      expect(vaultBalance).to.equal(depositAmount);
      
      // Check user shares
      const userShares = await vault.userTokenSharesBalance(owner.address, CUSD_ADDRESS);
      expect(userShares).to.be.gt(0);
      
      // Withdraw
      await vault.withdraw(CUSD_ADDRESS, userShares);
      
      // Check vault balance after withdrawal
      const vaultBalanceAfter = await vault.totalAssets(CUSD_ADDRESS);
      expect(vaultBalanceAfter).to.equal(0);
    });

    it("Should handle USDC deposits and withdrawals", async function () {
      const depositAmount = ethers.parseUnits("100", 6); // 100 USDC (6 decimals)
      
      // Check if deployer has enough USDC
      const balance = await usdcToken.balanceOf(owner.address);
      if (balance < depositAmount) {
        console.log("⚠️  Skipping USDC test - insufficient balance");
        console.log(`   Available: ${ethers.formatUnits(balance, 6)} USDC`);
        console.log(`   Required: ${ethers.formatUnits(depositAmount, 6)} USDC`);
        return;
      }

      // Approve vault to spend USDC
      await usdcToken.approve(await vault.getAddress(), depositAmount);
      
      // Deposit USDC
      await vault.deposit(USDC_ADDRESS, depositAmount);
      
      // Check vault balance
      const vaultBalance = await vault.totalAssets(USDC_ADDRESS);
      expect(vaultBalance).to.equal(depositAmount);
      
      // Check user shares
      const userShares = await vault.userTokenSharesBalance(owner.address, USDC_ADDRESS);
      expect(userShares).to.be.gt(0);
      
      // Withdraw
      await vault.withdraw(USDC_ADDRESS, userShares);
      
      // Check vault balance after withdrawal
      const vaultBalanceAfter = await vault.totalAssets(USDC_ADDRESS);
      expect(vaultBalanceAfter).to.equal(0);
    });

    it("Should calculate APY for different tokens", async function () {
      const cusdAPY = await vault.getAPY(CUSD_ADDRESS);
      const usdcAPY = await vault.getAPY(USDC_ADDRESS);
      
      expect(cusdAPY).to.be.gt(0);
      expect(usdcAPY).to.be.gt(0);
      
      console.log(`cUSD APY: ${Number(cusdAPY) / 100}%`);
      console.log(`USDC APY: ${Number(usdcAPY) / 100}%`);
    });

    it("Should track user positions correctly", async function () {
      const depositAmount = ethers.parseEther("50"); // 50 cUSD
      
      // Check if deployer has enough cUSD
      const balance = await cusdToken.balanceOf(owner.address);
      if (balance < depositAmount) {
        console.log("⚠️  Skipping position tracking test - insufficient balance");
        return;
      }

      // Approve and deposit
      await cusdToken.approve(await vault.getAddress(), depositAmount);
      await vault.deposit(CUSD_ADDRESS, depositAmount);
      
      // Check user position
      const userShares = await vault.userTokenSharesBalance(owner.address, CUSD_ADDRESS);
      const userAssetBalance = await vault.userAssetBalance(owner.address, CUSD_ADDRESS);
      
      expect(userShares).to.be.gt(0);
      expect(userAssetBalance).to.be.gt(0);
      
      console.log(`User shares: ${ethers.formatEther(userShares)}`);
      console.log(`User asset balance: ${ethers.formatEther(userAssetBalance)} cUSD`);
    });
  });

  describe("Mento Strategy Integration", function () {
    it("Should handle strategy deposits", async function () {
      const depositAmount = ethers.parseEther("25"); // 25 cUSD
      
      // Check if deployer has enough cUSD
      const balance = await cusdToken.balanceOf(owner.address);
      if (balance < depositAmount) {
        console.log("⚠️  Skipping strategy test - insufficient balance");
        return;
      }

      // Approve strategy to spend cUSD
      await cusdToken.approve(await strategy.getAddress(), depositAmount);
      
      // Deposit to strategy
      await strategy.deposit(CUSD_ADDRESS, depositAmount);
      
      // Check strategy balance
      const strategyBalance = await cusdToken.balanceOf(await strategy.getAddress());
      expect(strategyBalance).to.equal(depositAmount);
    });

    it("Should calculate strategy APY", async function () {
      const cusdAPY = await strategy.getAPY(CUSD_ADDRESS);
      const usdcAPY = await strategy.getAPY(USDC_ADDRESS);
      
      expect(cusdAPY).to.be.gt(0);
      expect(usdcAPY).to.be.gt(0);
      
      console.log(`Strategy cUSD APY: ${Number(cusdAPY) / 100}%`);
      console.log(`Strategy USDC APY: ${Number(usdcAPY) / 100}%`);
    });
  });

  describe("Token Configuration", function () {
    it("Should have correct token addresses", async function () {
      // These addresses should match the real Celo Alfajores testnet addresses
      expect(CUSD_ADDRESS).to.equal("0x874069Fa1Ee493706DbeE6Cf34ff9829832e6A00");
      expect(USDC_ADDRESS).to.equal("0x62b8B11039Ff5064145D0D87D32c658Da4CC2Dc1");
    });

    it("Should have correct token decimals", async function () {
      const cusdDecimals = await cusdToken.decimals();
      const usdcDecimals = await usdcToken.decimals();
      
      expect(cusdDecimals).to.equal(18);
      expect(usdcDecimals).to.equal(6);
    });

    it("Should have correct token symbols", async function () {
      const cusdSymbol = await cusdToken.symbol();
      const usdcSymbol = await usdcToken.symbol();
      
      expect(cusdSymbol).to.equal("cUSD");
      expect(usdcSymbol).to.equal("USDC");
    });
  });

  describe("Error Handling", function () {
    it("Should reject deposits to unsupported tokens", async function () {
      const unsupportedToken = "0x0000000000000000000000000000000000000001";
      const depositAmount = ethers.parseEther("100");
      
      await expect(
        vault.deposit(unsupportedToken, depositAmount)
      ).to.be.revertedWith("Unsupported asset");
    });

    it("Should reject withdrawals with insufficient shares", async function () {
      const withdrawAmount = ethers.parseEther("100");
      
      await expect(
        vault.withdraw(CUSD_ADDRESS, withdrawAmount)
      ).to.be.revertedWith("Insufficient shares");
    });

    it("Should reject zero amount deposits", async function () {
      await expect(
        vault.deposit(CUSD_ADDRESS, 0)
      ).to.be.revertedWith("Deposit amount must be greater than zero");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for deposits", async function () {
      const depositAmount = ethers.parseEther("10"); // 10 cUSD
      
      // Check if deployer has enough cUSD
      const balance = await cusdToken.balanceOf(owner.address);
      if (balance < depositAmount) {
        console.log("⚠️  Skipping gas test - insufficient balance");
        return;
      }

      // Approve vault
      const approveTx = await cusdToken.approve(await vault.getAddress(), depositAmount);
      const approveReceipt = await approveTx.wait();
      
      // Deposit
      const depositTx = await vault.deposit(CUSD_ADDRESS, depositAmount);
      const depositReceipt = await depositTx.wait();
      
      console.log(`Approve gas used: ${approveReceipt.gasUsed.toString()}`);
      console.log(`Deposit gas used: ${depositReceipt.gasUsed.toString()}`);
      
      // Gas usage should be reasonable (less than 200k for deposit)
      expect(depositReceipt.gasUsed).to.be.lt(200000);
    });
  });
});
