import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface ClientConnection {
  ws: WebSocket
  userId?: string
  address?: string
}

class WebSocketService {
  private wss: WebSocketServer
  private clients: Map<string, ClientConnection> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    })

    this.setupWebSocketServer()
    this.startHeartbeat()
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId()
      console.log(`New WebSocket connection: ${clientId}`)

      // Store client connection
      this.clients.set(clientId, { ws })

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(clientId, message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
          this.sendError(clientId, 'Invalid message format')
        }
      })

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`WebSocket disconnected: ${clientId}`)
        this.clients.delete(clientId)
      })

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error)
        this.clients.delete(clientId)
      })

      // Send welcome message
      this.sendMessage(clientId, {
        type: 'CONNECTION_ESTABLISHED',
        data: { clientId, timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      })
    })
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client) return

    switch (message.type) {
      case 'SUBSCRIBE_USER':
        if (message.address) {
          client.address = message.address
          console.log(`Client ${clientId} subscribed to user updates: ${message.address}`)
          this.sendMessage(clientId, {
            type: 'SUBSCRIPTION_CONFIRMED',
            data: { address: message.address },
            timestamp: new Date().toISOString()
          })
        }
        break

      case 'SUBSCRIBE_VAULT':
        console.log(`Client ${clientId} subscribed to vault updates`)
        this.sendMessage(clientId, {
          type: 'SUBSCRIPTION_CONFIRMED',
          data: { subscription: 'vault' },
          timestamp: new Date().toISOString()
        })
        break

      case 'PING':
        this.sendMessage(clientId, {
          type: 'PONG',
          data: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        })
        break

      default:
        console.log(`Unknown message type from ${clientId}:`, message.type)
    }
  }

  private sendMessage(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`Error sending message to ${clientId}:`, error)
        this.clients.delete(clientId)
      }
    }
  }

  private sendError(clientId: string, error: string) {
    this.sendMessage(clientId, {
      type: 'ERROR',
      data: { error },
      timestamp: new Date().toISOString()
    })
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  // Broadcast methods for different types of updates
  public broadcastVaultStatsUpdate(stats: any) {
    const message: WebSocketMessage = {
      type: 'VAULT_STATS_UPDATE',
      data: stats,
      timestamp: new Date().toISOString()
    }

    this.broadcastToSubscribers('vault', message)
  }

  public broadcastUserPositionUpdate(address: string, positions: any) {
    const message: WebSocketMessage = {
      type: 'USER_POSITION_UPDATE',
      data: { address, positions },
      timestamp: new Date().toISOString()
    }

    this.broadcastToUser(address, message)
  }

  public broadcastNewTransaction(transaction: any) {
    const message: WebSocketMessage = {
      type: 'NEW_TRANSACTION',
      data: transaction,
      timestamp: new Date().toISOString()
    }

    // Broadcast to the user who made the transaction
    if (transaction.userAddress) {
      this.broadcastToUser(transaction.userAddress, message)
    }

    // Also broadcast to vault subscribers
    this.broadcastToSubscribers('vault', message)
  }

  public broadcastAPYUpdate(token: string, apy: number) {
    const message: WebSocketMessage = {
      type: 'APY_UPDATE',
      data: { token, apy },
      timestamp: new Date().toISOString()
    }

    this.broadcastToSubscribers('vault', message)
  }

  public broadcastNotification(notification: any) {
    const message: WebSocketMessage = {
      type: 'NOTIFICATION',
      data: notification,
      timestamp: new Date().toISOString()
    }

    this.broadcastToAll(message)
  }

  private broadcastToUser(address: string, message: WebSocketMessage) {
    this.clients.forEach((client, clientId) => {
      if (client.address === address) {
        this.sendMessage(clientId, message)
      }
    })
  }

  private broadcastToSubscribers(subscription: string, message: WebSocketMessage) {
    // For now, broadcast to all connected clients
    // In a more sophisticated implementation, you'd track subscriptions
    this.broadcastToAll(message)
  }

  private broadcastToAll(message: WebSocketMessage) {
    this.clients.forEach((client, clientId) => {
      this.sendMessage(clientId, message)
    })
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          this.sendMessage(clientId, {
            type: 'HEARTBEAT',
            data: { timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString()
          })
        } else {
          // Remove dead connections
          this.clients.delete(clientId)
        }
      })
    }, 30000) // Send heartbeat every 30 seconds
  }

  public getConnectedClients(): number {
    return this.clients.size
  }

  public getClientStats() {
    const stats = {
      totalClients: this.clients.size,
      connectedClients: 0,
      subscribedUsers: new Set<string>()
    }

    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        stats.connectedClients++
        if (client.address) {
          stats.subscribedUsers.add(client.address)
        }
      }
    })

    return {
      ...stats,
      subscribedUsers: Array.from(stats.subscribedUsers)
    }
  }

  public shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close()
      }
    })

    this.wss.close()
  }
}

export default WebSocketService
