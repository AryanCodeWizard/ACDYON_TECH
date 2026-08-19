import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5005', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobflow',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Ingestion Operational Pacing & Resilience Config
  sourceUrl: process.env.SOURCE_URL || 'https://weworkremotely.com/remote-jobs.rss',
  secondarySourceUrl: process.env.SECONDARY_SOURCE_URL || 'https://remotive.com/api/remote-jobs?category=software-dev&limit=20',
  
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '300000', 10),
};
