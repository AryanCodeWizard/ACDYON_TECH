import { IRawJob, ISourceAdapter } from '../adapters/BaseAdapter';

import { IngestionRun } from '../models/IngestionRun.model';
import { Job } from '../models/Job.model';
import { generateFingerprint } from '../utils/fingerprint';
import mongoose from 'mongoose';

export class IngestionService {
  constructor(private adapter: ISourceAdapter) {}

  async run() {
    const run = new IngestionRun({
      source: this.adapter.getSourceName(),
      status: 'running',
    });
    await run.save();

    try {
      const rawJobs = await this.adapter.fetchAndParse();
      let inserted = 0;
      let duplicates = 0;
      let errors = 0;

      // Process each job sequentially to handle dedupe properly
      for (const raw of rawJobs) {
        try {
          const fingerprint = generateFingerprint(raw);

          // Check if job already exists via fingerprint (primary dedupe)
          const existing = await Job.findOne({ fingerprint });
          if (existing) {
            duplicates++;
            continue;
          }

          // Optional: Check via source+externalId (secondary dedupe)
          const existingByExt = await Job.findOne({
            source: this.adapter.getSourceName(),
            externalId: raw.externalId,
          });
          if (existingByExt) {
            duplicates++;
            continue;
          }

          // Save new job
          const job = new Job({
            ...raw,
            source: this.adapter.getSourceName(),
            fingerprint,
          });
          await job.save();
          inserted++;
        } catch (err) {
          errors++;
          // Log error but continue processing other jobs
          console.error('Error processing job:', err);
        }
      }

      run.status = 'completed';
      run.metrics = {
        fetched: rawJobs.length,
        inserted,
        duplicates,
        errors,
      };
      run.completedAt = new Date();
      await run.save();

      return run;
    } catch (error: any) {
      run.status = 'failed';
      run.errorMessage = error.message || 'Unknown error';
      run.completedAt = new Date();
      await run.save();
      throw error;
    }
  }
}