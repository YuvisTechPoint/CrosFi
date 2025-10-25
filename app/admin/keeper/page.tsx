'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { 
  getContract, 
  formatAmount, 
  parseAmount,
  waitForTransaction,
  getExplorerUrl,
  formatError
} from '@/lib/eth';
import { CONTRACTS, TOKENS, isAdminAddress } from '@/lib/contracts';

interface EventLog {
  type: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  data: any;
}

export default function AdminKeeperPage() {
  const router = useRouter();
  const [userAddress, setUserAddress] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  
  // Rate Update State
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [rateUpdateTxHash, setRateUpdateTxHash] = useState('');
  
  // Accrue Interest State
  const [accrueUser, setAccrueUser] = useState('');
  const [accrueToken, setAccrueToken] = useState('');
  const [accrueTxHash, setAccrueTxHash] = useState('');
  
  // Manual Liquidation State
  const [liquidationBorrower, setLiquidationBorrower] = useState('');
  const [liquidationRepayToken, setLiquidationRepayToken] = useState('');
  const [liquidationCollateralToken, setLiquidationCollateralToken] = useState('');
  const [liquidationAmount, setLiquidationAmount] = useState('');
  const [liquidationTxHash, setLiquidationTxHash] = useState('');

  useEffect(() => {
    checkAuthorization();
    setupEventListeners();
  }, []);

  const checkAuthorization = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        
        if (isAdminAddress(address)) {
          setIsAuthorized(true);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.log('No wallet connected');
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  const setupEventListeners = () => {
    if (!isAuthorized) return;

    const provider = getContract(CONTRACTS.lendingPool.address, CONTRACTS.lendingPool.abi).provider;
    
    // Listen for various contract events
    const eventFilters = [
      {
        name: 'RateUpdated',
        filter: {
          address: CONTRACTS.lendingPool.address,
          topics: [ethers.id('RateUpdated(address,uint256,uint256)')]
        }
      },
      {
        name: 'Accrue',
        filter: {
          address: CONTRACTS.lendingPool.address,
          topics: [ethers.id('Accrue(address,address)')]
        }
      },
      {
        name: 'LiquidationExecuted',
        filter: {
          address: CONTRACTS.lendingPool.address,
          topics: [ethers.id('LiquidationExecuted(address,address,address,uint256)')]
        }
      },
      {
        name: 'Deposit',
        filter: {
          address: CONTRACTS.lendingPool.address,
          topics: [ethers.id('Deposit(address,address,uint256)')]
        }
      },
      {
        name: 'Borrow',
        filter: {
          address: CONTRACTS.lendingPool.address,
          topics: [ethers.id('Borrow(address,address,address,uint256,uint256)')]
        }
      }
    ];

    eventFilters.forEach(({ name, filter }) => {
      provider.on(filter, (log) => {
        const eventLog: EventLog = {
          type: name,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          timestamp: Date.now(),
          data: log
        };
        
        setEventLogs(prev => [eventLog, ...prev.slice(0, 49)]); // Keep last 50 events
      });
    });
  };

  const handleUpdateRates = async () => {
    if (!selectedToken) {
      setError('Please select a token');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const lendingPoolContract = getContract(CONTRACTS.lendingPool.address, CONTRACTS.lendingPool.abi);
      
      const tx = await lendingPoolContract.updateRates(selectedToken);
      setRateUpdateTxHash(tx.hash);
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        setSuccess('Rates updated successfully');
        setSelectedToken('');
      } else {
        throw new Error('Rate update transaction failed');
      }
    } catch (error: any) {
      console.error('Rate update failed:', error);
      setError(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAccrueInterest = async () => {
    if (!accrueUser || !accrueToken) {
      setError('Please enter user address and select token');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const lendingPoolContract = getContract(CONTRACTS.lendingPool.address, CONTRACTS.lendingPool.abi);
      
      const tx = await lendingPoolContract.accrueFor(accrueUser, accrueToken);
      setAccrueTxHash(tx.hash);
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        setSuccess('Interest accrued successfully');
        setAccrueUser('');
        setAccrueToken('');
      } else {
        throw new Error('Accrue transaction failed');
      }
    } catch (error: any) {
      console.error('Accrue failed:', error);
      setError(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleManualLiquidation = async () => {
    if (!liquidationBorrower || !liquidationRepayToken || !liquidationCollateralToken || !liquidationAmount) {
      setError('Please fill all liquidation fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const lendingPoolContract = getContract(CONTRACTS.lendingPool.address, CONTRACTS.lendingPool.abi);
      const parsedAmount = parseAmount(liquidationAmount);
      
      const tx = await lendingPoolContract.liquidatePosition(
        liquidationBorrower,
        liquidationRepayToken,
        liquidationCollateralToken,
        parsedAmount
      );
      
      setLiquidationTxHash(tx.hash);
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        setSuccess('Liquidation executed successfully');
        setLiquidationBorrower('');
        setLiquidationRepayToken('');
        setLiquidationCollateralToken('');
        setLiquidationAmount('');
      } else {
        throw new Error('Liquidation transaction failed');
      }
    } catch (error: any) {
      console.error('Liquidation failed:', error);
      setError(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You are not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Keeper</h1>
          <p className="text-gray-600">Protocol maintenance and monitoring tools</p>
          <p className="text-sm text-gray-500 mt-1">Connected as: {userAddress}</p>
        </div>

        {/* Messages */}
        {(error || success) && (
          <div className="mb-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-2">
                {error}
                <button onClick={clearMessages} className="ml-2 text-red-500 hover:text-red-700">×</button>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                {success}
                <button onClick={clearMessages} className="ml-2 text-green-500 hover:text-green-700">×</button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rate Update Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Update Rates</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Token
                </label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a token...</option>
                  {Object.values(TOKENS).map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpdateRates}
                disabled={loading || !selectedToken}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
              >
                {loading ? 'Updating...' : 'Update Rates'}
              </button>

              {rateUpdateTxHash && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm text-blue-700">
                    Transaction: 
                    <a 
                      href={getExplorerUrl(rateUpdateTxHash)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:no-underline"
                    >
                      {rateUpdateTxHash.slice(0, 10)}...{rateUpdateTxHash.slice(-8)}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Accrue Interest Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Accrue Interest</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Address
                </label>
                <input
                  type="text"
                  value={accrueUser}
                  onChange={(e) => setAccrueUser(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token
                </label>
                <select
                  value={accrueToken}
                  onChange={(e) => setAccrueToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a token...</option>
                  {Object.values(TOKENS).map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAccrueInterest}
                disabled={loading || !accrueUser || !accrueToken}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md font-medium transition-colors"
              >
                {loading ? 'Accruing...' : 'Accrue Interest'}
              </button>

              {accrueTxHash && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-sm text-green-700">
                    Transaction: 
                    <a 
                      href={getExplorerUrl(accrueTxHash)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:no-underline"
                    >
                      {accrueTxHash.slice(0, 10)}...{accrueTxHash.slice(-8)}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual Liquidation Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Manual Liquidation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borrower Address
                </label>
                <input
                  type="text"
                  value={liquidationBorrower}
                  onChange={(e) => setLiquidationBorrower(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repay Token
                </label>
                <select
                  value={liquidationRepayToken}
                  onChange={(e) => setLiquidationRepayToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose repay token...</option>
                  {Object.values(TOKENS).map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collateral Token
                </label>
                <select
                  value={liquidationCollateralToken}
                  onChange={(e) => setLiquidationCollateralToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose collateral token...</option>
                  {Object.values(TOKENS).map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repay Amount
                </label>
                <input
                  type="number"
                  value={liquidationAmount}
                  onChange={(e) => setLiquidationAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.000001"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleManualLiquidation}
                disabled={loading || !liquidationBorrower || !liquidationRepayToken || !liquidationCollateralToken || !liquidationAmount}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md font-medium transition-colors"
              >
                {loading ? 'Executing...' : 'Execute Liquidation'}
              </button>

              {liquidationTxHash && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm text-red-700">
                    Transaction: 
                    <a 
                      href={getExplorerUrl(liquidationTxHash)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:no-underline"
                    >
                      {liquidationTxHash.slice(0, 10)}...{liquidationTxHash.slice(-8)}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Log Viewer */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Event Logs</h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {eventLogs.length === 0 ? (
                <p className="text-gray-500 text-sm">No events yet. Perform some actions to see logs.</p>
              ) : (
                eventLogs.map((log, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-blue-600">{log.type}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Block: {log.blockNumber} | 
                      <a 
                        href={getExplorerUrl(log.transactionHash)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 underline hover:no-underline"
                      >
                        {log.transactionHash.slice(0, 10)}...
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
