import { Router } from 'express';
import { CompositeAdapter } from '../adapters/CompositeAdapter';
import { RemotiveAdapter } from '../adapters/RemotiveAdapter';
import { RSSAdapter } from '../adapters/RSSAdapter';
import { IngestionRun } from '../models/IngestionRun.model';
import { IngestionService } from '../services/IngestionService';
import { Logger } from '../utils/logger';

const router = Router();

router.post('/run', async (req, res) => {
  try {
    const { source } = req.body || {};

    let adapter;
    if (source === 'remotive') {
      adapter = new RemotiveAdapter();
    } else if (source === 'rss' || source === 'weworkremotely') {
      adapter = new RSSAdapter();
    } else {
      // Default to CompositeAdapter with fallback strategy
      adapter = new CompositeAdapter([new RSSAdapter(), new RemotiveAdapter()]);
    }

    const service = new IngestionService(adapter);
    const run = await service.run();
    res.status(202).json({ runId: run._id, status: run.status, metrics: run.metrics });
  } catch (error: any) {
    Logger.error('IngestionRoute', `Failed to trigger ingestion: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.get('/runs', async (req, res) => {
  try {
    const runs = await IngestionRun.find().sort({ startedAt: -1 }).limit(20);
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/runs/:id', async (req, res) => {
  try {
    const run = await IngestionRun.findById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(run);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;