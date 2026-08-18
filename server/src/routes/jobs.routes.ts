import { Job } from '../models/Job.model';
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const source = req.query.source as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (source && source !== 'all') filter.source = source;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
        { location: regex },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ postedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    res.json({
      data: jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sources', async (req, res) => {
  try {
    const sources = await Job.distinct('source');
    res.json(sources);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;