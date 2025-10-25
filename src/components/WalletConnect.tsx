'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  getProvider, 
  getSigner, 
  truncateAddress, 
  getNetworkName, 
  isMetaMaskInstalled,
  requestAccountAccess,
  getCurrentChainId,
  formatError
} from '@/lib/eth';

interface WalletConnectProps {
  onConnected?: (signer: ethers.Signer) => void;
  onDisconnected?: () => void;
}

export default function WalletConnect({ onConnected, onDisconnected }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>("");

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      const provider = getProvider();
      if (provider instanceof ethers.BrowserProvider) {
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const chainId = await getCurrentChainId();
          
          setAddress(address);
          setNetwork(getNetworkName(chainId));
          
          if (onConnected) {
            onConnected(signer);
          }
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const setupEventListeners = () => {
    if (!isMetaMaskInstalled()) return;

    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        checkConnection();
      }
    });

    // Listen for network changes
    window.ethereum.on('chainChanged', (chainId: string) => {
      const networkName = getNetworkName(parseInt(chainId, 16));
      setNetwork(networkName);
      // Optionally refresh the page or update contracts
      window.location.reload();
    });
  };

  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      // Request account access
      await requestAccountAccess();
      
      // Get signer and address
      const signer = await getSigner();
      const address = await signer.getAddress();
      const chainId = await getCurrentChainId();
      
      setAddress(address);
      setNetwork(getNetworkName(chainId));
      
      if (onConnected) {
        onConnected(signer);
      }
      
      console.log("Wallet connected:", address);
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      setError(formatError(error));
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setNetwork("");
    setError("");
    
    if (onDisconnected) {
      onDisconnected();
    }
    
    console.log("Wallet disconnected");
  };

  if (address) {
    return (
      <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm border">
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">{network}</span>
          <span className="text-sm font-mono font-medium">{truncateAddress(address)}</span>
        </div>
        <button
          onClick={disconnect}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}
      <button
        onClick={connect}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.076 13.308-5.076 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05c-3.124-3.124-8.19-3.124-11.314 0a1 1 0 01-1.414-1.414c4.01-4.01 10.522-4.01 14.532 0a1 1 0 01-1.414 1.414zM12.12 13.88c-1.171-1.171-3.073-1.171-4.244 0a1 1 0 01-1.415-1.415c2.053-2.054 5.378-2.054 7.432 0a1 1 0 01-1.415 1.415zM9 16a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
            </svg>
            Connect Wallet
          </>
        )}
      </button>
    </div>
  );
}
