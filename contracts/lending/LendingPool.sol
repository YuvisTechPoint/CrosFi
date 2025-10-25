// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Interfaces
interface IInterestModel {
    function getBorrowRate(address token, uint256 totalDeposits, uint256 totalBorrows, 
        uint256 marketVolatility, uint256 poolLiquidity, uint256 priceDeviation) 
        external view returns (uint256);
    function getSupplyRate(address token, uint256 totalDeposits, uint256 totalBorrows, 
        uint256 reserveFactor) external view returns (uint256);
}

interface IOracleAdapter {
    function getExchangeRate(address base, address quote) external view returns (uint256);
    function getVolatility(address token) external view returns (uint256);
    function getPriceDeviation(address token) external view returns (uint256);
}

interface IDebtToken {
    function mintDebt(address borrower, uint256 amount) external;
    function burnDebt(address borrower, uint256 amount) external;
    function accrueInterest(address borrower) external;
    function balanceOf(address borrower) external view returns (uint256);
    function getAccruedDebt(address borrower) external view returns (uint256);
}

interface ICollateralManager {
    function getCollateralValue(address user, address token, address denomToken) 
        external view returns (uint256);
    function getTotalCollateralValueForTokens(address user, address[] memory tokens, 
        address denomToken) external view returns (uint256);
    function isLiquidatableForTokens(address user, address borrowToken, 
        address[] memory collateralTokens) external view returns (bool);
    function liquidateForTokens(address borrower, address repayToken, 
        address collateralToken, uint256 repayAmount, address[] memory collateralTokens) external;
    function approvedCollateralTokens(address token) external view returns (bool);
}

/**
 * @title LendingPool - Integrated Lending Protocol
 * @notice A comprehensive lending pool that coordinates with InterestModel, OracleAdapter, 
 *         DebtToken, and CollateralManager contracts for decentralized lending
 * @dev Implements deposit, withdraw, borrow, repay, and liquidation functionality
 * @author CrosFi Team
 */
contract LendingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Core mappings
    mapping(address => uint256) public totalDeposits;  // token => total deposited
    mapping(address => mapping(address => uint256)) public deposits;  // token => user => amount
    mapping(address => uint256) public totalBorrows;  // token => total borrowed
    mapping(address => mapping(address => uint256)) public borrows;  // token => user => principal

    // Token => DebtToken address mapping (per-token debt tracking)
    mapping(address => address) public debtTokens;

    // Protocol parameters
    address public reserve;  // Protocol reserve address
    uint256 public reserveFactor;  // 1e18 precision (0.1e18 = 10%)
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_RESERVE_FACTOR = 5e17;  // Max 50%

    // Contract references
    IInterestModel public interestModel;
    IOracleAdapter public oracle;
    ICollateralManager public collateralManager;

    // Rate storage (for gas optimization)
    mapping(address => uint256) public lastBorrowRate;
    mapping(address => uint256) public lastSupplyRate;
    mapping(address => uint256) public lastRateUpdate;

    // Events
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event Borrow(address indexed user, address indexed collateralToken, address indexed borrowToken, 
        uint256 collateralAmount, uint256 borrowAmount);
    event Repay(address indexed user, address indexed token, uint256 amount);
    event RateUpdated(address indexed token, uint256 borrowRate, uint256 supplyRate);
    event Accrue(address indexed user, address indexed token, uint256 interest);
    event LiquidationExecuted(address indexed borrower, address indexed liquidator, 
        address indexed token, uint256 amount);
    event DebtTokenSet(address indexed token, address indexed debtToken);
    event ReserveFactorUpdated(uint256 newFactor);
    event ReserveUpdated(address indexed newReserve);

    // Modifiers
    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be > 0");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    /**
     * @notice Constructor to initialize the lending pool
     * @param _interestModel Address of the InterestModel contract
     * @param _oracle Address of the OracleAdapter contract
     * @param _collateralManager Address of the CollateralManager contract
     * @param _reserve Address of the protocol reserve
     * @param _reserveFactor Reserve factor in 1e18 precision (e.g., 0.1e18 = 10%)
     */
    constructor(
        address _interestModel,
        address _oracle,
        address _collateralManager,
        address _reserve,
        uint256 _reserveFactor
    ) {
        require(_interestModel != address(0), "Invalid interest model");
        require(_oracle != address(0), "Invalid oracle");
        require(_collateralManager != address(0), "Invalid collateral manager");
        require(_reserve != address(0), "Invalid reserve");
        require(_reserveFactor <= MAX_RESERVE_FACTOR, "Reserve factor too high");
        
        interestModel = IInterestModel(_interestModel);
        oracle = IOracleAdapter(_oracle);
        collateralManager = ICollateralManager(_collateralManager);
        reserve = _reserve;
        reserveFactor = _reserveFactor;
    }

    /**
     * @notice Deposit tokens into the lending pool
     * @param token Token address to deposit
     * @param amount Amount to deposit
     */
    function deposit(address token, uint256 amount) external nonReentrant validAmount(amount) {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        deposits[token][msg.sender] += amount;
        totalDeposits[token] += amount;
        
        emit Deposit(msg.sender, token, amount);
    }

    /**
     * @notice Withdraw tokens from the lending pool
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function withdraw(address token, uint256 amount) external nonReentrant validAmount(amount) {
        require(deposits[token][msg.sender] >= amount, "Insufficient balance");
        
        // Ensure pool solvency
        uint256 available = totalDeposits[token] - totalBorrows[token];
        require(available >= amount, "Insufficient liquidity");
        
        deposits[token][msg.sender] -= amount;
        totalDeposits[token] -= amount;
        
        IERC20(token).safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, token, amount);
    }

    /**
     * @notice Borrow tokens using collateral deposited in CollateralManager
     * @param collateralToken Token used as collateral (must be deposited in CollateralManager first)
     * @param borrowToken Token to borrow
     * @param collateralAmount Amount of collateral (for validation)
     * @param borrowAmount Amount to borrow
     */
    function borrow(
        address collateralToken,
        address borrowToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external nonReentrant validAmount(borrowAmount) validAmount(collateralAmount) {
        require(debtTokens[borrowToken] != address(0), "No debt token for borrow token");
        
        // Check liquidity
        uint256 available = totalDeposits[borrowToken] - totalBorrows[borrowToken];
        require(available >= borrowAmount, "Insufficient liquidity");
        
        // User must have already deposited collateral to CollateralManager
        // Verify collateral value is sufficient
        uint256 collateralValue = collateralManager.getCollateralValue(
            msg.sender, collateralToken, borrowToken
        );
        require(collateralValue >= collateralAmount, "Insufficient collateral in manager");
        
        // Check health factor with oracle prices
        uint256 borrowValue = borrowAmount;
        uint256 requiredCollateral = (borrowValue * 150) / 100;  // 150% collateralization
        require(collateralValue >= requiredCollateral, "Insufficient collateral ratio");
        
        // Mint debt tokens
        IDebtToken(debtTokens[borrowToken]).mintDebt(msg.sender, borrowAmount);
        
        // Update state
        borrows[borrowToken][msg.sender] += borrowAmount;
        totalBorrows[borrowToken] += borrowAmount;
        
        // Transfer borrowed tokens
        IERC20(borrowToken).safeTransfer(msg.sender, borrowAmount);
        
        emit Borrow(msg.sender, collateralToken, borrowToken, collateralAmount, borrowAmount);
    }

    /**
     * @notice Repay borrowed tokens with interest
     * @param token Token to repay
     * @param amount Amount to repay
     */
    function repay(address token, uint256 amount) external nonReentrant validAmount(amount) {
        require(debtTokens[token] != address(0), "No debt token");
        
        // Accrue interest first
        IDebtToken debtToken = IDebtToken(debtTokens[token]);
        debtToken.accrueInterest(msg.sender);
        
        // Get actual debt with interest
        uint256 totalDebt = debtToken.getAccruedDebt(msg.sender);
        uint256 repayAmount = amount > totalDebt ? totalDebt : amount;
        
        // Transfer repayment
        IERC20(token).safeTransferFrom(msg.sender, address(this), repayAmount);
        
        // Calculate interest portion for reserve
        uint256 principal = borrows[token][msg.sender];
        uint256 interestPortion = repayAmount > principal ? repayAmount - principal : 0;
        uint256 reserveAmount = (interestPortion * reserveFactor) / PRECISION;
        
        // Burn debt
        debtToken.burnDebt(msg.sender, repayAmount);
        
        // Update borrows
        uint256 principalRepaid = repayAmount > principal ? principal : repayAmount;
        borrows[token][msg.sender] -= principalRepaid;
        totalBorrows[token] -= principalRepaid;
        
        // Transfer reserve portion
        if (reserveAmount > 0) {
            IERC20(token).safeTransfer(reserve, reserveAmount);
        }
        
        emit Repay(msg.sender, token, repayAmount);
    }

    /**
     * @notice Update interest rates for a token
     * @param token Token to update rates for
     */
    function updateRates(address token) external {
        uint256 volatility = oracle.getVolatility(token);
        uint256 priceDeviation = oracle.getPriceDeviation(token);
        uint256 liquidity = totalDeposits[token] - totalBorrows[token];
        
        uint256 borrowRate = interestModel.getBorrowRate(
            token,
            totalDeposits[token],
            totalBorrows[token],
            volatility,
            liquidity,
            priceDeviation
        );
        
        uint256 supplyRate = interestModel.getSupplyRate(
            token,
            totalDeposits[token],
            totalBorrows[token],
            reserveFactor
        );
        
        lastBorrowRate[token] = borrowRate;
        lastSupplyRate[token] = supplyRate;
        lastRateUpdate[token] = block.timestamp;
        
        emit RateUpdated(token, borrowRate, supplyRate);
    }

    /**
     * @notice Accrue interest for a user's debt
     * @param user User address
     * @param token Token to accrue interest for
     */
    function accrueFor(address user, address token) external {
        require(debtTokens[token] != address(0), "No debt token");
        IDebtToken(debtTokens[token]).accrueInterest(user);
        emit Accrue(user, token, 0);  // Interest amount tracked in DebtToken
    }

    /**
     * @notice Liquidate an undercollateralized position
     * @param borrower Borrower address to liquidate
     * @param repayToken Token to repay (debt token)
     * @param collateralToken Collateral token to seize
     * @param repayAmount Amount to repay
     * @param collateralTokens Array of collateral tokens to check
     */
    function liquidatePosition(
        address borrower,
        address repayToken,
        address collateralToken,
        uint256 repayAmount,
        address[] memory collateralTokens
    ) external nonReentrant validAmount(repayAmount) {
        // Check if liquidatable
        bool isLiquidatable = collateralManager.isLiquidatableForTokens(
            borrower, repayToken, collateralTokens
        );
        require(isLiquidatable, "Position not liquidatable");
        
        // Execute liquidation through CollateralManager
        collateralManager.liquidateForTokens(
            borrower, repayToken, collateralToken, repayAmount, collateralTokens
        );
        
        // Update borrows
        uint256 borrowerDebt = borrows[repayToken][borrower];
        uint256 debtReduction = repayAmount > borrowerDebt ? borrowerDebt : repayAmount;
        borrows[repayToken][borrower] -= debtReduction;
        totalBorrows[repayToken] -= debtReduction;
        
        emit LiquidationExecuted(borrower, msg.sender, repayToken, repayAmount);
    }

    // Admin Functions

    /**
     * @notice Set debt token address for a token
     * @param token Token address
     * @param debtToken DebtToken contract address
     */
    function setDebtTokenFor(address token, address debtToken) external onlyOwner {
        require(debtToken != address(0), "Invalid debt token");
        debtTokens[token] = debtToken;
        emit DebtTokenSet(token, debtToken);
    }

    /**
     * @notice Set reserve factor
     * @param newFactor New reserve factor in 1e18 precision
     */
    function setReserveFactor(uint256 newFactor) external onlyOwner {
        require(newFactor <= MAX_RESERVE_FACTOR, "Factor too high");
        reserveFactor = newFactor;
        emit ReserveFactorUpdated(newFactor);
    }

    /**
     * @notice Set interest model address
     * @param _model New InterestModel contract address
     */
    function setInterestModel(address _model) external onlyOwner validAddress(_model) {
        interestModel = IInterestModel(_model);
    }

    /**
     * @notice Set oracle adapter address
     * @param _oracle New OracleAdapter contract address
     */
    function setOracle(address _oracle) external onlyOwner validAddress(_oracle) {
        oracle = IOracleAdapter(_oracle);
    }

    /**
     * @notice Set collateral manager address
     * @param _manager New CollateralManager contract address
     */
    function setCollateralManager(address _manager) external onlyOwner validAddress(_manager) {
        collateralManager = ICollateralManager(_manager);
    }

    /**
     * @notice Set reserve address
     * @param _reserve New reserve address
     */
    function setReserve(address _reserve) external onlyOwner validAddress(_reserve) {
        reserve = _reserve;
        emit ReserveUpdated(_reserve);
    }

    // View Functions

    /**
     * @notice Get user's position for a specific token
     * @param user User address
     * @param token Token address
     * @return deposited Amount deposited by user
     * @return borrowed Amount borrowed by user (principal only)
     */
    function getUserPosition(address user, address token) 
        external view returns (uint256 deposited, uint256 borrowed) 
    {
        deposited = deposits[token][user];
        borrowed = borrows[token][user];
    }

    /**
     * @notice Get available liquidity for a token
     * @param token Token address
     * @return Available liquidity (deposits - borrows)
     */
    function getAvailableLiquidity(address token) external view returns (uint256) {
        return totalDeposits[token] - totalBorrows[token];
    }

    /**
     * @notice Get utilization rate for a token
     * @param token Token address
     * @return Utilization rate in 1e18 precision
     */
    function getUtilizationRate(address token) external view returns (uint256) {
        if (totalDeposits[token] == 0) return 0;
        return (totalBorrows[token] * PRECISION) / totalDeposits[token];
    }

    /**
     * @notice Get user's total debt including accrued interest
     * @param user User address
     * @param token Token address
     * @return Total debt with interest
     */
    function getUserTotalDebt(address user, address token) external view returns (uint256) {
        if (debtTokens[token] == address(0)) return 0;
        return IDebtToken(debtTokens[token]).getAccruedDebt(user);
    }

    /**
     * @notice Check if a user's position is liquidatable
     * @param user User address
     * @param borrowToken Token borrowed
     * @param collateralTokens Array of collateral tokens to check
     * @return True if position is liquidatable
     */
    function isUserLiquidatable(
        address user,
        address borrowToken,
        address[] memory collateralTokens
    ) external view returns (bool) {
        return collateralManager.isLiquidatableForTokens(user, borrowToken, collateralTokens);
    }

    // TODO: Implement per-lender interest accrual index for accurate interest distribution
    // TODO: Add flash loan functionality with fee collection
    // TODO: Implement supply/borrow caps per token for risk management
    // TODO: Add pause mechanism for emergency situations
    // TODO: Implement time-weighted average rates for smoother rate updates
    // TODO: Add support for native token (CELO) deposits and borrows
}