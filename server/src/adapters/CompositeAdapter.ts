import { IRawJob, ISourceAdapter } from './BaseAdapter';
import { Logger } from '../utils/logger';

export class CompositeAdapter implements ISourceAdapter {
  constructor(private adapters: ISourceAdapter[]) {
    if (!adapters.length) {
      throw new Error('CompositeAdapter requires at least one ISourceAdapter.');
    }
  }

  getSourceName(): string {
    return this.adapters.map((a) => a.getSourceName()).join('+');
  }

  async fetchAndParse(): Promise<IRawJob[]> {
    for (let i = 0; i < this.adapters.length; i++) {
      const adapter = this.adapters[i];
      try {
        Logger.info('CompositeAdapter', `Attempting ingestion via adapter [${adapter.getSourceName()}] (${i + 1}/${this.adapters.length})`);
        const jobs = await adapter.fetchAndParse();
        if (jobs && jobs.length > 0) {
          Logger.info('CompositeAdapter', `Adapter [${adapter.getSourceName()}] succeeded with ${jobs.length} jobs.`);
          return jobs;
        }
        Logger.warn('CompositeAdapter', `Adapter [${adapter.getSourceName()}] returned 0 jobs. Trying next adapter...`);
      } catch (err: any) {
        Logger.error('CompositeAdapter', `Adapter [${adapter.getSourceName()}] failed: ${err.message}. Trying next adapter...`);
      }
    }

    Logger.error('CompositeAdapter', 'All adapters failed or returned 0 jobs.');
    return [];
  }
}
