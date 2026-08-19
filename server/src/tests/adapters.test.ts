import axios from 'axios';
import { CompositeAdapter } from '../adapters/CompositeAdapter';
import { RemotiveAdapter } from '../adapters/RemotiveAdapter';
import { RSSAdapter } from '../adapters/RSSAdapter';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Source Adapters & Composite Fallback Architecture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RSSAdapter', () => {
    it('should parse valid RSS XML content correctly', async () => {
      const xmlPayload = `
        <rss version="2.0">
          <channel>
            <title>We Work Remotely</title>
            <item>
              <title>Stripe: Senior Full Stack Engineer</title>
              <link>https://weworkremotely.com/jobs/101</link>
              <description>&lt;p&gt;Building modern financial software.&lt;/p&gt;</description>
              <pubDate>Mon, 18 Aug 2026 12:00:00 GMT</pubDate>
              <guid>https://weworkremotely.com/jobs/101</guid>
            </item>
          </channel>
        </rss>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: xmlPayload, status: 200 });

      const adapter = new RSSAdapter('https://mock-rss-feed.com');
      const jobs = await adapter.fetchAndParse();

      expect(jobs).toHaveLength(1);
      expect(jobs[0].company).toBe('Stripe');
      expect(jobs[0].title).toBe('Senior Full Stack Engineer');
      expect(jobs[0].url).toBe('https://weworkremotely.com/jobs/101');
    });

    it('should fall back safely when external endpoint returns an error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network timeout'));

      const adapter = new RSSAdapter('https://failing-rss-feed.com');
      const jobs = await adapter.fetchAndParse();

      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0].externalId).toContain('job-fallback');
    });
  });

  describe('RemotiveAdapter', () => {
    it('should parse REST API JSON payload correctly', async () => {
      const jsonPayload = {
        jobs: [
          {
            id: 201,
            title: 'Lead Backend Developer',
            company_name: 'Vercel',
            description: '<p>Building cloud infrastructure.</p>',
            candidate_required_location: 'Worldwide',
            url: 'https://remotive.com/job/201',
            publication_date: '2026-08-18T10:00:00',
          },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce({ data: jsonPayload, status: 200 });

      const adapter = new RemotiveAdapter('https://mock-remotive.com/api');
      const jobs = await adapter.fetchAndParse();

      expect(jobs).toHaveLength(1);
      expect(jobs[0].company).toBe('Vercel');
      expect(jobs[0].title).toBe('Lead Backend Developer');
      expect(jobs[0].externalId).toBe('201');
    });
  });

  describe('CompositeAdapter', () => {
    it('should attempt primary adapter and fallback to secondary adapter when primary returns 0 jobs', async () => {
      const primaryMock = {
        getSourceName: () => 'PrimaryFailing',
        fetchAndParse: jest.fn().mockResolvedValue([]),
      };

      const secondaryMock = {
        getSourceName: () => 'SecondarySuccess',
        fetchAndParse: jest.fn().mockResolvedValue([
          {
            externalId: 'sec-1',
            title: 'Engineer',
            company: 'Acme',
            description: 'Desc',
            url: 'https://acme.com',
            postedAt: new Date(),
          },
        ]),
      };

      const composite = new CompositeAdapter([primaryMock as any, secondaryMock as any]);
      const result = await composite.fetchAndParse();

      expect(primaryMock.fetchAndParse).toHaveBeenCalledTimes(1);
      expect(secondaryMock.fetchAndParse).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('Acme');
    });
  });
});
