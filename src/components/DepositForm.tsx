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

interface DepositFormProps {
  tokenAddress: string;
  tokenSymbol: string;
  lendingPoolAddress: string;
  lendingPoolAbi: any;
  userAddress?: string;
  onSuccess?: () => void;
}

type TransactionState = 'idle' | 'approving' | 'depositing' | 'success' | 'error';

export default function DepositForm({
  tokenAddress,
  tokenSymbol,
  lendingPoolAddress,
  lendingPoolAbi,
  userAddress,
  onSuccess
}: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState<bigint>(0n);
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
    if (userAddress && tokenAddress) {
      fetchUserData();
    }
  }, [userAddress, tokenAddress]);

  const fetchUserData = async () => {
    try {
      const tokenContract = getContract(tokenAddress, ERC20_ABI);
      const lendingPoolContract = getContract(lendingPoolAddress, lendingPoolAbi);

      const [userBalance, currentAllowance] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.allowance(userAddress, lendingPoolAddress)
      ]);

      setBalance(userBalance);
      setAllowance(currentAllowance);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch balance');
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError('');
    
    // Estimate gas when amount changes
    if (value && parseFloat(value) > 0) {
      estimateTransactionGas(value);
    }
  };

  const estimateTransactionGas = async (amountValue: string) => {
    try {
      const tokenContract = getContract(tokenAddress, ERC20_ABI);
      const parsedAmount = parseAmount(amountValue);
      
      // Estimate approve gas if needed
      if (parsedAmount > allowance) {
        const approveGas = await estimateGas(tokenContract, 'approve', lendingPoolAddress, parsedAmount);
        setGasEstimate(approveGas);
      } else {
        // Estimate deposit gas
        const lendingPoolContract = getContract(lendingPoolAddress, lendingPoolAbi);
        const depositGas = await estimateGas(lendingPoolContract, 'deposit', tokenAddress, parsedAmount);
        setGasEstimate(depositGas);
      }
    } catch (error) {
      console.error('Gas estimation failed:', error);
    }
  };

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setTxState('approving');
    setError('');

    try {
      const tokenContract = getContract(tokenAddress, ERC20_ABI);
      const parsedAmount = parseAmount(amount);

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

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseAmount(amount) > balance) {
      setError('Insufficient balance');
      return;
    }

    setTxState('depositing');
    setError('');

    try {
      const lendingPoolContract = getContract(lendingPoolAddress, lendingPoolAbi);
      const parsedAmount = parseAmount(amount);

      const tx = await lendingPoolContract.deposit(tokenAddress, parsedAmount);
      setTxHash(tx.hash);
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        setTxState('success');
        setAmount('');
        await fetchUserData(); // Refresh balance
        
        if (onSuccess) {
          onSuccess();
        }
        
        console.log('Deposit successful');
      } else {
        throw new Error('Deposit transaction failed');
      }
    } catch (error: any) {
      console.error('Deposit failed:', error);
      setError(formatError(error));
      setTxState('error');
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = formatAmount(balance);
    setAmount(maxAmount);
    estimateTransactionGas(maxAmount);
  };

  const isApproved = () => {
    if (!amount) return false;
    return parseAmount(amount) <= allowance;
  };

  const isLoading = txState === 'approving' || txState === 'depositing';
  const canApprove = !isLoading && amount && parseFloat(amount) > 0 && !isApproved();
  const canDeposit = !isLoading && amount && parseFloat(amount) > 0 && isApproved() && parseAmount(amount) <= balance;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Deposit {tokenSymbol}</h3>
      
      {/* Balance Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span>Your Balance:</span>
          <span className="font-mono">{formatAmount(balance)} {tokenSymbol}</span>
        </div>
        {allowance > 0n && (
          <div className="flex justify-between text-sm mt-1">
            <span>Allowance:</span>
            <span className="font-mono">{formatAmount(allowance)} {tokenSymbol}</span>
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount to Deposit
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleMaxAmount}
            disabled={isLoading || balance === 0n}
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
          ✅ Deposit successful!
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
            onClick={handleDeposit}
            disabled={!canDeposit}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            {txState === 'depositing' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {txState === 'depositing' ? 'Depositing...' : 'Deposit'}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500">
        {!isApproved() ? (
          <p>First, approve the lending pool to spend your {tokenSymbol} tokens.</p>
        ) : (
          <p>Approved! You can now deposit your {tokenSymbol} tokens.</p>
        )}
      </div>
    </div>
  );
}
