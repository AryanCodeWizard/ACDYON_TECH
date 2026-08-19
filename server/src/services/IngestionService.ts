import { ISourceAdapter } from '../adapters/BaseAdapter';
import { IngestionRun } from '../models/IngestionRun.model';
import { Job } from '../models/Job.model';
import { generateFingerprint } from '../utils/fingerprint';
import { Logger } from '../utils/logger';
import { validateRawJob } from '../utils/validator';

export class IngestionService {
  constructor(private adapter: ISourceAdapter) {}

  async run() {
    const startTime = Date.now();
    const sourceName = this.adapter.getSourceName();

    const run = new IngestionRun({
      source: sourceName,
      status: 'running',
    });
    await run.save();

    Logger.info('IngestionService', `Started ingestion run ${run._id} for source '${sourceName}'`);

    try {
      const rawJobs = await this.adapter.fetchAndParse();
      let inserted = 0;
      let duplicates = 0;
      let errors = 0;

      for (const rawItem of rawJobs) {
        try {
          // 1. Validate raw job payload
          const validated = validateRawJob(rawItem, sourceName);

          // 2. Generate SHA-256 fingerprint hash
          const fingerprint = generateFingerprint(validated);

          // 3. Primary deduplication check (SHA-256 Fingerprint)
          const existingByFingerprint = await Job.findOne({ fingerprint });
          if (existingByFingerprint) {
            duplicates++;
            continue;
          }

          // 4. Secondary deduplication check (source + externalId)
          const existingByExtId = await Job.findOne({
            source: sourceName,
            externalId: validated.externalId,
          });
          if (existingByExtId) {
            duplicates++;
            continue;
          }

          // 5. Save validated job
          const job = new Job({
            ...validated,
            source: sourceName,
            fingerprint,
          });
          await job.save();
          inserted++;
        } catch (err: any) {
          errors++;
          Logger.warn('IngestionService', `Skipped invalid job item from source '${sourceName}': ${err.message}`);
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

      const durationMs = Date.now() - startTime;
      Logger.ingestionRun(sourceName, run.metrics, durationMs);

      return run;
    } catch (error: any) {
      run.status = 'failed';
      run.errorMessage = error.message || 'Unknown ingestion pipeline error';
      run.completedAt = new Date();
      await run.save();

      Logger.error('IngestionService', `Ingestion run ${run._id} failed for source '${sourceName}': ${error.message}`);
      throw error;
    }
  }
}