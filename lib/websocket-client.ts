import { useEffect, useRef, useState } from 'react'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface UseWebSocketOptions {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002',
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    try {
      wsRef.current = new WebSocket(url)
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else {
          setError('Max reconnection attempts reached')
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('WebSocket connection error')
      }
    } catch (err) {
      console.error('Error creating WebSocket connection:', err)
      setError('Failed to create WebSocket connection')
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [url])

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect
  }
}

// Hook for vault-specific WebSocket updates
export function useVaultUpdates() {
  const { isConnected, lastMessage, error } = useWebSocket()
  const [vaultStats, setVaultStats] = useState<any>(null)
  const [userPositions, setUserPositions] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'VAULT_STATS_UPDATE':
          setVaultStats(lastMessage.data)
          break
        case 'USER_POSITION_UPDATE':
          setUserPositions(lastMessage.data)
          break
        case 'NEW_TRANSACTION':
          setTransactions(prev => [lastMessage.data, ...prev.slice(0, 9)]) // Keep last 10
          break
        case 'APY_UPDATE':
          // Handle APY updates
          break
        default:
          console.log('Unknown message type:', lastMessage.type)
      }
    }
  }, [lastMessage])

  return {
    isConnected,
    error,
    vaultStats,
    userPositions,
    transactions
  }
}

// Hook for real-time notifications
export function useNotifications() {
  const { lastMessage } = useWebSocket()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'NOTIFICATION') {
      setNotifications(prev => [lastMessage.data, ...prev.slice(0, 4)]) // Keep last 5
    }
  }, [lastMessage])

  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    clearNotifications
  }
}
