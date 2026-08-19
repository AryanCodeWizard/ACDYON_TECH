import axios from 'axios';
import { IRawJob, ISourceAdapter } from './BaseAdapter';
import { config } from '../config/env';
import { Logger } from '../utils/logger';

export class RemotiveAdapter implements ISourceAdapter {
  private url: string;

  constructor(customUrl?: string) {
    this.url = customUrl || config.secondarySourceUrl;
  }

  getSourceName(): string {
    return 'remotive';
  }

  async fetchAndParse(): Promise<IRawJob[]> {
    try {
      Logger.info('RemotiveAdapter', `Fetching remote tech jobs from REST API endpoint: ${this.url}`);

      const response = await axios.get(this.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 JobFlow/1.0',
          'Accept': 'application/json',
        },
        timeout: config.requestTimeoutMs,
      });

      const jobsData = response.data?.jobs;

      if (!Array.isArray(jobsData) || jobsData.length === 0) {
        Logger.warn('RemotiveAdapter', 'Remotive REST API returned zero job listings.');
        return [];
      }

      return jobsData.map((item: any) => ({
        externalId: String(item.id || `remotive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
        title: item.title || 'Untitled Position',
        company: item.company_name || 'Tech Company',
        description: (item.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500),
        location: item.candidate_required_location || 'Remote',
        url: item.url || 'https://remotive.com',
        postedAt: new Date(item.publication_date || Date.now()),
        jobType: item.job_type || 'Full-time',
        salaryRange: item.salary || undefined,
      }));
    } catch (error: any) {
      Logger.error('RemotiveAdapter', `Failed to fetch from Remotive API: ${error.message}`);
      return [];
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; latencyMs: number; message?: string }> {
    const startTime = Date.now();
    try {
      await axios.get(this.url, { timeout: 4000 });
      return { healthy: true, latencyMs: Date.now() - startTime };
    } catch (err: any) {
      return { healthy: false, latencyMs: Date.now() - startTime, message: err.message };
    }
  }
}
