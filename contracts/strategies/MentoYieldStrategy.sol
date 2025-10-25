// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../libraries/TokenConfig.sol";

/**
 * @title MentoYieldStrategy
 * @dev Strategy that generates yield through Mento protocol interactions
 * This is a simplified implementation for the hackathon demo
 */
contract MentoYieldStrategy is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    // Events
    event Deposited(address indexed token, uint256 amount);
    event Withdrawn(address indexed token, uint256 amount);
    event YieldGenerated(address indexed token, uint256 yieldAmount);
    event Rebalanced(address indexed fromToken, address indexed toToken, uint256 amount);

    // State variables
    mapping(address => uint256) public tokenDeposits; // token => total deposited
    mapping(address => uint256) public tokenWithdrawals; // token => total withdrawn
    mapping(address => uint256) public tokenYield; // token => total yield generated
    
    uint256 public constant APY_BASIS_POINTS = 800; // 8% APY
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public lastYieldCalculation;
    
    // Mento protocol addresses (placeholder - would be real addresses in production)
    address public constant MENTO_RESERVE = address(0x1234567890123456789012345678901234567890);
    
    // Modifiers
    modifier onlyVault() {
        require(msg.sender == vault, "Only vault can call this function");
        _;
    }

    modifier onlyWhitelistedToken(address token) {
        require(TokenConfig.isSupportedToken(token), "Token not supported");
        _;
    }

    address public vault;

    constructor() {
        lastYieldCalculation = block.timestamp;
    }

    /**
     * @dev Set the vault address (can only be called once)
     * @param _vault Vault contract address
     */
    function setVault(address _vault) external onlyOwner {
        require(vault == address(0), "Vault already set");
        require(_vault != address(0), "Invalid vault address");
        vault = _vault;
    }

    /**
     * @dev Deposit tokens into the strategy
     * @param token Token address
     * @param amount Amount to deposit
     */
    function deposit(address token, uint256 amount) 
        external 
        onlyVault 
        onlyWhitelistedToken(token)
        nonReentrant 
    {
        require(amount > 0, "Amount must be greater than 0");
        
        // Update deposits
        tokenDeposits[token] = tokenDeposits[token].add(amount);
        
        // In a real implementation, this would:
        // 1. Swap tokens through Mento protocol for optimal yield
        // 2. Provide liquidity to Mento pools
        // 3. Stake tokens in yield-generating protocols
        
        // For demo purposes, we just track the deposit
        emit Deposited(token, amount);
    }

    /**
     * @dev Withdraw tokens from the strategy
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function withdraw(address token, uint256 amount) 
        external 
        onlyVault 
        onlyWhitelistedToken(token)
        nonReentrant 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= getAvailableBalance(token), "Insufficient balance");
        
        // Update withdrawals
        tokenWithdrawals[token] = tokenWithdrawals[token].add(amount);
        
        // In a real implementation, this would:
        // 1. Unstake tokens from yield protocols
        // 2. Remove liquidity from Mento pools
        // 3. Swap back to requested token if needed
        
        // For demo purposes, we just track the withdrawal
        emit Withdrawn(token, amount);
    }

    /**
     * @dev Calculate and generate yield for all tokens
     */
    function generateYield() external {
        uint256 timeElapsed = block.timestamp.sub(lastYieldCalculation);
        require(timeElapsed >= 1 hours, "Yield calculation too frequent");
        
        address[] memory supportedTokens = TokenConfig.getAllSupportedTokens();
        
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            uint256 currentDeposits = tokenDeposits[token].sub(tokenWithdrawals[token]);
            
            if (currentDeposits > 0) {
                // Calculate yield based on APY and time elapsed
                uint256 yieldAmount = calculateYield(token, currentDeposits, timeElapsed);
                
                if (yieldAmount > 0) {
                    tokenYield[token] = tokenYield[token].add(yieldAmount);
                    emit YieldGenerated(token, yieldAmount);
                }
            }
        }
        
        lastYieldCalculation = block.timestamp;
    }

    /**
     * @dev Calculate yield for a specific token and time period
     * @param token Token address
     * @param principal Principal amount
     * @param timeElapsed Time elapsed in seconds
     * @return yieldAmount Calculated yield amount
     */
    function calculateYield(address token, uint256 principal, uint256 timeElapsed) 
        public 
        pure 
        returns (uint256) 
    {
        // Simple interest calculation: yield = principal * rate * time
        // APY_BASIS_POINTS is in basis points (800 = 8%)
        uint256 ratePerSecond = APY_BASIS_POINTS.mul(1e18).div(10000).div(SECONDS_PER_YEAR);
        return principal.mul(ratePerSecond).mul(timeElapsed).div(1e18);
    }

    /**
     * @dev Get available balance for a token (deposits - withdrawals + yield)
     * @param token Token address
     * @return balance Available balance
     */
    function getAvailableBalance(address token) public view returns (uint256) {
        uint256 netDeposits = tokenDeposits[token].sub(tokenWithdrawals[token]);
        uint256 currentYield = getCurrentYield(token);
        return netDeposits.add(currentYield);
    }

    /**
     * @dev Get current yield for a token
     * @param token Token address
     * @return yield Current yield amount
     */
    function getCurrentYield(address token) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp.sub(lastYieldCalculation);
        uint256 netDeposits = tokenDeposits[token].sub(tokenWithdrawals[token]);
        
        if (netDeposits == 0 || timeElapsed == 0) {
            return tokenYield[token];
        }
        
        uint256 newYield = calculateYield(token, netDeposits, timeElapsed);
        return tokenYield[token].add(newYield);
    }

    /**
     * @dev Get total value locked for a token
     * @param token Token address
     * @return tvl Total value locked
     */
    function getTVL(address token) external view returns (uint256) {
        return getAvailableBalance(token);
    }

    /**
     * @dev Get current APY for a token
     * @param token Token address
     * @return apy APY in basis points
     */
    function getAPY(address token) external pure returns (uint256) {
        // In a real implementation, this would calculate APY based on:
        // 1. Current Mento pool rates
        // 2. Liquidity mining rewards
        // 3. Protocol fees
        return APY_BASIS_POINTS; // 8% for demo
    }

    /**
     * @dev Rebalance strategy (placeholder for future implementation)
     * @param fromToken Source token
     * @param toToken Destination token
     * @param amount Amount to rebalance
     */
    function rebalance(address fromToken, address toToken, uint256 amount) 
        external 
        onlyOwner 
        onlyWhitelistedToken(fromToken)
        onlyWhitelistedToken(toToken)
    {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= getAvailableBalance(fromToken), "Insufficient balance");
        
        // In a real implementation, this would:
        // 1. Withdraw from current position
        // 2. Swap through Mento protocol
        // 3. Deposit into new position
        
        emit Rebalanced(fromToken, toToken, amount);
    }

    /**
     * @dev Get strategy statistics
     * @param token Token address
     * @return deposits Total deposits
     * @return withdrawals Total withdrawals
     * @return yield Total yield generated
     * @return tvl Current TVL
     */
    function getStrategyStats(address token) 
        external 
        view 
        returns (
            uint256 deposits,
            uint256 withdrawals,
            uint256 yield,
            uint256 tvl
        ) 
    {
        deposits = tokenDeposits[token];
        withdrawals = tokenWithdrawals[token];
        yield = getCurrentYield(token);
        tvl = getAvailableBalance(token);
    }

    /**
     * @dev Emergency function to withdraw all funds (only owner)
     * @param token Token address
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = getAvailableBalance(token);
        require(balance > 0, "No funds to withdraw");
        
        tokenWithdrawals[token] = tokenWithdrawals[token].add(balance);
        emit Withdrawn(token, balance);
    }
}
