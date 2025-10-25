// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title InterestModel - Dynamic Interest Rate Calculator
/// @notice Calculates borrow and supply rates based on market conditions
/// @dev Uses multi-factor model: utilization, volatility, liquidity, price deviation
/// @author CrosFi Team
contract InterestModel is Ownable {
    // Token-specific risk premiums (modifiable by owner)
    mapping(address => uint256) public riskPremium;

    // Constants for rate calculations
    uint256 public constant BASE_RATE = 2e16; // 2% annual base rate
    uint256 public constant BLOCKS_PER_YEAR = 6307200; // 365 days / 5 seconds
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_RISK_PREMIUM = 50e16; // Maximum 50% risk premium

    // Events
    event RiskPremiumUpdated(address indexed token, uint256 oldPremium, uint256 newPremium);

    // Modifiers
    modifier validRate(uint256 rate) {
        require(rate <= MAX_RISK_PREMIUM, "Risk premium too high");
        _;
    }

    /**
     * @notice Calculates the borrow rate for a token based on market conditions
     * @dev Rate = baseRate + utilizationFactor + volatilityFactor + deviationFactor + liquidityPenalty + riskPremium
     * @param token The token address to calculate rate for
     * @param totalDeposits Total amount of tokens deposited in the pool (wei)
     * @param totalBorrows Total amount of tokens borrowed from the pool (wei)
     * @param marketVolatility Current market volatility index (1e18 = 100%)
     * @param poolLiquidity Available liquidity in the pool (wei)
     * @param priceDeviation Price deviation from oracle (1e18 = 100%)
     * @return borrowRate Annual borrow rate with 1e18 precision (5% = 0.05e18)
     */
    function getBorrowRate(
        address token,
        uint256 totalDeposits,
        uint256 totalBorrows,
        uint256 marketVolatility,
        uint256 poolLiquidity,
        uint256 priceDeviation
    ) external view returns (uint256 borrowRate) {
        return _getBorrowRate(token, totalDeposits, totalBorrows, marketVolatility, poolLiquidity, priceDeviation);
    }

    /**
     * @notice Internal function to calculate the borrow rate for a token based on market conditions
     * @dev Rate = baseRate + utilizationFactor + volatilityFactor + deviationFactor + liquidityPenalty + riskPremium
     * @param token The token address to calculate rate for
     * @param totalDeposits Total amount of tokens deposited in the pool (wei)
     * @param totalBorrows Total amount of tokens borrowed from the pool (wei)
     * @param marketVolatility Current market volatility index (1e18 = 100%)
     * @param poolLiquidity Available liquidity in the pool (wei)
     * @param priceDeviation Price deviation from oracle (1e18 = 100%)
     * @return borrowRate Annual borrow rate with 1e18 precision (5% = 0.05e18)
     */
    function _getBorrowRate(
        address token,
        uint256 totalDeposits,
        uint256 totalBorrows,
        uint256 marketVolatility,
        uint256 poolLiquidity,
        uint256 priceDeviation
    ) internal view returns (uint256 borrowRate) {
        // Handle edge case: no deposits
        if (totalDeposits == 0) {
            return BASE_RATE + riskPremium[token];
        }

        // 1. Calculate utilization ratio: U = totalBorrows * 1e18 / totalDeposits
        uint256 utilizationRate = getUtilizationRate(totalDeposits, totalBorrows);

        // 2. Start with base rate: borrowRate = BASE_RATE (2e16)
        borrowRate = BASE_RATE;

        // 3. Add utilization factor: + (U * 8e16 / 1e18)
        // At 100% utilization, this adds 8% to the rate
        borrowRate += (utilizationRate * 8e16) / PRECISION;

        // 4. Add volatility factor: + (marketVolatility * 2e15 / 1e18)
        // At 100% volatility, this adds 0.2% to the rate
        borrowRate += (marketVolatility * 2e15) / PRECISION;

        // 5. Add price deviation factor: + (priceDeviation * 1e15 / 1e18)
        // At 100% price deviation, this adds 0.1% to the rate
        borrowRate += (priceDeviation * 1e15) / PRECISION;

        // 6. Add small pool penalty: + (poolLiquidity < 1e6 ? 3e15 : 0)
        // 3e15 = 0.3% penalty for small pools
        if (poolLiquidity < 1e6) {
            borrowRate += 3e15;
        }

        // 7. Add token risk premium: + riskPremium[token]
        borrowRate += riskPremium[token];

        return borrowRate;
    }

    /**
     * @notice Calculates the supply rate for a token based on borrow rate and reserve factor
     * @dev supplyRate = borrowRate * utilization * (1 - reserveFactor)
     * @param token The token address to calculate rate for
     * @param totalDeposits Total amount of tokens deposited in the pool (wei)
     * @param totalBorrows Total amount of tokens borrowed from the pool (wei)
     * @param reserveFactor Reserve factor as percentage (1e18 = 100%)
     * @return supplyRate Annual supply rate with 1e18 precision (5% = 0.05e18)
     */
    function getSupplyRate(
        address token,
        uint256 totalDeposits,
        uint256 totalBorrows,
        uint256 reserveFactor
    ) external view returns (uint256 supplyRate) {
        // Handle edge case: no deposits
        if (totalDeposits == 0) {
            return 0;
        }

        // Validate reserve factor
        require(reserveFactor <= PRECISION, "Reserve factor too high");

        // Get borrow rate with default market conditions (0 volatility, 0 deviation, high liquidity)
        uint256 borrowRate = _getBorrowRate(token, totalDeposits, totalBorrows, 0, 1e18, 0);

        // Calculate utilization: U = totalBorrows * 1e18 / totalDeposits
        uint256 utilizationRate = getUtilizationRate(totalDeposits, totalBorrows);

        // Calculate supply rate: supplyRate = borrowRate * U * (1e18 - reserveFactor) / 1e36
        supplyRate = (borrowRate * utilizationRate * (PRECISION - reserveFactor)) / (PRECISION * PRECISION);

        return supplyRate;
    }

    /**
     * @notice Sets the risk premium for a specific token (owner only)
     * @dev Risk premium is added to the base borrow rate for token-specific risk assessment
     * @param token The token address to set risk premium for
     * @param value The risk premium value with 1e18 precision (5% = 0.05e18)
     */
    function setRiskPremium(address token, uint256 value) external onlyOwner validRate(value) {
        uint256 oldPremium = riskPremium[token];
        riskPremium[token] = value;
        emit RiskPremiumUpdated(token, oldPremium, value);
    }

    /**
     * @notice Converts annual rate to per-block rate
     * @dev perBlockRate = annualRate / BLOCKS_PER_YEAR
     * @param annualRate Annual interest rate with 1e18 precision
     * @return perBlockRate Per-block interest rate with 1e18 precision
     */
    function convertToPerBlockRate(uint256 annualRate) public pure returns (uint256 perBlockRate) {
        perBlockRate = annualRate / BLOCKS_PER_YEAR;
        return perBlockRate;
    }

    /**
     * @notice Calculates the utilization rate of the lending pool
     * @dev utilizationRate = totalBorrows * PRECISION / totalDeposits
     * @param totalDeposits Total amount of tokens deposited in the pool (wei)
     * @param totalBorrows Total amount of tokens borrowed from the pool (wei)
     * @return utilizationRate Utilization rate with 1e18 precision (80% = 0.8e18)
     */
    function getUtilizationRate(uint256 totalDeposits, uint256 totalBorrows) public pure returns (uint256 utilizationRate) {
        if (totalDeposits == 0) {
            return 0;
        }
        utilizationRate = (totalBorrows * PRECISION) / totalDeposits;
        return utilizationRate;
    }

    /**
     * @notice Gets the current risk premium for a token
     * @param token The token address to query
     * @return premium The current risk premium with 1e18 precision
     */
    function getRiskPremium(address token) external view returns (uint256 premium) {
        return riskPremium[token];
    }

    /**
     * @notice Calculates the maximum possible borrow rate for a token
     * @dev This includes all factors at maximum values for worst-case scenario
     * @param token The token address to calculate for
     * @return maxRate Maximum possible borrow rate with 1e18 precision
     */
    function getMaxBorrowRate(address token) external view returns (uint256 maxRate) {
        // Base rate + max utilization (100%) + max volatility (100%) + max deviation (100%) + small pool penalty + risk premium
        maxRate = BASE_RATE + 8e16 + 2e15 + 1e15 + 3e15 + riskPremium[token];
        return maxRate;
    }

    /**
     * @notice Calculates the minimum possible borrow rate for a token
     * @dev This includes only base rate and risk premium (best-case scenario)
     * @param token The token address to calculate for
     * @return minRate Minimum possible borrow rate with 1e18 precision
     */
    function getMinBorrowRate(address token) external view returns (uint256 minRate) {
        // Base rate + risk premium only
        minRate = BASE_RATE + riskPremium[token];
        return minRate;
    }
}
