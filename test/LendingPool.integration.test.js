const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingPool - Integration", function () {
  let deployer, alice, bob, liquidator;
  let tokenUSDC, tokenCEUR, interestModel, oracle, debtTokenUSDC, collateralManager, lendingPool;
  let mockOracleUSDC, mockOracleCEUR;

  beforeEach(async function () {
    [deployer, alice, bob, liquidator] = await ethers.getSigners();

    // Deploy mock ERC20 tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    tokenUSDC = await MockERC20.deploy("cUSD", "cUSD", 18);
    tokenCEUR = await MockERC20.deploy("cEUR", "cEUR", 18);
    await tokenUSDC.waitForDeployment();
    await tokenCEUR.waitForDeployment();

    // Mint tokens to alice (lender) and bob (borrower)
    await tokenUSDC.mint(alice.address, ethers.parseUnits("10000", 18));
    await tokenCEUR.mint(bob.address, ethers.parseUnits("10000", 18));

    // Deploy InterestModel
    const InterestModel = await ethers.getContractFactory("InterestModel");
    interestModel = await InterestModel.deploy();
    await interestModel.waitForDeployment();

    // Deploy Mock Oracles
    const MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracleUSDC = await MockOracle.deploy();
    mockOracleCEUR = await MockOracle.deploy();
    await mockOracleUSDC.waitForDeployment();
    await mockOracleCEUR.waitForDeployment();

    // Set initial prices: 1 cEUR = 1.05 cUSD
    await mockOracleUSDC.setPrice(ethers.parseUnits("1", 18));
    await mockOracleCEUR.setPrice(ethers.parseUnits("1.05", 18));

    // Deploy OracleAdapter
    const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
    oracle = await OracleAdapter.deploy();
    await oracle.waitForDeployment();

    // Register price feeds to adapter
    await oracle.setPriceFeed(await tokenUSDC.getAddress(), await mockOracleUSDC.getAddress(), 18);
    await oracle.setPriceFeed(await tokenCEUR.getAddress(), await mockOracleCEUR.getAddress(), 18);
    
    // Update price history to initialize volatility
    await oracle.updatePriceHistory(await tokenUSDC.getAddress());
    await oracle.updatePriceHistory(await tokenCEUR.getAddress());

    // Deploy DebtToken
    const DebtToken = await ethers.getContractFactory("DebtToken");
    debtTokenUSDC = await DebtToken.connect(deployer).deploy("Debt cUSD", "debtCUSD", 500);
    await debtTokenUSDC.waitForDeployment();

    // Deploy CollateralManager and approve collateral tokens
    const CollateralManager = await ethers.getContractFactory("CollateralManager");
    collateralManager = await CollateralManager.deploy(await oracle.getAddress(), await debtTokenUSDC.getAddress(), 7500, 500);
    await collateralManager.waitForDeployment();
    await collateralManager.setApprovedCollateralToken(await tokenCEUR.getAddress(), true);

    // Deploy LendingPool
    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(
      await interestModel.getAddress(),
      await oracle.getAddress(),
      await collateralManager.getAddress(),
      deployer.address, // reserve address
      ethers.parseUnits("0.1", 18) // reserveFactor = 10%
    );
    await lendingPool.waitForDeployment();

    // Register debt token in pool
    await lendingPool.setDebtTokenFor(await tokenUSDC.getAddress(), await debtTokenUSDC.getAddress());

    // Set lending pool in debt token
    await debtTokenUSDC.connect(deployer).setLendingPool(await lendingPool.getAddress());

    // Alice deposits 5000 cUSD to pool as lender
    await tokenUSDC.connect(alice).approve(await lendingPool.getAddress(), ethers.parseUnits("5000", 18));
    await lendingPool.connect(alice).deposit(await tokenUSDC.getAddress(), ethers.parseUnits("5000", 18));

    // Bob deposits 2000 cEUR as collateral into CollateralManager
    await tokenCEUR.connect(bob).approve(await collateralManager.getAddress(), ethers.parseUnits("2000", 18));
    await collateralManager.connect(bob).addCollateral(await tokenCEUR.getAddress(), ethers.parseUnits("2000", 18));
  });

  it("should allow cross-currency borrow and accrue interest", async function () {
    // Bob borrows 1000 cUSD using 2000 cEUR collateral (~value 2000*1.05 = 2100 cUSD)
    await lendingPool.connect(bob).borrow(
      await tokenCEUR.getAddress(), 
      await tokenUSDC.getAddress(), 
      ethers.parseUnits("2000", 18), // collateral amount
      ethers.parseUnits("1000", 18)  // borrow amount
    );

    // Check borrow accounting updated
    const totalBorrowsUSDC = await lendingPool.totalBorrows(await tokenUSDC.getAddress());
    expect(totalBorrowsUSDC).to.equal(ethers.parseUnits("1000", 18));

    // Check Bob's debt token balance
    const initialDebt = await debtTokenUSDC.balanceOf(bob.address);
    expect(initialDebt).to.equal(ethers.parseUnits("1000", 18));

    // Advance time by 30 days and simulate interest accrual
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 3600]);
    await ethers.provider.send("evm_mine");

    // Call accrue for Bob
    await lendingPool.accrueFor(bob.address, await tokenUSDC.getAddress());
    
    // DebtToken should have increased due to interest
    const debtBalance = await debtTokenUSDC.balanceOf(bob.address);
    expect(debtBalance).to.be.gt(ethers.parseUnits("1000", 18));

    // Test that the borrow and interest accrual worked correctly
    // The debt should be greater than the initial borrow due to interest
    expect(debtBalance).to.be.gt(initialDebt);
    
    // Test that we can get user's total debt including interest
    const totalDebt = await lendingPool.getUserTotalDebt(bob.address, await tokenUSDC.getAddress());
    expect(totalDebt).to.be.gt(ethers.parseUnits("1000", 18));
  });

  it("should handle deposit and withdraw correctly", async function () {
    // Check initial deposit
    const aliceDeposit = await lendingPool.deposits(await tokenUSDC.getAddress(), alice.address);
    expect(aliceDeposit).to.equal(ethers.parseUnits("5000", 18));

    const totalDeposits = await lendingPool.totalDeposits(await tokenUSDC.getAddress());
    expect(totalDeposits).to.equal(ethers.parseUnits("5000", 18));

    // Alice withdraws 1000 cUSD
    await lendingPool.connect(alice).withdraw(await tokenUSDC.getAddress(), ethers.parseUnits("1000", 18));

    // Check updated balances
    const newAliceDeposit = await lendingPool.deposits(await tokenUSDC.getAddress(), alice.address);
    expect(newAliceDeposit).to.equal(ethers.parseUnits("4000", 18));

    const newTotalDeposits = await lendingPool.totalDeposits(await tokenUSDC.getAddress());
    expect(newTotalDeposits).to.equal(ethers.parseUnits("4000", 18));
  });

  it("should handle repay correctly", async function () {
    // Bob borrows 1000 cUSD
    await lendingPool.connect(bob).borrow(
      await tokenCEUR.getAddress(), 
      await tokenUSDC.getAddress(), 
      ethers.parseUnits("2000", 18),
      ethers.parseUnits("1000", 18)
    );

    // Bob repays 500 cUSD
    await tokenUSDC.connect(bob).approve(await lendingPool.getAddress(), ethers.parseUnits("500", 18));
    await lendingPool.connect(bob).repay(await tokenUSDC.getAddress(), ethers.parseUnits("500", 18));

    // Check debt reduced
    const remainingDebt = await debtTokenUSDC.balanceOf(bob.address);
    expect(remainingDebt).to.be.lt(ethers.parseUnits("1000", 18));

    // Check total borrows reduced
    const totalBorrows = await lendingPool.totalBorrows(await tokenUSDC.getAddress());
    expect(totalBorrows).to.be.lt(ethers.parseUnits("1000", 18));
  });

  it("should revert when trying to withdraw more than available liquidity", async function () {
    // Bob borrows most of the liquidity (but within collateral limits)
    await lendingPool.connect(bob).borrow(
      await tokenCEUR.getAddress(), 
      await tokenUSDC.getAddress(), 
      ethers.parseUnits("2000", 18),
      ethers.parseUnits("1000", 18) // Reduced to stay within collateral ratio
    );

    // Check available liquidity is now 4000 (5000 - 1000)
    const availableLiquidity = await lendingPool.getAvailableLiquidity(await tokenUSDC.getAddress());
    expect(availableLiquidity).to.equal(ethers.parseUnits("4000", 18));

    // Alice tries to withdraw more than available liquidity
    await expect(
      lendingPool.connect(alice).withdraw(await tokenUSDC.getAddress(), ethers.parseUnits("5000", 18))
    ).to.be.revertedWith("Insufficient liquidity");
  });

  it("should revert when trying to borrow more than available liquidity", async function () {
    // Bob tries to borrow more than available
    await expect(
      lendingPool.connect(bob).borrow(
        await tokenCEUR.getAddress(), 
        await tokenUSDC.getAddress(), 
        ethers.parseUnits("2000", 18),
        ethers.parseUnits("6000", 18)
      )
    ).to.be.revertedWith("Insufficient liquidity");
  });

  it("should revert when trying to borrow without sufficient collateral", async function () {
    // Bob tries to borrow with insufficient collateral ratio
    await expect(
      lendingPool.connect(bob).borrow(
        await tokenCEUR.getAddress(), 
        await tokenUSDC.getAddress(), 
        ethers.parseUnits("2000", 18),
        ethers.parseUnits("2000", 18) // Too much for 150% collateralization
      )
    ).to.be.revertedWith("Insufficient collateral ratio");
  });

  it("should handle rate updates correctly", async function () {
    // First, create some activity to have meaningful rates
    await lendingPool.connect(bob).borrow(
      await tokenCEUR.getAddress(), 
      await tokenUSDC.getAddress(), 
      ethers.parseUnits("2000", 18),
      ethers.parseUnits("1000", 18)
    );

    // Update rates for USDC
    await lendingPool.updateRates(await tokenUSDC.getAddress());

    // Check rates were updated
    const borrowRate = await lendingPool.lastBorrowRate(await tokenUSDC.getAddress());
    const supplyRate = await lendingPool.lastSupplyRate(await tokenUSDC.getAddress());
    const lastUpdate = await lendingPool.lastRateUpdate(await tokenUSDC.getAddress());

    expect(borrowRate).to.be.gt(0);
    expect(supplyRate).to.be.gt(0);
    expect(lastUpdate).to.be.gt(0);
  });

  it("should handle utilization rate calculation correctly", async function () {
    // Initial utilization should be 0
    let utilization = await lendingPool.getUtilizationRate(await tokenUSDC.getAddress());
    expect(utilization).to.equal(0);

    // Bob borrows 1000 cUSD
    await lendingPool.connect(bob).borrow(
      await tokenCEUR.getAddress(), 
      await tokenUSDC.getAddress(), 
      ethers.parseUnits("2000", 18),
      ethers.parseUnits("1000", 18)
    );

    // Utilization should be 20% (1000/5000)
    utilization = await lendingPool.getUtilizationRate(await tokenUSDC.getAddress());
    expect(utilization).to.equal(ethers.parseUnits("0.2", 18));
  });

  it("should handle available liquidity calculation correctly", async function () {
    // Initial available liquidity should be 5000
    let available = await lendingPool.getAvailableLiquidity(await tokenUSDC.getAddress());
    expect(available).to.equal(ethers.parseUnits("5000", 18));

    // Bob borrows 1000 cUSD
    await lendingPool.connect(bob).borrow(
      await tokenCEUR.getAddress(), 
      await tokenUSDC.getAddress(), 
      ethers.parseUnits("2000", 18),
      ethers.parseUnits("1000", 18)
    );

    // Available liquidity should be 4000
    available = await lendingPool.getAvailableLiquidity(await tokenUSDC.getAddress());
    expect(available).to.equal(ethers.parseUnits("4000", 18));
  });

  it("should handle user position queries correctly", async function () {
    // Check Alice's position
    const [aliceDeposited, aliceBorrowed] = await lendingPool.getUserPosition(alice.address, await tokenUSDC.getAddress());
    expect(aliceDeposited).to.equal(ethers.parseUnits("5000", 18));
    expect(aliceBorrowed).to.equal(0);

    // Bob borrows
    await lendingPool.connect(bob).borrow(
      await tokenCEUR.getAddress(), 
      await tokenUSDC.getAddress(), 
      ethers.parseUnits("2000", 18),
      ethers.parseUnits("1000", 18)
    );

    // Check Bob's position
    const [bobDeposited, bobBorrowed] = await lendingPool.getUserPosition(bob.address, await tokenUSDC.getAddress());
    expect(bobDeposited).to.equal(0);
    expect(bobBorrowed).to.equal(ethers.parseUnits("1000", 18));
  });
});