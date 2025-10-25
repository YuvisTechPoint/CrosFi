// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockOracle {
    int256 private price;
    uint8 private decimals_ = 18;
    uint256 private timestamp;

    function setPrice(int256 _price) external {
        price = _price;
        timestamp = block.timestamp;
    }

    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (0, price, timestamp, timestamp, 0);
    }

    function decimals() external view returns (uint8) {
        return decimals_;
    }

    function getPrice() external view returns (int256) {
        return price;
    }
}
