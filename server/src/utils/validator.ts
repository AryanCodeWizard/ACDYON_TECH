import { IRawJob } from '../adapters/BaseAdapter';
import { ValidationError } from './errors';

export function sanitizeText(text?: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function validateUrl(urlStr?: string): boolean {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateRawJob(raw: any, sourceName: string): IRawJob {
  if (!raw || typeof raw !== 'object') {
    throw new ValidationError(`[${sourceName}] Raw job item is not a valid object.`);
  }

  const title = sanitizeText(raw.title);
  const company = sanitizeText(raw.company);
  const location = sanitizeText(raw.location) || 'Remote / Unspecified';
  const description = sanitizeText(raw.description) || 'No description provided.';
  const url = raw.url ? raw.url.trim() : '';
  const externalId = raw.externalId ? String(raw.externalId).trim() : '';

  if (!title) {
    throw new ValidationError(`[${sourceName}] Job missing required field 'title'.`);
  }

  if (!company) {
    throw new ValidationError(`[${sourceName}] Job missing required field 'company'.`);
  }

  if (!url || !validateUrl(url)) {
    throw new ValidationError(`[${sourceName}] Job missing or invalid HTTP/HTTPS 'url': '${url}'.`);
  }

  const postedAt = raw.postedAt && !isNaN(new Date(raw.postedAt).getTime())
    ? new Date(raw.postedAt)
    : new Date();

  return {
    externalId: externalId || `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    company,
    location,
    description: description.slice(0, 2000),
    url,
    postedAt,
    jobType: raw.jobType ? sanitizeText(raw.jobType) : undefined,
    salaryRange: raw.salaryRange ? sanitizeText(raw.salaryRange) : undefined,
  };
}
