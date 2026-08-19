export interface IRawJob {
  externalId: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  url: string;
  postedAt: Date;
  jobType?: string;
  salaryRange?: string;
}

export interface ISourceAdapter {
  fetchAndParse(): Promise<IRawJob[]>;
  getSourceName(): string;
  checkHealth?(): Promise<{ healthy: boolean; latencyMs: number; message?: string }>;
}