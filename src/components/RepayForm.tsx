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

interface RepayFormProps {
  borrowToken: { address: string; symbol: string };
  lendingPoolAddress: string;
  lendingPoolAbi: any;
  debtTokenAddress: string;
  debtTokenAbi: any;
  userAddress?: string;
  onSuccess?: () => void;
}

type TransactionState = 'idle' | 'approving' | 'repaying' | 'success' | 'error';

export default function RepayForm({
  borrowToken,
  lendingPoolAddress,
  lendingPoolAbi,
  debtTokenAddress,
  debtTokenAbi,
  userAddress,
  onSuccess
}: RepayFormProps) {
  const [repayAmount, setRepayAmount] = useState('');
  const [outstandingDebt, setOutstandingDebt] = useState<bigint>(0n);
  const [tokenBalance, setTokenBalance] = useState<bigint>(0n);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [txState, setTxState] = useState<TransactionState>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [gasEstimate, setGasEstimate] = useState<bigint>(0n);

  // ERC20 ABI for token operations
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
  ];

  useEffect(() => {
    if (userAddress && borrowToken.address) {
      fetchUserData();
    }
  }, [userAddress, borrowToken.address, debtTokenAddress]);

  const fetchUserData = async () => {
    try {
      const debtTokenContract = getContract(debtTokenAddress, debtTokenAbi);
      const tokenContract = getContract(borrowToken.address, ERC20_ABI);

      const [debt, balance, currentAllowance] = await Promise.all([
        debtTokenContract.getAccruedDebt(userAddress),
        tokenContract.balanceOf(userAddress),
        tokenContract.allowance(userAddress, lendingPoolAddress)
      ]);

      setOutstandingDebt(debt);
      setTokenBalance(balance);
      setAllowance(currentAllowance);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch debt information');
    }
  };

  const handleRepayAmountChange = (value: string) => {
    setRepayAmount(value);
    setError('');
    
    if (value && parseFloat(value) > 0) {
      estimateTransactionGas(value);
    }
  };

  const estimateTransactionGas = async (amountValue: string) => {
    try {
      const parsedAmount = parseAmount(amountValue);
      
      if (parsedAmount > allowance) {
        // Need to approve first
        const tokenContract = getContract(borrowToken.address, ERC20_ABI);
        const approveGas = await estimateGas(tokenContract, 'approve', lendingPoolAddress, parsedAmount);
        setGasEstimate(approveGas);
      } else {
        // Can repay directly
        const lendingPoolContract = getContract(lendingPoolAddress, lendingPoolAbi);
        const repayGas = await estimateGas(lendingPoolContract, 'repay', borrowToken.address, parsedAmount);
        setGasEstimate(repayGas);
      }
    } catch (error) {
      console.error('Gas estimation failed:', error);
    }
  };

  const handleApprove = async () => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setTxState('approving');
    setError('');

    try {
      const tokenContract = getContract(borrowToken.address, ERC20_ABI);
      const parsedAmount = parseAmount(repayAmount);

      const tx = await tokenContract.approve(lendingPoolAddress, parsedAmount);
      setTxHash(tx.hash);
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        setAllowance(parsedAmount);
        setTxState('idle');
        setTxHash('');
        console.log('Approval successful');
      } else {
        throw new Error('Approval transaction failed');
      }
    } catch (error: any) {
      console.error('Approval failed:', error);
      setError(formatError(error));
      setTxState('error');
    }
  };

  const handleRepay = async () => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const parsedAmount = parseAmount(repayAmount);
    
    if (parsedAmount > tokenBalance) {
      setError('Insufficient token balance');
      return;
    }

    if (parsedAmount > outstandingDebt) {
      setError('Repay amount exceeds outstanding debt');
      return;
    }

    setTxState('repaying');
    setError('');

    try {
      const lendingPoolContract = getContract(lendingPoolAddress, lendingPoolAbi);

      const tx = await lendingPoolContract.repay(borrowToken.address, parsedAmount);
      setTxHash(tx.hash);
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        setTxState('success');
        setRepayAmount('');
        await fetchUserData(); // Refresh debt and balance
        
        if (onSuccess) {
          onSuccess();
        }
        
        console.log('Repay successful');
      } else {
        throw new Error('Repay transaction failed');
      }
    } catch (error: any) {
      console.error('Repay failed:', error);
      setError(formatError(error));
      setTxState('error');
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = Math.min(
      Number(formatAmount(outstandingDebt)),
      Number(formatAmount(tokenBalance))
    );
    setRepayAmount(maxAmount.toString());
    estimateTransactionGas(maxAmount.toString());
  };

  const isApproved = () => {
    if (!repayAmount) return false;
    return parseAmount(repayAmount) <= allowance;
  };

  const isLoading = txState === 'approving' || txState === 'repaying';
  const canApprove = !isLoading && repayAmount && parseFloat(repayAmount) > 0 && !isApproved();
  const canRepay = !isLoading && repayAmount && parseFloat(repayAmount) > 0 && isApproved() && 
                   parseAmount(repayAmount) <= tokenBalance && parseAmount(repayAmount) <= outstandingDebt;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Repay {borrowToken.symbol}</h3>
      
      {/* Debt and Balance Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span>Outstanding Debt:</span>
          <span className="font-mono text-red-600">{formatAmount(outstandingDebt)} {borrowToken.symbol}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Your {borrowToken.symbol} Balance:</span>
          <span className="font-mono">{formatAmount(tokenBalance)} {borrowToken.symbol}</span>
        </div>
        {allowance > 0n && (
          <div className="flex justify-between text-sm">
            <span>Allowance:</span>
            <span className="font-mono">{formatAmount(allowance)} {borrowToken.symbol}</span>
          </div>
        )}
      </div>

      {/* Repay Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount to Repay
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={repayAmount}
            onChange={(e) => handleRepayAmountChange(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleMaxAmount}
            disabled={isLoading || outstandingDebt === 0n || tokenBalance === 0n}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-md transition-colors"
          >
            Max
          </button>
        </div>
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
          ✅ Repay successful!
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isApproved() ? (
          <button
            onClick={handleApprove}
            disabled={!canApprove}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            {txState === 'approving' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {txState === 'approving' ? 'Approving...' : 'Approve'}
          </button>
        ) : (
          <button
            onClick={handleRepay}
            disabled={!canRepay}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            {txState === 'repaying' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {txState === 'repaying' ? 'Repaying...' : 'Repay'}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500">
        {!isApproved() ? (
          <p>First, approve the lending pool to spend your {borrowToken.symbol} tokens.</p>
        ) : (
          <p>Approved! You can now repay your {borrowToken.symbol} debt.</p>
        )}
        <p>You can repay partial or full amount. Interest will be calculated automatically.</p>
      </div>
    </div>
  );
}
