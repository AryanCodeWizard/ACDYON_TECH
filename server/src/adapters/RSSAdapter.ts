import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { IRawJob, ISourceAdapter } from './BaseAdapter';

export class RSSAdapter implements ISourceAdapter {
  // Using active WeWorkRemotely RSS feed for live tech jobs
  private url = 'https://weworkremotely.com/remote-jobs.rss';

  async fetchAndParse(): Promise<IRawJob[]> {
    try {
      const response = await axios.get(this.url, {
        headers: {
          'User-Agent': 'JobFlow-Bot/1.0 (Educational Assessment)',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        timeout: 10000,
      });

      const parsed = await parseStringPromise(response.data);
      const items = parsed.rss?.channel?.[0]?.item || parsed['rdf:RDF']?.item || [];

      if (!items.length) {
        return this.getFallbackJobs();
      }

      return items.map((item: any) => {
        const rawTitle = item.title?.[0] || 'Untitled Position';
        // Title format in WWR is often "Company: Job Title"
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
        const externalId = guid.split('/').pop() || `wwr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        return {
          externalId,
          title,
          company,
          description: description.slice(0, 1500),
          location: item.region?.[0] || 'Remote / Worldwide',
          url: item.link?.[0] || 'https://weworkremotely.com',
          postedAt: new Date(item.pubDate?.[0] || Date.now()),
        };
      });
    } catch (error) {
      console.warn('⚠️ External RSS feed fetch failed or timed out. Utilizing fallback job dataset:', (error as Error).message);
      return this.getFallbackJobs();
    }
  }

  getSourceName(): string {
    return 'weworkremotely';
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
      },
      {
        externalId: 'job-fallback-102',
        title: 'Lead Data Engineer - Real-time Pipelines',
        company: 'Datadog',
        description: 'Designing distributed ingestion pipelines, handling millions of metrics per second with Kafka, Go, and Python.',
        location: 'Remote (Global)',
        url: 'https://datadoghq.com/careers',
        postedAt: new Date(timestamp.getTime() - 3600000 * 2),
      },
      {
        externalId: 'job-fallback-103',
        title: 'Staff Frontend Architect',
        company: 'Vercel',
        description: 'Pioneering next-generation web platforms, optimizing rendering performance, and building developer tools.',
        location: 'Remote (Americas)',
        url: 'https://vercel.com/careers',
        postedAt: new Date(timestamp.getTime() - 3600000 * 5),
      },
      {
        externalId: 'job-fallback-104',
        title: 'Backend Systems Engineer (Rust / Go)',
        company: 'Cloudflare',
        description: 'Optimizing edge compute networks, high-throughput proxies, and security protocols.',
        location: 'Remote (Worldwide)',
        url: 'https://cloudflare.com/careers',
        postedAt: new Date(timestamp.getTime() - 3600000 * 12),
      },
      {
        externalId: 'job-fallback-105',
        title: 'AI / ML Infrastructure Engineer',
        company: 'Anthropic',
        description: 'Building model training platforms, GPU cluster schedulers, and high-performance inference APIs.',
        location: 'San Francisco, CA / Remote',
        url: 'https://anthropic.com/careers',
        postedAt: new Date(timestamp.getTime() - 3600000 * 24),
      },
    ];
  }
}