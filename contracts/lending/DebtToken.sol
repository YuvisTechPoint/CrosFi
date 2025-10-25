// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title DebtToken - Non-transferable debt representation token
/// @notice Represents a borrower's outstanding loan amount for a specific asset
/// @dev Inherits from ERC20 but overrides transfer functions to make it non-transferable
/// @author CrosFi Team
contract DebtToken is ERC20, Ownable {
    // State variables
    address public lendingPool; // The authorized pool that can mint/burn
    mapping(address => uint256) public lastAccrualTimestamp; // Per borrower timestamp
    uint256 public annualInterestRate; // In basis points (bps)
    uint256 public constant BPS_DIVISOR = 10000; // 100% = 10000 bps

    // Events
    event DebtMinted(address indexed borrower, uint256 amount);
    event DebtBurned(address indexed borrower, uint256 amount);
    event InterestAccrued(address indexed borrower, uint256 interest);
    event InterestRateUpdated(uint256 newRate);
    event LendingPoolUpdated(address indexed newPool);

    // Modifiers
    modifier onlyLendingPool() {
        require(msg.sender == lendingPool, "DebtToken: caller is not lending pool");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "DebtToken: invalid address");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "DebtToken: amount must be greater than zero");
        _;
    }

    /**
     * @notice Constructor to initialize the debt token
     * @param name_ The name of the debt token
     * @param symbol_ The symbol of the debt token
     * @param _annualInterestRate The annual interest rate in basis points (e.g., 500 = 5%)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 _annualInterestRate
    ) ERC20(name_, symbol_) {
        require(_annualInterestRate <= BPS_DIVISOR, "DebtToken: interest rate too high");
        
        lendingPool = msg.sender;
        annualInterestRate = _annualInterestRate;
    }

    /**
     * @notice Mint debt tokens to a borrower (only callable by lending pool)
     * @param borrower The address of the borrower
     * @param amount The amount of debt to mint
     */
    function mintDebt(address borrower, uint256 amount) 
        external 
        onlyLendingPool 
        validAddress(borrower) 
        validAmount(amount) 
    {
        // Accrue interest before minting new debt
        accrueInterest(borrower);
        
        // Mint the debt tokens to the borrower
        _mint(borrower, amount);
        
        // Update the last accrual timestamp
        lastAccrualTimestamp[borrower] = block.timestamp;
        
        emit DebtMinted(borrower, amount);
    }

    /**
     * @notice Burn debt tokens from a borrower (only callable by lending pool)
     * @param borrower The address of the borrower
     * @param amount The amount of debt to burn
     */
    function burnDebt(address borrower, uint256 amount) 
        external 
        onlyLendingPool 
        validAddress(borrower) 
        validAmount(amount) 
    {
        // Accrue interest before burning debt
        accrueInterest(borrower);
        
        // Check if borrower has sufficient debt balance
        require(balanceOf(borrower) >= amount, "DebtToken: insufficient debt balance");
        
        // Burn the debt tokens from the borrower
        _burn(borrower, amount);
        
        // Update the last accrual timestamp
        lastAccrualTimestamp[borrower] = block.timestamp;
        
        emit DebtBurned(borrower, amount);
    }

    /**
     * @notice Accrue interest for a borrower based on time elapsed
     * @param borrower The address of the borrower
     */
    function accrueInterest(address borrower) public validAddress(borrower) {
        uint256 currentBalance = balanceOf(borrower);
        
        // If no balance, no interest to accrue
        if (currentBalance == 0) {
            lastAccrualTimestamp[borrower] = block.timestamp;
            return;
        }
        
        uint256 lastTimestamp = lastAccrualTimestamp[borrower];
        
        // If this is the first time, set timestamp and return
        if (lastTimestamp == 0) {
            lastAccrualTimestamp[borrower] = block.timestamp;
            return;
        }
        
        uint256 timeDelta = block.timestamp - lastTimestamp;
        
        // If no time has passed, no interest to accrue
        if (timeDelta == 0) {
            return;
        }
        
        // Calculate interest: balance * rate * time / (365 days * BPS_DIVISOR)
        uint256 interest = (currentBalance * annualInterestRate * timeDelta) / (365 days * BPS_DIVISOR);
        
        // Only mint interest if it's greater than 0
        if (interest > 0) {
            _mint(borrower, interest);
            emit InterestAccrued(borrower, interest);
        }
        
        // Update the last accrual timestamp
        lastAccrualTimestamp[borrower] = block.timestamp;
    }

    /**
     * @notice Get the total accrued debt for a borrower (including pending interest)
     * @param borrower The address of the borrower
     * @return The total debt including accrued interest
     */
    function getAccruedDebt(address borrower) external view validAddress(borrower) returns (uint256) {
        uint256 currentBalance = balanceOf(borrower);
        
        // If no balance, no debt
        if (currentBalance == 0) {
            return 0;
        }
        
        uint256 lastTimestamp = lastAccrualTimestamp[borrower];
        
        // If no previous timestamp, return current balance
        if (lastTimestamp == 0) {
            return currentBalance;
        }
        
        uint256 timeDelta = block.timestamp - lastTimestamp;
        
        // If no time has passed, return current balance
        if (timeDelta == 0) {
            return currentBalance;
        }
        
        // Calculate pending interest without minting
        uint256 pendingInterest = (currentBalance * annualInterestRate * timeDelta) / (365 days * BPS_DIVISOR);
        
        return currentBalance + pendingInterest;
    }

    /**
     * @notice Set the annual interest rate (only callable by owner)
     * @param newRate The new annual interest rate in basis points
     */
    function setAnnualInterestRate(uint256 newRate) external onlyOwner {
        require(newRate <= BPS_DIVISOR, "DebtToken: interest rate too high");
        
        annualInterestRate = newRate;
        emit InterestRateUpdated(newRate);
    }

    /**
     * @notice Set the lending pool address (only callable by owner)
     * @param newPool The new lending pool address
     */
    function setLendingPool(address newPool) external onlyOwner validAddress(newPool) {
        lendingPool = newPool;
        emit LendingPoolUpdated(newPool);
    }

    // Override transfer functions to make the token non-transferable

    /**
     * @notice Override transfer function to prevent transfers
     * @dev This token is non-transferable
     */
    function transfer(address, uint256) public pure override returns (bool) {
        revert("DebtToken: non-transferable");
    }

    /**
     * @notice Override transferFrom function to prevent transfers
     * @dev This token is non-transferable
     */
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("DebtToken: non-transferable");
    }

    /**
     * @notice Override approve function to prevent approvals
     * @dev This token is non-transferable
     */
    function approve(address, uint256) public pure override returns (bool) {
        revert("DebtToken: non-transferable");
    }

    /**
     * @notice Override allowance function to always return 0
     * @dev This token is non-transferable
     */
    function allowance(address, address) public pure override returns (uint256) {
        return 0;
    }

    /**
     * @notice Override increaseAllowance function to prevent approvals
     * @dev This token is non-transferable
     */
    function increaseAllowance(address, uint256) public pure override returns (bool) {
        revert("DebtToken: non-transferable");
    }

    /**
     * @notice Override decreaseAllowance function to prevent approvals
     * @dev This token is non-transferable
     */
    function decreaseAllowance(address, uint256) public pure override returns (bool) {
        revert("DebtToken: non-transferable");
    }

    // TODO: Integrate with InterestModel for dynamic rates
    // TODO: Add compound interest calculation option
    // TODO: Implement interest rate curves based on utilization
    // TODO: Add flash loan protection
}
