import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import WebSocketService from './websocket';
import { db } from './services/database';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Analytics routes
app.get('/api/analytics/tvl', async (req, res) => {
  try {
    const vaultStats = await db.getVaultStats();
    const totalTVL = vaultStats.reduce((sum, stat) => {
      return sum + parseFloat(stat.total_assets);
    }, 0);
    
    res.json({
      totalTVL: totalTVL.toString(),
      breakdown: vaultStats.map(stat => ({
        token: stat.token,
        tvl: stat.total_assets,
        apy: stat.apy
      }))
    });
  } catch (error) {
    console.error('Error fetching TVL:', error);
    res.status(500).json({ error: 'Failed to fetch TVL' });
  }
});

app.get('/api/analytics/apy/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const vaultStat = await db.getVaultStatsByToken(token);
    
    if (!vaultStat) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    res.json({
      token,
      apy: vaultStat.apy,
      lastUpdated: vaultStat.last_updated
    });
  } catch (error) {
    console.error('Error fetching APY:', error);
    res.status(500).json({ error: 'Failed to fetch APY' });
  }
});

app.get('/api/analytics/apy-history/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { days = 30 } = req.query;
    
    const apyHistory = await db.getAPYHistory(token, parseInt(days as string));
    res.json(apyHistory);
  } catch (error) {
    console.error('Error fetching APY history:', error);
    res.status(500).json({ error: 'Failed to fetch APY history' });
  }
});

// User routes
app.get('/api/user/:address/positions', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Find or create user
    const user = await db.getOrCreateUser(address);
    const positions = await db.getUserPositions(user.id);
    
    res.json(positions);
  } catch (error) {
    console.error('Error fetching user positions:', error);
    res.status(500).json({ error: 'Failed to fetch user positions' });
  }
});

app.get('/api/user/:address/transactions', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Find user
    const user = await db.getUserByAddress(address);
    
    if (!user) {
      return res.json([]);
    }
    
    const transactions = await db.getUserTransactions(
      user.id, 
      parseInt(limit as string), 
      parseInt(offset as string)
    );
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
});

app.get('/api/user/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Find user
    const user = await db.getUserByAddress(address);
    
    if (!user) {
      return res.json({
        totalDeposited: '0',
        totalWithdrawn: '0',
        totalEarned: '0',
        currentPositions: 0
      });
    }
    
    const stats = await db.getUserStats(user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Vault routes
app.get('/api/vault/stats', async (req, res) => {
  try {
    const vaultStats = await db.getVaultStats();
    const totalUsers = await db.getTotalUsers();
    
    res.json({
      totalUsers,
      tokens: vaultStats.map(stat => ({
        token: stat.token,
        totalAssets: stat.total_assets,
        totalShares: stat.total_shares,
        apy: stat.apy,
        lastUpdated: stat.last_updated
      }))
    });
  } catch (error) {
    console.error('Error fetching vault stats:', error);
    res.status(500).json({ error: 'Failed to fetch vault stats' });
  }
});

app.get('/api/vault/tokens', async (req, res) => {
  try {
    const vaultStats = await db.getVaultStats();
    
    res.json(vaultStats.map(stat => ({
      token: stat.token,
      totalAssets: stat.total_assets,
      apy: stat.apy,
      totalUsers: stat.total_users
    })));
  } catch (error) {
    console.error('Error fetching vault tokens:', error);
    res.status(500).json({ error: 'Failed to fetch vault tokens' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// WebSocket status endpoint
app.get('/ws/status', (req, res) => {
  const stats = wsService.getClientStats();
  res.json({
    websocket: {
      connected: true,
      clients: stats.connectedClients,
      totalClients: stats.totalClients,
      subscribedUsers: stats.subscribedUsers
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server running on port ${PORT}/ws`);
  console.log(`📡 WebSocket status: http://localhost:${PORT}/ws/status`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  wsService.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
