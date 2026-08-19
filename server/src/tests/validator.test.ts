import { ValidationError } from '../utils/errors';
import { sanitizeText, validateRawJob, validateUrl } from '../utils/validator';

describe('Raw Job Validator & Sanitizer', () => {
  it('should validate and normalize a valid raw job object', () => {
    const raw = {
      externalId: 'ext-101',
      title: '  <p>Staff Engineer</p>  ',
      company: 'Datadog',
      location: 'Remote',
      url: 'https://datadoghq.com/careers/101',
      description: '<b>Building distributed data pipelines</b>',
    };

    const validated = validateRawJob(raw, 'test-source');

    expect(validated.title).toBe('Staff Engineer');
    expect(validated.company).toBe('Datadog');
    expect(validated.description).toBe('Building distributed data pipelines');
    expect(validated.url).toBe('https://datadoghq.com/careers/101');
    expect(validated.externalId).toBe('ext-101');
  });

  it('should throw ValidationError if title is missing', () => {
    const raw = {
      company: 'Stripe',
      url: 'https://stripe.com/jobs/1',
    };

    expect(() => validateRawJob(raw, 'test-source')).toThrow(ValidationError);
  });

  it('should throw ValidationError if company is missing', () => {
    const raw = {
      title: 'Developer',
      url: 'https://stripe.com/jobs/1',
    };

    expect(() => validateRawJob(raw, 'test-source')).toThrow(ValidationError);
  });

  it('should throw ValidationError if URL is invalid or unsafe', () => {
    const raw = {
      title: 'Developer',
      company: 'Stripe',
      url: 'ftp://unsafe-server/job',
    };

    expect(() => validateRawJob(raw, 'test-source')).toThrow(ValidationError);
  });

  it('should validate URLs correctly', () => {
    expect(validateUrl('https://example.com/job')).toBe(true);
    expect(validateUrl('http://example.com/job')).toBe(true);
    expect(validateUrl('not-a-url')).toBe(false);
    expect(validateUrl('javascript:alert(1)')).toBe(false);
  });

  it('should sanitize HTML tags from text strings', () => {
    const html = '<h1>Headline</h1> <script>alert("xss")</script> Body text';
    expect(sanitizeText(html)).toBe('Headline alert("xss") Body text');
  });
});
