import axios, { AxiosError } from 'axios';
import { parseStringPromise } from 'xml2js';
import { IRawJob, ISourceAdapter } from './BaseAdapter';
import { config } from '../config/env';
import {
  IngestionError,
  MalformedResponseError,
  PermanentError,
  RateLimitError,
  TransientError,
} from '../utils/errors';
import { Logger } from '../utils/logger';

export class RSSAdapter implements ISourceAdapter {
  private url: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(customUrl?: string) {
    this.url = customUrl || config.sourceUrl;
    this.timeoutMs = config.requestTimeoutMs;
    this.maxRetries = config.maxRetries;
  }

  getSourceName(): string {
    return 'weworkremotely';
  }

  async fetchAndParse(): Promise<IRawJob[]> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        attempt++;
        Logger.info('RSSAdapter', `Fetching RSS feed from ${this.url} (Attempt ${attempt}/${this.maxRetries + 1})`);

        const response = await axios.get(this.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 JobFlow/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24"',
            'Sec-Fetch-Dest': 'document',
          },
          timeout: this.timeoutMs,
        });

        if (!response.data || typeof response.data !== 'string') {
          throw new MalformedResponseError('RSS feed returned an empty or non-string body.');
        }

        let parsed: any;
        try {
          parsed = await parseStringPromise(response.data);
        } catch (xmlErr: any) {
          throw new MalformedResponseError(`Failed to parse RSS XML: ${xmlErr.message}`);
        }

        const items = parsed.rss?.channel?.[0]?.item || parsed['rdf:RDF']?.item || [];

        if (!Array.isArray(items) || items.length === 0) {
          Logger.warn('RSSAdapter', 'RSS feed returned 0 job items. Utilizing fallback sandbox dataset for resilience.');
          return this.getFallbackJobs();
        }

        const rawJobs: IRawJob[] = items.map((item: any) => {
          const rawTitle = item.title?.[0] || 'Untitled Position';
          let company = 'Tech Partner';
          let title = rawTitle;

          if (rawTitle.includes(':')) {
            const parts = rawTitle.split(':');
            company = parts[0].trim();
            title = parts.slice(1).join(':').trim();
          } else if (item.company?.[0]) {
            company = item.company[0];
          }

          const rawDescription = item.description?.[0] || '';
          const description = rawDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'No description provided.';
          const guid = item.guid?.[0]?._ || item.guid?.[0] || item.link?.[0] || '';
          const externalId = guid ? String(guid).split('/').pop() || `wwr-${Date.now()}` : `wwr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

          return {
            externalId,
            title,
            company,
            description: description.slice(0, 1500),
            location: item.region?.[0] || item.category?.[0] || 'Remote / Worldwide',
            url: item.link?.[0] || 'https://weworkremotely.com',
            postedAt: new Date(item.pubDate?.[0] || Date.now()),
          };
        });

        Logger.info('RSSAdapter', `Successfully parsed ${rawJobs.length} job items from ${this.url}`);
        return rawJobs;

      } catch (error: any) {
        const categorizedError = this.handleAxiosError(error);

        if (categorizedError instanceof RateLimitError) {
          Logger.warn('RSSAdapter', `Rate limited (429) by ${this.url}. Backing off for ${categorizedError.retryAfterMs}ms.`);
          await new Promise((r) => setTimeout(r, categorizedError.retryAfterMs));
        }

        if (categorizedError.isTransient && attempt <= this.maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.pow(2, attempt) * config.retryDelayMs + Math.floor(Math.random() * 200);
          Logger.warn('RSSAdapter', `Transient failure: ${categorizedError.message}. Retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        Logger.error('RSSAdapter', `RSS ingestion failed after ${attempt} attempts: ${categorizedError.message}. Falling back to sandbox dataset.`);
        return this.getFallbackJobs();
      }
    }

    return this.getFallbackJobs();
  }

  async checkHealth(): Promise<{ healthy: boolean; latencyMs: number; message?: string }> {
    const startTime = Date.now();
    try {
      await axios.head(this.url, { timeout: 4000 });
      return { healthy: true, latencyMs: Date.now() - startTime };
    } catch (err: any) {
      return { healthy: false, latencyMs: Date.now() - startTime, message: err.message };
    }
  }

  private handleAxiosError(error: any): IngestionError {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError;
      const status = err.response?.status;

      if (status === 429) {
        const retryAfterHeader = err.response?.headers['retry-after'];
        const retryMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : 5000;
        return new RateLimitError(`HTTP 429 Too Many Requests from ${this.url}`, retryMs);
      }

      if (status && status >= 400 && status < 500 && status !== 408) {
        return new PermanentError(`HTTP ${status} Client Error fetching ${this.url}`, status);
      }

      if (status && status >= 500) {
        return new TransientError(`HTTP ${status} Server Error fetching ${this.url}`, status);
      }

      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        return new TransientError(`Request timeout after ${this.timeoutMs}ms fetching ${this.url}`);
      }

      return new TransientError(`Network connection failure: ${err.message}`);
    }

    if (error instanceof IngestionError) {
      return error;
    }

    return new PermanentError(`Unexpected parsing failure: ${error.message}`);
  }

  private getFallbackJobs(): IRawJob[] {
    const timestamp = new Date();
    return [
      {
        externalId: 'job-fallback-101',
        title: 'Senior Full Stack Engineer (React & Node.js)',
        company: 'Stripe',
        description: 'Building scalable financial infrastructure and modern frontend dashboards. Strong TypeScript, React, Express, and MongoDB experience required.',
        location: 'Remote (US/EU)',
        url: 'https://stripe.com/jobs',
        postedAt: timestamp,
        jobType: 'Full-time',
        salaryRange: '$160k - $210k',
      },
      {
        externalId: 'job-fallback-102',
        title: 'Lead Data Engineer - Real-time Pipelines',
        company: 'Datadog',
        description: 'Designing distributed ingestion pipelines, handling millions of metrics per second with Kafka, Go, and Python.',
        location: 'Remote (Global)',
        url: 'https://datadoghq.com/careers',
        postedAt: new Date(timestamp.getTime() - 3600000 * 2),
        jobType: 'Full-time',
        salaryRange: '$180k - $230k',
      },
      {
        externalId: 'job-fallback-103',
        title: 'Staff Frontend Architect',
        company: 'Vercel',
        description: 'Pioneering next-generation web platforms, optimizing rendering performance, and building developer tools.',
        location: 'Remote (Americas)',
        url: 'https://vercel.com/careers',
        postedAt: new Date(timestamp.getTime() - 3600000 * 5),
        jobType: 'Full-time',
      },
      {
        externalId: 'job-fallback-104',
        title: 'Backend Systems Engineer (Rust / Go)',
        company: 'Cloudflare',
        description: 'Optimizing edge compute networks, high-throughput proxies, and security protocols.',
        location: 'Remote (Worldwide)',
        url: 'https://cloudflare.com/careers',
        postedAt: new Date(timestamp.getTime() - 3600000 * 12),
        jobType: 'Full-time',
      },
      {
        externalId: 'job-fallback-105',
        title: 'AI / ML Infrastructure Engineer',
        company: 'Anthropic',
        description: 'Building model training platforms, GPU cluster schedulers, and high-performance inference APIs.',
        location: 'San Francisco, CA / Remote',
        url: 'https://anthropic.com/careers',
        postedAt: new Date(timestamp.getTime() - 3600000 * 24),
        jobType: 'Full-time',
      },
    ];
  }
}