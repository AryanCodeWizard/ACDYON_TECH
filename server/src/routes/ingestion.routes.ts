import { IngestionRun } from '../models/IngestionRun.model';
import { IngestionService } from '../services/IngestionService';
import { RSSAdapter } from '../adapters/RSSAdapter';
import { Router } from 'express';

const router = Router();

router.post('/run', async (req, res) => {
  try {
    const adapter = new RSSAdapter();
    const service = new IngestionService(adapter);
    const run = await service.run();
    res.status(202).json({ runId: run._id, status: run.status, metrics: run.metrics });
  } catch (error: any) {
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