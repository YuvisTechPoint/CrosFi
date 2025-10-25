"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  provider: ethers.BrowserProvider | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)

  // Check if already connected on mount
  useEffect(() => {
    checkConnection()
  }, [])

  // Poll for account changes when connected
  useEffect(() => {
    if (!isConnected) return

    const pollInterval = setInterval(async () => {
      try {
        const ethereumProvider = await detectEthereumProvider()
        if (ethereumProvider && 'request' in ethereumProvider) {
          const accounts = await (ethereumProvider as any).request({ method: 'eth_accounts' })
          if (accounts.length === 0) {
            // User disconnected
            setAddress(null)
            setIsConnected(false)
            setProvider(null)
          } else if (accounts[0] !== address) {
            // User switched accounts
            setAddress(accounts[0])
          }
        }
      } catch (err) {
        console.error('Error polling accounts:', err)
      }
    }, 1000) // Check every second

    return () => clearInterval(pollInterval)
  }, [isConnected, address])

  const checkConnection = async () => {
    try {
      const ethereumProvider = await detectEthereumProvider()
      if (ethereumProvider && 'request' in ethereumProvider) {
        const accounts = await (ethereumProvider as any).request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          setProvider(new ethers.BrowserProvider(ethereumProvider as any))
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err)
    }
  }

  const connect = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const ethereumProvider = await detectEthereumProvider()
      
      if (!ethereumProvider) {
        throw new Error('MetaMask not detected. Please install MetaMask.')
      }

      // Request account access
      const accounts = await (ethereumProvider as any).request({ 
        method: 'eth_requestAccounts' 
      })

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        setProvider(new ethers.BrowserProvider(ethereumProvider as any))
      }

    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('Wallet connection error:', err)
    } finally {
      setIsLoading(false)
    }
  }


  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setProvider(null)
    setError(null)
  }

  const value: WalletContextType = {
    address,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    provider
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
