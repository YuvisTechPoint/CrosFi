'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  getContract, 
  formatAmount, 
  parseAmount, 
  estimateGas,
  waitForTransaction,
  getExplorerUrl,
  formatError
} from '@/lib/eth';
import { CONTRACTS, TOKENS } from '@/lib/contracts';

interface BorrowFormProps {
  collateralToken: { address: string; symbol: string };
  borrowToken: { address: string; symbol: string };
  lendingPoolAddress: string;
  lendingPoolAbi: any;
  collateralManagerAddress: string;
  collateralManagerAbi: any;
  userAddress?: string;
  onSuccess?: () => void;
}

type TransactionState = 'idle' | 'borrowing' | 'success' | 'error';

export default function BorrowForm({
  collateralToken,
  borrowToken,
  lendingPoolAddress,
  lendingPoolAbi,
  collateralManagerAddress,
  collateralManagerAbi,
  userAddress,
  onSuccess
}: BorrowFormProps) {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralBalance, setCollateralBalance] = useState<bigint>(0n);
  const [availableLiquidity, setAvailableLiquidity] = useState<bigint>(0n);
  const [healthFactor, setHealthFactor] = useState<number>(0);
  const [txState, setTxState] = useState<TransactionState>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [gasEstimate, setGasEstimate] = useState<bigint>(0n);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (userAddress) {
      fetchUserData();
    }
  }, [userAddress, collateralToken.address, borrowToken.address]);

  const fetchUserData = async () => {
    try {
      const collateralManagerContract = getContract(collateralManagerAddress, collateralManagerAbi);
      const lendingPoolContract = getContract(lendingPoolAddress, lendingPoolAbi);

      const [userCollateral, totalDeposits, totalBorrows] = await Promise.all([
        collateralManagerContract.userCollateral(userAddress, collateralToken.address),
        lendingPoolContract.totalDeposits(borrowToken.address),
        lendingPoolContract.totalBorrows(borrowToken.address)
      ]);

      setCollateralBalance(userCollateral);
      setAvailableLiquidity(totalDeposits - totalBorrows);

      // Calculate health factor
      if (userCollateral > 0n) {
        const collateralValue = await collateralManagerContract.getCollateralValue(
          userAddress, 
          collateralToken.address, 
          borrowToken.address
        );
        setHealthFactor(Number(collateralValue) / 1e18); // Convert to readable number
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch collateral data');
    }
  };

  const handleBorrowAmountChange = (value: string) => {
    setBorrowAmount(value);
    setError('');
    
    if (value && parseFloat(value) > 0) {
      estimateTransactionGas(value);
    }
  };

  const estimateTransactionGas = async (amountValue: string) => {
    try {
      const lendingPoolContract = getContract(lendingPoolAddress, lendingPoolAbi);
      const parsedAmount = parseAmount(amountValue);
      
      const gasEstimate = await estimateGas(
        lendingPoolContract, 
        'borrow', 
        collateralToken.address,
        borrowToken.address,
        collateralBalance, // Use current collateral balance
        parsedAmount
      );
      setGasEstimate(gasEstimate);
    } catch (error) {
      console.error('Gas estimation failed:', error);
    }
  };

  const validateBorrow = (): string | null => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      return 'Please enter a valid borrow amount';
    }

    const parsedAmount = parseAmount(borrowAmount);
    
    if (parsedAmount > availableLiquidity) {
      return 'Insufficient liquidity in the pool';
    }

    if (collateralBalance === 0n) {
      return 'No collateral deposited. Please deposit collateral first.';
    }

    // Check if collateral is sufficient (150% ratio)
    const requiredCollateral = (parsedAmount * 150n) / 100n;
    if (collateralBalance < requiredCollateral) {
      return 'Insufficient collateral. Need at least 150% collateralization ratio.';
    }

    return null;
  };

  const handleBorrow = async () => {
    const validationError = validateBorrow();
    if (validationError) {
      setError(validationError);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmBorrow = async () => {
    setTxState('borrowing');
    setError('');
    setShowConfirmModal(false);

    try {
      const lendingPoolContract = getContract(lendingPoolAddress, lendingPoolAbi);
      const parsedAmount = parseAmount(borrowAmount);

      const tx = await lendingPoolContract.borrow(
        collateralToken.address,
        borrowToken.address,
        collateralBalance, // Use current collateral balance
        parsedAmount
      );
      
      setTxHash(tx.hash);
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        setTxState('success');
        setBorrowAmount('');
        await fetchUserData(); // Refresh data
        
        if (onSuccess) {
          onSuccess();
        }
        
        console.log('Borrow successful');
      } else {
        throw new Error('Borrow transaction failed');
      }
    } catch (error: any) {
      console.error('Borrow failed:', error);
      setError(formatError(error));
      setTxState('error');
    }
  };

  const canBorrow = () => {
    return !txState.includes('borrowing') && 
           borrowAmount && 
           parseFloat(borrowAmount) > 0 && 
           validateBorrow() === null;
  };

  const getHealthFactorColor = (hf: number) => {
    if (hf >= 1.5) return 'text-green-600';
    if (hf >= 1.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">
        Borrow {borrowToken.symbol} using {collateralToken.symbol}
      </h3>
      
      {/* Collateral Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span>Your {collateralToken.symbol} Collateral:</span>
          <span className="font-mono">{formatAmount(collateralBalance)} {collateralToken.symbol}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Available Liquidity:</span>
          <span className="font-mono">{formatAmount(availableLiquidity)} {borrowToken.symbol}</span>
        </div>
        {healthFactor > 0 && (
          <div className="flex justify-between text-sm mt-2">
            <span>Health Factor:</span>
            <span className={`font-mono ${getHealthFactorColor(healthFactor)}`}>
              {(healthFactor * 100).toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Borrow Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount to Borrow ({borrowToken.symbol})
        </label>
        <input
          type="number"
          value={borrowAmount}
          onChange={(e) => handleBorrowAmountChange(e.target.value)}
          placeholder="0.00"
          step="0.000001"
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={txState === 'borrowing'}
        />
      </div>

      {/* Gas Estimate */}
      {gasEstimate > 0n && (
        <div className="mb-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
          Estimated Gas: {gasEstimate.toString()}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Success Display */}
      {txState === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          ✅ Borrow successful!
        </div>
      )}

      {/* Transaction Hash */}
      {txHash && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-700">
            Transaction: 
            <a 
              href={getExplorerUrl(txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-1 underline hover:no-underline"
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          </div>
        </div>
      )}

      {/* Borrow Button */}
      <button
        onClick={handleBorrow}
        disabled={!canBorrow()}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
      >
        {txState === 'borrowing' && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
        {txState === 'borrowing' ? 'Borrowing...' : 'Borrow'}
      </button>

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500">
        <p>You must have sufficient {collateralToken.symbol} collateral deposited to borrow {borrowToken.symbol}.</p>
        <p>Minimum collateralization ratio: 150%</p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Confirm Borrow</h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Borrowing:</span>
                <span className="font-mono">{borrowAmount} {borrowToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Using Collateral:</span>
                <span className="font-mono">{formatAmount(collateralBalance)} {collateralToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Collateralization:</span>
                <span className="font-mono">150%</span>
              </div>
              <div className="flex justify-between">
                <span>Gas Estimate:</span>
                <span className="font-mono">{gasEstimate.toString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBorrow}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Confirm Borrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
