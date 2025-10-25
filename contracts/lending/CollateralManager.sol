// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../oracles/OracleAdapter.sol";
import "./DebtToken.sol";

/// @title CollateralManager - Collateral Management and Liquidation System
/// @notice Manages user collateral deposits, calculates collateral values using oracle prices, and handles liquidations
/// @dev Integrates with OracleAdapter for price feeds and DebtToken for debt tracking
/// @author CrosFi Team
contract CollateralManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // State variables
    mapping(address => mapping(address => uint256)) public userCollateral; // user => token => amount
    mapping(address => bool) public approvedCollateralTokens; // token => approved status
    
    OracleAdapter public oracle;
    DebtToken public debtToken;
    
    uint256 public liquidationThreshold; // e.g., 7500 = 75%
    uint256 public liquidationBonus;     // e.g., 500 = 5%
    uint256 public constant BPS_DIVISOR = 10000;
    uint256 public constant PRECISION = 1e18;

    // Events
    event CollateralAdded(address indexed user, address indexed token, uint256 amount);
    event CollateralRemoved(address indexed user, address indexed token, uint256 amount);
    event LiquidationExecuted(
        address indexed borrower,
        address indexed liquidator,
        address indexed repayToken,
        uint256 repayAmount,
        address collateralToken,
        uint256 collateralSeized
    );
    event CollateralTokenStatusUpdated(address indexed token, bool status);
    event LiquidationThresholdUpdated(uint256 newThreshold);
    event LiquidationBonusUpdated(uint256 newBonus);

    // Modifiers
    modifier validAddress(address addr) {
        require(addr != address(0), "CollateralManager: invalid address");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "CollateralManager: amount must be greater than zero");
        _;
    }

    modifier onlyApprovedCollateral(address token) {
        require(approvedCollateralTokens[token], "CollateralManager: token not approved as collateral");
        _;
    }

    /**
     * @notice Constructor to initialize the collateral manager
     * @param _oracle Address of the OracleAdapter contract
     * @param _debtToken Address of the DebtToken contract
     * @param _liquidationThreshold Liquidation threshold in basis points (e.g., 7500 = 75%)
     * @param _liquidationBonus Liquidation bonus in basis points (e.g., 500 = 5%)
     */
    constructor(
        address _oracle,
        address _debtToken,
        uint256 _liquidationThreshold,
        uint256 _liquidationBonus
    ) validAddress(_oracle) validAddress(_debtToken) {
        require(_liquidationThreshold <= BPS_DIVISOR, "CollateralManager: liquidation threshold too high");
        require(_liquidationBonus <= BPS_DIVISOR, "CollateralManager: liquidation bonus too high");
        
        oracle = OracleAdapter(_oracle);
        debtToken = DebtToken(_debtToken);
        liquidationThreshold = _liquidationThreshold;
        liquidationBonus = _liquidationBonus;
    }

    /**
     * @notice Add collateral tokens to the user's collateral balance
     * @param token The token address to add as collateral (zero address for native CELO)
     * @param amount The amount of tokens to add
     */
    function addCollateral(address token, uint256 amount) 
        external 
        payable
        nonReentrant 
        onlyApprovedCollateral(token) 
        validAmount(amount) 
    {
        if (token == address(0)) {
            // Handle native CELO
            require(msg.value == amount, "CollateralManager: incorrect CELO amount");
        } else {
            // Handle ERC20 tokens
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
        
        // Update user's collateral balance
        userCollateral[msg.sender][token] += amount;
        
        emit CollateralAdded(msg.sender, token, amount);
    }

    /**
     * @notice Remove collateral tokens from the user's collateral balance
     * @param token The token address to remove from collateral
     * @param amount The amount of tokens to remove
     */
    function removeCollateral(address token, uint256 amount) 
        external 
        nonReentrant 
        validAmount(amount) 
    {
        require(userCollateral[msg.sender][token] >= amount, "CollateralManager: insufficient collateral");
        
        // Check if removal would make user undercollateralized
        uint256 userDebt = debtToken.getAccruedDebt(msg.sender);
        if (userDebt > 0) {
            uint256 currentCollateralValue = getTotalCollateralValue(msg.sender, token);
            uint256 collateralToRemoveValue = getCollateralValue(msg.sender, token, token);
            uint256 remainingCollateralValue = currentCollateralValue > collateralToRemoveValue ? 
                currentCollateralValue - collateralToRemoveValue : 0;
            require(
                remainingCollateralValue * BPS_DIVISOR >= userDebt * liquidationThreshold,
                "CollateralManager: removal would make position undercollateralized"
            );
        }
        
        // Update user's collateral balance
        userCollateral[msg.sender][token] -= amount;
        
        // Transfer tokens back to user
        if (token == address(0)) {
            // Handle native CELO
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "CollateralManager: CELO transfer failed");
        } else {
            // Handle ERC20 tokens
            IERC20(token).safeTransfer(msg.sender, amount);
        }
        
        emit CollateralRemoved(msg.sender, token, amount);
    }

    /**
     * @notice Get the value of a user's collateral in a specific denomination token
     * @param user The user address
     * @param token The collateral token address
     * @param denomToken The denomination token address
     * @return The collateral value in denomToken terms
     */
    function getCollateralValue(
        address user,
        address token,
        address denomToken
    ) public view returns (uint256) {
        uint256 amount = userCollateral[user][token];
        if (amount == 0) {
            return 0;
        }
        
        // If same token, no conversion needed
        if (token == denomToken) {
            return amount;
        }
        
        // Get exchange rate from oracle
        uint256 rate = oracle.getExchangeRate(token, denomToken);
        return (amount * rate) / PRECISION;
    }

    /**
     * @notice Get the total value of a user's collateral in a specific denomination token
     * @param user The user address
     * @param denomToken The denomination token address
     * @return The total collateral value in denomToken terms
     */
    function getTotalCollateralValue(
        address user,
        address denomToken
    ) public view returns (uint256) {
        uint256 totalValue = 0;
        
        // Note: In a production system, you would maintain a list of approved tokens
        // For now, we'll check common tokens. This could be optimized with a token registry.
        address[] memory commonTokens = new address[](3);
        commonTokens[0] = 0x874069fa1ee493706DbeE6Cf34FF9829832E6A00; // cUSD
        commonTokens[1] = 0x62b8b11039FF5064145D0D87d32C658DA4cC2Dc1; // USDC
        commonTokens[2] = 0x0000000000000000000000000000000000000000; // CELO (native)
        
        for (uint256 i = 0; i < commonTokens.length; i++) {
            if (approvedCollateralTokens[commonTokens[i]]) {
                totalValue += getCollateralValue(user, commonTokens[i], denomToken);
            }
        }
        
        return totalValue;
    }

    /**
     * @notice Get the total value of a user's collateral for specific tokens
     * @param user The user address
     * @param tokens Array of token addresses to check
     * @param denomToken The denomination token address
     * @return The total collateral value in denomToken terms
     */
    function getTotalCollateralValueForTokens(
        address user,
        address[] memory tokens,
        address denomToken
    ) public view returns (uint256) {
        uint256 totalValue = 0;
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (approvedCollateralTokens[tokens[i]]) {
                totalValue += getCollateralValue(user, tokens[i], denomToken);
            }
        }
        
        return totalValue;
    }

    /**
     * @notice Check if a user's position is liquidatable
     * @param user The user address
     * @param borrowToken The token the user borrowed
     * @return True if the position is liquidatable
     */
    function isLiquidatable(
        address user,
        address borrowToken
    ) public view returns (bool) {
        uint256 debtValue = debtToken.getAccruedDebt(user);
        if (debtValue == 0) {
            return false; // No debt = not liquidatable
        }
        
        uint256 collateralValue = getTotalCollateralValue(user, borrowToken);
        uint256 healthFactor = (collateralValue * BPS_DIVISOR) / debtValue;
        
        return healthFactor < liquidationThreshold;
    }

    /**
     * @notice Check if a user's position is liquidatable for specific tokens
     * @param user The user address
     * @param borrowToken The token the user borrowed
     * @param collateralTokens Array of collateral token addresses to check
     * @return True if the position is liquidatable
     */
    function isLiquidatableForTokens(
        address user,
        address borrowToken,
        address[] memory collateralTokens
    ) public view returns (bool) {
        uint256 debtValue = debtToken.getAccruedDebt(user);
        if (debtValue == 0) {
            return false; // No debt = not liquidatable
        }
        
        uint256 collateralValue = getTotalCollateralValueForTokens(user, collateralTokens, borrowToken);
        uint256 healthFactor = (collateralValue * BPS_DIVISOR) / debtValue;
        
        return healthFactor < liquidationThreshold;
    }

    /**
     * @notice Liquidate an undercollateralized position
     * @param borrower The borrower address to liquidate
     * @param repayToken The token to repay (debt token)
     * @param collateralToken The collateral token to seize
     * @param repayAmount The amount of debt to repay
     */
    function liquidate(
        address borrower,
        address repayToken,
        address collateralToken,
        uint256 repayAmount
    ) external nonReentrant validAmount(repayAmount) onlyApprovedCollateral(collateralToken) {
        require(isLiquidatable(borrower, repayToken), "CollateralManager: position not liquidatable");
        
        // Calculate collateral to seize
        uint256 rate = oracle.getExchangeRate(repayToken, collateralToken);
        uint256 baseCollateral = (repayAmount * rate) / PRECISION;
        uint256 collateralSeized = baseCollateral * (BPS_DIVISOR + liquidationBonus) / BPS_DIVISOR;
        
        require(
            userCollateral[borrower][collateralToken] >= collateralSeized,
            "CollateralManager: insufficient collateral to seize"
        );
        
        // Transfer repay tokens from liquidator to contract
        IERC20(repayToken).safeTransferFrom(msg.sender, address(this), repayAmount);
        
        // Burn debt from borrower
        debtToken.burnDebt(borrower, repayAmount);
        
        // Update borrower's collateral
        userCollateral[borrower][collateralToken] -= collateralSeized;
        
        // Transfer seized collateral to liquidator
        if (collateralToken == address(0)) {
            // Handle native CELO
            (bool success, ) = payable(msg.sender).call{value: collateralSeized}("");
            require(success, "CollateralManager: CELO transfer failed");
        } else {
            // Handle ERC20 tokens
            IERC20(collateralToken).safeTransfer(msg.sender, collateralSeized);
        }
        
        emit LiquidationExecuted(borrower, msg.sender, repayToken, repayAmount, collateralToken, collateralSeized);
    }

    /**
     * @notice Liquidate an undercollateralized position (for testing with specific collateral tokens)
     * @param borrower The borrower address to liquidate
     * @param repayToken The token to repay (debt token)
     * @param collateralToken The collateral token to seize
     * @param repayAmount The amount of debt to repay
     * @param collateralTokens Array of collateral tokens to check for liquidation eligibility
     */
    function liquidateForTokens(
        address borrower,
        address repayToken,
        address collateralToken,
        uint256 repayAmount,
        address[] memory collateralTokens
    ) external nonReentrant validAmount(repayAmount) onlyApprovedCollateral(collateralToken) {
        require(isLiquidatableForTokens(borrower, repayToken, collateralTokens), "CollateralManager: position not liquidatable");
        
        // Calculate collateral to seize
        uint256 rate = oracle.getExchangeRate(repayToken, collateralToken);
        uint256 baseCollateral = (repayAmount * rate) / PRECISION;
        uint256 collateralSeized = baseCollateral * (BPS_DIVISOR + liquidationBonus) / BPS_DIVISOR;
        
        require(
            userCollateral[borrower][collateralToken] >= collateralSeized,
            "CollateralManager: insufficient collateral to seize"
        );
        
        // Transfer repay tokens from liquidator to contract
        IERC20(repayToken).safeTransferFrom(msg.sender, address(this), repayAmount);
        
        // Burn debt from borrower
        debtToken.burnDebt(borrower, repayAmount);
        
        // Update borrower's collateral
        userCollateral[borrower][collateralToken] -= collateralSeized;
        
        // Transfer seized collateral to liquidator
        if (collateralToken == address(0)) {
            // Handle native CELO
            (bool success, ) = payable(msg.sender).call{value: collateralSeized}("");
            require(success, "CollateralManager: CELO transfer failed");
        } else {
            // Handle ERC20 tokens
            IERC20(collateralToken).safeTransfer(msg.sender, collateralSeized);
        }
        
        emit LiquidationExecuted(borrower, msg.sender, repayToken, repayAmount, collateralToken, collateralSeized);
    }

    /**
     * @notice Set the approved status of a collateral token (only owner)
     * @param token The token address (can be zero address for native CELO)
     * @param status True to approve, false to disapprove
     */
    function setApprovedCollateralToken(address token, bool status) 
        external 
        onlyOwner 
    {
        // Allow zero address for native CELO
        approvedCollateralTokens[token] = status;
        emit CollateralTokenStatusUpdated(token, status);
    }

    /**
     * @notice Set the liquidation threshold (only owner)
     * @param newThreshold The new liquidation threshold in basis points
     */
    function setLiquidationThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold <= BPS_DIVISOR, "CollateralManager: liquidation threshold too high");
        liquidationThreshold = newThreshold;
        emit LiquidationThresholdUpdated(newThreshold);
    }

    /**
     * @notice Set the liquidation bonus (only owner)
     * @param newBonus The new liquidation bonus in basis points
     */
    function setLiquidationBonus(uint256 newBonus) external onlyOwner {
        require(newBonus <= BPS_DIVISOR, "CollateralManager: liquidation bonus too high");
        liquidationBonus = newBonus;
        emit LiquidationBonusUpdated(newBonus);
    }

    /**
     * @notice Get all collateral tokens and amounts for a user
     * @param user The user address
     * @return tokens Array of token addresses
     * @return amounts Array of corresponding amounts
     */
    function getUserCollateralTokens(address user) 
        external 
        view 
        returns (address[] memory tokens, uint256[] memory amounts) 
    {
        address[] memory commonTokens = new address[](3);
        commonTokens[0] = 0x874069fa1ee493706DbeE6Cf34FF9829832E6A00; // cUSD
        commonTokens[1] = 0x62b8b11039FF5064145D0D87d32C658DA4cC2Dc1; // USDC
        commonTokens[2] = 0x0000000000000000000000000000000000000000; // CELO (native)
        
        // Count non-zero balances
        uint256 count = 0;
        for (uint256 i = 0; i < commonTokens.length; i++) {
            if (userCollateral[user][commonTokens[i]] > 0) {
                count++;
            }
        }
        
        // Create arrays
        tokens = new address[](count);
        amounts = new uint256[](count);
        
        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 0; i < commonTokens.length; i++) {
            if (userCollateral[user][commonTokens[i]] > 0) {
                tokens[index] = commonTokens[i];
                amounts[index] = userCollateral[user][commonTokens[i]];
                index++;
            }
        }
    }

    /**
     * @notice Get collateral tokens and amounts for a user for specific tokens
     * @param user The user address
     * @param tokenList Array of token addresses to check
     * @return tokens Array of token addresses with non-zero balances
     * @return amounts Array of corresponding amounts
     */
    function getUserCollateralTokensForList(address user, address[] memory tokenList) 
        external 
        view 
        returns (address[] memory tokens, uint256[] memory amounts) 
    {
        // Count non-zero balances
        uint256 count = 0;
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (userCollateral[user][tokenList[i]] > 0) {
                count++;
            }
        }
        
        // Create arrays
        tokens = new address[](count);
        amounts = new uint256[](count);
        
        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (userCollateral[user][tokenList[i]] > 0) {
                tokens[index] = tokenList[i];
                amounts[index] = userCollateral[user][tokenList[i]];
                index++;
            }
        }
    }

    /**
     * @notice Get the health factor for a user's position
     * @param user The user address
     * @param borrowToken The token the user borrowed
     * @return The health factor (collateral value / debt value) in basis points
     */
    function getHealthFactor(address user, address borrowToken) external view returns (uint256) {
        uint256 debtValue = debtToken.getAccruedDebt(user);
        if (debtValue == 0) {
            return type(uint256).max; // No debt = infinite health factor
        }
        
        uint256 collateralValue = getTotalCollateralValue(user, borrowToken);
        return (collateralValue * BPS_DIVISOR) / debtValue;
    }

    /**
     * @notice Get the health factor for a user's position with specific collateral tokens
     * @param user The user address
     * @param borrowToken The token the user borrowed
     * @param collateralTokens Array of collateral token addresses to check
     * @return The health factor (collateral value / debt value) in basis points
     */
    function getHealthFactorForTokens(
        address user,
        address borrowToken,
        address[] memory collateralTokens
    ) external view returns (uint256) {
        uint256 debtValue = debtToken.getAccruedDebt(user);
        if (debtValue == 0) {
            return type(uint256).max; // No debt = infinite health factor
        }
        
        uint256 collateralValue = getTotalCollateralValueForTokens(user, collateralTokens, borrowToken);
        return (collateralValue * BPS_DIVISOR) / debtValue;
    }

    /**
     * @notice Helper function for testing - mint debt tokens (only for testing)
     * @param borrower The borrower address
     * @param amount The amount to mint
     */
    function mintDebtForTesting(address borrower, uint256 amount) external onlyOwner {
        debtToken.mintDebt(borrower, amount);
    }

    // TODO: Add partial liquidation support
    // TODO: Implement multi-collateral liquidation
    // TODO: Add liquidation protection period for new positions
    // TODO: Implement dynamic liquidation bonus based on market conditions
    // TODO: Add emergency pause functionality
}
