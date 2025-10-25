// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/// @title OracleAdapter - Price Feed Manager and Volatility Calculator
/// @notice Manages multiple price feeds, calculates volatility, and provides price deviation data
/// @dev Integrates with Chainlink oracles and supports historical price tracking for volatility calculation
/// @author CrosFi Team
contract OracleAdapter is Ownable {
    // Core data structures
    struct PriceFeed {
        address oracleAddress;
        uint8 decimals;
        bool isActive;
        uint256 lastPrice;
        uint256 lastUpdateTime;
    }

    struct HistoricalPrice {
        uint256 price;
        uint256 timestamp;
    }

    // State variables
    mapping(address => PriceFeed) public priceFeeds;
    
    // Historical prices for volatility calculation (circular buffer)
    mapping(address => mapping(uint256 => HistoricalPrice)) public historicalPrices;
    mapping(address => uint256) public currentPriceIndex; // Current position in circular buffer
    
    // Constants
    uint256 public constant HISTORY_SIZE = 10; // Store last 10 prices
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_PRICE_AGE = 1 hours;

    // Events
    event PriceFeedUpdated(address indexed token, address indexed oracle);
    event PriceUpdated(address indexed token, uint256 price);
    event PriceFeedDeactivated(address indexed token);

    // Modifiers
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    modifier activePriceFeed(address token) {
        require(priceFeeds[token].isActive, "Price feed not active");
        _;
    }

    /**
     * @notice Sets or updates a price feed for a token
     * @param token The token address to set price feed for
     * @param oracle The oracle contract address
     * @param decimals The number of decimals the oracle returns
     */
    function setPriceFeed(address token, address oracle, uint8 decimals) 
        external 
        onlyOwner 
        validAddress(token) 
        validAddress(oracle) 
    {
        priceFeeds[token] = PriceFeed({
            oracleAddress: oracle,
            decimals: decimals,
            isActive: true,
            lastPrice: 0,
            lastUpdateTime: 0
        });
        
        emit PriceFeedUpdated(token, oracle);
    }

    /**
     * @notice Gets the latest price for a token in cUSD terms (1e18 precision)
     * @param token The token address to get price for
     * @return price The normalized price in 1e18 precision
     */
    function getPrice(address token) 
        external 
        view 
        activePriceFeed(token) 
        returns (uint256 price) 
    {
        AggregatorV3Interface oracle = AggregatorV3Interface(priceFeeds[token].oracleAddress);
        
        (
            ,
            int256 rawPrice,
            ,
            uint256 updatedAt,
            
        ) = oracle.latestRoundData();

        // Sanity checks
        require(rawPrice > 0, "Invalid price");
        require(updatedAt > 0, "Invalid timestamp");
        require(block.timestamp - updatedAt < MAX_PRICE_AGE, "Price too stale");

        // Normalize price to 1e18 precision
        price = _normalizePrice(rawPrice, priceFeeds[token].decimals);
    }

    /**
     * @notice Gets the exchange rate between two tokens
     * @param baseToken The base token address
     * @param quoteToken The quote token address
     * @return rate The exchange rate (baseToken / quoteToken) in 1e18 precision
     */
    function getExchangeRate(address baseToken, address quoteToken) 
        external 
        view 
        returns (uint256 rate) 
    {
        uint256 basePrice = this.getPrice(baseToken);
        uint256 quotePrice = this.getPrice(quoteToken);
        
        require(quotePrice > 0, "Quote price cannot be zero");
        
        rate = (basePrice * PRECISION) / quotePrice;
    }

    /**
     * @notice Calculates the volatility of a token based on historical prices
     * @param token The token address to calculate volatility for
     * @return volatility The volatility as a percentage (1e18 = 100%)
     */
    function getVolatility(address token) external view returns (uint256 volatility) {
        uint256[] memory prices = new uint256[](HISTORY_SIZE);
        uint256 validCount = 0;

        // Collect valid historical prices
        for (uint256 i = 0; i < HISTORY_SIZE; i++) {
            HistoricalPrice memory histPrice = historicalPrices[token][i];
            if (histPrice.price > 0 && histPrice.timestamp > 0) {
                prices[validCount] = histPrice.price;
                validCount++;
            }
        }

        // Need at least 2 samples for volatility calculation
        if (validCount < 2) {
            return 0;
        }

        // Resize array to valid count
        uint256[] memory validPrices = new uint256[](validCount);
        for (uint256 i = 0; i < validCount; i++) {
            validPrices[i] = prices[i];
        }

        volatility = _calculateStandardDeviation(validPrices);
    }

    /**
     * @notice Gets the price deviation between current and last stored price
     * @param token The token address to get deviation for
     * @return deviation The absolute percentage difference (1e18 = 100%)
     */
    function getPriceDeviation(address token) 
        external 
        view 
        activePriceFeed(token) 
        returns (uint256 deviation) 
    {
        uint256 currentPrice = this.getPrice(token);
        uint256 lastPrice = priceFeeds[token].lastPrice;
        
        if (lastPrice == 0) {
            return 0;
        }

        // Calculate absolute percentage difference
        if (currentPrice > lastPrice) {
            deviation = ((currentPrice - lastPrice) * PRECISION) / lastPrice;
        } else {
            deviation = ((lastPrice - currentPrice) * PRECISION) / lastPrice;
        }
    }

    /**
     * @notice Updates the price history for a token (can be called by anyone)
     * @param token The token address to update history for
     */
    function updatePriceHistory(address token) external activePriceFeed(token) {
        uint256 currentPrice = this.getPrice(token);
        uint256 currentIndex = currentPriceIndex[token];
        
        // Store in circular buffer
        historicalPrices[token][currentIndex] = HistoricalPrice({
            price: currentPrice,
            timestamp: block.timestamp
        });
        
        // Update index (circular)
        currentPriceIndex[token] = (currentIndex + 1) % HISTORY_SIZE;
        
        // Update last price and timestamp
        priceFeeds[token].lastPrice = currentPrice;
        priceFeeds[token].lastUpdateTime = block.timestamp;
        
        emit PriceUpdated(token, currentPrice);
    }

    /**
     * @notice Deactivates a price feed
     * @param token The token address to deactivate
     */
    function deactivatePriceFeed(address token) external onlyOwner {
        require(priceFeeds[token].isActive, "Price feed already inactive");
        priceFeeds[token].isActive = false;
        emit PriceFeedDeactivated(token);
    }

    /**
     * @notice Gets all historical prices for a token
     * @param token The token address to get history for
     * @return prices Array of historical prices
     */
    function getHistoricalPrices(address token) 
        external 
        view 
        returns (HistoricalPrice[] memory prices) 
    {
        prices = new HistoricalPrice[](HISTORY_SIZE);
        
        for (uint256 i = 0; i < HISTORY_SIZE; i++) {
            prices[i] = historicalPrices[token][i];
        }
    }

    /**
     * @notice Normalizes a price to 1e18 precision
     * @param price The raw price from oracle
     * @param decimals The number of decimals in the raw price
     * @return normalizedPrice The price in 1e18 precision
     */
    function _normalizePrice(int256 price, uint8 decimals) 
        internal 
        pure 
        returns (uint256 normalizedPrice) 
    {
        uint256 decimalFactor = 10 ** decimals;
        normalizedPrice = (uint256(price) * PRECISION) / decimalFactor;
    }

    /**
     * @notice Calculates the standard deviation of an array of prices
     * @param prices Array of prices to calculate standard deviation for
     * @return stdDev The standard deviation as a percentage (1e18 = 100%)
     */
    function _calculateStandardDeviation(uint256[] memory prices) 
        internal 
        pure 
        returns (uint256 stdDev) 
    {
        uint256 length = prices.length;
        if (length < 2) {
            return 0;
        }

        // Calculate mean
        uint256 sum = 0;
        for (uint256 i = 0; i < length; i++) {
            sum += prices[i];
        }
        uint256 mean = sum / length;

        // Calculate variance
        uint256 variance = 0;
        for (uint256 i = 0; i < length; i++) {
            uint256 diff = prices[i] > mean ? prices[i] - mean : mean - prices[i];
            variance += (diff * diff) / length;
        }

        // Calculate standard deviation (square root of variance)
        stdDev = _sqrt(variance);
    }

    /**
     * @notice Calculates the square root of a number using Babylonian method
     * @param x The number to calculate square root for
     * @return sqrt The square root of x
     */
    function _sqrt(uint256 x) internal pure returns (uint256 sqrt) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        sqrt = y;
    }

    // TODO: Integrate Mento-specific oracle interface for native Celo token pairs
    // TODO: Add support for multiple oracle sources with price aggregation
    // TODO: Implement time-weighted average price (TWAP) calculation
    // TODO: Add circuit breaker for extreme price movements
}
