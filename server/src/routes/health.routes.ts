import { Router } from 'express';
import mongoose from 'mongoose';
import { RemotiveAdapter } from '../adapters/RemotiveAdapter';
import { RSSAdapter } from '../adapters/RSSAdapter';

const router = Router();

router.get('/', async (req, res) => {
  const rssAdapter = new RSSAdapter();
  const remotiveAdapter = new RemotiveAdapter();

  const [rssHealth, remotiveHealth] = await Promise.all([
    rssAdapter.checkHealth(),
    remotiveAdapter.checkHealth(),
  ]);

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    sources: {
      weworkremotely: rssHealth,
      remotive: remotiveHealth,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;