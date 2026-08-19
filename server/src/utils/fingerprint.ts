import { createHash } from 'crypto';

export const generateFingerprint = (job: {
  title: string;
  company: string;
  location?: string;
  description?: string;
}): string => {
  // Normalize text: lowercase, remove extra spaces, trim
  const normalize = (str: string = '') =>
    str.toLowerCase().trim().replace(/\s+/g, ' ');

  const raw = `${normalize(job.title)}|${normalize(job.company)}|${normalize(job.location || '')}`;
  return createHash('sha256').update(raw).digest('hex');
};