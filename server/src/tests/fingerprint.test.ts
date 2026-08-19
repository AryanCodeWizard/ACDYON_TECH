import { generateFingerprint } from '../utils/fingerprint';

describe('SHA-256 Fingerprint Generator', () => {
  it('should generate a deterministic 64-character hex hash', () => {
    const raw = {
      title: 'Senior Full Stack Engineer',
      company: 'Stripe',
      location: 'Remote (US/EU)',
    };

    const hash1 = generateFingerprint(raw);
    const hash2 = generateFingerprint(raw);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
  });

  it('should be case-insensitive and ignore leading/trailing whitespace', () => {
    const raw1 = {
      title: '  Senior Full Stack Engineer  ',
      company: 'STRIPE',
      location: 'Remote (US/EU)',
    };

    const raw2 = {
      title: 'senior full stack engineer',
      company: 'stripe',
      location: 'remote (us/eu)',
    };

    const hash1 = generateFingerprint(raw1);
    const hash2 = generateFingerprint(raw2);

    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different job attributes', () => {
    const raw1 = {
      title: 'Frontend Engineer',
      company: 'Stripe',
      location: 'Remote',
    };

    const raw2 = {
      title: 'Backend Engineer',
      company: 'Stripe',
      location: 'Remote',
    };

    expect(generateFingerprint(raw1)).not.toBe(generateFingerprint(raw2));
  });
});
