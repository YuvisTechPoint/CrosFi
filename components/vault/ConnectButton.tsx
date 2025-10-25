'use client'

import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export function ConnectButton() {
  const { address, isConnected, isLoading, connect, disconnect } = useWallet()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={connect}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}
